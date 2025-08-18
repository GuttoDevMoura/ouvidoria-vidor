import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Shield, Clock, Users, ThumbsUp, MessageSquare, Megaphone, Lightbulb } from "lucide-react";

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
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3">
              {content.hero_title}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 leading-relaxed font-bold">
              {content.hero_subtitle}
            </p>
            
            {/* Título da seção de manifestação */}
            <h2 className="text-xl md:text-2xl text-blue-600 font-bold mb-2">
              Qual tipo de manifestação você deseja fazer?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Selecione um dos tipos abaixo:
            </p>
            
            {/* Botões de tipos de manifestação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Elogio")}
                className="flex flex-col h-auto py-8 px-6 text-center space-y-4 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/30 hover:shadow-green-600/40 transition-all duration-300"
              >
                <div className="bg-white/20 rounded-full p-4">
                  <ThumbsUp className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Fazer um Elogio</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Sugestão")}
                className="flex flex-col h-auto py-8 px-6 text-center space-y-4 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-300"
              >
                <div className="bg-white/20 rounded-full p-4">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Fazer uma Sugestão</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Crítica")}
                className="flex flex-col h-auto py-8 px-6 text-center space-y-4 bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 transition-all duration-300"
              >
                <div className="bg-white/20 rounded-full p-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Fazer uma Crítica</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Denúncia")}
                className="flex flex-col h-auto py-8 px-6 text-center space-y-4 bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all duration-300"
              >
                <div className="bg-white/20 rounded-full p-4">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Fazer uma Denúncia</span>
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

      {/* Base Bíblica */}
      <div className="py-12 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Base Bíblica
            </h2>
            <p className="text-base text-muted-foreground">
              Fundamentada em 1 Coríntios 6:1-8, que orienta a resolução de conflitos dentro da comunidade cristã.
            </p>
          </div>
          
          <Card className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                1 Coríntios 6:1-8
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p><span className="font-semibold text-blue-600">¹</span> Se algum de vocês tem queixa contra outro irmão, como ousa apresentar a causa para ser julgada pelos ímpios, em vez de levá-la aos santos?</p>
              <p><span className="font-semibold text-blue-600">²</span> Vocês não sabem que os santos hão de julgar o mundo? Se vocês hão de julgar o mundo, acaso não são capazes de julgar as causas de menor importância?</p>
              <p><span className="font-semibold text-blue-600">³</span> Vocês não sabem que haveremos de julgar os anjos? Quanto mais as coisas desta vida!</p>
              <p><span className="font-semibold text-blue-600">⁴</span> Portanto, se vocês têm questões relativas às coisas desta vida, designem para juízes os que são da igreja, mesmo que sejam os menos importantes.</p>
              <p><span className="font-semibold text-blue-600">⁵</span> Digo isso para envergonhá-los. Acaso não há entre vocês alguém suficientemente sábio para julgar uma causa entre irmãos?</p>
              <p><span className="font-semibold text-blue-600">⁶</span> Mas, ao invés disso, um irmão vai ao tribunal contra outro irmão, e isso diante de descrentes!</p>
              <p><span className="font-semibold text-blue-600">⁷</span> O fato de haver litígios entre vocês já significa uma completa derrota. Por que não preferem sofrer a injustiça?</p>
              <p><span className="font-semibold text-blue-600">⁸</span> Em vez disso vocês mesmos causam injustiças e prejuízos, e isso contra irmãos!</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Informações da Ouvidoria */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Atribuições */}
            <Card className="p-8 h-full">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Atribuições</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Compete a Ouvidoria receber denúncias, elogios, críticas, reclamações, sugestões e outros expedientes de qualquer natureza que lhes sejam encaminhados acerca das atividades desenvolvidas pela Igreja Lagoinha Rio e/ou das condutas entre os membros, voluntários e pastores.
              </p>
            </Card>

            {/* Estrutura */}
            <Card className="p-8 h-full">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Estrutura</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                É composta por um pastor Ouvidor, nomeado pelo Pastor Presidente, preferencialmente, com formação em Direito.
              </p>
            </Card>

            {/* Como fazer */}
            <Card className="p-8 h-full">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Como fazer</h3>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong>Formulário eletrônico:</strong> Canal preferencial e mais rápido através desta página.
                </p>
                <p>
                  <strong>Atendimento presencial:</strong> Mediante agendamento com a Secretaria do Campus, por meio do telefone, e-mail, ou diretamente na sede, na Estrada Francisco da Cruz Nunes, nº 119, Piratininga, Niterói/RJ.
                </p>
              </div>
            </Card>

            {/* Tratamento da demanda */}
            <Card className="p-8 h-full">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Tratamento da demanda</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Com o recebimento da demanda, o Pastor iniciará a busca das informações sobre o caso, podendo se valer de todos os meios de provas disponíveis, a fim de se chegar a uma conclusão do fato. Após, discricionariamente, serão adotadas as medidas necessárias à solução da demanda, à luz da Bíblia e do Estatuto da Igreja.
              </p>
            </Card>
          </div>

          {/* Importante */}
          <Card className="mt-8 p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Importante</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ao remeter a sua comunicação forneça o maior número de informações, a fim de viabilizar a apuração dos fatos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};