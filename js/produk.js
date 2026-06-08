// js/produk.js
import { bukaDB } from "./db.js";
import { formatRupiah } from "./format.js";
import { exportProduk } from "./export.js";
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';

let db;

bukaDB().then(function(database) {
    db = database;
    tampilSemuaProduk();
});

// TAMPIL SEMUA PRODUK
function tampilSemuaProduk() {
    const tx = db.transaction("produk", "readonly");
    const store = tx.objectStore("produk");
    const semua = store.getAll();

    semua.onsuccess = function(e) {
        const produkList = e.target.result;
        const tbody = document.getElementById("isi-tabel");
        tbody.innerHTML = "";

        produkList.forEach(function(p) {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nama}</td>
                    <td>Rp ${formatRupiah(p.harga)}</td>
                    <td>
                        <button onclick="hapusProduk('${p.nama}')">Hapus</button>
                    </td>
                </tr>
            `;
        });
    };
}

// TAMBAH / EDIT PRODUK
function tambahProduk() {
    const nama = document.getElementById("input-nama").value.trim().toLowerCase();
    const harga = Number(document.getElementById("input-harga").value);

    if (!nama || !harga) {
        alert("Nama dan harga wajib diisi!");
        return;
    }

    const tx = db.transaction("produk", "readwrite");
    const store = tx.objectStore("produk");
    store.put({ nama: nama, harga: harga });

    tx.oncomplete = function() {
        tampilSemuaProduk();
        document.getElementById("input-nama").value = "";
        document.getElementById("input-harga").value = "";
    };
}

// HAPUS PRODUK
function hapusProduk(nama) {
    const yakin = confirm("Hapus produk: " + nama + "?");
    if (!yakin) return;

    const tx = db.transaction("produk", "readwrite");
    const store = tx.objectStore("produk");
    store.delete(nama);

    tx.oncomplete = function() {
        tampilSemuaProduk();
    };
}

// IMPORT XLSX
function importXLSX(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        rows.forEach(function(row) {
            const nama = String(row['Nama'] || row['nama'] || '').trim().toLowerCase();
            const harga = Number(row['Harga'] || row['harga'] || 0);

            if (!nama || !harga) return;

            const tx = db.transaction("produk", "readwrite");
            const store = tx.objectStore("produk");
            store.put({ nama: nama, harga: harga });
        });

        setTimeout(function() {
            tampilSemuaProduk();
        }, 500);

        // reset input agar file sama bisa diimport lagi
        event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
}

// CARI PRODUK
function cariProduk() {
    const keyword = document.getElementById("input-cari").value.toLowerCase();
    const semuaBaris = document.querySelectorAll("#isi-tabel tr");

    semuaBaris.forEach(function(baris) {
        const nama = baris.cells[0].textContent.toLowerCase();
        if (nama.includes(keyword)) {
            baris.style.display = "";
        } else {
            baris.style.display = "none";
        }
    });
}

function exportProdukHtml() {
    exportProduk(db);
}

window.exportProdukHtml = exportProdukHtml;
window.tambahProduk = tambahProduk;
window.hapusProduk = hapusProduk;
window.importXLSX = importXLSX;
window.cariProduk = cariProduk;