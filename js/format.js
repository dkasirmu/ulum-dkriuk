// js/format.js

export function formatRupiah(angka) {
    return angka.toLocaleString("id-ID");
}

export function formatWaktu(iso) {
    const d = new Date(iso);
    const tgl = d.toLocaleDateString("id-ID");
    const jam = d.toLocaleTimeString("id-ID");
    return tgl + " " + jam;
}

export function formatWaktuExport(iso) {
    const d = new Date(iso);
    const tgl = d.toLocaleDateString("id-ID");
    const jam = d.toLocaleTimeString("id-ID", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return tgl + " " + jam;
}