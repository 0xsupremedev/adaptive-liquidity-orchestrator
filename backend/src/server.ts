import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { SiweMessage } from 'siwe';
import { randomUUID } from 'crypto';
import {
    LoginRequestSchema,
    CreateVaultRequestSchema,
    OptimizerScoreRequestSchema,
    BacktestRequestSchema,
    SubmitSignalRequestSchema,
    OptimizerScore,
    BacktestResult,
    RelayerJob,
} from './types/index.js';
import { optimizerService } from './services/optimizer.service.js';
import { blockchainService } from './services/blockchain.service.js';

// Create Fastify instance
const app: FastifyInstance = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
});

// In-memory stores (use database in production)
const sessions: Map<string, { address: string; expiresAt: number }> = new Map();
const jobs: Map<string, RelayerJob> = new Map();

// Helper function to generate unique IDs
function generateId(): string {
    return randomUUID();
}

// ============ Health & Info ============

app.get('/api/v1/health', async () => {
    let blockNumber = 0;
    try {
        blockNumber = await blockchainService.getBlockNumber();
    } catch (e) {
        // Ignore if not connected
    }

    return {
        status: 'ok',
        chain: 'opBNB',
        lastBlock: blockNumber,
        timestamp: Date.now(),
        configured: blockchainService.isConfigured(),
    };
});

// ============ Auth ============

app.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = LoginRequestSchema.parse(request.body);

        // Parse and verify SIWE message
        const siweMessage = new SiweMessage(body.message);
        const fields = await siweMessage.verify({ signature: body.signature });

        if (!fields.success) {
            return reply.status(401).send({ error: 'Invalid signature' });
        }

        // Create session
        const token = Buffer.from(`${fields.data.address}:${Date.now()}`).toString('base64');
        sessions.set(token, {
            address: fields.data.address,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        return {
            token,
            user: {
                address: fields.data.address,
                chainId: fields.data.chainId,
            },
        };
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({ error: error.message || 'Login failed' });
    }
});

// ============ Vaults ============

app.get('/api/v1/vaults', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { owner?: string; page?: string; per?: string };

    try {
        const vaults = await blockchainService.listVaults(
            query.owner,
            parseInt(query.page || '1'),
            parseInt(query.per || '20')
        );

        // If no vaults from chain, return mock data for demo
        if (vaults.length === 0 && !blockchainService.isConfigured()) {
            const mockVault = await blockchainService.createMockVault();
            return [mockVault];
        }

        return vaults;
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch vaults' });
    }
});

app.get('/api/v1/vaults/:vaultId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { vaultId } = request.params as { vaultId: string };

    try {
        const vault = await blockchainService.getVaultInfo(parseInt(vaultId));

        if (!vault) {
            // Return mock for demo
            if (!blockchainService.isConfigured()) {
                return await blockchainService.createMockVault();
            }
            return reply.status(404).send({ error: 'Vault not found' });
        }

        const strategy = await blockchainService.getVaultStrategy(parseInt(vaultId));

        return {
            ...vault,
            strategy,
        };
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch vault' });
    }
});

app.post('/api/v1/vaults', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = CreateVaultRequestSchema.parse(request.body);

        // In production, this would trigger the on-chain transaction
        // For now, return a mock response
        return {
            vaultId: 1,
            tx: '0x' + '0'.repeat(64),
            message: 'Vault creation initiated',
            params: body,
        };
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({ error: error.message || 'Invalid request' });
    }
});

// ============ Optimizer ============

app.post('/api/v1/optimizer/score', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = OptimizerScoreRequestSchema.parse(request.body);

        // Get vault info
        let vault = await blockchainService.getVaultInfo(body.vaultId);
        let strategy = await blockchainService.getVaultStrategy(body.vaultId);

        // Use mock data if not configured
        if (!vault || !strategy) {
            vault = await blockchainService.createMockVault();
            strategy = {
                tickLower: -887220,
                tickUpper: 887220,
                rebalanceThreshold: 500,
                autoRebalance: true,
            };
        }

        // Get recommendation from optimizer
        const recommendation = optimizerService.getRecommendation(
            body.vaultId,
            vault.tokenA,
            vault.tokenB,
            strategy.tickLower,
            strategy.tickUpper,
            vault.lastRebalance
        );

        // Calculate metrics
        const metrics = optimizerService.calculateMetrics(vault.tokenA, vault.tokenB);

        const response: OptimizerScore = {
            shouldRebalance: recommendation.shouldRebalance,
            reason: recommendation.reason,
            recommendedAction: recommendation.action,
            confidence: recommendation.confidence,
            timestamp: Math.floor(Date.now() / 1000),
            metrics,
        };

        return response;
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({ error: error.message || 'Optimizer error' });
    }
});

