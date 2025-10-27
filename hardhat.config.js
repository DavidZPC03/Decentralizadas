// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// // Usa el paquete actualizado de Hardhat
// require("@nomicfoundation/hardhat-toolbox");

// Valida que las variables necesarias existan para evitar errores
if (!process.env.API_URL || !process.env.PRIVATE_KEY_1) {
  console.error("Error: API_URL o PRIVATE_KEY_1 no están definidas en el archivo .env");
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // <-- ¡Cambia esta línea!
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.API_URL,
      // Asegúrate de que el nombre de la variable coincida con tu .env
      accounts: [process.env.PRIVATE_KEY_1] 
    }
  }
};