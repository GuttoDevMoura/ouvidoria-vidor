import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";

interface OuvidoriaFormProps {
  onBack: () => void;
  selectedType?: string;
}

export const OuvidoriaForm = ({ onBack, selectedType }: OuvidoriaFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdentified, setIsIdentified] = useState<string>("");
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    whatsapp: "",
    email: "",
    confirmarEmail: "",
    campus: "",
    tipoSolicitacao: selectedType || "",
    descricao: ""
  });
  const { toast } = useToast();

  const campusOptions = [
    "Niterói", "Barra", "Búzios", "Zona Sul", "Caxias", "Itaboraí", 
    "Petrópolis", "Friburgo", "Teresópolis", "Cabo Frio", "Macaé", "Maricá", "Online"
  ];

  const tipoOptions = ["Elogio", "Crítica", "Denúncia", "Sugestão"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isIdentified === "identificado" && formData.email !== formData.confirmarEmail) {
      toast({
        title: "Erro",
        description: "Os e-mails não coincidem",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        eh_anonimo: isIdentified === "anonimo",
        nome_completo: isIdentified === "identificado" ? formData.nomeCompleto : null,
        contato_whatsapp: isIdentified === "identificado" ? formData.whatsapp : null,
        email: isIdentified === "identificado" ? formData.email : null,
        campus: formData.campus,
        tipo_solicitacao: formData.tipoSolicitacao,
        descricao: formData.descricao
      } as any;

      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('numero_protocolo')
        .single();

      if (error) throw error;

      toast({
        title: "Solicitação enviada com sucesso!",
        description: `Protocolo: ${data.numero_protocolo}. Você receberá uma resposta em até 15 dias úteis.`,
      });

      // Reset form
      setFormData({
        nomeCompleto: "",
        whatsapp: "",
        email: "",
        confirmarEmail: "",
        campus: "",
        tipoSolicitacao: selectedType || "",
        descricao: ""
      });
      setIsIdentified("");
      onBack();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Nova Solicitação para a Ouvidoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de solicitação - Identificado ou Anônimo */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Como deseja fazer sua solicitação?</Label>
                <RadioGroup 
                  value={isIdentified} 
                  onValueChange={setIsIdentified}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="identificado" id="identificado" />
                    <Label htmlFor="identificado">Identificado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonimo" id="anonimo" />
                    <Label htmlFor="anonimo">Anônimo</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Campos para solicitação identificada */}
              {isIdentified === "identificado" && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      required
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      required
                      placeholder="(21) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmarEmail">Confirmar E-mail *</Label>
                    <Input
                      id="confirmarEmail"
                      type="email"
                      required
                      value={formData.confirmarEmail}
                      onChange={(e) => setFormData({...formData, confirmarEmail: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Campos obrigatórios para todos */}
              {isIdentified && (
                <>
                  <div>
                    <Label htmlFor="campus">Campus da Igreja *</Label>
                    <Select onValueChange={(value) => setFormData({...formData, campus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map((campus) => (
                          <SelectItem key={campus} value={campus}>
                            {campus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                   <div>
                     <Label htmlFor="tipoSolicitacao">Tipo de Solicitação *</Label>
                     <Select 
                       value={formData.tipoSolicitacao}
                       onValueChange={(value) => setFormData({...formData, tipoSolicitacao: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o tipo" />
                       </SelectTrigger>
                       <SelectContent>
                         {tipoOptions.map((tipo) => (
                           <SelectItem key={tipo} value={tipo}>
                             {tipo}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                  <div>
                    <Label htmlFor="descricao">Descrição da Solicitação *</Label>
                    <Textarea
                      id="descricao"
                      required
                      rows={6}
                      placeholder="Descreva detalhadamente sua solicitação..."
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};