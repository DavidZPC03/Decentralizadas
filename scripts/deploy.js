const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const partyA_address = process.env.PUBLIC_KEY_1;
  const partyB_address = process.env.PUBLIC_KEY_2; 

  const percentageA = 70;
  const percentageB = 30;

  if (!partyA_address || !partyB_address) {
    console.error("Error: no hay llaves PUBLIC_KEY_1 y PUBLIC_KEY_2 en .env");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();

  console.log("Desplegando contrato 'Examen.sol' con la cuenta:", deployer.address);
  console.log("-----------------------------------");
  console.log("Parámetros del Constructor:");
  console.log(`  Cuenta#1 A (recibe ${percentageA}%):`, partyA_address);
  console.log(`  Cuenta#2 (recibe ${percentageB}%):`, partyB_address);
  console.log("-----------------------------------");

  const Examen = await ethers.getContractFactory("Examen");

  const examenContract = await Examen.deploy(
    partyA_address,
    partyB_address,
    percentageA,
    percentageB
  );

  await examenContract.waitForDeployment();

  const contractAddress = examenContract.target;
  console.log("Contrato 'Examen.sol' desplegado exitosamente en:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });