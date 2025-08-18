import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { TicketHistory } from "./TicketHistory";

interface Ticket {
  id: string;
  numero_protocolo: string;
  eh_anonimo: boolean;
  nome_completo: string | null;
  email: string | null;
  contato_whatsapp: string | null;
  campus: string;
  tipo_solicitacao: string;
  descricao: string;
  status: string;
  resumo_tratativa: string | null;
  created_at: string;
  data_vencimento: string;
}

interface TicketNote {
  id: string;
  nota: string;
  created_at: string;
  profiles: {
    nome_completo: string | null;
  };
}

interface TicketDetailsProps {
  ticket: Ticket;
  onBack: () => void;
  onTicketUpdate: () => void;
}

export const TicketDetails = ({ ticket, onBack, onTicketUpdate }: TicketDetailsProps) => {
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState<string>(ticket.status);
  const [resumoTratativa, setResumoTratativa] = useState(ticket.resumo_tratativa || "");
  const [loading, setLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, [ticket.id]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_notes')
        .select(`
          id,
          nota,
          created_at,
          profiles:agente_id (
            nome_completo
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('ticket_notes')
        .insert([{
          ticket_id: ticket.id,
          agente_id: user.id,
          nota: newNote
        }]);

      if (error) throw error;

      setNewNote("");
      loadNotes();
      toast({
        title: "Nota interna adicionada",
        description: "A nota foi adicionada com sucesso e é visível apenas para administradores e agentes.",
      });
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota interna.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async () => {
    try {
      setLoading(true);
      const oldStatus = currentTicket.status;
      
      const { error } = await supabase
        .from('tickets')
        .update({
          status: status as any,
          resumo_tratativa: resumoTratativa || null
        })
        .eq('id', currentTicket.id);

      if (error) throw error;

      // Atualizar o ticket local com o novo status
      const updatedTicket = { ...currentTicket, status, resumo_tratativa: resumoTratativa || null };
      setCurrentTicket(updatedTicket);

      // Enviar email se o status mudou e há email
      if (oldStatus !== status && currentTicket.email) {
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: currentTicket.email,
              subject: `Atualização da Manifestação ${currentTicket.numero_protocolo}`,
              protocolNumber: currentTicket.numero_protocolo,
              status,
              nome: currentTicket.nome_completo,
              isAnonymous: currentTicket.eh_anonimo
            }
          });
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
          // Não bloquear a atualização se o email falhar
        }
      }

      toast({
        title: "Ticket atualizado",
        description: "O ticket foi atualizado com sucesso.",
      });
      onTicketUpdate();
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ticket.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Aberto': return 'destructive';
      case 'Em andamento': return 'default';
      case 'Aguardando': return 'secondary';
      case 'Fechado': return 'outline';
      case 'Reaberto': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    if (status === 'Em andamento') {
      return 'bg-orange hover:bg-orange text-orange-foreground border-orange';
    }
    if (status === 'Fechado') {
      return 'bg-success hover:bg-success text-success-foreground border-success';
    }
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimalista */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">#{ticket.numero_protocolo}</h1>
                <p className="text-sm text-muted-foreground">{ticket.tipo_solicitacao}</p>
              </div>
            </div>
            <Badge 
              variant={getStatusBadgeVariant(currentTicket.status)}
              className={getStatusBadgeClassName(currentTicket.status)}
            >
              {currentTicket.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Card principal - mais compacto */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Detalhes da Solicitação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Campus:</span>
                <p className="font-medium">{ticket.campus}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Abertura:</span>
                <p className="font-medium">{formatDate(ticket.created_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
                <p className="font-medium">{formatDate(ticket.data_vencimento)}</p>
              </div>
            </div>

            {!ticket.eh_anonimo && ticket.nome_completo && (
              <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Solicitante:</span>
                  <p className="font-medium">{ticket.nome_completo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">E-mail:</span>
                  <p className="font-medium">{ticket.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <p className="font-medium">{ticket.contato_whatsapp}</p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground">Descrição:</span>
              <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
                <p className="whitespace-pre-wrap">{ticket.descricao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid responsivo para ações e notas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ações - Status e Tratativa */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Gerenciar Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                    <SelectItem value="Fechado">Fechado</SelectItem>
                    <SelectItem value="Reaberto">Reaberto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Resumo da Tratativa
                  <span className="text-xs text-muted-foreground ml-1">(visível ao usuário)</span>
                </label>
                <Textarea
                  placeholder="Descreva as ações tomadas para resolver esta solicitação..."
                  value={resumoTratativa}
                  onChange={(e) => setResumoTratativa(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Button onClick={updateTicket} disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Notas Internas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                Notas Internas 
                <span className="text-xs text-muted-foreground ml-2">(apenas admin/agentes)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted/50 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-xs">
                          {note.profiles?.nome_completo || "Usuário"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{note.nota}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  placeholder="Adicionar nota interna (não visível ao usuário)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <Button 
                  onClick={addNote} 
                  disabled={loading || !newNote.trim()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Nota Interna
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico em uma seção separada mais compacta */}
        <TicketHistory ticketId={ticket.id} />
      </div>
    </div>
  );
};