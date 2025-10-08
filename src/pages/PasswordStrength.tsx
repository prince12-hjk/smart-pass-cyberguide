import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock, Zap, Server, Globe } from "lucide-react";

/**
 * Educational Password Strength Analyzer
 * 
 * SECURITY NOTICE: This tool is for EDUCATIONAL PURPOSES ONLY.
 * - All calculations happen client-side (no data sent to servers)
 * - DO NOT enter your real passwords
 * - Use example passwords to learn about password security
 * 
 * This simulator estimates how long it would take attackers to crack
 * passwords using various methods, helping users understand the importance
 * of password complexity and length.
 */

// Character set sizes for entropy calculation
const CHARSET_SIZES = {
  lowercase: 26,
  uppercase: 26,
  numbers: 10,
  symbols: 32, // Common symbols
};

// Attacker speeds (guesses per second)
const ATTACKER_SPEEDS = {
  onlineThrottled: { speed: 10, name: "Online Attack (Throttled)", icon: Globe, color: "text-green-500" },
  consumerGPU: { speed: 1e9, name: "Consumer GPU", icon: Zap, color: "text-yellow-500" },
  cloudCluster: { speed: 1e11, name: "Cloud GPU Cluster", icon: Server, color: "text-orange-500" },
  massiveBotnet: { speed: 1e13, name: "Massive Botnet", icon: AlertTriangle, color: "text-destructive" },
};

interface PasswordAnalysis {
  entropy: number;
  charsetSize: number;
  guessSpace: string;
  crackTimes: {
    [key: string]: string;
  };
  strength: "very-weak" | "weak" | "moderate" | "strong" | "very-strong";
  suggestions: string[];
}

