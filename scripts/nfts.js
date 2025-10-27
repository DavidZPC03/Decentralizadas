// nfts.js - Versión Final con Enlaces de Etherscan

const dotenv = require("dotenv");
dotenv.config();

const { ethers } = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const FormData = require("form-data");

const nftArtifact = require("../artifacts/contracts/NTF.sol/NFTClase.json");
const nftABI = nftArtifact.abi;

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    PUBLIC_KEY,
    PRIVATE_KEY,
    API_URL,
    NFT_CONTRACT_ADDRESS
} = process.env;

async function uploadImageToIPFS(imageRoute) {
    console.log(`Subiendo ${path.basename(imageRoute)} a IPFS...`);
    const stream = fs.createReadStream(imageRoute);
    const data = new FormData();
    data.append('file', stream, { filename: path.basename(imageRoute) });

    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers: {
            ...data.getHeaders(),
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
        }
    });

    const { IpfsHash } = fileResponse.data;
    const imgUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(`Imagen subida a: ${imgUrl}`);
    return imgUrl;
}

async function createTokenURI(metadata) {
    console.log(`Creando metadata para "${metadata.name}"...`);
    const jsonResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
            headers: {
                "Content-Type": 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        }
    );

    const { IpfsHash } = jsonResponse.data;
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(`Metadata subida. Token URI: ${tokenURI}`);
    return tokenURI;
}

async function mintNFT(tokenURI, currentNonce) {
    console.log("Preparando la transacción de minteo...");
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const etherInterface = new ethers.utils.Interface(nftABI);
    const data = etherInterface.encodeFunctionData('minNFT', [PUBLIC_KEY, tokenURI]);

    const transaction = {
        from: PUBLIC_KEY,
        to: NFT_CONTRACT_ADDRESS,
        nonce: currentNonce,
        gasPrice: await provider.getGasPrice(),
        data: data,
    };

    transaction.gasLimit = await provider.estimateGas(transaction);

    const signedTX = await wallet.signTransaction(transaction);
    const receipt = await provider.sendTransaction(signedTX);
    
    console.log("Esperando confirmación de la transacción...");
    await receipt.wait();
    // La impresión del hash ahora se hará en la función 'main'
    return receipt.hash;
}

async function main() {
    try {
        const imageFolderPath = path.join(__dirname, '../image');
        const files = fs.readdirSync(imageFolderPath);
        const imageFiles = files.filter(file => ['.png', '.jpg', '.jpeg', '.gif'].includes(path.extname(file).toLowerCase()));

        const provider = new ethers.providers.JsonRpcProvider(API_URL);
        let nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest');

        console.log(`Se encontraron ${imageFiles.length} imágenes para mintear.`);
        console.log(`Nonce inicial: ${nonce}`);

        for (const fileName of imageFiles) {
            console.log(`\n--- Procesando: ${fileName} ---`);
            const imagePath = path.join(imageFolderPath, fileName);

            const imageUrl = await uploadImageToIPFS(imagePath);

            const metadata = {
                name: `Mi NFT #${path.parse(fileName).name}`,
                description: `Un NFT único generado a partir de la imagen ${fileName}.`,
                image: imageUrl,
                attributes: [
                    {
                        trait_type: "Número de archivo",
                        value: imageFiles.indexOf(fileName) + 1
                    }
                ]
            };

            const tokenURI = await createTokenURI(metadata);
            
            // Capturamos el hash de la transacción que devuelve la función
            const txHash = await mintNFT(tokenURI, nonce);

            // ¡NUEVO! Imprimimos el enlace directo a Etherscan
            const etherscanLink = `https://sepolia.etherscan.io/tx/${txHash}`;
            console.log(`✅ ¡Éxito! Puedes ver tu transacción en: ${etherscanLink}`);

            nonce++;
        }

        console.log("\n¡Proceso completado! Todos los NFTs han sido minteados.");

    } catch (error) {
        console.error("\nOcurrió un error durante el proceso de minteo masivo:", error);
    }
}

main();