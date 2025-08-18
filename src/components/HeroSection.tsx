import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Shield, Clock, Users, ThumbsUp, MessageSquare, AlertTriangle, Lightbulb } from "lucide-react";

interface HeroSectionProps {
  onOpenForm: (type?: string) => void;
  content: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
  };
}

export const HeroSection = ({ onOpenForm, content }: HeroSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/127fdf71-f341-47a6-9849-5730551fe462.png" 
                alt="Igreja Novos Começos" 
                className="h-16 w-auto mb-4"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {content.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {content.hero_subtitle}
            </p>
            
            {/* Botões de tipos de manifestação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Elogio")}
                className="flex flex-col h-auto py-6 px-4 text-center space-y-2 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-10 w-10" />
                <span className="text-sm font-medium">Fazer um Elogio</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Sugestão")}
                className="flex flex-col h-auto py-6 px-4 text-center space-y-2 bg-blue-600 hover:bg-blue-700"
              >
                <Lightbulb className="h-10 w-10" />
                <span className="text-sm font-medium">Fazer uma Sugestão</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Crítica")}
                className="flex flex-col h-auto py-6 px-4 text-center space-y-2 bg-orange-600 hover:bg-orange-700"
              >
                <MessageSquare className="h-10 w-10" />
                <span className="text-sm font-medium">Fazer uma Crítica</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Denúncia")}
                className="flex flex-col h-auto py-6 px-4 text-center space-y-2 bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-10 w-10" />
                <span className="text-sm font-medium">Fazer uma Denúncia</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seguro e Confidencial</h3>
              <p className="text-muted-foreground">
                Suas informações são tratadas com total sigilo e segurança
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Resposta em 15 dias</h3>
              <p className="text-muted-foreground">
                Compromisso de resposta em até 15 dias úteis
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Equipe Dedicada</h3>
              <p className="text-muted-foreground">
                Profissionais capacitados para atender sua demanda
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              O que é a Ouvidoria?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.about_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};