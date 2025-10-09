import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Clock, Bookmark, BookmarkCheck, Sparkles, RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  reading_time: number;
}

interface AIInsight {
  insight: string;
  generated_by: string;
}

export default function Knowledge() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);

  useEffect(() => {
    fetchArticles();
    loadBookmarks();
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

  const loadBookmarks = () => {
    const saved = localStorage.getItem("cybershield_bookmarks");
    if (saved) {
      setBookmarkedArticles(JSON.parse(saved));
    }
  };

  const toggleBookmark = (articleId: string) => {
    let updated: string[];
    if (bookmarkedArticles.includes(articleId)) {
      updated = bookmarkedArticles.filter(id => id !== articleId);
      toast.success("Bookmark removed");
    } else {
      updated = [...bookmarkedArticles, articleId];
      toast.success("Article bookmarked!");
    }
    setBookmarkedArticles(updated);
    localStorage.setItem("cybershield_bookmarks", JSON.stringify(updated));
  };

  const fetchAIInsight = async (article: KnowledgeArticle) => {
    setIsLoadingAI(true);
    setAiInsight(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-knowledge-insight', {
        body: { topic: `${article.category}: ${article.title}`, type: 'insight' }
      });
      
      if (error) throw error;
      
      setAiInsight(data);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      toast.error("Could not generate AI insights");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const surpriseMe = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-knowledge-insight', {
        body: { type: 'surprise' }
      });
      
      if (error) throw error;
      
      setSelectedArticle(null);
      setAiInsight(data);
      toast.success("Here's a surprising cybersecurity fact!");
    } catch (error) {
      console.error('Error fetching surprise:', error);
      toast.error("Could not generate surprise fact");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setAiInsight(null);
    fetchAIInsight(article);
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

  const displayedArticles = showBookmarked 
    ? articles.filter(a => bookmarkedArticles.includes(a.id))
    : articles;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-glow mb-2">Cyber Knowledge Library</h1>
            <p className="text-muted-foreground">Learn about cybersecurity threats and protection</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showBookmarked ? "default" : "outline"}
              onClick={() => setShowBookmarked(!showBookmarked)}
              className="hover-scale"
            >
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Bookmarked ({bookmarkedArticles.length})
            </Button>
            <Button
              variant="outline"
              onClick={surpriseMe}
              disabled={isLoadingAI}
              className="cyber-glow"
            >
              <Shuffle className={`h-4 w-4 mr-2 ${isLoadingAI ? 'animate-spin' : ''}`} />
              Surprise Me with AI
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1 space-y-4">
            {displayedArticles.length === 0 ? (
              <Card className="border-glow">
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {showBookmarked ? "No bookmarked articles" : "No articles available"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              displayedArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className={`border-glow hover:cyber-glow transition-all cursor-pointer ${
                    selectedArticle?.id === article.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {bookmarkedArticles.includes(article.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardTitle className="text-sm text-accent">{article.title}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.reading_time} min read
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          {/* Article Detail View */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <Card className="border-glow animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(selectedArticle.category)}`}>
                      {selectedArticle.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {selectedArticle.reading_time} min read
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(selectedArticle.id)}
                      >
                        {bookmarkedArticles.includes(selectedArticle.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-accent">{selectedArticle.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </p>

                  <Separator />

                  {/* AI Insights Section */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI-Generated Insights
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchAIInsight(selectedArticle)}
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
                          This content is AI-generated for educational purposes. Always verify before applying.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click refresh to generate AI insights for this article.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : aiInsight && !selectedArticle ? (
              <Card className="border-glow animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Surprising Cybersecurity Fact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed mb-4">
                    {aiInsight.insight}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    AI-generated educational content. Always verify information from official sources.
                  </p>
                  <Button
                    variant="outline"
                    onClick={surpriseMe}
                    disabled={isLoadingAI}
                    className="mt-4"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Another Surprise
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-glow">
                <CardContent className="text-center py-20">
                  <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Select an article to read</p>
                  <Button
                    variant="outline"
                    onClick={surpriseMe}
                    disabled={isLoadingAI}
                    className="cyber-glow"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Surprise Fact
                  </Button>
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
