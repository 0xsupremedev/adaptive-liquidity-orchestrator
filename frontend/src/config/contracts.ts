export const VAULT_MANAGER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with deployed address

export const VAULT_MANAGER_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "tokenA", "type": "address" },
            { "internalType": "address", "name": "tokenB", "type": "address" },
            {
                "components": [
                    { "internalType": "int24", "name": "tickLower", "type": "int24" },
                    { "internalType": "int24", "name": "tickUpper", "type": "int24" },
                    { "internalType": "uint256", "name": "rebalanceThreshold", "type": "uint256" },
                    { "internalType": "bool", "name": "autoRebalance", "type": "bool" }
                ],
                "internalType": "struct IVaultManager.StrategyParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "createVault",
        "outputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "tokenA", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "tokenB", "type": "address" }
        ],
        "name": "VaultCreated",
        "type": "event"
    }
] as const;
