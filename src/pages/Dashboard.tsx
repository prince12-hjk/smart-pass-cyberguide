import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, BookOpen, AlertTriangle, Coins, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CyberTip {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
}

interface AITip {
  tip: string;
  generated_by: string;
}

export default function Dashboard() {
  const [randomTip, setRandomTip] = useState<CyberTip | null>(null);
  const [aiTip, setAiTip] = useState<AITip | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [passwordCount, setPasswordCount] = useState(0);

  useEffect(() => {
    fetchRandomTip();
    fetchPasswordCount();
    fetchAITip();
  }, []);

  const fetchRandomTip = async () => {
    const { data, error } = await supabase
      .from("cyber_tips")
      .select("*")
      .limit(10);

    if (error) {
      toast.error("Error fetching cyber tips");
      return;
    }

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setRandomTip(data[randomIndex]);
    }
  };

  const fetchPasswordCount = async () => {
    const { count, error } = await supabase
      .from("passwords")
      .select("*", { count: "exact", head: true });

    if (!error && count !== null) {
      setPasswordCount(count);
    }
  };

  const fetchAITip = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cyber-tip');
      
      if (error) throw error;
      
      setAiTip(data);
    } catch (error) {
      console.error('Error fetching AI tip:', error);
      // Fallback to local tips if AI fails
      fetchRandomTip();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const dashboardCards = [
    {
      title: "Password Vault",
      description: `${passwordCount} passwords stored`,
      icon: Key,
      link: "/vault",
      color: "text-primary",
    },
    {
      title: "Cyber Knowledge",
      description: "Learn about security",
      icon: BookOpen,
      link: "/knowledge",
      color: "text-secondary",
    },
    {
      title: "Crime Awareness",
      description: "Real-world case studies",
      icon: AlertTriangle,
      link: "/awareness",
      color: "text-destructive",
    },
    {
      title: "Crypto Lookup",
      description: "Check wallet transactions",
      icon: Coins,
      link: "/crypto",
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Security Dashboard</h1>
          <p className="text-muted-foreground">Your cyber protection command center</p>
        </div>

        <Card className="mb-8 border-glow bg-gradient-to-r from-card to-muted/20 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI-Powered Security Tip</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchAITip}
                disabled={isLoadingAI}
                className="hover-scale"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingAI ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAI ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiTip ? (
              <>
                <p className="text-foreground leading-relaxed">{aiTip.tip}</p>
                <div className="mt-3 flex gap-2 items-center">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Powered by AI
                  </span>
                </div>
              </>
            ) : randomTip ? (
              <>
                <h3 className="font-semibold text-accent mb-2">{randomTip.title}</h3>
                <p className="text-foreground">{randomTip.description}</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {randomTip.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    randomTip.severity === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {randomTip.severity} priority
                  </span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <Link key={card.title} to={card.link}>
              <Card className="border-glow hover:cyber-glow transition-all cursor-pointer h-full">
                <CardHeader>
                  <card.icon className={`h-12 w-12 ${card.color} mb-2`} />
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passwords Stored:</span>
                <span className="font-semibold text-primary">{passwordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Security:</span>
                <span className="font-semibold text-accent">High</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary" />
                Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-glow mb-2">85/100</div>
              <p className="text-muted-foreground text-sm">
                Great job! Keep using strong passwords and 2FA.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
