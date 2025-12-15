// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockOracle
 * @notice Mock price oracle for testing volatility calculations
 */
contract MockOracle is Ownable {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
    }

    /// @notice Price feeds for tokens (token => price data)
    mapping(address => PriceData) public prices;

    /// @notice Price history for volatility calculation
    mapping(address => uint256[]) public priceHistory;

    /// @notice Maximum history entries to keep
    uint256 public maxHistoryLength = 24;

    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Updates the price for a token
     * @param token The token address
     * @param price The new price (18 decimals)
     */
    function updatePrice(address token, uint256 price) external onlyOwner {
        prices[token] = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: 100
        });

        // Add to history
        priceHistory[token].push(price);

        // Trim history if too long
        if (priceHistory[token].length > maxHistoryLength) {
            // Shift array (expensive but OK for testing)
            for (uint i = 0; i < priceHistory[token].length - 1; i++) {
                priceHistory[token][i] = priceHistory[token][i + 1];
            }
            priceHistory[token].pop();
        }

        emit PriceUpdated(token, price, block.timestamp);
    }

    /**
     * @notice Batch updates prices for multiple tokens
     * @param tokens Array of token addresses
     * @param newPrices Array of prices
     */
    function batchUpdatePrices(
        address[] calldata tokens,
        uint256[] calldata newPrices
    ) external onlyOwner {
        require(tokens.length == newPrices.length, "Length mismatch");

        for (uint i = 0; i < tokens.length; i++) {
            prices[tokens[i]] = PriceData({
                price: newPrices[i],
                timestamp: block.timestamp,
                confidence: 100
            });

            priceHistory[tokens[i]].push(newPrices[i]);

            emit PriceUpdated(tokens[i], newPrices[i], block.timestamp);
        }
    }

    /**
     * @notice Gets the latest price for a token
     * @param token The token address
     * @return price The latest price
     * @return timestamp The update timestamp
     */
    function getLatestPrice(address token) external view returns (uint256 price, uint256 timestamp) {
        PriceData memory data = prices[token];
        return (data.price, data.timestamp);
    }

    /**
     * @notice Calculates volatility based on price history
     * @param token The token address
     * @return volatilityBps Volatility in basis points
     */
    function calculateVolatility(address token) external view returns (uint256 volatilityBps) {
        uint256[] memory history = priceHistory[token];
        
        if (history.length < 2) {
            return 0;
        }

        // Calculate simple volatility as max deviation from mean
        uint256 sum = 0;
        uint256 maxPrice = 0;
        uint256 minPrice = type(uint256).max;

        for (uint i = 0; i < history.length; i++) {
            sum += history[i];
            if (history[i] > maxPrice) maxPrice = history[i];
            if (history[i] < minPrice) minPrice = history[i];
        }

        uint256 meanPrice = sum / history.length;
        
        if (meanPrice == 0) return 0;

        // Volatility as (max - min) / mean in basis points
        volatilityBps = ((maxPrice - minPrice) * 10000) / meanPrice;
    }

    /**
     * @notice Gets the price history length for a token
     * @param token The token address
     * @return The number of historical prices
     */
    function getHistoryLength(address token) external view returns (uint256) {
        return priceHistory[token].length;
    }

    /**
     * @notice Sets the maximum history length
     * @param length The new maximum length
     */
    function setMaxHistoryLength(uint256 length) external onlyOwner {
        maxHistoryLength = length;
    }
}
