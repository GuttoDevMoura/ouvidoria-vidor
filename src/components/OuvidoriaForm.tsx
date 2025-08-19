import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, CheckCircle, Shield } from "lucide-react";

interface OuvidoriaFormProps {
  onBack: () => void;
  selectedType?: string;
}

export const OuvidoriaForm = ({ onBack, selectedType }: OuvidoriaFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdentified, setIsIdentified] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
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

      // Configurar dados para o popup
      setProtocolNumber(data.numero_protocolo);
      setIsAnonymous(isIdentified === "anonimo");
      setShowSuccessDialog(true);

      // Enviar email de confirmação apenas se for identificado
      if (isIdentified === "identificado" && formData.email) {
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: formData.email,
              subject: 'Confirmação de Manifestação - Ouvidoria Igreja Novos Começos',
              protocolNumber: data.numero_protocolo,
              status: 'Aberto',
              nome: formData.nomeCompleto,
              isAnonymous: false
            }
          });
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
          // Não bloquear o processo se o email falhar
        }
      }

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

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    onBack();
  };

  return (
    <>
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
                     {selectedType ? (
                       <div 
                         className={`h-10 px-3 py-2 border rounded-md flex items-center font-bold text-white ${
                           selectedType === 'Elogio' ? 'bg-green-600/80 border-green-600' :
                           selectedType === 'Sugestão' ? 'bg-blue-600/80 border-blue-600' :
                           selectedType === 'Crítica' ? 'bg-orange-600/80 border-orange-600' :
                           selectedType === 'Denúncia' ? 'bg-red-600/80 border-red-600' : 'bg-gray-600/80 border-gray-600'
                         }`}
                       >
                         {selectedType}
                       </div>
                     ) : (
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
                     )}
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

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">
                Número do Protocolo:
              </div>
              <div className="rounded-lg bg-muted p-3 font-mono text-lg font-bold">
                {protocolNumber}
              </div>
            </div>

            {isAnonymous ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">Solicitação Anônima</div>
                    <div className="text-blue-700">Seu anonimato será mantido durante todo o processo.</div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="text-sm">
                    <div className="font-medium text-orange-900 mb-1">Prazo para Resposta</div>
                    <div className="text-orange-700">
                      Manifestações anônimas têm prazo de <strong>30 dias úteis</strong> para resposta.
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <strong>Importante:</strong> Salve este número de protocolo para acompanhar sua solicitação. 
                  Você pode consultar o andamento na página de acompanhamento.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="text-sm">
                    <div className="font-medium text-green-900 mb-1">E-mail de Confirmação</div>
                    <div className="text-green-700">
                      Um e-mail de confirmação foi enviado para {formData.email} com os detalhes da sua solicitação.
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Você receberá uma resposta em até <strong>15 dias úteis</strong>.
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={handleDialogClose} className="w-full">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};