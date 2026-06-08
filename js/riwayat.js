// js/riwayat.js
import { bukaDB } from "./db.js";
import { formatRupiah, formatWaktu } from "./format.js";
import { exportTransaksi } from "./export.js";

let db;
let hasilFilter = [];

bukaDB().then(function(database) {
    db = database;
    tampilRekapSesi();
    setDefaultTanggal();
    filterTransaksi();
});

// SET DEFAULT TANGGAL HARI INI
function setDefaultTanggal() {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    const hari = String(sekarang.getDate()).padStart(2, '0');
    const hariIni = `${tahun}-${bulan}-${hari}`;

    document.getElementById("tanggal-mulai").value = hariIni;
    document.getElementById("tanggal-selesai").value = hariIni;
}

// TAMPIL REKAP SESI
function tampilRekapSesi() {
    const tx = db.transaction("sesiKasir", "readonly");
    const store = tx.objectStore("sesiKasir");
    const semua = store.getAll();

    semua.onsuccess = function() {
        const list = semua.result;
        const tbody = document.getElementById("isi-sesi");
        tbody.innerHTML = "";

        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>Belum ada sesi tersimpan.</td></tr>";
            return;
        }

        list.forEach(function(sesi) {
            tbody.innerHTML += `
                <tr>
                    <td>${formatWaktu(sesi.waktuBuka)}</td>
                    <td>${formatWaktu(sesi.waktuTutup)}</td>
                    <td>${sesi.jumlahTransaksi}</td>
                    <td>Rp ${formatRupiah(sesi.modalAwal || 0)}</td>
                    <td>Rp ${formatRupiah(sesi.saldoAkhir || 0)}</td>
                    <td>Rp ${formatRupiah(sesi.totalPendapatan)}</td>
                </tr>
            `;
        });
    };
}

// FILTER TRANSAKSI RENTANG TANGGAL
function filterTransaksi() {
    const mulai = document.getElementById("tanggal-mulai").value;
    const selesai = document.getElementById("tanggal-selesai").value;

    if (!mulai || !selesai) {
        alert("Pilih tanggal mulai dan selesai dulu!");
        return;
    }

    const tx = db.transaction("transaksi", "readonly");
    const store = tx.objectStore("transaksi");
    const semua = store.getAll();

    semua.onsuccess = function() {
        const list = semua.result;

        const hasil = list.filter(function(t) {
            // koncersi waktu transaksi ke tanggal lokal
            const tgl = new Date(t.waktu);
            const tahun = tgl.getFullYear();
            const bulan = String(tgl.getMonth() + 1).padStart(2, '0');
            const hari = String(tgl.getDate()).padStart(2, '0');
            const tanggalLokal = `${tahun}-${bulan}-${hari}`;

            return tanggalLokal >= mulai && tanggalLokal <= selesai;
        });

        hasilFilter = hasil;

        const tbody = document.getElementById("isi-transaksi");
        tbody.innerHTML = "";

        if (hasil.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>Tidak ada transaksi pada rentang tanggal ini.</td></tr>";
            return;
        }

        hasil.forEach(function(t) {
            const itemTeks = t.items.map(function(i) {
                return i.nama + " x" + i.qty;
            }).join(", ");

            tbody.innerHTML += `
                <tr>
                    <td>${formatWaktu(t.waktu)}</td>
                    <td>${itemTeks}</td>
                    <td>Rp ${formatRupiah(t.total)}</td>
                    <td>Rp ${formatRupiah(t.bayar)}</td>
                    <td>Rp ${formatRupiah(t.kembalian)}</td>
                </tr>
            `;
        });
    };
}

// FUNGSI PEMBUNGKUS UNTUK TOMBOL EXPORT DI HTML
function exportTransaksiHtml() {
    const mulai = document.getElementById("tanggal-mulai").value;
    const selesai = document.getElementById("tanggal-selesai").value;
    exportTransaksi(hasilFilter, mulai, selesai);
}

window.filterTransaksi = filterTransaksi;
window.exportTransaksiHtml = exportTransaksiHtml;