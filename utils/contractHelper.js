const { ethers } = require('ethers');
const { getWallet, getProvider } = require('./accountManager');

function accountToIndex(account) {
    const index = parseInt(account) - 1;
    if (index < 0 || index > 1) {
        console.error(`Índice de cuenta inválido: ${account}. Debe ser 1 o 2.`);
        throw new Error(`Índice de cuenta inválido: ${account}. Debe ser 1 o 2.`);
    }
    return index;
}

async function createTransaction(contractAddress, abi, method, params = [], account) {
    const index = accountToIndex(account);
    const signer = getWallet(index);

    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log(`Ejecutando ${method} desde la cuenta ${signer.address}...`);

    try {
        const tx = await contract[method](...params);
        const receipt = await tx.wait();
        console.log(`Transacción ${method} minada: ${receipt.hash}`);
        return receipt;
    } catch (error) {
        console.error(`Error en createTransaction (${method}):`, error.message);
        throw error;
    }
}

async function depositToContract(contractAddress, abi, amountInEther, account) {
    const index = accountToIndex(account);
    const signer = getWallet(index);

    const parsedAmount = ethers.parseEther(amountInEther.toString());

    try {
        const tx = await signer.sendTransaction({
            to: contractAddress,
            value: parsedAmount
        });
        const receipt = await tx.wait();
        console.log(`Depósito de ${amountInEther} ETH minado: ${receipt.hash}`);
        return receipt;
    } catch (error) {
        console.error('Error en depositToContract:', error.message);
        throw error;
    }
}

function getContract(contractAddress, abi) {
    const provider = getProvider();
    return new ethers.Contract(contractAddress, abi, provider);
}

module.exports = {
    createTransaction,
    depositToContract,
    getContract,
    accountToIndex
};