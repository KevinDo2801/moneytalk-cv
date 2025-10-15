import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const transactionController = new TransactionController();

// All transaction routes require authentication
router.use(authenticateUser);

// Analysis endpoints (must come before :id routes to avoid conflicts)
// GET /api/transactions/analysis/spending - Get spending analysis
router.get('/analysis/spending', (req, res) => {
  transactionController.getSpendingAnalysis(req, res);
});

// GET /api/transactions/analysis/summary - Get spending summary
router.get('/analysis/summary', (req, res) => {
  transactionController.getSpendingSummary(req, res);
});

// GET /api/transactions/analysis/categories - Get category analysis
router.get('/analysis/categories', (req, res) => {
  transactionController.getCategoryAnalysis(req, res);
});

// POST /api/transactions - Create a new transaction
router.post('/', (req, res) => {
  transactionController.createTransaction(req, res);
});

// GET /api/transactions - Get all transactions with optional query parameters
router.get('/', (req, res) => {
  transactionController.getAllTransactions(req, res);
});

// GET /api/transactions/:id - Get a specific transaction by ID
router.get('/:id', (req, res) => {
  transactionController.getTransactionById(req, res);
});

// PUT /api/transactions/:id - Update a specific transaction
router.put('/:id', (req, res) => {
  transactionController.updateTransaction(req, res);
});

// DELETE /api/transactions/:id - Delete a specific transaction
router.delete('/:id', (req, res) => {
  transactionController.deleteTransaction(req, res);
});

export default router;
