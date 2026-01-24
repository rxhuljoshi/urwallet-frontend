import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Settings2, Check, Loader2, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [settings, setSettings] = useState({
    currency: user?.currency || "USD",
    dark_mode: user?.dark_mode ?? true,
    budget: user?.budget?.toString() || "",
    ai_insights_enabled: user?.ai_insights_enabled ?? true,
  });
  const prevSettingsRef = useRef(settings);
  const debouncedSettings = useDebounce(settings, 800);

  // Auto-save when debounced settings change
  const saveSettings = useCallback(async (newSettings) => {
    setSaveStatus("saving");

    try {
      const payload = {
        currency: newSettings.currency,
        dark_mode: newSettings.dark_mode,
        budget: newSettings.budget ? parseFloat(newSettings.budget) : null,
        ai_insights_enabled: newSettings.ai_insights_enabled,
      };

      const response = await axios.put(`${API}/user/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(response.data);
      setSaveStatus("saved");

      // Reset to idle after showing saved
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      toast.error("Failed to save settings");

      // Rollback to previous settings
      setSettings(prevSettingsRef.current);

      // Reset to idle after showing error
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [token, updateUser]);

  // Trigger save when debounced settings change (skip initial render)
  useEffect(() => {
    const prevStr = JSON.stringify(prevSettingsRef.current);
    const newStr = JSON.stringify(debouncedSettings);

    if (prevStr !== newStr) {
      prevSettingsRef.current = debouncedSettings;
      saveSettings(debouncedSettings);
    }
  }, [debouncedSettings, saveSettings]);

  // Apply dark mode immediately
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.dark_mode]);

  const renderSaveIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <Check className="w-4 h-4" />
            Saved
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            Failed to save
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="back-button" className="btn-press">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {renderSaveIndicator()}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
        <Card className="border-border/50 shadow-lg shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Changes are saved automatically</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger id="currency" data-testid="currency-select" className="h-11">
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
                className="h-11"
              />
              <p className="text-sm text-muted-foreground">
                Set a monthly budget to track spending and get alerts when exceeded
              </p>
            </div>

            <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-muted/50 border">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
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

            <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-muted/50 border">
              <div className="space-y-1">
                <Label htmlFor="ai-insights" className="font-medium">AI Insights</Label>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