export default function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  /**
   * Calculate character set size based on password composition
   */
  const calculateCharsetSize = (pwd: string): number => {
    let size = 0;
    if (/[a-z]/.test(pwd)) size += CHARSET_SIZES.lowercase;
    if (/[A-Z]/.test(pwd)) size += CHARSET_SIZES.uppercase;
    if (/[0-9]/.test(pwd)) size += CHARSET_SIZES.numbers;
    if (/[^a-zA-Z0-9]/.test(pwd)) size += CHARSET_SIZES.symbols;
    return size || 1; // Minimum 1 to avoid division by zero
  };

  /**
   * Calculate Shannon entropy (bits)
   * Entropy = log2(charset_size^length)
   */
  const calculateEntropy = (pwd: string, charsetSize: number): number => {
    return Math.log2(Math.pow(charsetSize, pwd.length));
  };

  /**
   * Format large numbers into human-readable strings
   */
  const formatLargeNumber = (num: number): string => {
    if (num < 1000) return num.toFixed(0);
    if (num < 1e6) return (num / 1e3).toFixed(1) + "K";
    if (num < 1e9) return (num / 1e6).toFixed(1) + "M";
    if (num < 1e12) return (num / 1e9).toFixed(1) + "B";
    if (num < 1e15) return (num / 1e12).toFixed(1) + "T";
    if (num < 1e18) return (num / 1e15).toFixed(1) + "Q";
    return ">" + (num / 1e18).toFixed(0) + "Qi";
  };

  /**
   * Convert seconds to human-readable time format
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 1) return "Instant";
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
    if (seconds < 31536000 * 100) return `${(seconds / 31536000).toFixed(1)} years`;
    if (seconds < 31536000 * 1e6) return `${(seconds / (31536000 * 1e3)).toFixed(1)}K years`;
    if (seconds < 31536000 * 1e9) return `${(seconds / (31536000 * 1e6)).toFixed(1)}M years`;
    if (seconds < 31536000 * 1e12) return `${(seconds / (31536000 * 1e9)).toFixed(1)}B years`;
    return "Universe lifetime+";
  };

  /**
   * Determine password strength category based on entropy
   */
  const determineStrength = (entropy: number): "very-weak" | "weak" | "moderate" | "strong" | "very-strong" => {
    if (entropy < 28) return "very-weak"; // < 268M combinations
    if (entropy < 36) return "weak"; // < 68B combinations
    if (entropy < 60) return "moderate"; // < 1 quintillion
    if (entropy < 80) return "strong"; // < 1.2 nonillion
    return "very-strong";
  };

  /**
   * Generate suggestions for improving password strength
   */
  const generateSuggestions = (pwd: string, entropy: number): string[] => {
    const suggestions: string[] = [];

    if (pwd.length < 12) {
      suggestions.push("Increase length to at least 12 characters (longer is better)");
    }

    if (!/[a-z]/.test(pwd)) {
      suggestions.push("Add lowercase letters");
    }

    if (!/[A-Z]/.test(pwd)) {
      suggestions.push("Add uppercase letters");
    }

    if (!/[0-9]/.test(pwd)) {
      suggestions.push("Add numbers");
    }

    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      suggestions.push("Add special characters (!@#$%^&*)");
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(pwd)) {
      suggestions.push("Avoid repeating characters (aaa, 111)");
    }

    if (/^[a-zA-Z]+$/.test(pwd) && /^[a-z]+$/i.test(pwd)) {
      suggestions.push("Don't use only letters - mix character types");
    }

    if (/^\d+$/.test(pwd)) {
      suggestions.push("Don't use only numbers - add letters and symbols");
    }

    // Check for sequential patterns
    if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def/i.test(pwd)) {
      suggestions.push("Avoid sequential patterns (123, abc)");
    }

    if (pwd.toLowerCase().includes("password") || pwd.toLowerCase().includes("admin")) {
      suggestions.push("Never use common words like 'password' or 'admin'");
    }

    if (entropy >= 80) {
      suggestions.push("✓ Excellent! This is a very strong password");
    } else if (entropy >= 60) {
      suggestions.push("Good strength, but consider making it even longer");
    }

    return suggestions;
  };

  /**
   * Main analysis function
   */
  const analyzePassword = (pwd: string): void => {
    if (!pwd) {
      setAnalysis(null);
      return;
    }

    const charsetSize = calculateCharsetSize(pwd);
    const entropy = calculateEntropy(pwd, charsetSize);
    const guessSpace = Math.pow(charsetSize, pwd.length);
    
    // Calculate crack times for different attacker speeds
    const crackTimes: { [key: string]: string } = {};
    Object.entries(ATTACKER_SPEEDS).forEach(([key, { speed }]) => {
      // Average time to crack = guessSpace / (2 * speed)
      // We use average case (50% of search space)
      const seconds = guessSpace / (2 * speed);
      crackTimes[key] = formatTime(seconds);
    });

    const strength = determineStrength(entropy);
    const suggestions = generateSuggestions(pwd, entropy);

    setAnalysis({
      entropy,
      charsetSize,
      guessSpace: formatLargeNumber(guessSpace),
      crackTimes,
      strength,
      suggestions,
    });
  };

  const handleAnalyze = () => {
    analyzePassword(password);
  };

  const loadExample = (example: string) => {
    setPassword(example);
    analyzePassword(example);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "very-weak": return "text-destructive";
      case "weak": return "text-orange-500";
      case "moderate": return "text-yellow-500";
      case "strong": return "text-primary";
      case "very-strong": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  const getStrengthLabel = (strength: string) => {
    return strength.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-glow mb-2">Password Strength Simulator</h1>
            <p className="text-muted-foreground">Educational tool to understand password security</p>
          </div>

          {/* Security Warning */}
          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-foreground">
              <strong>Educational Tool Only:</strong> This simulator runs entirely in your browser. 
              <strong> DO NOT enter your real passwords.</strong> Use example passwords to learn about security. 
              All calculations are performed locally - no data is sent to any server.
            </AlertDescription>
          </Alert>

          {/* Input Section */}
          <Card className="mb-6 border-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Password Analysis
              </CardTitle>
              <CardDescription>
                Enter a password to see how long it would take attackers to crack it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter example password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                  className="flex-1"
                />
                <Button onClick={handleAnalyze} className="bg-primary hover:bg-primary/90">
                  Analyze
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Examples:</span>
                <Button variant="outline" size="sm" onClick={() => loadExample("password123")}>
                  password123
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadExample("P@ssw0rd!")}>
                  P@ssw0rd!
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadExample("MyDog'sName2024")}>
                  MyDog'sName2024
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadExample("c0rrect-h0rse-battery-staple!")}>
                  passphrase
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <>
              {/* Strength Overview */}
              <Card className="mb-6 border-glow">
                <CardHeader>
                  <CardTitle className={getStrengthColor(analysis.strength)}>
                    Strength: {getStrengthLabel(analysis.strength)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Password Length</p>
                      <p className="text-2xl font-semibold text-accent">{password.length} characters</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Character Set Size</p>
                      <p className="text-2xl font-semibold text-accent">{analysis.charsetSize} possible chars</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entropy (bits)</p>
                      <p className="text-2xl font-semibold text-accent">{analysis.entropy.toFixed(1)} bits</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Combinations</p>
                      <p className="text-2xl font-semibold text-accent">{analysis.guessSpace}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crack Time Estimates */}
              <Card className="mb-6 border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Estimated Crack Times
                  </CardTitle>
                  <CardDescription>
                    Time required to crack this password under different attack scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(ATTACKER_SPEEDS).map(([key, { name, icon: Icon, color }]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${color}`} />
                        <div>
                          <p className="font-semibold text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatLargeNumber(ATTACKER_SPEEDS[key as keyof typeof ATTACKER_SPEEDS].speed)} guesses/sec
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${color}`}>
                        {analysis.crackTimes[key]}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card className="border-glow">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    How to improve your password security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {/* Educational Information */}
          <Card className="mt-6 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Understanding the Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground">
              <p>
                <strong>Entropy:</strong> Measures password unpredictability in bits. Higher is better. 
                80+ bits is considered very strong.
              </p>
              <p>
                <strong>Character Set:</strong> The pool of possible characters. More variety = stronger password.
              </p>
              <p>
                <strong>Attack Scenarios:</strong> Different attackers have different capabilities. 
                Online attacks are slow (rate-limited by website). Offline attacks (stolen password database) 
                can be extremely fast with specialized hardware.
              </p>
              <p>
                <strong>Best Practice:</strong> Use a password manager to generate and store unique, 
                random passwords of 16+ characters for each account. Enable two-factor authentication 
                whenever possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
