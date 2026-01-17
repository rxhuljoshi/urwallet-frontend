import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AIInsights() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ai/insights`, {
        params: { month: selectedMonth, year: selectedYear },
        headers: { Authorization: `Bearer ${token}` },
      });
      setInsights(response.data.insights);
    } catch (error) {
      toast.error("Failed to load AI insights");
      setInsights("Unable to generate insights at this time.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, token]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="back-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
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

        <Card className="border-2" data-testid="insights-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>AI-Powered Insights</CardTitle>
            </div>
            <CardDescription>
              {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {insights}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Insights are generated using AI and cached for performance.</p>
          <p>You can disable AI insights in Settings if you prefer.</p>
        </div>
      </div>
    </div>
  );
}
