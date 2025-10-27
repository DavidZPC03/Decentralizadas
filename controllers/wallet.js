const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');

// --- CAMBIO 1: SEPARAR LAS IMPORTACIONES ---
// Importamos solo las funciones que realmente viven en contractHelper
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
// Importamos getProvider desde su verdadero origen: AccountManager
const { getProvider } = require('../utils/AccountManager'); 

const { WALLET_CONTRACT_ADDRESS } = process.env;

async function sendTransaction(method, params, account) {
    return await createTransaction(WALLET_CONTRACT_ADDRESS, contract.abi, method, params, account);
}

async function submitTransaction(to, amount, account) {
    // La función del contrato se llama "SubmitTransaction" (mayúscula S)
    const receipt = await sendTransaction('SubmitTransaction', [to, amount], account);
    return receipt;
}

async function approveTransaction(txId, account) {
    const receipt = await sendTransaction('approveTransaction', [txId], account);
    return receipt;
}

async function executeTransaction(txId, account) {
    const receipt = await sendTransaction('executeTransaction', [txId], account);
    return receipt;
}

// --- CAMBIO 2: AÑADIR EL ABI QUE FALTABA ---
async function deposit(amount, account) {
    // La función depositToContract también necesita el ABI del contrato
    return await depositToContract(WALLET_CONTRACT_ADDRESS, contract.abi, amount, account);
}

// --- CORREGIDO: La función se llama `releasePayment` y necesita un `payee` ---
async function releasePayment(payee, account) {
    const receipt = await sendTransaction('releasePayment', [payee], account);
    return receipt;
}

async function getBalance() {
    // getContract ya no necesita el provider aquí, lo obtiene de contractHelper
    const walletContract = getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const balanceWei = await walletContract.getBalance();
    // --- CAMBIO 3: SINTAXIS DE ETHERS V6 ---
    return ethers.formatEther(balanceWei); // Se usa formatEther
}

// --- CORREGIDO: Lógica para obtener todas las transacciones ---
async function getTransactions() {
    const walletContract = getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const txCount = await walletContract.getTransactionCount();
    
    const transactions = [];
    for (let i = 0; i < txCount; i++) {
        const txInfo = await walletContract.getTransaction(i);
        transactions.push(formatTransaction(i, txInfo));
    }
    
    return transactions;
}

function formatTransaction(id, info) {
    // --- CAMBIO 4: Usar índices (0, 1, 2, 3) ---
    // Esto coincide con el 'returns (address, uint, uint, bool)' de tu contrato
    return {
        id: id,
        to: info[0],
        amount: ethers.formatEther(info[1]), // amount en Ether
        approvalCount: info[2].toString(),
        executed: info[3]
    };
}

module.exports = {
    submitTransaction,
    approveTransaction,
    executeTransaction,
    deposit,
    releasePayment,
    getBalance,
    getTransactions
};