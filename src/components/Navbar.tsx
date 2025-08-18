import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
}

export const Navbar = ({ onSectionChange, currentSection }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: "home", label: "Início" },
    { id: "about", label: "Sobre a Ouvidoria" },
    { id: "form", label: "Abrir Solicitação" },
    { id: "contact", label: "Contato" },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => handleSectionClick("home")}
              className="flex items-center space-x-3"
            >
              <img 
                src="/lovable-uploads/127fdf71-f341-47a6-9849-5730551fe462.png" 
                alt="Igreja Novos Começos" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-primary">OUVIDORIA NC</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentSection === item.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/admin"}
              >
                Área Administrativa
              </Button>
            )}
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
                  className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                    currentSection === item.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => window.location.href = "/admin"}
                >
                  Área Administrativa
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};