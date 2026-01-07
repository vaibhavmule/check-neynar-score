// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DailyClaim is Ownable, ReentrancyGuard {
    IERC20 public token;
    uint256 public dailyClaimAmount;
    
    // Mapping to track the last claim timestamp for each address
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event ClaimAmountUpdated(uint256 newAmount);
    event TokenUpdated(address newToken);
    event Claimed(address indexed user, uint256 amount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);
    
    constructor(address _token, uint256 _dailyClaimAmount) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
        dailyClaimAmount = _dailyClaimAmount;
    }
    
    /**
     * @dev Sets the token address
     * @param _token The new token address
     */
    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
        emit TokenUpdated(_token);
    }
    
    /**
     * @dev Sets the daily claim amount
     * @param _amount The new daily claim amount
     */
    function setDailyClaimAmount(uint256 _amount) external onlyOwner {
        dailyClaimAmount = _amount;
        emit ClaimAmountUpdated(_amount);
    }
    
    /**
     * @dev Checks if an address is eligible for a daily claim
     * @param _user The address to check
     * @return bool Whether the address is eligible
     */
    function isEligibleForClaim(address _user) public view returns (bool) {
        // Check if 24 hours (86400 seconds) have passed since the last claim
        return (block.timestamp - lastClaimTime[_user]) >= 1 days;
    }
    
    /**
     * @dev Claims the daily token amount if eligible
     */
    function claim() external nonReentrant {
        require(isEligibleForClaim(msg.sender), "Already claimed today");
        require(getContractBalance() >= dailyClaimAmount, "Insufficient contract balance");
        
        // Update last claim time
        lastClaimTime[msg.sender] = block.timestamp;
        
        // Transfer tokens to the claimer
        bool success = token.transfer(msg.sender, dailyClaimAmount);
        require(success, "Token transfer failed");
        
        emit Claimed(msg.sender, dailyClaimAmount);
    }
    
    /**
     * @dev Gets the token balance of this contract
     * @return uint256 The token balance
     */
    function getContractBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Deposits tokens into the contract
     * @param _amount The amount to deposit
     */
    function depositTokens(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
    }
    
    /**
     * @dev Emergency withdrawal of all tokens by the owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = getContractBalance();
        require(balance > 0, "No tokens to withdraw");
        
        bool success = token.transfer(owner(), balance);
        require(success, "Token transfer failed");
        
        emit EmergencyWithdrawal(owner(), balance);
    }
}










