import express, { Request, Response } from 'express';
import { CreditScoringEngine } from './credit-scoring';
import { MasumiJobRequest, MasumiJobStatus, CreditScoreRequest } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// In-memory job storage (use Redis in production)
const jobs: Map<string, MasumiJobStatus> = new Map();

const creditEngine = new CreditScoringEngine();

// Masumi Agent Endpoints

/**
 * GET /availability
 * Returns agent availability and pricing
 */
app.get('/availability', (req: Request, res: Response) => {
  res.json({
    available: true,
    name: 'LendADA Credit Scoring Agent',
    description: 'AI-powered credit scoring for Cardano addresses',
    version: '1.0.0',
    pricing: {
      costPerJob: 0.5, // 0.5 ADA per credit check
      currency: 'ADA'
    },
    capabilities: [
      'on-chain-analysis',
      'credit-scoring',
      'risk-assessment',
      'loan-recommendation'
    ]
  });
});

/**
 * GET /input_schema
 * Returns expected input schema for jobs
 */
app.get('/input_schema', (req: Request, res: Response) => {
  res.json({
    type: 'object',
    properties: {
      borrowerAddress: {
        type: 'string',
        description: 'Cardano wallet address to analyze',
        pattern: '^addr[a-z0-9]+$'
      },
      loanAmount: {
        type: 'number',
        description: 'Requested loan amount in ADA',
        minimum: 10,
        maximum: 100000
      },
      duration: {
        type: 'number',
        description: 'Loan duration in days',
        minimum: 7,
        maximum: 365
      }
    },
    required: ['borrowerAddress', 'loanAmount', 'duration']
  });
});

/**
 * POST /start_job
 * Initiates a new credit scoring job
 */
app.post('/start_job', async (req: Request, res: Response) => {
  try {
    const input: CreditScoreRequest = req.body;

    // Validate input
    if (!input.borrowerAddress || !input.loanAmount || !input.duration) {
      return res.status(400).json({
        error: 'Missing required fields: borrowerAddress, loanAmount, duration'
      });
    }

    // Generate job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize job status
    const jobStatus: MasumiJobStatus = {
      jobId,
      status: 'processing',
      progress: 0
    };

    jobs.set(jobId, jobStatus);

    // Start async processing
    processJob(jobId, input);

    res.json({
      jobId,
      status: 'processing',
      message: 'Credit scoring job initiated'
    });
  } catch (error) {
    console.error('Error starting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /status/:jobId
 * Returns the status of a job
 */
app.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;

  const jobStatus = jobs.get(jobId);

  if (!jobStatus) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(jobStatus);
});

/**
 * Process credit scoring job asynchronously
 */
async function processJob(jobId: string, input: CreditScoreRequest) {
  const jobStatus = jobs.get(jobId);
  if (!jobStatus) return;

  try {
    // Update progress
    jobStatus.progress = 25;
    jobs.set(jobId, jobStatus);

    // Calculate credit score
    const result = await creditEngine.calculateCreditScore(input);

    // Update progress
    jobStatus.progress = 75;
    jobs.set(jobId, jobStatus);

    // Complete job
    jobStatus.status = 'completed';
    jobStatus.result = result;
    jobStatus.progress = 100;
    jobs.set(jobId, jobStatus);

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    jobStatus.status = 'failed';
    jobStatus.error = error instanceof Error ? error.message : 'Unknown error';
    jobs.set(jobId, jobStatus);
  }
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🤖 LendADA Credit Agent running on port ${PORT}`);
  console.log(`📊 Masumi endpoints available at:`);
  console.log(`   - GET  /availability`);
  console.log(`   - GET  /input_schema`);
  console.log(`   - POST /start_job`);
  console.log(`   - GET  /status/:jobId`);
});
