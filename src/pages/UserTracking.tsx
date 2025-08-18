import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, MapPin, FileText, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface HistoryItem {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  agente_id?: string;
  old_value?: string;
  new_value?: string;
}

export default function UserTracking() {
  const [protocolCode, setProtocolCode] = useState("");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
    setHistory([]);

    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select("*")
        .eq("numero_protocolo", protocolCode.trim().toUpperCase())
        .maybeSingle();

      if (ticketError) {
        console.error("Erro ao buscar manifestação:", ticketError);
        toast({
          title: "Erro na busca",
          description: "Ocorreu um erro ao buscar a manifestação.",
          variant: "destructive",
        });
        return;
      }

      if (!ticketData) {
        setNotFound(true);
        return;
      }

      setTicketInfo(ticketData);

      // Buscar histórico público (apenas mudanças de status visíveis ao usuário)
      const { data: historyData } = await supabase
        .from("ticket_history")
        .select("*")
        .eq("ticket_id", ticketData.id)
        .in("action_type", ["created", "status_change"])
        .order("created_at", { ascending: true });

      if (historyData) {
        setHistory(historyData);
      }
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

  const getTimelineIcon = (actionType: string, status?: string) => {
    switch (actionType) {
      case "created":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "status_change":
        if (status === "Concluído") {
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Acompanhar Solicitação
          </h1>
          <p className="text-gray-600">
            Digite o código da sua manifestação para ver o andamento
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl text-center">
              Buscar Manifestação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
              <Card className="border-red-200 bg-red-50 mt-4">
                <CardContent className="p-4">
                  <p className="text-red-600 text-center">
                    Manifestação não encontrada. Verifique se o código foi digitado corretamente.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {ticketInfo && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações da Manifestação */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800">
                    Informações da Manifestação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Protocolo:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
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

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Abertura:</span>
                        <span>{formatDate(ticketInfo.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Prazo:</span>
                        <span>{formatDate(ticketInfo.data_vencimento)}</span>
                      </div>
                      {!ticketInfo.eh_anonimo && ticketInfo.nome_completo && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Solicitante:</span>
                          <span>{ticketInfo.nome_completo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Descrição</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded border">
                      {ticketInfo.descricao}
                    </p>
                  </div>

                  {ticketInfo.resumo_tratativa && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Resumo da Tratativa</h4>
                      <p className="text-gray-700 bg-green-50 p-4 rounded border border-green-200">
                        {ticketInfo.resumo_tratativa}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline e Status */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <CardTitle className="text-center">Status Atual</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Badge 
                    variant={getStatusBadgeVariant(ticketInfo.status) as any}
                    className="text-lg px-4 py-2 mb-4"
                  >
                    {ticketInfo.status}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {getDaysRemaining(ticketInfo.data_vencimento) > 0 ? (
                      <p className="text-orange-600">
                        {getDaysRemaining(ticketInfo.data_vencimento)} dias restantes
                      </p>
                    ) : (
                      <p className="text-red-600">Prazo vencido</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-gray-800">Histórico</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-blue-100 rounded-full">
                            {getTimelineIcon(item.action_type, item.new_value)}
                          </div>
                          {index < history.length - 1 && (
                            <div className="w-px bg-gray-300 h-8 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-800">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(item.created_at)}
                          </p>
                          {item.new_value && item.action_type === "status_change" && (
                            <Badge 
                              variant={getStatusBadgeVariant(item.new_value) as any}
                              className="mt-2"
                            >
                              {item.new_value}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}