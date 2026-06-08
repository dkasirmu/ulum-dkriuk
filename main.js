const elNamaToko = document.getElementById("nama-toko");
if (elNamaToko) {
    elNamaToko.textContent = CONFIG.namaToko;
}

const elVersi = document.getElementById("versi-app");
if (elVersi) {
    elVersi.textContent = "Versi " + CONFIG.versiApp;
}

console.log(CONFIG.versiApp);
console.log(document.getElementById("versi-app"));
