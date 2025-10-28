const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');

const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');

const { WALLET_CONTRACT_ADDRESS } = process.env;

async function sendTransaction(method, params, account) {
    return await createTransaction(WALLET_CONTRACT_ADDRESS, contract.abi, method, params, account);
}

async function submitTransaction(to, amount, account) {
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

async function deposit(amount, account) {
    return await depositToContract(WALLET_CONTRACT_ADDRESS, contract.abi, amount, account);
}

async function releasePayment(payee, account) {
    const receipt = await sendTransaction('releasePayment', [payee], account);
    return receipt;
}

async function getBalance() {
    const walletContract = getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const balanceWei = await walletContract.getBalance();
    return ethers.formatEther(balanceWei);
}

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
    return {
        id: id,
        to: info[0],
        amount: ethers.formatEther(info[1]),
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