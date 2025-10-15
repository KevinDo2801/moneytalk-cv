import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionQueryParams 
} from '../models/transaction';

const transactionService = new TransactionService();

export class TransactionController {
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to create transaction'
        });
        return;
      }

      const { type, category, amount, note, date }: CreateTransactionRequest = req.body;

      // Validation
      if (!type || !category || amount === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: type, category, and amount are required'
        });
        return;
      }

      if (!['income', 'expense'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
        return;
      }

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
        return;
      }

      if (typeof category !== 'string' || category.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Category must be a non-empty string'
        });
        return;
      }

      const transaction = await transactionService.createTransaction({
        type,
        category: category.trim(),
        amount,
        note: note?.trim() || undefined,
        date
      }, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to fetch transactions'
        });
        return;
      }

      const queryParams: TransactionQueryParams = {
        type: req.query.type as 'income' | 'expense' | undefined,
        category: req.query.category as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      // Validate query parameters
      if (queryParams.type && !['income', 'expense'].includes(queryParams.type)) {
        res.status(400).json({
          success: false,
          message: 'Type query parameter must be either "income" or "expense"'
        });
        return;
      }

      if (queryParams.limit && (isNaN(queryParams.limit) || queryParams.limit <= 0)) {
        res.status(400).json({
          success: false,
          message: 'Limit must be a positive number'
        });
        return;
      }

      if (queryParams.offset && (isNaN(queryParams.offset) || queryParams.offset < 0)) {
        res.status(400).json({
          success: false,
          message: 'Offset must be a non-negative number'
        });
        return;
      }

      const transactions = await transactionService.getAllTransactions(req.user.id, queryParams);

      res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
        count: transactions.length
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to fetch transaction'
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      const transaction = await transactionService.getTransactionById(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      if (error instanceof Error && error.message === 'Transaction not found') {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  }

  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to update transaction'
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateTransactionRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      // Validation
      if (updateData.type && !['income', 'expense'].includes(updateData.type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
        return;
      }

      if (updateData.amount !== undefined && (typeof updateData.amount !== 'number' || updateData.amount <= 0)) {
        res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
        return;
      }

      if (updateData.category !== undefined && (typeof updateData.category !== 'string' || updateData.category.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'Category must be a non-empty string'
        });
        return;
      }

      // Clean up string fields
      if (updateData.category) {
        updateData.category = updateData.category.trim();
      }
      if (updateData.note !== undefined) {
        updateData.note = updateData.note?.trim() || undefined;
      }

      const transaction = await transactionService.updateTransaction(id, updateData, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error instanceof Error && error.message === 'Transaction not found') {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  }

  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to delete transaction'
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      await transactionService.deleteTransaction(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      if (error instanceof Error && error.message === 'Transaction not found') {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  }

  async getSpendingAnalysis(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const params = {
        days: req.query.days ? parseInt(req.query.days as string) : undefined,
        weeks: req.query.weeks ? parseInt(req.query.weeks as string) : undefined,
        months: req.query.months ? parseInt(req.query.months as string) : undefined,
        years: req.query.years ? parseInt(req.query.years as string) : undefined,
        period: req.query.period as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const analysis = await transactionService.getSpendingAnalysis(req.user.id, params);

      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error getting spending analysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getSpendingSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const params = {
        days: req.query.days ? parseInt(req.query.days as string) : undefined,
        weeks: req.query.weeks ? parseInt(req.query.weeks as string) : undefined,
        months: req.query.months ? parseInt(req.query.months as string) : undefined,
        years: req.query.years ? parseInt(req.query.years as string) : undefined,
        period: req.query.period as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const summary = await transactionService.getSpendingSummary(req.user.id, params);

      res.status(200).json(summary);
    } catch (error) {
      console.error('Error getting spending summary:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getCategoryAnalysis(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const params = {
        days: req.query.days ? parseInt(req.query.days as string) : undefined,
        weeks: req.query.weeks ? parseInt(req.query.weeks as string) : undefined,
        months: req.query.months ? parseInt(req.query.months as string) : undefined,
        years: req.query.years ? parseInt(req.query.years as string) : undefined,
        period: req.query.period as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        category: req.query.category as string | undefined,
      };

      const analysis = await transactionService.getCategoryAnalysis(req.user.id, params);

      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error getting category analysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
