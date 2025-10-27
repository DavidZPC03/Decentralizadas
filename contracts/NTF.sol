pragma solidity >= 0.8.0 < 0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTClase is ERC721,Ownable{
            
        using Counters for Counters.Counter;
        Counters.Counter private _tokenIds;

        using Strings for uint256;
        mapping (uint256 => string) private _tokenURIs;

        constructor() ERC721("NFTlewy", "NFTC") {}
        string private _baseURIextended;

        function setBaseURI(string memory baseURI_) external onlyOwner() {
            _baseURIextended = baseURI_;
        }

        function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
            require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
            _tokenURIs[tokenId] = _tokenURI;
        }

        function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
            require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

            string memory _tokenURI = _tokenURIs[tokenId];
            string memory base = _baseURI();

            if (bytes(base).length == 0) {
                return _tokenURI;
            }
            if (bytes(_tokenURI).length > 0) {
                return string(abi.encodePacked(base, _tokenURI));
            }

            return string(abi.encodePacked(base, tokenId.toString()));
        }

        function minNFT(address player, string memory uri) public onlyOwner() returns (uint256){
            _tokenIds.increment();

            uint256 newItemId = _tokenIds.current();
            _mint(player, newItemId);
            _setTokenURI(newItemId, uri);

            return newItemId;
        }
}