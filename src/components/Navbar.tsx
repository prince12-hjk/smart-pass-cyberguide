import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "@/assets/logo.svg";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-glow bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="CyberShield" className="h-10 w-10 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-glow">CyberShield</span>
          </Link>

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
            <Link to="/password-strength">
              <Button variant="ghost" className="hover:text-accent">
                Password Strength
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
