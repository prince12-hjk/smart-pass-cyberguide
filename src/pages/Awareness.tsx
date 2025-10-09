import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { AlertCircle, ExternalLink, Sparkles, RefreshCw, MessageSquare, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CaseFromJSON {
  id: string;
  title: string;
  summary: string;
  details: string;
  impact: string;
  laws: string;
  reporting_links: string[];
  prevention: string[];
  immediate_actions: string[];
}

interface AIInsight {
  insight: string;
  generated_by: string;
}

export default function Awareness() {
  const [cases, setCases] = useState<CaseFromJSON[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseFromJSON | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState<AIInsight | null>(null);
  const [isLoadingQA, setIsLoadingQA] = useState(false);

  useEffect(() => {
    loadCasesFromJSON();
  }, []);

  const loadCasesFromJSON = async () => {
    try {
      const response = await fetch('/data/crime_cases.json');
      const data = await response.json();
      setCases(data);
    } catch (error) {
      console.error('Error loading case studies:', error);
      toast.error("Error loading case studies");
    }
  };

  const handleCaseClick = (caseItem: CaseFromJSON) => {
    setSelectedCase(caseItem);
    setAiInsight(null);
    setQaAnswer(null);
    setQaQuestion("");
    fetchAIInsight(caseItem);
  };

  const fetchAIInsight = async (caseItem: CaseFromJSON) => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-crime-insight', {
        body: { 
          caseTitle: caseItem.title,
          caseDetails: caseItem.summary,
          type: 'insight'
        }
      });
      
      if (error) throw error;
      
      setAiInsight(data);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!qaQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoadingQA(true);
    setQaAnswer(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-crime-insight', {
        body: { 
          question: qaQuestion,
          type: 'qa'
        }
      });
      
      if (error) throw error;
      
      setQaAnswer(data);
    } catch (error) {
      console.error('Error getting AI answer:', error);
      toast.error("Could not get answer");
    } finally {
      setIsLoadingQA(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Cyber Crime Awareness</h1>
          <p className="text-muted-foreground">Real case studies and prevention strategies</p>
        </div>

        {/* Reporting Alert */}
        <Alert className="mb-8 border-primary/50 bg-primary/5">
          <AlertCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold">Victim of cybercrime? Report it immediately:</span>
              <div className="flex gap-2">
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  National Cyber Crime Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* AI Q&A Box */}
        <Card className="mb-8 border-glow bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              AI Cybercrime Advisor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ask any question about cybercrime prevention and safety
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., How to stay safe from phishing?"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="flex-1"
              />
              <Button
                onClick={handleAskQuestion}
                disabled={isLoadingQA}
                className="cyber-glow"
              >
                {isLoadingQA ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isLoadingQA && (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            )}
            
            {qaAnswer && (
              <div className="bg-muted/50 p-4 rounded-lg border border-accent/20 animate-fade-in">
                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {qaAnswer.insight}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  AI-generated advice. For official guidance, always consult cybercrime.gov.in
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-1 space-y-4">
            {cases.length === 0 ? (
              <Card className="border-glow">
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No case studies available</p>
                </CardContent>
              </Card>
            ) : (
              cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`border-glow hover:cyber-glow transition-all cursor-pointer ${
                    selectedCase?.id === caseItem.id ? 'ring-2 ring-destructive' : ''
                  }`}
                  onClick={() => handleCaseClick(caseItem)}
                >
                  <CardHeader>
                    <CardTitle className="text-sm text-destructive">{caseItem.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{caseItem.summary}</p>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          {/* Case Details */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <Card className="border-glow animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-destructive">{selectedCase.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedCase.summary}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Details */}
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Full Details</h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedCase.details}
                    </p>
                  </div>

                  <Separator />

                  {/* Impact */}
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Impact</h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedCase.impact}
                    </p>
                  </div>

                  <Separator />

                  {/* Laws */}
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Applicable Laws</h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedCase.laws}
                    </p>
                  </div>

                  <Separator />

                  {/* Prevention Checklist */}
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Prevention Checklist
                    </h3>
                    <ul className="space-y-2">
                      {selectedCase.prevention.map((item, index) => (
                        <li key={index} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Actions */}
                  <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                    <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      If You're a Victim - Immediate Actions
                    </h3>
                    <ul className="space-y-2">
                      {selectedCase.immediate_actions.map((item, index) => (
                        <li key={index} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* AI Insights */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-accent/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        AI-Generated Global Context
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAIInsight(selectedCase)}
                        disabled={isLoadingAI}
                        className="hover-scale"
                      >
                        <RefreshCw className={`h-3 w-3 ${isLoadingAI ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    
                    {isLoadingAI ? (
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/6" />
                      </div>
                    ) : aiInsight ? (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground leading-relaxed">
                          {aiInsight.insight}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          AI-generated educational content. Always verify from official sources.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click refresh to generate AI insights for this case.
                      </p>
                    )}
                  </div>

                  {/* Reporting Links */}
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.reporting_links.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          Report Crime
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-glow">
                <CardContent className="text-center py-20">
                  <AlertCircle className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a case study to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground py-6 border-t border-muted">
          <p>CyberShield © 2025 | Educational use only | Not a substitute for professional security tools</p>
        </footer>
      </main>
    </div>
  );
}
