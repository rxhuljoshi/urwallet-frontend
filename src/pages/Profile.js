import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, User, Mail, Calendar, Wallet } from "lucide-react";

const currencySymbols = {
    USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
    AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥"
};

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currencySymbol = currencySymbols[user?.currency] || "$";

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
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Profile</CardTitle>
                                <CardDescription>Your account information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user?.email || "Not set"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <Wallet className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Currency</p>
                                <p className="font-medium">{currencySymbol} {user?.currency || "USD"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <Wallet className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Monthly Budget</p>
                                <p className="font-medium">
                                    {user?.budget ? `${currencySymbol}${user.budget.toFixed(2)}` : "Not set"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">Savings Balance</p>
                                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                    {currencySymbol}{(user?.savings_balance || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="font-medium">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : "Unknown"
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => navigate("/settings")}
                                variant="outline"
                                className="btn-press"
                            >
                                Edit Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
