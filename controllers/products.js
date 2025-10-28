const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { createTransaction, getContract, accountToIndex } = require('../utils/contractHelper');
const { getWallet } = require('../utils/accountManager'); 

const { WALLET_CONTRACT_ADDRESS } = process.env;

function formatProduct(productData) {
    return {
        id: Number(productData[0]),
        name: productData[1],
        price: ethers.formatEther(productData[2]),
        seller: productData[3],
        active: productData[4]
    };
}

async function addProduct(name, priceInEther, account) {
    const priceInWei = ethers.parseEther(priceInEther.toString());
    return await createTransaction(
        WALLET_CONTRACT_ADDRESS,
        contract.abi,
        'addProduct',
        [name, priceInWei],
        account
    );
}

async function buyProduct(productId, amountInEther, account) {
    try {
        const index = accountToIndex(account);
        const signer = getWallet(index); 
        const walletContract = new ethers.Contract(WALLET_CONTRACT_ADDRESS, contract.abi, signer);

        const parsedAmount = ethers.parseEther(amountInEther.toString());

        console.log(`Intentando comprar producto ${productId} por ${amountInEther} ETH desde ${signer.address}...`);

        const tx = await walletContract.buyProduct(productId, {
            value: parsedAmount
        });
        
        const receipt = await tx.wait();
        console.log(`Compra exitosa: ${receipt.hash}`);
        return receipt;
    } catch (error) {
        console.error("Error en buyProduct:", error.message);
        if (error.reason) {
            throw new Error(error.reason);
        }
        throw new Error(error.message);
    }
}

async function disableProduct(productId, account) {
    return await createTransaction(
        WALLET_CONTRACT_ADDRESS,
        contract.abi,
        'disableProduct',
        [productId],
        account
    );
}

async function getAllProducts() {
    const walletContract = getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const rawProducts = await walletContract.getAllProducts();
    
    return rawProducts.map(formatProduct);
}

module.exports = {
    addProduct,
    buyProduct,
    disableProduct,
    getAllProducts
};