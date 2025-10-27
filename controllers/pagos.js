require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Pagos.sol/Pagos.json');
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
const { getPublicKey, provider } = require('../utils/AccountManager'); // Importamos para la nueva función
const { PAGOS_CONTRACT_ADDRESS } = process.env;

async function deposit(amount, account) {
    return await depositToContract(PAGOS_CONTRACT_ADDRESS, contract.abi, amount, account);
}

async function release(account) {
    return await createTransaction(PAGOS_CONTRACT_ADDRESS, contract.abi, 'release', [], account);
}

async function getBalance() {
    const pagos = getContract(PAGOS_CONTRACT_ADDRESS, contract.abi);
    const balance = await pagos.getBalance();
    console.log("Contract balance:", ethers.formatEther(balance));
    return balance;
}

async function getAccountBalance(accountIndex) {
    const publicKey = getPublicKey(accountIndex);
    if (!publicKey) {
        throw new Error(`La cuenta con el índice ${accountIndex} no fue encontrada.`);
    }
    const balanceWei = await provider.getBalance(publicKey);
    return ethers.formatEther(balanceWei);
}

module.exports={
    deposit,
    release,
    getBalance,
    getAccountBalance // Exportamos la nueva función
};