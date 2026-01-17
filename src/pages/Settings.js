import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

export default function Settings() {
  const navigate = useNavigate();
  const { token, user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    currency: user?.currency || "USD",
    dark_mode: user?.dark_mode ?? true,
    budget: user?.budget?.toString() || "",
    ai_insights_enabled: user?.ai_insights_enabled ?? true,
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const payload = {
        currency: settings.currency,
        dark_mode: settings.dark_mode,
        budget: settings.budget ? parseFloat(settings.budget) : null,
        ai_insights_enabled: settings.ai_insights_enabled,
      };

      const response = await axios.put(`${API}/user/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(response.data);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.dark_mode]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="back-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your expense tracking experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger id="currency" data-testid="currency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Changing currency only affects display, not existing values
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget</Label>
              <Input
                id="budget"
                data-testid="budget-input"
                type="number"
                step="0.01"
                placeholder="Enter your monthly budget"
                value={settings.budget}
                onChange={(e) => setSettings({ ...settings, budget: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Set a monthly budget to track spending and get alerts when exceeded
              </p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between dark and light theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                data-testid="dark-mode-switch"
                checked={settings.dark_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, dark_mode: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <Label htmlFor="ai-insights">AI Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered spending insights and recommendations
                </p>
              </div>
              <Switch
                id="ai-insights"
                data-testid="ai-insights-switch"
                checked={settings.ai_insights_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, ai_insights_enabled: checked })
                }
              />
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={isLoading} data-testid="save-settings-button">
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
