// js/kasir.js
import { bukaDB } from "./db.js";
import { formatRupiah, formatWaktu } from "./format.js";

let db;
let keranjang = [];

bukaDB().then(function(database) {
    db = database;
    inisialisasiProduk();
    tampilSaldoLaci();
});

// INISIALISASI PRODUK AWAL
function inisialisasiProduk() {
    const produkAwal = [];

    const tx = db.transaction("produk", "readwrite");
    const store = tx.objectStore("produk");

    produkAwal.forEach(function(produk) {
        const cek = store.get(produk.nama);
        cek.onsuccess = function(e) {
            if (!e.target.result) {
                store.add(produk);
            }
        };
    });
}

// CARI HARGA DARI INPUT NAMA
function cariHarga() {
    const nama = document.getElementById("namaBarang").value.toLowerCase();

    const tx = db.transaction("produk", "readonly");
    const store = tx.objectStore("produk");
    const cek = store.get(nama);

    cek.onsuccess = function(e) {
        if (e.target.result) {
            document.getElementById("hargaBarang").value = e.target.result.harga;
        } else {
            document.getElementById("hargaBarang").value = "";
        }
    };
}

// TAMBAH BARANG KE KERANJANG
function tambahBarang() {
    const nama = document.getElementById("namaBarang").value;
    const harga = Number(document.getElementById("hargaBarang").value);
    const qty = Number(document.getElementById("qtyBarang").value);

    if (!nama || !harga || !qty) {
        alert("Lengkapi nama, harga, dan qty dulu!");
        return;
    }

    const subtotal = harga * qty;

    keranjang.push({ nama, harga, qty, subtotal });

    tampilKeranjang();
    bersihkanInput();
}

// TAMPIL KERANJANG
function tampilKeranjang() {
    const list = document.getElementById("listBarang");
    list.innerHTML = "";

    let total = 0;

    keranjang.forEach(function(item, index) {
        total += item.subtotal;
        list.innerHTML += `<li>${item.nama} x${item.qty} @ Rp ${formatRupiah(item.harga)} = Rp ${formatRupiah(item.subtotal)}
        <button onclick="hapusItem(${index})">X</button></li>`;
    });

    document.getElementById("totalHarga").textContent = "Rp " + formatRupiah(total);
}

// BERSIHKAN INPUT
function bersihkanInput() {
    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaBarang").value = "";
    document.getElementById("qtyBarang").value = 1;
}

// HAPUS ITEM DARI KERANJANG
function hapusItem(index) {
    keranjang.splice(index, 1);
    tampilKeranjang();
}

// HITUNG KEMBALIAN
function hitungKembalian() {
    const bayar = Number(document.getElementById("uangBayar").value);
    const total = keranjang.reduce(function(acc, item) {
        return acc + item.subtotal;
    }, 0);

    if (bayar < total) {
        document.getElementById("kembalian").textContent = "Uang kurang!";
        return;
    }

    document.getElementById("kembalian").textContent = "Rp " + formatRupiah(bayar - total);
}

// TAMPIL STRUK
function tampilStruk() {
    const bayar = Number(document.getElementById("uangBayar").value);
    const total = keranjang.reduce(function(acc, item) {
        return acc + item.subtotal;
    }, 0);

    if (keranjang.length === 0 || !bayar || bayar < total) return;

    const waktuSekarang = new Date().toLocaleString("id-ID");
    document.getElementById("struk-waktu").textContent = waktuSekarang;

    const strukItem = document.getElementById("struk-items");
    strukItem.innerHTML = "";

    keranjang.forEach(function(item) {
        strukItem.innerHTML += `<li><span>${item.nama} x${item.qty}</span><span>Rp ${formatRupiah(item.subtotal)}</span></li>`;
    });

    document.getElementById("struk-total").textContent = "Rp " + formatRupiah(total);
    document.getElementById("struk-bayar").textContent = "Rp " + formatRupiah(bayar);
    document.getElementById("struk-kembalian").textContent = "Rp " + formatRupiah(bayar - total);
    document.getElementById("tampilan-struk").style.display = "block";
}

// SIMPAN TRANSAKSI
function simpanTransaksi() {
    const bayar = Number(document.getElementById("uangBayar").value);
    const total = keranjang.reduce(function(acc, item) {
        return acc + item.subtotal;
    }, 0);

    const transaksi = {
        waktu: new Date().toISOString(),
        items: keranjang,
        total: total,
        bayar: bayar,
        kembalian: bayar - total
    };

    const tx = db.transaction("transaksi", "readwrite");
    const store = tx.objectStore("transaksi");
    store.add(transaksi);
}

// UPDATE LACI
function updateLaci(totalMasuk) {
    const tx = db.transaction("laci", "readwrite");
    const store = tx.objectStore("laci");
    const cek = store.get("laci");

    cek.onsuccess = function(e) {
        const saldoLama = e.target.result ? e.target.result.saldo : 0;
        store.put({ id: "laci", saldo: saldoLama + totalMasuk });
    };
}

// TAMPIL SALDO LACI
function tampilSaldoLaci() {
    const tx = db.transaction("laci", "readonly");
    const store = tx.objectStore("laci");
    const cek = store.get("laci");

    cek.onsuccess = function(e) {
        const saldo = e.target.result ? e.target.result.saldo : 0;
        document.getElementById("saldo-laci").textContent = "Rp " + formatRupiah(saldo);
    };
}

