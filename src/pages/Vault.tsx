import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key, Plus, Trash2, Eye, EyeOff, Copy, RefreshCw, Wand2 } from "lucide-react";
import CryptoJS from "crypto-js";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface Password {
  id: string;
  site_name: string;
  username: string | null;
  encrypted_password: string;
  url: string | null;
  category: string;
  created_at: string;
}

const ENCRYPTION_KEY = "cybershield-secret-key-2024";

export default function Vault() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    site_name: "",
    username: "",
    password: "",
    url: "",
    category: "general",
  });
  
  // Password generator state
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    const { data, error } = await supabase
      .from("passwords")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching passwords");
      return;
    }

    setPasswords(data || []);
  };

  const encryptPassword = (password: string) => {
    return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
  };

  const decryptPassword = (encryptedPassword: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
    toast.success("Strong password generated!");
  };

  const generateCustomPassword = () => {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      toast.error("Please select at least one character type");
      return;
    }

    let password = "";
    for (let i = 0; i < passwordLength[0]; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
    toast.success("Password generated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const encrypted = encryptPassword(formData.password);

    const { error } = await supabase.from("passwords").insert({
      user_id: user.id,
      site_name: formData.site_name,
      username: formData.username || null,
      encrypted_password: encrypted,
      url: formData.url || null,
      category: formData.category,
    });

    if (error) {
      toast.error("Error saving password");
      return;
    }

    toast.success("Password saved securely!");
    setIsDialogOpen(false);
    setFormData({ site_name: "", username: "", password: "", url: "", category: "general" });
    fetchPasswords();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("passwords").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting password");
      return;
    }

    toast.success("Password deleted");
    fetchPasswords();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Password Vault</h1>
          <p className="text-muted-foreground">Encrypted password storage with AES-256</p>
        </div>

        {/* Password Generator Section */}
        <Card className="border-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-accent" />
              Password Generator
            </CardTitle>
            <CardDescription>
              Create strong, secure passwords for any website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Password Length: {passwordLength[0]}</Label>
                </div>
                <Slider
                  value={passwordLength}
                  onValueChange={setPasswordLength}
                  min={8}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
                  />
                  <Label htmlFor="uppercase" className="cursor-pointer">
                    Uppercase (A-Z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
                  />
                  <Label htmlFor="lowercase" className="cursor-pointer">
                    Lowercase (a-z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                  />
                  <Label htmlFor="numbers" className="cursor-pointer">
                    Numbers (0-9)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
                  />
                  <Label htmlFor="symbols" className="cursor-pointer">
                    Symbols (!@#$%)
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={generateCustomPassword} className="w-full cyber-glow">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Password
            </Button>

            {generatedPassword && (
              <div className="space-y-2 animate-fade-in">
                <Label>Generated Password</Label>
                <div className="flex items-center gap-2 bg-muted p-3 rounded border-glow">
                  <span className="font-mono text-sm flex-1 break-all">
                    {showGeneratedPassword ? generatedPassword : "••••••••••••••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
                  >
                    {showGeneratedPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPassword)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Password Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-glow">Saved Passwords</h2>
            <p className="text-sm text-muted-foreground">Manage your stored passwords</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cyber-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Password
              </Button>
            </DialogTrigger>
            <DialogContent className="border-glow">
              <DialogHeader>
                <DialogTitle className="text-glow">Add New Password</DialogTitle>
                <DialogDescription>
                  Store your password securely with encryption
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name *</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username/Email</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button type="button" onClick={generatePassword} variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full cyber-glow">
                  Save Password
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {passwords.length === 0 ? (
          <Card className="border-glow">
            <CardContent className="text-center py-12">
              <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No passwords stored yet</p>
              <p className="text-sm text-muted-foreground mt-2">Click "Add Password" to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passwords.map((pwd) => (
              <Card key={pwd.id} className="border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-accent">{pwd.site_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pwd.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  {pwd.username && (
                    <CardDescription className="flex items-center justify-between">
                      <span>{pwd.username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(pwd.username!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <span className="font-mono text-sm">
                      {showPassword[pwd.id] ? decryptPassword(pwd.encrypted_password) : "••••••••"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword({ ...showPassword, [pwd.id]: !showPassword[pwd.id] })}
                      >
                        {showPassword[pwd.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(decryptPassword(pwd.encrypted_password))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {pwd.url && (
                    <a
                      href={pwd.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 block"
                    >
                      Visit site
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
