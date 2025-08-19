import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
  onTrackingClick?: () => void;
}

export const Navbar = ({ onSectionChange, currentSection, onTrackingClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Início" },
    { id: "about", label: "Sobre a Ouvidoria" },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === "about") {
      // Scroll para a seção sobre a ouvidoria
      const aboutSection = document.getElementById("sobre-ouvidoria");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      onSectionChange(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center mr-12">
            <button
              onClick={() => handleSectionClick("home")}
              className="flex items-center space-x-3 sm:space-x-4 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/127fdf71-f341-47a6-9849-5730551fe462.png" 
                alt="Igreja Novos Começos" 
                className="h-10 w-auto opacity-70"
              />
              <span className="text-lg font-bold text-foreground tracking-wider">OUVIDORIA</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`px-3 lg:px-4 py-2 text-sm lg:text-base font-medium transition-colors rounded-lg ${
                  currentSection === item.id
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link to="/acompanhar">
              <Button 
                variant="outline" 
                size="sm"
                className="border-border hover:bg-muted/50 text-xs lg:text-sm flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Digite o seu Protocolo</span>
                <span className="lg:hidden">Protocolo</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`block w-full text-left px-3 py-3 text-base font-medium transition-colors rounded-lg ${
                    currentSection === item.id
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link to="/acompanhar" className="w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-border hover:bg-muted/50 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Acompanhe sua solicitação aqui
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};