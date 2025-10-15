# Financial Dashboard with AI Assistant

A full-stack financial management application featuring a real-time AI assistant powered by Google's Gemini 2.0 Live API. Track your income and expenses while getting intelligent insights through voice and text interactions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

### Financial Management
- ✅ Create, read, update, and delete financial transactions
- ✅ Support for both income and expense tracking
- ✅ Filter transactions by type, category, and date range
- ✅ Visual charts and analytics
- ✅ Real-time data synchronization
- ✅ Pagination support for large datasets

### AI Assistant
- 🤖 Real-time voice interaction with Gemini 2.0
- 📊 Dynamic chart generation using Vega/Altair
- 🎤 Audio streaming and voice recognition
- 📹 Webcam and screen capture support
- 🔍 Google Search integration for enhanced context
- 💬 Multimodal communication (text, voice, video)

### Technical Features
- 🔐 User authentication with Supabase
- 🚀 TypeScript for type safety across the stack
- 📱 Responsive React-based UI
- 🎨 Modern SCSS styling
- ⚡ Real-time updates and live API interactions

## 📁 Project Structure

```
hackgame/
├── api/                      # Backend API
│   ├── src/
│   │   ├── config/          # Supabase configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── migrations/      # Database migrations
│   ├── dist/                # Compiled JavaScript
│   └── package.json
│
├── client/                   # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth, LiveAPI)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and services
│   │   └── types/           # TypeScript type definitions
│   ├── build/               # Production build
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackgame
   ```

2. **Set up the API**
   ```bash
   cd api
   npm install
   ```

   Create a `.env` file in the `api` directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   NODE_ENV=development
   ```

3. **Set up the Client**
   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Database Setup**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   CREATE TABLE transactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
     category TEXT NOT NULL,
     amount NUMERIC NOT NULL CHECK (amount > 0),
     note TEXT,
     date DATE NOT NULL DEFAULT CURRENT_DATE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view their own transactions"
     ON transactions FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create their own transactions"
     ON transactions FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own transactions"
     ON transactions FOR UPDATE
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own transactions"
     ON transactions FOR DELETE
     USING (auth.uid() = user_id);
   ```

### Running the Application

1. **Start the API server**
   ```bash
   cd api
   npm run dev
   # Server runs on http://localhost:3001
   ```

2. **Start the client (in a new terminal)**
   ```bash
   cd client
   npm start
   # Client runs on http://localhost:3000
   ```

3. **Build for production**
   ```bash
   # API
   cd api
   npm run build
   npm start

   # Client
   cd client
   npm run build
   ```

## 📡 API Endpoints

### Transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get all user transactions
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Query Parameters
- `type` - Filter by type (income/expense)
- `category` - Filter by category
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `limit` - Results per page
- `offset` - Pagination offset

## 🔑 Environment Variables

### API (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `PORT` - API server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Client (.env)
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `REACT_APP_GEMINI_API_KEY` - Your Google Gemini API key

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database and authentication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Supabase JS Client** - Database and auth client
- **Google GenAI** - Gemini Live API integration
- **Chart.js** - Data visualization
- **Vega/Vega-Lite** - Advanced charting
- **SASS** - CSS preprocessing
- **React Select** - Enhanced select components
- **Zustand** - State management

## 🎯 Usage Examples

### Creating a Transaction
```javascript
// API request
POST http://localhost:3001/api/transactions
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "type": "expense",
  "category": "Food",
  "amount": 25.50,
  "note": "Lunch at restaurant",
  "date": "2024-01-15"
}
```

### Using the AI Assistant
- Click the microphone icon to start voice interaction
- Ask questions about your finances
- Request chart generation: "Show me a chart of my expenses this month"
- Get insights: "What category am I spending the most on?"

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Google Gemini Live API](https://ai.google.dev/api/multimodal-live)
- Based on the [Multimodal Live API Web Console](https://github.com/google-gemini/multimodal-live-api-web-console)
- Database and authentication powered by [Supabase](https://supabase.com)
- Charts powered by [Vega](https://vega.github.io/) and [Chart.js](https://www.chartjs.org/)

## 🐛 Known Issues

- None at the moment. Please report any issues you encounter!

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Note**: This application requires a Google Gemini API key and Supabase account to function. Make sure to set up both services before running the application.

