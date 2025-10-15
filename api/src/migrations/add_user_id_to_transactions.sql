-- Migration: Add user_id column to transactions table
-- This migration adds user association to transactions for proper data isolation

-- Add user_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Create composite index for user_id and date for efficient filtering
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Add RLS (Row Level Security) policy to ensure users can only access their own transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT operations
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for INSERT operations
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for UPDATE operations
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for DELETE operations
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