// TAMPIL SARAN AUTOCOMPLETE
function tampilSaran() {
    const keyword = document.getElementById("namaBarang").value.toLowerCase();
    const kotak = document.getElementById("saran-produk");
    kotak.innerHTML = "";

    if (!keyword) return;

    const tx = db.transaction("produk", "readonly");
    const store = tx.objectStore("produk");
    const semua = store.getAll();

    semua.onsuccess = function(e) {
        const hasil = e.target.result.filter(function(p) {
            return p.nama.includes(keyword);
        });

        hasil.forEach(function(p) {
            const item = document.createElement("div");
            item.textContent = p.nama + " - Rp " + p.harga.toLocaleString("id-ID");
            item.onclick = function() {
                document.getElementById("namaBarang").value = p.nama;
                document.getElementById("hargaBarang").value = p.harga;
                kotak.innerHTML = "";
            };
            kotak.appendChild(item);
        });
    };
}

// BAYAR
function bayar() {
    const bayarNominal = Number(document.getElementById("uangBayar").value);
    const total = keranjang.reduce(function(acc, item) {
        return acc + item.subtotal;
    }, 0);

    if (keranjang.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    if (!bayarNominal || bayarNominal < total) {
        alert("Uang bayar kurang atau belum diisi!");
        return;
    }

    tampilStruk();
    simpanTransaksi();
    updateLaci(total);
    tampilSaldoLaci();
    resetSetelahBayar();
}

// RESET SETELAH BAYAR
function resetSetelahBayar() {
    keranjang = [];
    document.getElementById("listBarang").innerHTML = "";
    document.getElementById("totalHarga").textContent = "Rp 0";
    document.getElementById("uangBayar").value = "";
    document.getElementById("kembalian").textContent = "Rp 0";
    bersihkanInput();
}

// RESET MANUAL
function reset() {
    const yakin = confirm("Yakin reset transaksi?");
    if (!yakin) return;

    keranjang = [];
    document.getElementById("listBarang").innerHTML = "";
    document.getElementById("totalHarga").textContent = "Rp 0";
    document.getElementById("uangBayar").value = "";
    document.getElementById("kembalian").textContent = "Rp 0";
    document.getElementById("tampilan-struk").style.display = "none";
    bersihkanInput();
}

// SETOR MODAL
function setorModal() {
    const hasil = Number(prompt("Masukkan nominal modal"));

    if (!hasil || hasil <= 0) {
        alert("Nominal tidak valid");
        return;
    }

    const tx = db.transaction(["laci", "pengaturan"], "readwrite");
    const storeLaci = tx.objectStore("laci");
    const storePengaturan = tx.objectStore("pengaturan");

    const cek = storeLaci.get("laci");

    cek.onsuccess = function(e) {
        const saldoLama = e.target.result ? e.target.result.saldo : 0;
        storeLaci.put({ id: "laci", saldo: saldoLama + hasil });

        const cekSesi = storePengaturan.get("sesiAktif");
        cekSesi.onsuccess = function() {
            const sesi = cekSesi.result;
            if (!sesi || sesi.value === false) {
                const waktuBuka = new Date().toISOString();
                storePengaturan.put({ id: "sesiAktif", value: true, waktuBuka: waktuBuka, modalAwal: hasil });
            }
        };
    };

    tx.oncomplete = function() {
        tampilSaldoLaci();
    };
}

// TUTUP KASIR
function tutupKasir() {
    const yakin = confirm("Yakin tutup kasir sekarang?");
    if (!yakin) return;

    const tx = db.transaction(["pengaturan", "transaksi", "sesiKasir", "laci"], "readwrite");
    const storePengaturan = tx.objectStore("pengaturan");
    const storeTransaksi = tx.objectStore("transaksi");
    const storeSesiKasir = tx.objectStore("sesiKasir");
    const storeLaci = tx.objectStore("laci");

    const cekSesi = storePengaturan.get("sesiAktif");

    cekSesi.onsuccess = function() {
        const sesi = cekSesi.result;

        if (!sesi || sesi.value === false) {
            alert("Tidak ada sesi kasir yang aktif.");
            return;
        }

        const waktuBuka = sesi.waktuBuka;
        const waktuTutup = new Date().toISOString();

        const semuaTransaksi = storeTransaksi.getAll();

        semuaTransaksi.onsuccess = function() {
            const semua = semuaTransaksi.result;

            const transaksiSesi = semua.filter(function(t) {
                return t.waktu >= waktuBuka;
            });

            const jumlahTransaksi = transaksiSesi.length;
            const totalPendapatan = transaksiSesi.reduce(function(acc, t) {
                return acc + t.total;
            }, 0);

            const cekLaci = storeLaci.get("laci");

            cekLaci.onsuccess = function() {
                const saldoAkhir = cekLaci.result ? cekLaci.result.saldo : 0;

                storeSesiKasir.add({
                    waktuBuka: waktuBuka,
                    waktuTutup: waktuTutup,
                    jumlahTransaksi: jumlahTransaksi,
                    totalPendapatan: totalPendapatan,
                    modalAwal: sesi.modalAwal || 0,
                    saldoAkhir: saldoAkhir
                });

                storeLaci.put({ id: "laci", saldo: 0 });
                storePengaturan.delete("sesiAktif");
            };
        };
    };

    tx.oncomplete = function() {
        tampilSaldoLaci();
        alert("Kasir ditutup. Total pendapatan sesi ini tersimpan.");
    };
}

// DAFTARKAN KE WINDOW
window.tambahBarang = tambahBarang;
window.hapusItem = hapusItem;
window.hitungKembalian = hitungKembalian;
window.bayar = bayar;
window.reset = reset;
window.setorModal = setorModal;
window.tutupKasir = tutupKasir;
window.tampilSaran = tampilSaran;
window.cariHarga = cariHarga;
window.tampilStruk = tampilStruk;