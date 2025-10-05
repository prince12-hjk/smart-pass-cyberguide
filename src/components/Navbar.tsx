import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavbarProps {
  isAuthenticated: boolean;
}

export const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-glow bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
            <span className="text-2xl font-bold text-glow">CyberShield</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="hover:text-accent">
                  Dashboard
                </Button>
              </Link>
              <Link to="/vault">
                <Button variant="ghost" className="hover:text-accent">
                  Vault
                </Button>
              </Link>
              <Link to="/knowledge">
                <Button variant="ghost" className="hover:text-accent">
                  Knowledge
                </Button>
              </Link>
              <Link to="/awareness">
                <Button variant="ghost" className="hover:text-accent">
                  Awareness
                </Button>
              </Link>
              <Link to="/crypto">
                <Button variant="ghost" className="hover:text-accent">
                  Crypto Lookup
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="cyber-glow">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
