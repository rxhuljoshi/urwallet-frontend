import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultCategories = [
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

export default function AddTransaction() {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const typeParam = searchParams.get("type") || "expense";
    const isEdit = !!editId;

    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [useCustomCategory, setUseCustomCategory] = useState(false);

    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        currency: user?.currency || "USD",
        remarks: "",
        date: new Date().toISOString().split('T')[0],
        type: typeParam,
        source: "budget",
        addToSavings: false,
    });

    const fetchTransaction = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const transaction = response.data.find((t) => t.id === editId);
            if (transaction) {
                setFormData({
                    amount: transaction.amount.toString(),
                    category: transaction.category,
                    currency: transaction.currency || user?.currency || "USD",
                    remarks: transaction.remarks || "",
                    date: transaction.date,
                    type: transaction.type || "expense",
                    source: transaction.source || "budget",
                    addToSavings: transaction.category === "Savings",
                });
                // Check if category is custom
                if (!defaultCategories.includes(transaction.category)) {
                    setUseCustomCategory(true);
                    setCustomCategory(transaction.category);
                }
            }
        } catch (error) {
            toast.error("Failed to load transaction");
        }
    }, [editId, token, user?.currency]);

    useEffect(() => {
        if (isEdit) {
            fetchTransaction();
        }
    }, [isEdit, fetchTransaction]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const finalCategory = useCustomCategory ? customCategory : formData.category;

            const payload = {
                amount: parseFloat(formData.amount),
                category: finalCategory || "Other",
                currency: formData.currency,
                remarks: formData.remarks,
                date: formData.date,
                type: formData.type,
                source: formData.type === "expense" ? formData.source : null,
                add_to_savings: formData.type === "income" && formData.addToSavings,
            };

            if (isEdit) {
                await axios.put(`${API}/transactions/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Transaction updated successfully!");
            } else {
                await axios.post(`${API}/transactions`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
            }

            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Operation failed");
        } finally {
            setIsLoading(false);
        }
    };

    const isIncome = formData.type === "income";

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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                {isIncome ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-rose-500" />
                                )}
                            </div>
                            <div>
                                <CardTitle>{isEdit ? "Edit Transaction" : isIncome ? "Add Income" : "Add Expense"}</CardTitle>
                                <CardDescription>
                                    {isEdit ? "Update the details of your transaction" : isIncome ? "Record income you received" : "Record an expense"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle */}
                            {!isEdit && (
                                <div className="flex rounded-lg border p-1 bg-muted/50">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "income" })}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isIncome ? 'bg-emerald-500 text-white' : 'hover:bg-accent'}`}
                                    >
                                        <TrendingUp className="w-4 h-4 inline mr-2" />
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "expense" })}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isIncome ? 'bg-rose-500 text-white' : 'hover:bg-accent'}`}
                                    >
                                        <TrendingDown className="w-4 h-4 inline mr-2" />
                                        Expense
                                    </button>
                                </div>
                            )}

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

                            {/* Income-specific: Add to Savings */}
                            {isIncome && (
                                <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                    <div className="space-y-1">
                                        <Label htmlFor="add-savings" className="font-medium text-emerald-700 dark:text-emerald-300">Add to Savings</Label>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                            This income will be added to your savings balance
                                        </p>
                                    </div>
                                    <Switch
                                        id="add-savings"
                                        data-testid="add-savings-switch"
                                        checked={formData.addToSavings}
                                        onCheckedChange={(checked) => setFormData({ ...formData, addToSavings: checked })}
                                    />
                                </div>
                            )}

                            {/* Expense-specific: Source selector */}
                            {!isIncome && (
                                <div className="space-y-2">
                                    <Label>Pay From</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, source: "budget" })}
                                            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${formData.source === 'budget' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                                        >
                                            Monthly Budget
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, source: "savings" })}
                                            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${formData.source === 'savings' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                                        >
                                            Savings
                                        </button>
                                    </div>
                                    {formData.source === "savings" && (
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            This will deduct from your savings balance
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category">Category</Label>
                                    <button
                                        type="button"
                                        onClick={() => setUseCustomCategory(!useCustomCategory)}
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {useCustomCategory ? "Use preset" : "Custom category"}
                                    </button>
                                </div>
                                {useCustomCategory ? (
                                    <Input
                                        id="custom-category"
                                        data-testid="custom-category-input"
                                        placeholder="Enter custom category (AI will optimize)"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        className="h-11"
                                    />
                                ) : (
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger id="category" data-testid="category-select" className="h-11">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {defaultCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for AI auto-categorization based on remarks
                                </p>
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
                                    placeholder="Optional notes (helps AI categorization)"
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
                                    data-testid="submit-button"
                                    className={`btn-press h-11 px-6 ${isIncome ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        isEdit ? "Update" : isIncome ? "Add Income" : "Add Expense"
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
