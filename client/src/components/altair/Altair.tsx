import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthHeaders } from "../../lib/auth-utils";
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";
const baseapi = process.env.REACT_APP_BASE_API || "http://localhost:3000/api";


// ----------------- Function Declarations -----------------
const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      json_graph: {
        type: Type.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

const createTransactionDecl: FunctionDeclaration = {
  name: "create_transaction",
  description: "Create a new expense or income transaction",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "Either 'expense' or 'income'",
        enum: ["expense", "income"],
      },
      category: {
        type: Type.STRING,
        description: "The category for the transaction (e.g. Food, Salary)",
      },
      amount: {
        type: Type.NUMBER,
        description: "The amount of money spent or received",
      },
      note: {
        type: Type.STRING,
        description: "Optional note about this transaction",
      },
      date: {
        type: Type.STRING,
        description: `Date in YYYY-MM-DD, If user says 'today', assume the current date is ${getToday()}.`,
      },
    },
    required: ["type", "category", "amount", "date"],
  },
};

const spendingAnalysisDecl: FunctionDeclaration = {
  name: "get_spending_analysis",
  description: "Get complete spending analysis with trends, categories, and recent transactions",
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.NUMBER,
        description: "Number of days ago to analyze (e.g., 7 for last week)",
      },
      weeks: {
        type: Type.NUMBER,
        description: "Number of weeks ago to analyze",
      },
      months: {
        type: Type.NUMBER,
        description: "Number of months ago to analyze",
      },
      years: {
        type: Type.NUMBER,
        description: "Number of years ago to analyze",
      },
      period: {
        type: Type.STRING,
        description: "Predefined period: 'day', 'week', 'month', or 'year'",
        enum: ["day", "week", "month", "year"],
      },
      startDate: {
        type: Type.STRING,
        description: "Start date for custom range (YYYY-MM-DD)",
      },
      endDate: {
        type: Type.STRING,
        description: "End date for custom range (YYYY-MM-DD)",
      },
    },
  },
};

const spendingSummaryDecl: FunctionDeclaration = {
  name: "get_spending_summary",
  description: "Get basic spending summary with totals and net amount",
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.NUMBER,
        description: "Number of days ago to analyze",
      },
      weeks: {
        type: Type.NUMBER,
        description: "Number of weeks ago to analyze",
      },
      months: {
        type: Type.NUMBER,
        description: "Number of months ago to analyze",
      },
      years: {
        type: Type.NUMBER,
        description: "Number of years ago to analyze",
      },
      period: {
        type: Type.STRING,
        description: "Predefined period: 'day', 'week', 'month', or 'year'",
        enum: ["day", "week", "month", "year"],
      },
      startDate: {
        type: Type.STRING,
        description: "Start date for custom range (YYYY-MM-DD)",
      },
      endDate: {
        type: Type.STRING,
        description: "End date for custom range (YYYY-MM-DD)",
      },
    },
  },
};

const categoryAnalysisDecl: FunctionDeclaration = {
  name: "get_category_analysis",
  description: "Get category-wise spending breakdown with percentages",
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.NUMBER,
        description: "Number of days ago to analyze",
      },
      weeks: {
        type: Type.NUMBER,
        description: "Number of weeks ago to analyze",
      },
      months: {
        type: Type.NUMBER,
        description: "Number of months ago to analyze",
      },
      years: {
        type: Type.NUMBER,
        description: "Number of years ago to analyze",
      },
      period: {
        type: Type.STRING,
        description: "Predefined period: 'day', 'week', 'month', or 'year'",
        enum: ["day", "week", "month", "year"],
      },
      startDate: {
        type: Type.STRING,
        description: "Start date for custom range (YYYY-MM-DD)",
      },
      endDate: {
        type: Type.STRING,
        description: "End date for custom range (YYYY-MM-DD)",
      },
      category: {
        type: Type.STRING,
        description: "Filter by specific category (e.g., 'Food', 'Transportation')",
      },
    },
  },
};

const expenseOptimizationDecl: FunctionDeclaration = {
  name: "get_expense_optimization_advice",
  description: "Analyze spending patterns and provide personalized advice on how to reduce expenses for next month",
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: {
        type: Type.NUMBER,
        description: "Number of days ago to analyze for spending patterns (default: 30 for last month)",
      },
      weeks: {
        type: Type.NUMBER,
        description: "Number of weeks ago to analyze for spending patterns",
      },
      months: {
        type: Type.NUMBER,
        description: "Number of months ago to analyze for spending patterns",
      },
      years: {
        type: Type.NUMBER,
        description: "Number of years ago to analyze for spending patterns",
      },
      period: {
        type: Type.STRING,
        description: "Predefined period: 'day', 'week', 'month', or 'year'",
        enum: ["day", "week", "month", "year"],
      },
      startDate: {
        type: Type.STRING,
        description: "Start date for custom range (YYYY-MM-DD)",
      },
      endDate: {
        type: Type.STRING,
        description: "End date for custom range (YYYY-MM-DD)",
      },
    },
  },
};

