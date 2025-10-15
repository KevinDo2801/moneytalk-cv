# Transaction API

A full CRUD API for managing income and expense transactions built with Node.js, Express, TypeScript, and Supabase.

## Features

- ✅ Create, read, update, and delete transactions
- ✅ Support for both income and expense transactions
- ✅ Filter transactions by type, category, and date range
- ✅ Pagination support
- ✅ Input validation and error handling
- ✅ TypeScript for type safety
- ✅ Supabase for database operations

## API Endpoints

### Transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get all transactions (with optional query parameters)
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Query Parameters for GET /api/transactions
- `type` - Filter by transaction type (income or expense)
- `category` - Filter by category
- `startDate` - Filter transactions from this date (YYYY-MM-DD)
- `endDate` - Filter transactions until this date (YYYY-MM-DD)
- `limit` - Number of transactions to return
- `offset` - Number of transactions to skip

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
```

3. Set up your Supabase database with the following table:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Example Usage

### Create a Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "note": "Lunch at restaurant",
    "date": "2024-01-15"
  }'
```

### Get All Transactions
```bash
curl http://localhost:3000/api/transactions
```

### Get Transactions by Type
```bash
curl "http://localhost:3000/api/transactions?type=expense"
```

### Get Transactions by Date Range
```bash
curl "http://localhost:3000/api/transactions?startDate=2024-01-01&endDate=2024-01-31"
```

## Project Structure

```
src/
├── config/
│   └── supabase.ts          # Supabase client configuration
├── controllers/
│   └── transactionController.ts  # Request handling logic
├── models/
│   └── transaction.ts       # TypeScript interfaces
├── routes/
│   └── transactionRoutes.ts # API route definitions
├── services/
│   └── transactionService.ts # Business logic and database operations
├── app.ts                   # Express app configuration
└── server.ts               # Server startup
```
