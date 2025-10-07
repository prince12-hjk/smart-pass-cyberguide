import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, Calendar, TrendingUp } from "lucide-react";

interface CrimeCase {
  id: string;
  title: string;
  description: string;
  date: string;
  impact: string;
  lessons: string;
}

export default function Awareness() {
  const [cases, setCases] = useState<CrimeCase[]>([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from("cyber_crime_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching cases");
      return;
    }

    setCases(data || []);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Cyber Crime Awareness</h1>
          <p className="text-muted-foreground">Real-world case studies and lessons learned</p>
        </div>

        <Card className="mb-8 border-destructive/50 bg-gradient-to-r from-card to-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Report Cyber Crime in India
            </CardTitle>
            <CardDescription>
              If you're a victim of cybercrime, report it immediately to authorities
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => window.open("https://cybercrime.gov.in", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              cybercrime.gov.in
            </Button>
            <Button
              variant="outline"
              className="border-primary"
              onClick={() => window.open("https://www.police.gov.in", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Police Helpline
            </Button>
          </CardContent>
        </Card>

        {cases.length === 0 ? (
          <Card className="border-glow">
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No case studies available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {cases.map((crimeCase) => (
              <Card key={crimeCase.id} className="border-glow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl text-accent">{crimeCase.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {crimeCase.date}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Overview</h3>
                    <p className="text-foreground leading-relaxed">{crimeCase.description}</p>
                  </div>

                  <div className="bg-destructive/10 p-4 rounded border border-destructive/20">
                    <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Impact
                    </h3>
                    <p className="text-foreground">{crimeCase.impact}</p>
                  </div>

                  <div className="bg-primary/10 p-4 rounded border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">Lessons Learned</h3>
                    <p className="text-foreground">{crimeCase.lessons}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
