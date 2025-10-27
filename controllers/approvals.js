const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT_ADDRESS } = process.env;


async function getApprovalDetails(txId) {
    const walletContract = getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const details = await walletContract.getApprovalDetails(txId);

    return details.map(approval => {

        const timestampMs = Number(approval.timestamp) * 1000;
        const date = new Date(timestampMs);
        
        return {
            approver: approval.approver,
            timestamp: approval.timestamp.toString(),
            date: date.toLocaleString() 
        };
    });
}

// Controlador para la ruta
async function getApprovalsByTxId(req, res) {
    try {
        const { txId } = req.params;
        const details = await getApprovalDetails(txId);
        
        // Formateamos la respuesta final como en el ejemplo del PDF 
        const responseData = {
            txId: txId,
            totalApprovals: details.length,
            approvals: details
        };
        
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error al obtener aprobaciones:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getApprovalsByTxId
};