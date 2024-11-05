// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";
contract BuyMyRoom {
    address public platform;
    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HousePurchased(uint256 tokenId, uint256 price, address previousOwner, address newOwner);
    // maybe you need a struct to store car information
    struct House {
        uint256 tokenID;
        address owner;
        uint256 listedTimestamp;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => House) public houses; // A map from house-index to its information
    mapping(address => bool) isTook;
    uint256 private currentTokenId = 0;
    // TODO add any variables and functions if you want
    function getHouses() external{
        require(isTook[msg.sender] == false, "The user has already claimed the property");
        for(int i = 0; i < 3 ; i++){
        currentTokenId++;
        houses[currentTokenId] = House({
            tokenID: currentTokenId,
            owner: msg.sender,
            listedTimestamp: 0,
            price: 0,
            isListed: false
        });
        }
        isTook[msg.sender] = true;
    }

    constructor() {
        platform = msg.sender;
    }


    function listHouse(uint256 tokenId, uint256 price) external {
        require(houses[tokenId].owner == msg.sender, "Only the owner can list the house.");
        require(price > 0, "Price must be greater than zero.");
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].price = price;
        houses[tokenId].isListed = true;
        emit HouseListed(tokenId, price, msg.sender);
    }

    function unlistHouse(uint256 tokenId) external {
        require(houses[tokenId].owner == msg.sender, "Only the owner can unlist the house.");
        require(houses[tokenId].isListed == true, "House is not listed.");
        houses[tokenId].price = 0;
        houses[tokenId].isListed = false;
    }

    function buyHouse(uint256 tokenId) external payable {
        House storage house = houses[tokenId];
        require(house.isListed, "House is not listed for sale.");
        require(msg.value == house.price, "Incorrect value sent.");
        address previousOwner = house.owner;
        uint256 fee = (house.price * (block.timestamp - house.listedTimestamp) * 50)/ 1000 / (1 days);
        // 将房款转给卖家
        payable(house.owner).transfer(msg.value - fee);
        // 收取手续费
        payable(platform).transfer(fee);
        // 转让 NFT 所有权
        // 更新房产信息
        house.owner = msg.sender;
        house.isListed = false;
        house.listedTimestamp = 0;
        house.price = 0;
        emit HousePurchased(tokenId, msg.value, previousOwner, msg.sender);
    }

    function getOwnedHouses() external view returns (House[] memory) {
        uint256 count = 0;

        for (uint256 i = 1; i <= currentTokenId; i++) {
            if (houses[i].owner == msg.sender) {
                count++;
            }
        }

       House[] memory  ownedHouses= new House[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= currentTokenId; i++) {
            if (houses[i].owner == msg.sender) {
                ownedHouses[index] = houses[i];
                index++;
            }
        }
        return ownedHouses;
    }

    function getListedHouses() external view returns (House[] memory) {
        uint256 count = 0;

        for (uint256 i = 1; i <= currentTokenId; i++) {
            if (houses[i].isListed) {
                count++;
            }
        }

        House[] memory listedHouses = new House[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= currentTokenId; i++) {
            if (houses[i].isListed) {
                listedHouses[index] = houses[i];
                index++;
            }
        }
        return listedHouses;
    }
    // ...
    // TODO add any logic if you want
}