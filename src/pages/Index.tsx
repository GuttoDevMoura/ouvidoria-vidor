import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { OuvidoriaForm } from "@/components/OuvidoriaForm";
import { TrackingForm } from "@/components/TrackingForm";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  console.log('Index.tsx: Componente renderizando...');
  
  const [currentSection, setCurrentSection] = useState("home");
  const [selectedType, setSelectedType] = useState<string>("");
  const [content, setContent] = useState({
    hero_title: "",
    hero_subtitle: "",
    about_text: ""
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
        
        setContent({
          hero_title: contentMap.hero_title || "OUVIDORIA",
          hero_subtitle: contentMap.hero_subtitle || "Ouvindo por algo maior...", 
          about_text: contentMap.about_text || "A Ouvidoria da Igreja Novos Começos é um canal direto de comunicação entre nossa comunidade e a liderança."
        });
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

  const handleTrackingClick = () => {
    setCurrentSection("tracking");
  };

  const handleBackToHome = () => {
    setCurrentSection("home");
  };

  console.log('Index.tsx: Renderizando com seção:', currentSection);

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onSectionChange={handleSectionChange} 
        currentSection={currentSection}
        onTrackingClick={handleTrackingClick}
      />
      
      {currentSection === "form" ? (
        <OuvidoriaForm onBack={handleBackToHome} selectedType={selectedType} />
      ) : currentSection === "tracking" ? (
        <TrackingForm onBack={handleBackToHome} />
      ) : (
        <HeroSection 
          onOpenForm={handleOpenForm}
          content={content}
        />
      )}
    </div>
  );
};

export default Index;