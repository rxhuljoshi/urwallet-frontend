import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Receipt } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  "Food",
  "Rent",
  "Travel",
  "Bills",
  "Shopping",
  "Savings",
  "Investment",
  "Other",
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export default function AddExpense() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    currency: user?.currency || "USD",
    remarks: "",
    date: new Date().toISOString().split('T')[0],
  });

  const fetchTransaction = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transaction = response.data.find((t) => t.id === id);
      if (transaction) {
        setFormData({
          amount: transaction.amount.toString(),
          category: transaction.category,
          currency: transaction.currency || user?.currency || "USD",
          remarks: transaction.remarks || "",
          date: transaction.date,
        });
      }
    } catch (error) {
      toast.error("Failed to load transaction");
    }
  }, [id, token, user?.currency]);

  useEffect(() => {
    if (isEdit) {
      fetchTransaction();
    }
  }, [isEdit, fetchTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        currency: formData.currency,
        remarks: formData.remarks,
        date: formData.date,
      };

      if (isEdit) {
        await axios.put(`${API}/transactions/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Expense updated successfully!");
      } else {
        await axios.post(`${API}/transactions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Expense added successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="back-button" className="btn-press">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
        <Card className="border-border/50 shadow-lg shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>{isEdit ? "Edit Expense" : "Add New Expense"}</CardTitle>
                <CardDescription>
                  {isEdit ? "Update the details of your expense" : "Record a new expense transaction"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  data-testid="amount-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="h-11 text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency" data-testid="currency-select" className="h-11">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((cur) => (
                      <SelectItem key={cur.code} value={cur.code}>
                        {cur.symbol} - {cur.name} ({cur.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" data-testid="category-select" className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  data-testid="date-input"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks / Notes</Label>
                <Textarea
                  id="remarks"
                  data-testid="remarks-input"
                  placeholder="Optional notes about this expense"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="submit-expense-button"
                  className="btn-press h-11 px-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    isEdit ? "Update Expense" : "Add Expense"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="btn-press h-11"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
