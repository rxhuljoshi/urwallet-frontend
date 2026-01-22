import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Settings, PlusCircle, TrendingUp, Wallet, PiggyBank, AlertCircle, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

const currencySymbols = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥"
};

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spike, setSpike] = useState(null);
  const currencySymbol = currencySymbols[user?.currency] || "$";

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`, {
        params: { month: selectedMonth, year: selectedYear },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, token]);

  const fetchSpikeDetection = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/ai/spike-detection`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpike(response.data.warning);
    } catch (error) {
      console.error("Spike detection failed");
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
    fetchSpikeDetection();
  }, [fetchDashboardData, fetchSpikeDetection]);

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Transaction deleted");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const chartData = Object.entries(summary?.category_breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const budgetUsed = summary?.budget ? (summary.expenses / summary.budget) * 100 : 0;
  const budgetExceeded = budgetUsed > 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">urWallet</h1>
            {/* <p className="text-sm text-muted-foreground">{user?.email}</p> */}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/settings")} data-testid="settings-button">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={logout} data-testid="logout-button">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-lg border bg-card text-foreground"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              data-testid="month-select"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border bg-card text-foreground"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              data-testid="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={now.getFullYear() - i}>
                  {now.getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {spike && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20" data-testid="spike-alert">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-600">Spending Spike Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 dark:text-orange-200">{spike}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="expenses-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currencySymbol}{summary?.expenses?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="savings-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {currencySymbol}{summary?.savings?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="investments-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {currencySymbol}{summary?.investments?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className={budgetExceeded ? "border-red-500" : ""} data-testid="budget-card">
            <CardHeader className="pb-2">
              <CardDescription>Budget Status</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.budget ? (
                <div>
                  <div className="text-2xl font-bold">{budgetUsed.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currencySymbol}{summary.expenses.toFixed(2)} / {currencySymbol}{summary.budget.toFixed(2)}
                  </div>
                  {budgetExceeded && (
                    <Badge variant="destructive" className="mt-2">Over Budget!</Badge>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No budget set</div>
              )}
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${currencySymbol}${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${currencySymbol}${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {user?.ai_insights_enabled && (
          <Button
            onClick={() => navigate("/ai-insights")}
            className="w-full md:w-auto"
            size="lg"
            data-testid="view-insights-button"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View AI Insights
          </Button>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>This month's activity</CardDescription>
            </div>
            <Button onClick={() => navigate("/add-expense")} data-testid="add-expense-button">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            {summary?.transactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet this month</p>
                <Button onClick={() => navigate("/add-expense")} className="mt-4" variant="outline">
                  Add your first expense
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {summary?.transactions?.slice(0, 10).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    data-testid="transaction-item"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{txn.category}</Badge>
                        <span className="text-sm text-muted-foreground">{txn.date}</span>
                      </div>
                      {txn.remarks && (
                        <p className="text-sm text-muted-foreground mt-1">{txn.remarks}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">
                        {currencySymbols[txn.currency] || currencySymbol}{txn.amount.toFixed(2)}
                        {txn.currency && txn.currency !== user?.currency && (
                          <span className="ml-1 text-xs text-muted-foreground">({txn.currency})</span>
                        )}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/edit-expense/${txn.id}`)}
                          data-testid="edit-transaction-button"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(txn.id)}
                          data-testid="delete-transaction-button"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
