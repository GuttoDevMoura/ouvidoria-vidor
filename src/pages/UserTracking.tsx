import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, MapPin, FileText, RotateCcw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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
  updated_at: string;
  reaberto_count?: number;
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
  const [isReopening, setIsReopening] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Contar quantas vezes foi reaberto
      const { data: reopenHistory } = await supabase
        .from("ticket_history")
        .select("id")
        .eq("ticket_id", ticketData.id)
        .eq("action_type", "status_change")
        .eq("new_value", "Reaberto");

      setTicketInfo({
        ...ticketData,
        reaberto_count: reopenHistory?.length || 0
      });

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

  const handleReopen = async () => {
    if (!ticketInfo) return;

    setIsReopening(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          status: "Reaberto",
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketInfo.id);

      if (error) {
        console.error("Erro ao reabrir manifestação:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao reabrir a manifestação.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Manifestação reaberta",
        description: "Sua manifestação foi reaberta e retornou para análise.",
      });

      // Recarregar os dados
      handleSearch();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsReopening(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Aberto":
        return "secondary";
      case "Em Andamento":
        return "default";
      case "Reaberto":
        return "destructive";
      case "Fechado":
        return "outline";
      default:
        return "secondary";
    }
  };

  const canReopen = (ticket: TicketInfo) => {
    const allowedTypes = ["Critica", "Denuncia"];
    return (
      ticket.status === "Concluído" &&
      allowedTypes.includes(ticket.tipo_solicitacao) &&
      (ticket.reaberto_count || 0) < 1
    );
  };

  const canShowContestButton = (ticket: TicketInfo) => {
    const allowedTypes = ["Critica", "Denuncia"];
    return allowedTypes.includes(ticket.tipo_solicitacao);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDateOnly = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const shouldShowDaysRemaining = (status: string) => {
    return ["Aberto", "Em Andamento", "Reaberto"].includes(status);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="default"
            size="default"
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-1">
            Acompanhar Manifestação
          </h1>
          <p className="text-xs text-muted-foreground">
            Digite o código da sua manifestação
          </p>
        </div>

        <Card className="max-w-lg mx-auto mb-4 animate-fade-in">
          <CardHeader className="bg-primary text-primary-foreground py-2">
            <CardTitle className="text-base text-center">
              Buscar Manifestação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: OUV2025000001"
                value={protocolCode}
                onChange={(e) => setProtocolCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="text-xs h-8"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                size="sm"
                className="h-8 px-3"
              >
                {isLoading ? (
                  "..."
                ) : (
                  <>
                    <Search className="mr-1 h-3 w-3" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {notFound && (
              <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-center text-xs">
                  Manifestação não encontrada. Verifique o código.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {ticketInfo && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Informações da Manifestação */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Informações da Manifestação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="font-medium text-xs">Protocolo:</span>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                            {ticketInfo.numero_protocolo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-medium text-xs">Status:</span>
                          <Badge variant={getStatusBadgeVariant(ticketInfo.status) as any} className="text-xs px-1.5 py-0.5">
                            {ticketInfo.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="font-medium text-xs">Campus:</span>
                          <span className="text-xs">{ticketInfo.campus}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-medium text-xs">Tipo:</span>
                          <span className="text-xs">{ticketInfo.tipo_solicitacao}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <User className="h-3 w-3 text-primary" />
                          <span className="font-medium text-xs">Manifestante:</span>
                          {ticketInfo.eh_anonimo ? (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700">
                              Anônima
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700">
                              Identificado
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span className="font-medium text-xs">Abertura:</span>
                          <span className="text-xs">{formatDate(ticketInfo.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span className="font-medium text-xs">Prazo:</span>
                          <span className="text-xs">{formatDateOnly(ticketInfo.data_vencimento)}</span>
                        </div>
                        {!ticketInfo.eh_anonimo && ticketInfo.nome_completo && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <User className="h-3 w-3 text-primary" />
                            <span className="font-medium text-xs">Solicitante:</span>
                            <span className="text-xs">{ticketInfo.nome_completo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Descrição</h4>
                      <p className="text-muted-foreground bg-muted p-2 rounded text-xs">
                        {ticketInfo.descricao}
                      </p>
                    </div>

                    {ticketInfo.resumo_tratativa && (
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Resumo da Tratativa</h4>
                        <p className="text-muted-foreground bg-green-50 p-2 rounded border border-green-200 text-xs">
                          {ticketInfo.resumo_tratativa}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status */}
              <div>
                <Card className="hover-scale">
                  <CardHeader className="py-3">
                    <CardTitle className="text-center text-base">Status Atual</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3 p-4">
                    <Badge 
                      variant={getStatusBadgeVariant(ticketInfo.status) as any}
                      className="text-sm px-3 py-1"
                    >
                      {ticketInfo.status}
                    </Badge>
                    
                    {ticketInfo.status === "Fechado" ? (
                      <div className="text-xs text-muted-foreground">
                        Encerrado em {formatDateOnly(ticketInfo.updated_at)}
                      </div>
                    ) : shouldShowDaysRemaining(ticketInfo.status) ? (
                      <div className="text-xs">
                        {getDaysRemaining(ticketInfo.data_vencimento) > 0 ? (
                          <span className="text-orange-600">
                            {getDaysRemaining(ticketInfo.data_vencimento)} dias restantes
                          </span>
                        ) : (
                          <span className="text-destructive">Prazo vencido</span>
                        )}
                      </div>
                    ) : null}

                    {canShowContestButton(ticketInfo) && (
                      <div className="pt-3 border-t">
                        {canReopen(ticketInfo) ? (
                          <>
                            <p className="text-xs text-muted-foreground mb-2">
                              Você pode contestar esta tratativa
                            </p>
                            <Button
                              onClick={handleReopen}
                              disabled={isReopening}
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              {isReopening ? (
                                "..."
                              ) : (
                                <>
                                  <RotateCcw className="mr-1 h-3 w-3" />
                                  Contestar
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground mb-2">
                              Contestação disponível após encerramento
                            </p>
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs opacity-50"
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Contestar
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Histórico */}
            {history.length > 0 && (
              <div className="animate-fade-in">
                <Card className="hover-scale">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Histórico</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className="p-1.5 bg-primary/10 rounded-full">
                              {item.action_type === "created" ? (
                                <FileText className="h-3 w-3 text-primary" />
                              ) : (
                                <Calendar className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            {index < history.length - 1 && (
                              <div className="w-px bg-border h-6 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <p className="font-medium text-foreground text-sm">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(item.created_at)}
                            </p>
                            {item.new_value && item.action_type === "status_change" && (
                              <Badge 
                                variant={getStatusBadgeVariant(item.new_value) as any}
                                className="mt-1 text-xs px-1.5 py-0.5"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}