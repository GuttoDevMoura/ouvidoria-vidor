import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, Settings, UserPlus, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketHistoryItem {
  id: string;
  action_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description: string;
  created_at: string;
  agente_id?: string;
  profiles?: {
    nome_completo: string;
  };
}

interface TicketHistoryProps {
  ticketId: string;
}

export const TicketHistory = ({ ticketId }: TicketHistoryProps) => {
  const [history, setHistory] = useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          profiles:agente_id (
            nome_completo
          )
        `)
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "created":
        return <Plus className="h-4 w-4" />;
      case "status_change":
        return <Settings className="h-4 w-4" />;
      case "note_added":
        return <FileText className="h-4 w-4" />;
      case "assignment":
        return <UserPlus className="h-4 w-4" />;
      case "updated":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "created":
        return "default";
      case "status_change":
        return "secondary";
      case "note_added":
        return "outline";
      case "assignment":
        return "destructive";
      case "updated":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "created":
        return "Criado";
      case "status_change":
        return "Status";
      case "note_added":
        return "Nota";
      case "assignment":
        return "Atribuição";
      case "updated":
        return "Atualizado";
      default:
        return "Ação";
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      relative: formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      }),
      absolute: date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Atualizações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Atualizações
          <Badge variant="outline" className="ml-auto">
            {history.length} {history.length === 1 ? "evento" : "eventos"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma atualização registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const dateTime = formatDateTime(item.created_at);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      {getActionIcon(item.action_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getActionBadgeVariant(item.action_type)}>
                        {getActionLabel(item.action_type)}
                      </Badge>
                      {item.profiles?.nome_completo && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.profiles.nome_completo}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm mt-1 font-medium">
                      {item.description}
                    </p>
                    
                    {item.old_value && item.new_value && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="line-through">{item.old_value}</span>
                        {" → "}
                        <span className="font-medium">{item.new_value}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span title={dateTime.absolute}>
                        {dateTime.relative}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};