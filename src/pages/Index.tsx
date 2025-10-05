import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, BookOpen, AlertTriangle, Coins, Lock, Eye, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import heroImage from "@/assets/cyber-hero.jpg";

export default function Index() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    {
      icon: Key,
      title: "Password Vault",
      description: "Generate and store passwords with AES-256 encryption",
    },
    {
      icon: BookOpen,
      title: "Cyber Knowledge",
      description: "Learn about phishing, malware, VPNs, and security best practices",
    },
    {
      icon: AlertTriangle,
      title: "Crime Awareness",
      description: "Real-world case studies and cyber laws in India",
    },
    {
      icon: Coins,
      title: "Crypto Lookup",
      description: "Educational blockchain address scanner",
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "JWT-based authentication with encrypted sessions",
    },
    {
      icon: Eye,
      title: "Dynamic Tips",
      description: "AI-powered cybersecurity tips on every interaction",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-24 w-24 text-primary animate-pulse-glow" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-glow mb-6">
              CyberShield
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground mb-4">
              Smart Password Manager & Cyber Awareness Platform
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Protect your digital life with encrypted password storage, learn cybersecurity fundamentals,
              and stay aware of real-world cyber threats
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/auth">
                <Button size="lg" className="cyber-glow text-lg px-8">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-primary text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-glow mb-4">
              Complete Cyber Protection Suite
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to secure your digital presence and learn cybersecurity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-glow hover:cyber-glow transition-all">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-2" />
                  <CardTitle className="text-accent">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-glow bg-gradient-to-r from-card to-primary/5">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-glow mb-8 text-center">
                  Why Cybersecurity Matters
                </h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-destructive mb-2">43%</div>
                    <p className="text-muted-foreground">of cyber attacks target small businesses</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">81%</div>
                    <p className="text-muted-foreground">of breaches involve weak passwords</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-accent mb-2">$4.45M</div>
                    <p className="text-muted-foreground">average cost of a data breach</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-glow mb-6">
            Start Protecting Your Digital Life Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join CyberShield and take control of your online security with encrypted password storage and comprehensive cyber education
          </p>
          <Link to="/auth">
            <Button size="lg" className="cyber-glow text-lg px-12">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2024 CyberShield. Built for cybersecurity awareness and education.</p>
          <p className="text-sm">
            Passwords encrypted with AES-256 | Report cyber crime: <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cybercrime.gov.in</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
