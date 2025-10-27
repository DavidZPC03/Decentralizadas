const { ethers } = require('ethers');
// --- CAMBIO CLAVE: Importamos getProvider en lugar de la variable provider ---
const { getWallet, getProvider } = require('./AccountManager');

function getContract(contractAddress, abi) {
    // Usamos la función para obtener el provider.
    return new ethers.Contract(contractAddress, abi, getProvider());
}

async function createTransaction(contractAddress, abi, methodName, params, account) {
    const signer = getWallet(account);
    if (!signer) {
        throw new Error(`No se pudo obtener la wallet para la cuenta ${account}.`);
    }

    const contractWithSigner = new ethers.Contract(contractAddress, abi, signer);
    
    console.log(`Ejecutando '${methodName}' desde la cuenta ${account} (${signer.address})`);
    
    const tx = await contractWithSigner[methodName](...params);
    
    console.log(`Transacción enviada. Hash: ${tx.hash}`);
    console.log(`Ver en Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log("Transacción confirmada en el bloque:", receipt.blockNumber);
    
    return receipt;
}

async function depositToContract(contractAddress, abi, amountInEther, account) {
    const signer = getWallet(account);
    if (!signer) {
        throw new Error(`No se pudo obtener la wallet para la cuenta ${account}.`);
    }
    
    const contractWithSigner = new ethers.Contract(contractAddress, abi, signer);

    console.log(`Depositando ${amountInEther} ETH desde la cuenta ${account} (${signer.address})`);

    const tx = await contractWithSigner.deposit({ value: ethers.parseEther(String(amountInEther)) });

    console.log(`Depósito enviado. Hash: ${tx.hash}`);
    console.log(`Ver en Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    const receipt = await tx.wait();
    console.log("Depósito confirmado en el bloque:", receipt.blockNumber);

    return receipt;
}

module.exports = {
    getContract,
    createTransaction,
    depositToContract
};