import { ethers } from 'ethers';

// ABI snippets for the contracts
const VAULT_MANAGER_ABI = [
    'function createVault(address tokenA, address tokenB, tuple(int24 tickLower, int24 tickUpper, uint256 rebalanceThreshold, bool autoRebalance) params) external returns (uint256)',
    'function deposit(uint256 vaultId, uint256 amountA, uint256 amountB) external returns (uint256)',
    'function withdraw(uint256 vaultId, uint256 shares) external returns (uint256, uint256)',
    'function rebalance(uint256 vaultId, bytes calldata strategyData) external',
    'function getVaultInfo(uint256 vaultId) external view returns (tuple(uint256 vaultId, address owner, address tokenA, address tokenB, uint256 totalShares, uint256 totalTokenA, uint256 totalTokenB, address strategy, uint256 lastRebalance, bool isActive))',
    'function getUserShares(uint256 vaultId, address user) external view returns (uint256)',
    'function getVaultStrategy(uint256 vaultId) external view returns (tuple(int24 tickLower, int24 tickUpper, uint256 rebalanceThreshold, bool autoRebalance))',
    'function vaultCount() external view returns (uint256)',
    'event VaultCreated(uint256 indexed vaultId, address indexed owner, address tokenA, address tokenB)',
    'event Deposit(uint256 indexed vaultId, address indexed user, uint256 amountA, uint256 amountB, uint256 shares)',
    'event Withdraw(uint256 indexed vaultId, address indexed user, uint256 shares, uint256 amountA, uint256 amountB)',
    'event Rebalanced(uint256 indexed vaultId, address indexed executor, bytes32 detailsHash)',
];

const ERC20_ABI = [
    'function balanceOf(address owner) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function approve(address spender, uint256 amount) external returns (bool)',
];

export interface VaultInfo {
    vaultId: number;
    owner: string;
    tokenA: string;
    tokenB: string;
    totalShares: string;
    totalTokenA: string;
    totalTokenB: string;
    strategy: string;
    lastRebalance: number;
    isActive: boolean;
}

export interface VaultStrategy {
    tickLower: number;
    tickUpper: number;
    rebalanceThreshold: number;
    autoRebalance: boolean;
}

