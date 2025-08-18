import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
  onTrackingClick?: () => void;
}

export const Navbar = ({ onSectionChange, currentSection, onTrackingClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  
  // Debug: log do status do usuário
  console.log('Navbar - User:', user?.email, 'IsAdmin:', isAdmin);

  const navItems = [
    { id: "home", label: "Início" },
    { id: "about", label: "Sobre a Ouvidoria" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <button
              onClick={() => handleSectionClick("home")}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/127fdf71-f341-47a6-9849-5730551fe462.png" 
                alt="Igreja Novos Começos" 
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight">OUVIDORIA</span>
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
                    ? "text-foreground bg-gray-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTrackingClick}
              className="border-gray-200 hover:bg-gray-50 text-xs lg:text-sm flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Acompanhar</span>
              <span className="lg:hidden">Track</span>
            </Button>
            {user && isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/admin"}
                className="border-gray-200 hover:bg-gray-50 text-xs lg:text-sm"
              >
                <span className="hidden lg:inline">Área Administrativa</span>
                <span className="lg:hidden">Admin</span>
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
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`block w-full text-left px-3 py-3 text-base font-medium transition-colors rounded-lg ${
                    currentSection === item.id
                      ? "text-foreground bg-gray-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3 border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                onClick={onTrackingClick}
              >
                <Search className="h-4 w-4" />
                Acompanhar Manifestação
              </Button>
              {user && isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-gray-200 hover:bg-gray-50"
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