require('dotenv').config();
const { ethers } = require("ethers");
const {
    API_URL, 
    PRIVATE_KEY_1, PUBLIC_KEY_1, 
    PRIVATE_KEY_2, PUBLIC_KEY_2
} = process.env;

const accounts = [
    { privateKey: PRIVATE_KEY_1, publicKey: PUBLIC_KEY_1 },
    { privateKey: PRIVATE_KEY_2, publicKey: PUBLIC_KEY_2 }
];

// --- CAMBIO CLAVE: El provider está vacío al inicio ---
let provider;

function getProvider() {
    // Si el provider no ha sido creado, lo creamos.
    if (!provider) {
        if (!API_URL) {
            throw new Error("API_URL no está definida en el archivo .env");
        }
        console.log("Creando nueva conexión al proveedor RPC...");
        provider = new ethers.JsonRpcProvider(API_URL);
    }
    // Devolvemos la instancia existente o la recién creada.
    return provider;
}

function getWallet(accountIndex = 0) {
    if (accountIndex >= accounts.length || !accounts[accountIndex].privateKey) {
        console.error(`Error: La cuenta con índice ${accountIndex} no fue encontrada.`);
        return null;
    }
    // Usamos la función para obtener el provider.
    return new ethers.Wallet(accounts[accountIndex].privateKey, getProvider());
}

function getPublicKey(accountIndex = 0) {
    if (accountIndex >= accounts.length || !accounts[accountIndex].publicKey) {
        console.error(`Error: La cuenta con índice ${accountIndex} no fue encontrada.`);
        return null;
    }
    return accounts[accountIndex].publicKey;
}

function getAllAccounts() {
    return accounts.map((acc, index) => ({
        index: index, 
        address: acc.publicKey
    })).filter(acc => acc.address);
}

// --- CAMBIO CLAVE: Exportamos la nueva función getProvider ---
module.exports = { getWallet, getPublicKey, getAllAccounts, getProvider };