// const updateTransactionDecl: FunctionDeclaration = {
//   name: "update_transaction",
//   description: "Update an existing transaction",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       id: {
//         type: Type.STRING,
//         description: "The ID of the transaction to update",
//       },
//       type: { type: Type.STRING, enum: ["expense", "income"] },
//       category: { type: Type.STRING },
//       amount: { type: Type.NUMBER },
//       note: { type: Type.STRING },
//       date: { type: Type.STRING, description: "YYYY-MM-DD" },
//     },
//     required: ["id"],
//   },
// };

// const deleteTransactionDecl: FunctionDeclaration = {
//   name: "delete_transaction",
//   description: "Delete a transaction by ID",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       id: {
//         type: Type.STRING,
//         description: "ID of the transaction to delete",
//       },
//     },
//     required: ["id"],
//   },
// };

// ----------------- Component -----------------


function getToday(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

let today = getToday();

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();
  const { user } = useAuth();

  useEffect(() => {
    setModel("models/gemini-2.0-flash-exp");
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are my helpful finance assistant with powerful spending analysis capabilities. 

            **Transaction Management:**
            - If I mention spending/earning money → use create_transaction
            - Always fill in missing info by asking me first

            **Spending Analysis Features:**
            - Use get_spending_analysis for complete analysis with trends, categories, and recent transactions
            - Use get_spending_summary for basic totals and net amount
            - Use get_category_analysis for category-wise breakdown with percentages
            - Use get_expense_optimization_advice for personalized expense reduction recommendations

            **Expense Optimization Features:**
            - get_expense_optimization_advice analyzes spending patterns and provides actionable advice
            - Fetches comprehensive data from all analysis endpoints
            - Identifies highest spending categories and provides specific reduction strategies
            - Gives personalized tips based on actual spending behavior
            - Defaults to last month analysis if no period specified

            **Time Period Options:**
            - Relative periods: days=7 (last week), months=1 (last month), years=1 (last year)
            - Predefined periods: period=day|week|month|year
            - Custom ranges: startDate=2024-01-01&endDate=2024-01-31
            - Category filtering: category=Food (for specific category analysis)

            **Examples of what I can help with:**
            - "How much did I spend last week?" → get_spending_summary with weeks=1
            - "Show me my complete spending analysis for the last month" → get_spending_analysis with months=1
            - "What percentage of my spending goes to food?" → get_category_analysis with category=Food
            - "Show me spending trends for the last 2 weeks" → get_spending_analysis with weeks=2
            - "How can I reduce my expenses next month?" → get_expense_optimization_advice
            - "Find ways to decrease my spending" → get_expense_optimization_advice with months=1
            - "Give me advice on cutting costs based on last 2 weeks" → get_expense_optimization_advice with weeks=2

            Always answer in the language of the user and keep responses relevant to finance topics.
            `,
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        {
          functionDeclarations: [
            declaration,
            createTransactionDecl,
            spendingAnalysisDecl,
            spendingSummaryDecl,
            categoryAnalysisDecl,
            expenseOptimizationDecl,
            // updateTransactionDecl,
            // deleteTransactionDecl,
          ],
        },
      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) return;

      const responses = await Promise.all(
        toolCall.functionCalls.map(async (fc) => {
          try {
            let res;
            if (fc.name === "render_altair") {
              const str = (fc.args as any).json_graph;
              setJSONString(str);
              res = { success: true };
            } else if (fc.name === "create_transaction") {
              console.log("create_transaction", fc.args);
              const headers = await getAuthHeaders();
              res = await fetch(`${baseapi}/transactions`, {
                method: "POST",
                headers,
                body: JSON.stringify(fc.args),
              }).then((r) => r.json());
            } else if (fc.name === "update_transaction") {
              console.log("update_transaction", fc.args);
              const headers = await getAuthHeaders();
              res = await fetch(
                `${baseapi}/transactions/${fc.args?.id}`,
                fc.args && {
                  method: "PUT",
                  headers,
                  body: JSON.stringify(fc.args),
                }
              ).then((r) => r.json());
            } else if (fc.name === "delete_transaction") {
              console.log("delete_transaction", fc.args);
              const headers = await getAuthHeaders();
              res = await fetch(
                `${baseapi}/transactions/${fc.args?.id}`,
                fc.args && { 
                  method: "DELETE",
                  headers
                }
              ).then((r) => r.json());
            } else if (fc.name === "get_spending_analysis") {
              console.log("get_spending_analysis", fc.args);
              const headers = await getAuthHeaders();
              const queryParams = new URLSearchParams();
              
              // Build query parameters based on provided args
              if (fc.args?.days) queryParams.append("days", fc.args.days.toString());
              if (fc.args?.weeks) queryParams.append("weeks", fc.args.weeks.toString());
              if (fc.args?.months) queryParams.append("months", fc.args.months.toString());
              if (fc.args?.years) queryParams.append("years", fc.args.years.toString());
              if (fc.args?.period) queryParams.append("period", String(fc.args.period));
              if (fc.args?.startDate) queryParams.append("startDate", String(fc.args.startDate));
              if (fc.args?.endDate) queryParams.append("endDate", String(fc.args.endDate));
              
              res = await fetch(
                `${baseapi}/transactions/analysis/spending?${queryParams.toString()}`,
                { headers }
              ).then((r) => r.json());
            } else if (fc.name === "get_spending_summary") {
              console.log("get_spending_summary", fc.args);
              const headers = await getAuthHeaders();
              const queryParams = new URLSearchParams();
              
              if (fc.args?.days) queryParams.append("days", fc.args.days.toString());
              if (fc.args?.weeks) queryParams.append("weeks", fc.args.weeks.toString());
              if (fc.args?.months) queryParams.append("months", fc.args.months.toString());
              if (fc.args?.years) queryParams.append("years", fc.args.years.toString());
              if (fc.args?.period) queryParams.append("period", String(fc.args.period));
              if (fc.args?.startDate) queryParams.append("startDate", String(fc.args.startDate));
              if (fc.args?.endDate) queryParams.append("endDate", String(fc.args.endDate));
              
              res = await fetch(
                `${baseapi}/transactions/analysis/summary?${queryParams.toString()}`,
                { headers }
              ).then((r) => r.json());
            } else if (fc.name === "get_category_analysis") {
              console.log("get_category_analysis", fc.args);
              const headers = await getAuthHeaders();
              const queryParams = new URLSearchParams();
              
              if (fc.args?.days) queryParams.append("days", fc.args.days.toString());
              if (fc.args?.weeks) queryParams.append("weeks", fc.args.weeks.toString());
              if (fc.args?.months) queryParams.append("months", fc.args.months.toString());
              if (fc.args?.years) queryParams.append("years", fc.args.years.toString());
              if (fc.args?.period) queryParams.append("period", String(fc.args.period));
              if (fc.args?.startDate) queryParams.append("startDate", String(fc.args.startDate));
              if (fc.args?.endDate) queryParams.append("endDate", String(fc.args.endDate));
              if (fc.args?.category) queryParams.append("category", String(fc.args.category));
              
              res = await fetch(
                `${baseapi}/transactions/analysis/categories?${queryParams.toString()}`,
                { headers }
              ).then((r) => r.json());
            } else if (fc.name === "get_expense_optimization_advice") {
              console.log("get_expense_optimization_advice", fc.args);
              const headers = await getAuthHeaders();
              
              try {
                // Build query parameters for the analysis period
                const queryParams = new URLSearchParams();
                
                // Default to last month if no period specified
                if (!fc.args?.days && !fc.args?.weeks && !fc.args?.months && !fc.args?.years && !fc.args?.period && !fc.args?.startDate) {
                  queryParams.append("months", "1"); // Default to last month
                } else {
                  if (fc.args?.days) queryParams.append("days", fc.args.days.toString());
                  if (fc.args?.weeks) queryParams.append("weeks", fc.args.weeks.toString());
                  if (fc.args?.months) queryParams.append("months", fc.args.months.toString());
                  if (fc.args?.years) queryParams.append("years", fc.args.years.toString());
                  if (fc.args?.period) queryParams.append("period", String(fc.args.period));
                  if (fc.args?.startDate) queryParams.append("startDate", String(fc.args.startDate));
                  if (fc.args?.endDate) queryParams.append("endDate", String(fc.args.endDate));
                }
                
                const queryString = queryParams.toString();
                
                // Fetch comprehensive spending data from all analysis endpoints
                const [spendingAnalysis, spendingSummary, categoryAnalysis] = await Promise.all([
                  fetch(`${baseapi}/transactions/analysis/spending?${queryString}`, { headers }).then(r => r.json()),
                  fetch(`${baseapi}/transactions/analysis/summary?${queryString}`, { headers }).then(r => r.json()),
                  fetch(`${baseapi}/transactions/analysis/categories?${queryString}`, { headers }).then(r => r.json())
                ]);
                
                // Combine all the data for AI analysis
                res = {
                  success: true,
                  analysisPeriod: queryString,
                  spendingAnalysis,
                  spendingSummary,
                  categoryAnalysis,
                  message: "Comprehensive spending data gathered for AI analysis and advice generation"
                };
                
              } catch (error: any) {
                res = { success: false, error: error.message };
              }
            } else {
              res = { success: false, error: "Unknown function" };
            }

            return {
              response: { output: res },
              id: fc.id,
              name: fc.name,
            };
          } catch (err: any) {
            return {
              response: { output: { success: false, error: err.message } },
              id: fc.id,
              name: fc.name,
            };
          }
        })
      );

      client.sendToolResponse({ functionResponses: responses });
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("jsonString", jsonString);
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
