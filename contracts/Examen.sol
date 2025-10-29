pragma solidity ^0.8.20;
import "hardhat/console.sol";

contract Examen {
    address payable public partyA;
    address payable public partyB;
    uint256 public percentageA;
    uint256 public percentageB;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        bool isActive;
    }
    mapping(uint256 => Product) public products;
    uint256 private nextProductId = 1; 
    
    mapping(uint256 => uint256) public fundsHeldForProduct;

    struct Release {
        uint256 id;
        uint256 amount;
        uint256 timestamp;
    }
    Release[] public releasesLog;
    uint256 private nextReleaseId = 1;

    event ContractDeployed(
        address indexed _partyA,
        address indexed _partyB,
        uint256 _percentageA,
        uint256 _percentageB
    );
    
    event ProductCreated(
        uint256 indexed productId,
        string name,
        uint256 price
    );
    
    event FundsDeposited(
        uint256 indexed productId,
        address indexed depositor,
        uint256 amount
    );
    
    event FundsReleased(
        uint256 indexed productId,
        uint256 totalAmount,
        uint256 amountSentToA,
        uint256 amountSentToB
    );

    constructor(
        address payable _partyA,
        address payable _partyB,
        uint256 _percentageA,
        uint256 _percentageB
    ) {
        require(_partyA != address(0) && _partyB != address(0), "Direcciones invalidas");
        require(_percentageA + _percentageB == 100, "Los porcentajes deben sumar 100");

        partyA = _partyA;
        partyB = _partyB;
        percentageA = _percentageA;
        percentageB = _percentageB;

        emit ContractDeployed(_partyA, _partyB, _percentageA, _percentageB);
    }

    function createProduct(string memory _name, uint256 _price) external {
        require(_price > 0, "El precio debe ser mayor a 0");
        uint256 newId = nextProductId;
        
        products[newId] = Product({
            id: newId,
            name: _name,
            price: _price,
            isActive: true
        });
        
        nextProductId++;
        emit ProductCreated(newId, _name, _price);
    }

    function depositForProduct(uint256 _productId) external payable {
        Product storage product = products[_productId];
        
        require(product.id != 0, "Producto no existe");
        require(product.isActive, "Producto no esta activo");
        require(msg.value == product.price, "Monto incorrecto, debe ser igual al precio");

        fundsHeldForProduct[_productId] += msg.value;
        
        emit FundsDeposited(_productId, msg.sender, msg.value);
    }

    function releaseFunds(uint256 _productId) external {
        uint256 totalAmount = fundsHeldForProduct[_productId];
        require(totalAmount > 0, "No hay fondos para liberar");

        uint256 amountA = (totalAmount * percentageA) / 100;
        uint256 amountB = totalAmount - amountA; 

        fundsHeldForProduct[_productId] = 0;

        (bool sentA, ) = partyA.call{value: amountA}("");
        require(sentA, "Fallo al enviar a A");

        (bool sentB, ) = partyB.call{value: amountB}("");
        require(sentB, "Fallo al enviar a B");

        releasesLog.push(Release(
            nextReleaseId,
            totalAmount,
            block.timestamp
        ));
        nextReleaseId++;

        emit FundsReleased(_productId, totalAmount, amountA, amountB);
    }

    function getAllReleases() external view returns (Release[] memory) {
        return releasesLog;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}