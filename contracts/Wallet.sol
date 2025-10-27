//SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract MultiSignPaymentWallet {
    address[] public owners;
    uint public requiredApprovals;
    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint amount;
        uint approvalCount;
        bool executed;
    }
    Transaction[] public transactions;

    // --- NUEVO: Struct para guardar los detalles de la aprobación ---
    struct Approval {
        address approver;
        uint timestamp;
    }

    // --- MODIFICADO: Mapeo para chequear si alguien ya aprobó ---
    mapping(uint => mapping(address => bool)) public hasApproved;

    // --- NUEVO: Mapeo para guardar la lista de detalles de aprobación por txId ---
    mapping(uint => Approval[]) public approvalDetails;
    
    address[] public payees;
    mapping(address => uint) public shares;
    uint256 public totalShares;
    
    uint256 private _status;
    modifier nonReentrant() {
        require(_status != 2, "Reentrancy Guard:Reentrant call");
        _status = 2;
        _;
        _status = 1;
    }
    event Deposit(address indexed sender, uint amount);
    event TransactionSubmitted(uint indexed txId, address indexed to, uint amount);
    event TransactionApproved(uint indexed txId, address indexed owner);
    event TransactionExecuted(uint indexed txId, address indexed to, uint amount);
    event PaymentReleased(address indexed payee, uint amount);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    constructor(address[] memory _owners, uint _requireApprovals, address[] memory _payees, uint256[] memory _shares) {
        _status = 1;
        require(_owners.length > 0, "Must have owners");
        require(_requireApprovals > 0 && _requireApprovals <= _owners.length, "Invalid Approvals");
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid Address");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        requiredApprovals = _requireApprovals;
        
        require(_payees.length == _shares.length, "Length mismatch");
        require(_payees.length > 0, "No payees");
        for (uint i = 0; i < _payees.length; i++) {
            require(_payees[i] != address(0), "invalid address");
            require(_shares[i] > 0, "shares must be>0");
            payees.push(_payees[i]);
            shares[_payees[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    function deposit() public payable {
        require(msg.value > 0, "Debes mandar ether");
        emit Deposit(msg.sender, msg.value);
    }

    function SubmitTransaction(address _to, uint amount) external onlyOwner {
        require(_to != address(0), "Invalid Address");
        require(amount > 0, "Invalid Amount");
        transactions.push(Transaction({
            to: _to,
            amount: amount,
            approvalCount: 0,
            executed: false
        }));
        emit TransactionSubmitted(transactions.length - 1, _to, amount);
    }

    // --- FUNCIÓN COMPLETAMENTE MODIFICADA ---
    function approveTransaction(uint txId) external onlyOwner {
        Transaction storage transaction = transactions[txId];
        require(!transaction.executed, "Tx already executed");
        require(!hasApproved[txId][msg.sender], "Tx already approved by caller");

        hasApproved[txId][msg.sender] = true;
        transaction.approvalCount += 1;

        approvalDetails[txId].push(Approval({
            approver: msg.sender,
            timestamp: block.timestamp
        }));

        emit TransactionApproved(txId, msg.sender);
    }

    function executeTransaction(uint txId) external onlyOwner nonReentrant {
        Transaction storage transaction = transactions[txId];
        require(transaction.approvalCount >= requiredApprovals, "Not enough approvals");
        require(!transaction.executed, "Tx already executed");
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.amount}("");
        require(success, "Tx failed");
        emit TransactionExecuted(txId, transaction.to, transaction.amount);
    }

    function releasePayment(address payable payee) external nonReentrant {
        require(shares[payee] > 0, "No shares for payee");
        uint256 totalReceived = address(this).balance;
        uint256 payment = (totalReceived * shares[payee]) / totalShares;
        require(payment > 0, "No payment due");
        
        (bool success, ) = payee.call{value: payment}("");
        require(success, "Payment failed");
        emit PaymentReleased(payee, payment);
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint txId) public view returns (address, uint, uint, bool) {
        Transaction storage transaction = transactions[txId];
        return (
            transaction.to,
            transaction.amount,
            transaction.approvalCount,
            transaction.executed
        );
    }

    function getApprovalDetails(uint txId) public view returns (Approval[] memory) {
        return approvalDetails[txId];
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}