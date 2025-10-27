pragma solidity ^0.8.0;

contract Pagos{
    address [] public payees;
    mapping(address => uint) public shares;
    uint public totalShares;

    event Desposit(address indexed from, uint amount);

    constructor(address[] memory _payees, uint[] memory _shares){
        require(_payees.length == _shares.length, "Payees and shares length mismatch");
        require(_payees.length > 0, "No payees");

        for(uint i = 0; i < _payees.length; i++){
            address payee = _payees[i];
            uint share = _shares[i];

            require(payee != address(0), "Payee is the zero address");
            require(share > 0, "Shares are 0");
            require(shares[payee] == 0, "Payee already has shares");

            payees.push(payee);
            shares[payee] = share;
            totalShares += share;
        }
    }

    function deposit() public payable {
        require(msg.value > 0, "No ether sent");
        emit Desposit(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function release() external {
        uint balance = address(this).balance;
        require(balance > 0, "No ether to release");
        for (uint i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint payment = (balance * shares[payee]) / totalShares;
            (bool success, ) = payee.call{value: payment}("");
            require(success, "Transfer failed");
        }
    }
}
