// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @notice Mock token for testing purposes
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mints tokens to an address (for testing)
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from an address (for testing)
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/**
 * @title MockWBNB
 * @notice Mock Wrapped BNB for testing
 */
contract MockWBNB is MockERC20 {
    constructor() MockERC20("Wrapped BNB", "WBNB", 18) {}

    /**
     * @notice Wraps BNB into WBNB
     */
    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

    /**
     * @notice Unwraps WBNB to BNB
     * @param amount The amount to unwrap
     */
    function withdraw(uint256 amount) external {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {
        _mint(msg.sender, msg.value);
    }
}

/**
 * @title MockUSDT
 * @notice Mock USDT for testing (6 decimals)
 */
contract MockUSDT is MockERC20 {
    constructor() MockERC20("Tether USD", "USDT", 6) {}
}

/**
 * @title MockUSDC
 * @notice Mock USDC for testing (6 decimals)
 */
contract MockUSDC is MockERC20 {
    constructor() MockERC20("USD Coin", "USDC", 6) {}
}
