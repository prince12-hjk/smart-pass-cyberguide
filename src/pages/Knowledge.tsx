import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Clock } from "lucide-react";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  reading_time: number;
}

export default function Knowledge() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("cyber_knowledge")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching articles");
      return;
    }

    setArticles(data || []);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      phishing: "bg-destructive/20 text-destructive",
      malware: "bg-destructive/30 text-destructive",
      "data-breach": "bg-secondary/20 text-secondary",
      vpn: "bg-primary/20 text-primary",
      "best-practices": "bg-accent/20 text-accent",
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Cyber Knowledge Library</h1>
          <p className="text-muted-foreground">Learn about cybersecurity threats and protection</p>
        </div>

        {articles.length === 0 ? (
          <Card className="border-glow">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No articles available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="border-glow hover:cyber-glow transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.reading_time} min read
                    </div>
                  </div>
                  <CardTitle className="text-accent">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{article.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
