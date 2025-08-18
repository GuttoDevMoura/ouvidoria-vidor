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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/127fdf71-f341-47a6-9849-5730551fe462.png" 
                alt="Igreja Novos Começos" 
                className="h-12 sm:h-14 md:h-16 w-auto mb-2"
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground mb-2 tracking-tight px-2">
              {content.hero_title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 font-light leading-relaxed max-w-3xl mx-auto px-4">
              {content.hero_subtitle}
            </p>
            
            {/* Título da seção de manifestação */}
            <div className="mb-6 px-4">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground font-bold mb-2">
                Qual tipo de manifestação você deseja fazer?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light">
                Selecione um dos tipos abaixo:
              </p>
            </div>
            
            {/* Botões de tipos de manifestação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto px-4">
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Elogio")}
                className="group flex flex-col h-auto py-6 sm:py-8 px-4 sm:px-6 text-center space-y-3 sm:space-y-4 bg-white border-2 border-gray-100 hover:border-green-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-full"
              >
                <div className="bg-green-50 group-hover:bg-green-100 rounded-full p-3 sm:p-4 transition-colors duration-300 mx-auto">
                  <ThumbsUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-green-700 transition-colors leading-tight">Fazer um Elogio</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Sugestão")}
                className="group flex flex-col h-auto py-6 sm:py-8 px-4 sm:px-6 text-center space-y-3 sm:space-y-4 bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-full"
              >
                <div className="bg-blue-50 group-hover:bg-blue-100 rounded-full p-3 sm:p-4 transition-colors duration-300 mx-auto">
                  <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-blue-700 transition-colors leading-tight">Fazer uma Sugestão</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Crítica")}
                className="group flex flex-col h-auto py-6 sm:py-8 px-4 sm:px-6 text-center space-y-3 sm:space-y-4 bg-white border-2 border-gray-100 hover:border-orange-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-full"
              >
                <div className="bg-orange-50 group-hover:bg-orange-100 rounded-full p-3 sm:p-4 transition-colors duration-300 mx-auto">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-orange-700 transition-colors leading-tight">Fazer uma Crítica</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={() => onOpenForm("Denúncia")}
                className="group flex flex-col h-auto py-6 sm:py-8 px-4 sm:px-6 text-center space-y-3 sm:space-y-4 bg-white border-2 border-gray-100 hover:border-red-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-full"
              >
                <div className="bg-red-50 group-hover:bg-red-100 rounded-full p-3 sm:p-4 transition-colors duration-300 mx-auto">
                  <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-red-700 transition-colors leading-tight">Fazer uma Denúncia</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 sm:py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="bg-white rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 shadow-sm">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 px-2">Seguro e Confidencial</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                Suas informações são tratadas com total sigilo e segurança
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 shadow-sm">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 px-2">Resposta em 15 dias</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                Compromisso de resposta em até 15 dias úteis
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 shadow-sm">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 px-2">Equipe Dedicada</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                Profissionais capacitados para atender sua demanda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div id="sobre-ouvidoria" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 px-2">
              O que é a Ouvidoria?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              {content.about_text}
            </p>
          </div>
        </div>
      </div>

      {/* Base Bíblica */}
      <div className="py-8 sm:py-12 bg-card px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 px-2">
              Base Bíblica
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Fundamentada em 1 Coríntios 6:1-8, que orienta a resolução de conflitos dentro da comunidade cristã.
            </p>
          </div>
          
          <Card className="max-w-3xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200">
                1 Coríntios 6:1-8
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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

      {/* Call to Action - Abrir Manifestação */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Pronto para fazer sua manifestação?
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
            Escolha o tipo de manifestação que melhor se adequa à sua situação
          </p>
          <Button 
            size="lg" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
          >
            Abrir uma Manifestação
          </Button>
        </div>
      </div>

      {/* Informações da Ouvidoria */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Atribuições */}
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Atribuições</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                Compete a Ouvidoria receber denúncias, elogios, críticas, reclamações, sugestões e outros expedientes de qualquer natureza que lhes sejam encaminhados acerca das atividades desenvolvidas pela Igreja Lagoinha Rio e/ou das condutas entre os membros, voluntários e pastores.
              </p>
            </Card>

            {/* Estrutura */}
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Estrutura</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                É composta por um pastor Ouvidor, nomeado pelo Pastor Presidente, preferencialmente, com formação em Direito.
              </p>
            </Card>

            {/* Como fazer */}
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Como fazer</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 text-muted-foreground leading-relaxed text-xs sm:text-sm">
                <p>
                  <strong>Formulário eletrônico:</strong> Canal preferencial e mais rápido através desta página.
                </p>
                <p>
                  <strong>Atendimento presencial:</strong> Mediante agendamento com a Secretaria do Campus, por meio do telefone, e-mail, ou diretamente na sede, na Estrada Francisco da Cruz Nunes, nº 119, Piratininga, Niterói/RJ.
                </p>
              </div>
            </Card>

            {/* Tratamento da demanda */}
            <Card className="p-4 sm:p-6 h-full">
              <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="bg-orange-50 p-2 rounded-lg flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Tratamento da demanda</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                Com o recebimento da demanda, o Pastor iniciará a busca das informações sobre o caso, podendo se valer de todos os meios de provas disponíveis, a fim de se chegar a uma conclusão do fato. Após, discricionariamente, serão adotadas as medidas necessárias à solução da demanda, à luz da Bíblia e do Estatuto da Igreja.
              </p>
            </Card>
          </div>

          {/* Importante */}
          <Card className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Importante</h3>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
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