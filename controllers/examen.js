const { ethers } = require("ethers");
require("dotenv").config();

const {
  API_URL,
  PRIVATE_KEY_1,
  EXAMEN_CONTRACT_ADDRESS
} = process.env;

if (!API_URL || !PRIVATE_KEY_1 || !EXAMEN_CONTRACT_ADDRESS) {
  console.error(
    "Error: Faltan variables de entorno. Asegúrate de tener API_URL, PRIVATE_KEY_1 y EXAMEN_CONTRACT_ADDRESS en tu .env"
  );
  process.exit(1);
}

const contractArtifact = require("../artifacts/contracts/Examen.sol/Examen.json");
const contractABI = contractArtifact.abi;
const provider = new ethers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY_1, provider);

const examenContract = new ethers.Contract(
  EXAMEN_CONTRACT_ADDRESS,
  contractABI,
  signer
);

console.log(
  `Online 'examen.js' la mochila pesa conectado al contrato en: ${EXAMEN_CONTRACT_ADDRESS}`
);

exports.createProduct = async (req, res) => {
  const { name, priceInEther } = req.body;

  if (!name || !priceInEther) {
    return res.status(400).json({
      error: "Datos incompletos. Se requiere 'name' y 'priceInEther'.",
    });
  }

  try {
    const priceInWei = ethers.parseEther(priceInEther);

    console.log(`Creando producto '${name}' con precio ${priceInEther} ETH...`);

    const tx = await examenContract.createProduct(name, priceInWei);

    const receipt = await tx.wait();

    console.log(`Producto creado. TxHash: ${receipt.hash}`);
    res.status(201).json({
      message: "Producto creado exitosamente.",
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({
      error: "Error al crear el producto.",
      details: error.message,
    });
  }
};

exports.depositForProduct = async (req, res) => {
  const { productId, amountInEther } = req.body;

  if (!productId || !amountInEther) {
    return res
      .status(400)
      .json({
        error: "Datos incompletos. Se requiere 'productId' y 'amountInEther'.",
      });
  }

  try {
    const amountInWei = ethers.parseEther(amountInEther);

    console.log(
      `Depositando ${amountInEther} ETH para el producto ${productId}...`
    );

    const tx = await examenContract.depositForProduct(productId, {
      value: amountInWei,
    });

    const receipt = await tx.wait();

    console.log(`Depósito realizado. TxHash: ${receipt.hash}`);
    res.status(200).json({
      message: "Depósito realizado exitosamente.",
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("Error en depositForProduct:", error);
    res.status(500).json({
      error: "Error al realizar el depósito.",
      details: error.message,
    });
  }
};

exports.releaseFunds = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res
      .status(400)
      .json({ error: "Datos incompletos. Se requiere 'productId'." });
  }

  try {
    console.log(`Liberando fondos para el producto ${productId}...`);
    const tx = await examenContract.releaseFunds(productId);
    const receipt = await tx.wait();

    console.log(`Fondos liberados. TxHash: ${receipt.hash}`);
    res.status(200).json({
      message: "Fondos liberados y distribuidos exitosamente.",
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("Error en releaseFunds:", error);
    res.status(500).json({
      error: "Error al liberar los fondos.",
      details: error.message,
    });
  }
};

exports.getAllReleases = async (req, res) => {
  try {
    console.log("Obteniendo historial de liberaciones...");
    const releases = await examenContract.getAllReleases();
    const formattedReleases = releases.map((release) => {
      return {
        id: release.id.toString(),
        amount: ethers.formatEther(release.amount) + " ETH",
        timestamp: new Date(Number(release.timestamp) * 1000).toLocaleString(),
      };
    });

    res.status(200).json(formattedReleases);
  } catch (error) {
    console.error("Error en getAllReleases:", error);
    res.status(500).json({
      error: "Error al obtener el historial de liberaciones.",
      details: error.message,
    });
  }
};

exports.getContractInfo = async (req, res) => {
  try {
    console.log("Obteniendo información del contrato...");

    const balanceWei = await provider.getBalance(EXAMEN_CONTRACT_ADDRESS);
    const balanceEther = ethers.formatEther(balanceWei);

    const partyA = await examenContract.partyA();
    const partyB = await examenContract.partyB();
    const percentageA = (await examenContract.percentageA()).toString();
    const percentageB = (await examenContract.percentageB()).toString();

    res.status(200).json({
      contractAddress: EXAMEN_CONTRACT_ADDRESS,
      contractBalance: `${balanceEther} ETH`,
      distribution: {
        partyA: {
          address: partyA,
          percentage: `${percentageA}%`,
        },
        partyB: {
          address: partyB,
          percentage: `${percentageB}%`,
        },
      },
    });
  } catch (error) {
    console.error("Error en getContractInfo:", error);
    res.status(500).json({
      error: "Error al obtener la información del contrato.",
      details: error.message,
    });
  }
};


exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await examenContract.products(id);

    if (product.id === 0n) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      price: ethers.formatEther(product.price) + " ETH",
      isActive: product.isActive,
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error en getProductById:", error);
    res.status(500).json({
      error: "Error al obtener el producto.",
      details: error.message,
    });
  }
};