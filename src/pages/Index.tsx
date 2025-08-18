import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { OuvidoriaForm } from "@/components/OuvidoriaForm";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("home");
  const [selectedType, setSelectedType] = useState<string>("");
  const [content, setContent] = useState({
    hero_title: "OUVIDORIA NC",
    hero_subtitle: "Canal direto de diálogo com a Igreja Novos Começos. Uma porta aberta para participação através da escuta atenta, visando transparência, ética e melhorias em nossos ministérios e atividades.",
    about_text: "A Ouvidoria da Igreja Novos Começos é um canal direto de comunicação entre nossa comunidade e a liderança."
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data } = await supabase
        .from('content_settings')
        .select('chave, valor')
        .in('chave', ['hero_title', 'hero_subtitle', 'about_text']);
      
      if (data) {
        const contentMap = data.reduce((acc, item) => {
          acc[item.chave] = item.valor;
          return acc;
        }, {} as Record<string, string>);
        
        setContent(prev => ({ ...prev, ...contentMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const handleOpenForm = (type?: string) => {
    if (type) setSelectedType(type);
    setCurrentSection("form");
  };

  const handleBackToHome = () => {
    setCurrentSection("home");
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar 
          onSectionChange={handleSectionChange} 
          currentSection={currentSection}
        />
        
        {currentSection === "form" ? (
          <OuvidoriaForm onBack={handleBackToHome} selectedType={selectedType} />
        ) : (
          <HeroSection 
            onOpenForm={handleOpenForm}
            content={content}
          />
        )}
      </div>
    </AuthProvider>
  );
};

export default Index;