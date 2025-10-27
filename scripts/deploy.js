require('dotenv').config();
const { ethers } = require("hardhat");

const { PUBLIC_KEY_1, PUBLIC_KEY_2 } = process.env;

async function main() {
    
    const owners = [
        PUBLIC_KEY_1,
        PUBLIC_KEY_2
    ];

    const requiredApprovals = 2;

    const payees = [
        PUBLIC_KEY_1,
        PUBLIC_KEY_2
    ];
    
    const shares = [80, 20];

    if (!payees[0] || !payees[1] || !owners[0] || !owners[1]) {
        console.error("Asegúrate de que PUBLIC_KEY_1 y PUBLIC_KEY_2 estén en tu archivo .env");
        return;
    }

    console.log("Desplegando 'MultiSignPaymentWallet' con la siguiente configuración:");
    console.log("  Owners:", owners);
    console.log("  Required Approvals:", requiredApprovals);
    console.log("  Payees:", payees);
    console.log("  Shares:", shares);

    const MultiSignWallet = await ethers.getContractFactory("MultiSignPaymentWallet");
    
    const wallet = await MultiSignWallet.deploy(
        owners,
        requiredApprovals,
        payees,
        shares
    );

    await wallet.waitForDeployment();

    console.log("¡Contrato 'MultiSignPaymentWallet' desplegado en la dirección!:", wallet.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });