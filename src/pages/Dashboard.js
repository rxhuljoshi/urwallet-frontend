import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, Wallet, PiggyBank, AlertCircle, Sparkles, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/Skeleton";
import ProfileMenu from "@/components/ProfileMenu";
import AddTransactionButton from "@/components/FloatingActionButton";
import TransactionMenu from "@/components/TransactionMenu";
import SortFilterControls from "@/components/SortFilterControls";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

const currencySymbols = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥"
};

const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString('default', { month: 'long' })
}));

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spike, setSpike] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sort, setSort] = useState("latest");
  const [typeFilter, setTypeFilter] = useState("all");
  const currencySymbol = currencySymbols[user?.currency] || "$";

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(now.getFullYear() - i),
    label: String(now.getFullYear() - i)
  }));

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`, {
        params: { month: Number(selectedMonth), year: Number(selectedYear) },
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
    setDeletingId(id);
    try {
      await axios.delete(`${API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Transaction deleted");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const chartData = Object.entries(summary?.category_breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const budgetUsed = summary?.budget ? (summary.expenses / summary.budget) * 100 : 0;
  const budgetExceeded = budgetUsed > 100;

  // Sort and filter transactions
  let displayTransactions = [...(summary?.transactions || [])];

  // Apply type filter
  if (typeFilter !== "all") {
    displayTransactions = displayTransactions.filter(t => t.type === typeFilter);
  }

  // Apply sorting (transactions come pre-sorted from API but we can re-sort client-side)
  if (sort === "oldest") {
    displayTransactions.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sort === "amount_asc") {
    displayTransactions.sort((a, b) => a.amount - b.amount);
  } else if (sort === "amount_desc") {
    displayTransactions.sort((a, b) => b.amount - a.amount);
  }
  // "latest" is default from API

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-24">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="urWallet" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">urWallet</h1>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]" data-testid="month-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]" data-testid="year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {spike && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 animate-slide-up" data-testid="spike-alert">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg text-amber-700 dark:text-amber-300">Spending Spike Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 dark:text-amber-200 ml-[52px]">{spike}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="card-hover animate-slide-up stagger-1" data-testid="income-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                Income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {currencySymbol}{summary?.income?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-slide-up stagger-2" data-testid="expenses-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-rose-500" />
                </div>
                Expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {currencySymbol}{summary?.expenses?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-slide-up stagger-3" data-testid="savings-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-blue-500" />
                </div>
                Savings Balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {currencySymbol}{summary?.savings_balance?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-slide-up stagger-4" data-testid="investments-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                Investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {currencySymbol}{summary?.investments?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className={`card-hover animate-slide-up ${budgetExceeded ? "border-destructive/50" : ""}`} data-testid="budget-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${budgetExceeded ? 'bg-destructive/10' : 'bg-muted'}`}>
                  <Wallet className={`w-4 h-4 ${budgetExceeded ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                Budget Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.budget ? (
                <div>
                  <div className="text-3xl font-bold tracking-tight">{budgetUsed.toFixed(0)}%</div>
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
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
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

            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-lg">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${currencySymbol}${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {user?.ai_insights_enabled && (
          <Button
            onClick={() => navigate("/ai-insights")}
            className="w-full md:w-auto btn-press"
            size="lg"
            data-testid="view-insights-button"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View AI Insights
          </Button>
        )}

        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">Transactions</CardTitle>
              <CardDescription>This month's activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SortFilterControls
                sort={sort}
                onSortChange={setSort}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
              <AddTransactionButton />
            </div>
          </CardHeader>
          <CardContent>
            {displayTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Click the + button to add your first transaction</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayTransactions.slice(0, 15).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200"
                    data-testid="transaction-item"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {txn.remarks || txn.category}
                      </p>
                      {txn.remarks && (
                        <p className="text-sm text-muted-foreground">{txn.category}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className={`font-semibold tabular-nums ${txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {txn.type === 'income' ? '+' : '-'}{currencySymbols[txn.currency] || currencySymbol}{txn.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{txn.date}</p>
                      </div>
                      <TransactionMenu
                        onEdit={() => navigate(`/add-transaction?edit=${txn.id}`)}
                        onDelete={() => handleDeleteTransaction(txn.id)}
                        isDeleting={deletingId === txn.id}
                      />
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
