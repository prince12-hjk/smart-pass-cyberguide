import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Coins, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Crypto() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLookup = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    setLoading(true);
    
    // Simulated lookup (In production, you'd call blockchain API)
    setTimeout(() => {
      setResult({
        address: address,
        balance: "1.234 ETH",
        transactions: 42,
        firstSeen: "2023-01-15",
        lastActivity: "2024-10-05",
      });
      setLoading(false);
      toast.success("Lookup complete (Demo data)");
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Crypto Address Lookup</h1>
          <p className="text-muted-foreground">Educational demo - Check public blockchain transactions</p>
        </div>

        <Card className="mb-8 border-glow max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Wallet Address Lookup
            </CardTitle>
            <CardDescription>
              Enter an Ethereum wallet address to view public transaction data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-mono"
                />
                <Button
                  onClick={handleLookup}
                  disabled={loading}
                  className="cyber-glow"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Lookup"}
                </Button>
              </div>
            </div>

            <div className="bg-secondary/10 p-4 rounded border border-secondary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-secondary mb-1">Educational Purpose Only</p>
                  <p className="text-foreground">
                    This feature demonstrates blockchain transparency. In production, it would connect to APIs like Etherscan or Blockchain.com.
                    All blockchain transactions are public and can be viewed by anyone.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-primary/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-accent">Lookup Results</CardTitle>
              <CardDescription className="font-mono text-xs break-all">
                {result.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-lg font-semibold text-primary">{result.balance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold text-accent">{result.transactions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">First Seen</p>
                  <p className="text-sm font-medium">{result.firstSeen}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="text-sm font-medium">{result.lastActivity}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 This is demo data. In production, real-time blockchain data would be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