/**
 * Blockchain Service
 * Handles all on-chain interactions
 */
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet | null = null;
    private vaultManager: ethers.Contract | null = null;

    private readonly RPC_URL: string;
    private readonly VAULT_MANAGER_ADDRESS: string;

    constructor() {
        this.RPC_URL = process.env.OPBNB_TESTNET_RPC || 'https://opbnb-testnet-rpc.bnbchain.org';
        this.VAULT_MANAGER_ADDRESS = process.env.VAULT_MANAGER_ADDRESS || '';

        this.provider = new ethers.JsonRpcProvider(this.RPC_URL);

        if (process.env.PRIVATE_KEY) {
            this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        }

        if (this.VAULT_MANAGER_ADDRESS) {
            this.vaultManager = new ethers.Contract(
                this.VAULT_MANAGER_ADDRESS,
                VAULT_MANAGER_ABI,
                this.signer || this.provider
            );
        }
    }

    /**
     * Checks if the service is properly configured
     */
    isConfigured(): boolean {
        return !!this.VAULT_MANAGER_ADDRESS && !!this.signer;
    }

    /**
     * Gets the current block number
     */
    async getBlockNumber(): Promise<number> {
        return this.provider.getBlockNumber();
    }

    /**
     * Gets the total number of vaults
     */
    async getVaultCount(): Promise<number> {
        if (!this.vaultManager) return 0;
        const count = await this.vaultManager.vaultCount();
        return Number(count);
    }

    /**
     * Gets vault information by ID
     */
    async getVaultInfo(vaultId: number): Promise<VaultInfo | null> {
        if (!this.vaultManager) return null;

        try {
            const info = await this.vaultManager.getVaultInfo(vaultId);
            return {
                vaultId: Number(info.vaultId),
                owner: info.owner,
                tokenA: info.tokenA,
                tokenB: info.tokenB,
                totalShares: info.totalShares.toString(),
                totalTokenA: info.totalTokenA.toString(),
                totalTokenB: info.totalTokenB.toString(),
                strategy: info.strategy,
                lastRebalance: Number(info.lastRebalance),
                isActive: info.isActive,
            };
        } catch (error) {
            console.error(`Error fetching vault ${vaultId}:`, error);
            return null;
        }
    }

    /**
     * Gets vault strategy parameters
     */
    async getVaultStrategy(vaultId: number): Promise<VaultStrategy | null> {
        if (!this.vaultManager) return null;

        try {
            const strategy = await this.vaultManager.getVaultStrategy(vaultId);
            return {
                tickLower: Number(strategy.tickLower),
                tickUpper: Number(strategy.tickUpper),
                rebalanceThreshold: Number(strategy.rebalanceThreshold),
                autoRebalance: strategy.autoRebalance,
            };
        } catch (error) {
            console.error(`Error fetching strategy for vault ${vaultId}:`, error);
            return null;
        }
    }

    /**
     * Gets user's shares in a vault
     */
    async getUserShares(vaultId: number, userAddress: string): Promise<string> {
        if (!this.vaultManager) return '0';

        try {
            const shares = await this.vaultManager.getUserShares(vaultId, userAddress);
            return shares.toString();
        } catch (error) {
            console.error(`Error fetching shares for user ${userAddress} in vault ${vaultId}:`, error);
            return '0';
        }
    }

    /**
     * Lists all vaults with optional owner filter
     */
    async listVaults(owner?: string, page = 1, perPage = 20): Promise<VaultInfo[]> {
        if (!this.vaultManager) return [];

        const totalVaults = await this.getVaultCount();
        const vaults: VaultInfo[] = [];

        const start = (page - 1) * perPage + 1;
        const end = Math.min(start + perPage - 1, totalVaults);

        for (let i = start; i <= end; i++) {
            const vault = await this.getVaultInfo(i);
            if (vault) {
                if (!owner || vault.owner.toLowerCase() === owner.toLowerCase()) {
                    vaults.push(vault);
                }
            }
        }

        return vaults;
    }

    /**
     * Executes a rebalance transaction
     */
    async executeRebalance(
        vaultId: number,
        tickLower: number,
        tickUpper: number,
        reallocatePct: number
    ): Promise<{ txHash: string; gasUsed: string }> {
        if (!this.vaultManager || !this.signer) {
            throw new Error('Blockchain service not configured');
        }

        const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
            ['int24', 'int24', 'uint256'],
            [tickLower, tickUpper, reallocatePct]
        );

        const tx = await this.vaultManager.rebalance(vaultId, strategyData);
        const receipt = await tx.wait();

        return {
            txHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    /**
     * Gets token information
     */
    async getTokenInfo(tokenAddress: string): Promise<{ symbol: string; decimals: number }> {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

        try {
            const [symbol, decimals] = await Promise.all([
                token.symbol(),
                token.decimals(),
            ]);
            return { symbol, decimals: Number(decimals) };
        } catch (error) {
            console.error(`Error fetching token info for ${tokenAddress}:`, error);
            return { symbol: 'UNKNOWN', decimals: 18 };
        }
    }

    /**
     * Estimates gas for a rebalance
     */
    async estimateRebalanceGas(
        vaultId: number,
        tickLower: number,
        tickUpper: number,
        reallocatePct: number
    ): Promise<string> {
        if (!this.vaultManager) return '0';

        const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
            ['int24', 'int24', 'uint256'],
            [tickLower, tickUpper, reallocatePct]
        );

        try {
            const gasEstimate = await this.vaultManager.rebalance.estimateGas(vaultId, strategyData);
            return gasEstimate.toString();
        } catch (error) {
            console.error('Error estimating gas:', error);
            return '500000'; // Default estimate
        }
    }

    /**
     * Creates a mock vault for demo purposes
     */
    async createMockVault(): Promise<VaultInfo> {
        // For demo when contracts aren't deployed
        return {
            vaultId: 1,
            owner: '0x1234567890123456789012345678901234567890',
            tokenA: '0x4200000000000000000000000000000000000006', // WBNB
            tokenB: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', // USDT
            totalShares: '1000000000000000000',
            totalTokenA: '10000000000000000000', // 10 BNB
            totalTokenB: '6000000000', // 6000 USDT
            strategy: '0x0000000000000000000000000000000000000000',
            lastRebalance: Math.floor(Date.now() / 1000) - 7200,
            isActive: true,
        };
    }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
