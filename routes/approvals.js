const express = require('express');
const router = express.Router();
const approvalsController = require('../controllers/approvals');

router.get('/:txId', approvalsController.getApprovalsByTxId);

module.exports = router;