app.post('/api/v1/optimizer/backtest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = BacktestRequestSchema.parse(request.body);

        const now = Math.floor(Date.now() / 1000);
        const startTime = body.start ? Math.floor(new Date(body.start).getTime() / 1000) : now - 7 * 24 * 3600;
        const endTime = body.end ? Math.floor(new Date(body.end).getTime() / 1000) : now;

        const result: BacktestResult = optimizerService.runBacktest(
            body.vaultId,
            startTime,
            endTime,
            body.strategy
        );

        return result;
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({ error: error.message || 'Backtest error' });
    }
});

app.get('/api/v1/optimizer/metrics/:vaultId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { vaultId } = request.params as { vaultId: string };

    try {
        let vault = await blockchainService.getVaultInfo(parseInt(vaultId));

        if (!vault) {
            vault = await blockchainService.createMockVault();
        }

        const metrics = optimizerService.calculateMetrics(vault.tokenA, vault.tokenB);

        return {
            vaultId: parseInt(vaultId),
            ...metrics,
            timestamp: Math.floor(Date.now() / 1000),
        };
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch metrics' });
    }
});

// ============ Relayer ============

app.post('/api/v1/relayer/submit-signal', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = SubmitSignalRequestSchema.parse(request.body);

        // Create job
        const jobId = generateId();
        const job: RelayerJob = {
            jobId,
            vaultId: body.vaultId,
            action: body.action,
            status: 'queued',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        jobs.set(jobId, job);

        // In production, this would:
        // 1. Validate the EIP-712 signature
        // 2. Queue the transaction for execution
        // 3. Submit to blockchain via RebalanceExecutor

        // Simulate processing
        setTimeout(() => {
            const storedJob = jobs.get(jobId);
            if (storedJob) {
                storedJob.status = 'completed';
                storedJob.txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
                storedJob.updatedAt = Date.now();
            }
        }, 2000);

        return { jobId, status: 'queued' };
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({ error: error.message || 'Signal submission failed' });
    }
});

app.get('/api/v1/relayer/jobs/:jobId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { jobId } = request.params as { jobId: string };

    const job = jobs.get(jobId);
    if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
    }

    return job;
});

// ============ Simulate ============

app.post('/api/v1/simulate/swap', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { pair: string; size: string; slippageModel?: string };

    // Simulate swap slippage
    const size = parseFloat(body.size);
    let slippage = 0.004; // Base slippage

    if (size > 10000) slippage = 0.008;
    if (size > 50000) slippage = 0.015;
    if (size > 100000) slippage = 0.025;

    return {
        pair: body.pair,
        size: body.size,
        expectedSlippage: slippage,
        priceImpact: slippage * 0.75,
        estimatedOutput: size * (1 - slippage),
    };
});

app.post('/api/v1/simulate/rebalance', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { vaultId: number; action: any };

    // Simulate rebalance outcome
    return {
        vaultId: body.vaultId,
        predictedOutcome: {
            feesProjected: 125.50,
            ilDelta: -15.20,
            slippageOnRebalance: 0.003,
            gasEstimate: '250000',
            gasEstimateUsd: 0.05,
        },
        newPosition: body.action,
    };
});

// ============ Start Server ============

export async function startServer(port = 3001) {
    try {
        // Register middleware
        await app.register(cors, {
            origin: true,
            credentials: true,
        });

        await app.listen({ port, host: '0.0.0.0' });
        app.log.info(`Server running at http://localhost:${port}`);
        return app;
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

export { app };
