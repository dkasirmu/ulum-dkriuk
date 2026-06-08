// js/export.js
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';
import { formatWaktuExport } from './format.js';

// EXPORT RIWAYAT TRANSAKSI MENJADI FILE EXCEL SESUAI TANGGAL INPUT DI HALAMAN riwayat
export function exportTransaksi(hasilFilter, mulai, selesai) {
    if (hasilFilter.length === 0) {
        alert("Tidak ada data untuk diexport. Filter tanggal dulu.");
        return;
    }

    // Sheet 1 — Ringkasan per transaksi
    const ringkasan = hasilFilter.map(function(t) {
        return {
            Tanggal: formatWaktuExport(t.waktu),
            Items: t.items.map(function(i) {
                return i.nama + " x" + i.qty;
            }).join(", "),
            Total: t.total,
            Bayar: t.bayar,
            Kembalian: t.kembalian
        };
    });

    // Sheet 2 — Detail per item
    const detail = [];
    hasilFilter.forEach(function(t) {
        t.items.forEach(function(i) {
            detail.push({
                Tanggal: formatWaktuExport(t.waktu),
                Item: i.nama,
                Qty: i.qty,
                Subtotal: i.subtotal,
                Total: t.total,
                Bayar: t.bayar,
                Kembalian: t.kembalian
            });
        });
    });

    const sheetRingkasan = XLSX.utils.json_to_sheet(ringkasan);
    const sheetDetail = XLSX.utils.json_to_sheet(detail);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheetRingkasan, "Ringkasan");
    XLSX.utils.book_append_sheet(wb, sheetDetail, "Detail Item");

    XLSX.writeFile(wb, `transaksi_${formatTanggalFile(mulai)}_sd_${formatTanggalFile(selesai)}.xlsx`);
}

export function exportProduk(db) {
    const tx = db.transaction("produk", "readonly");
    const store = tx.objectStore("produk");
    const request = store.getAll();

    request.onsuccess = function() {
        const produk = request.result;

        const rows = produk.map(function(p) {
            return {
                Nama: p.nama,
                Harga: p.harga
            };
        });

        const sheet = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Produk");
        XLSX.writeFile(wb, "produk.xlsx");
    };
}

// format eksport tanggal excel agar sesuai indonesia
function formatTanggalFile(yyyy_mm_dd) {
    const parts = yyyy_mm_dd.split('-');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
}