import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Calendar, User, MapPin, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackingFormProps {
  onBack: () => void;
}

interface TicketInfo {
  id: string;
  numero_protocolo: string;
  status: string;
  campus: string;
  tipo_solicitacao: string;
  descricao: string;
  nome_completo?: string;
  eh_anonimo: boolean;
  created_at: string;
  data_vencimento: string;
  resumo_tratativa?: string;
}

export const TrackingForm = ({ onBack }: TrackingFormProps) => {
  const [protocolCode, setProtocolCode] = useState("");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!protocolCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, informe o código da manifestação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setTicketInfo(null);

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("numero_protocolo", protocolCode.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar manifestação:", error);
        toast({
          title: "Erro na busca",
          description: "Ocorreu um erro ao buscar a manifestação.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        setNotFound(true);
        toast({
          title: "Manifestação não encontrada",
          description: "Verifique se o código foi digitado corretamente.",
          variant: "destructive",
        });
        return;
      }

      setTicketInfo(data);
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Aberto":
        return "secondary";
      case "Em Andamento":
        return "default";
      case "Concluído":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-xl md:text-2xl font-bold text-center">
              Acompanhar Manifestação
            </CardTitle>
            <p className="text-blue-100 text-center mt-2">
              Digite o código da sua manifestação para ver o status atual
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: OUV2024000001"
                    value={protocolCode}
                    onChange={(e) => setProtocolCode(e.target.value.toUpperCase())}
                    className="h-12 text-lg"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    "Buscando..."
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>

              {notFound && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-600 text-center">
                      Manifestação não encontrada. Verifique se o código foi digitado corretamente.
                    </p>
                  </CardContent>
                </Card>
              )}

              {ticketInfo && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-800 mb-4">
                            Informações da Manifestação
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Protocolo:</span>
                              <span className="font-mono bg-white px-2 py-1 rounded">
                                {ticketInfo.numero_protocolo}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Status:</span>
                              <Badge variant={getStatusBadgeVariant(ticketInfo.status) as any}>
                                {ticketInfo.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Campus:</span>
                              <span>{ticketInfo.campus}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Tipo:</span>
                              <span>{ticketInfo.tipo_solicitacao}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">Datas Importantes</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Criada em:</span>
                              <span>{formatDate(ticketInfo.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Vencimento:</span>
                              <span>{formatDate(ticketInfo.data_vencimento)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Solicitante:</span>
                            {ticketInfo.eh_anonimo ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Anônimo
                                </Badge>
                                <span className="text-xs text-muted-foreground">(Prazo: 30 dias úteis)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{ticketInfo.nome_completo}</span>
                                <span className="text-xs text-muted-foreground">(Prazo: 15 dias úteis)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Descrição</h4>
                        <p className="text-gray-700 bg-white p-4 rounded border">
                          {ticketInfo.descricao}
                        </p>
                      </div>

                      {ticketInfo.resumo_tratativa && (
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">Resumo da Tratativa</h4>
                          <p className="text-gray-700 bg-white p-4 rounded border">
                            {ticketInfo.resumo_tratativa}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};