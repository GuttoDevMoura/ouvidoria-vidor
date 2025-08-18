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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profile) throw new Error('Perfil não encontrado');
      
      const { error } = await supabase
        .from('ticket_notes')
        .insert([{
          ticket_id: ticket.id,
          agente_id: profile.id,
          nota: newNote
        }]);

      if (error) throw error;

      setNewNote("");
      loadNotes();
      toast({
        title: "Nota adicionada",
        description: "A nota foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async () => {
    try {
      setLoading(true);
      const oldStatus = ticket.status;
      
      const { error } = await supabase
        .from('tickets')
        .update({
          status: status as any,
          resumo_tratativa: resumoTratativa || null
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // Enviar email se o status mudou e há email
      if (oldStatus !== status && ticket.email) {
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              to: ticket.email,
              subject: `Atualização da Manifestação ${ticket.numero_protocolo}`,
              protocolNumber: ticket.numero_protocolo,
              status,
              nome: ticket.nome_completo,
              isAnonymous: ticket.eh_anonimo
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="ml-4 text-xl font-bold">
              Ticket #{ticket.numero_protocolo}
            </h1>
            <Badge className="ml-4" variant={getStatusBadgeVariant(ticket.status)}>
              {ticket.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Ticket */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Solicitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Protocolo</p>
                    <p className="font-medium">{ticket.numero_protocolo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                    <p className="font-medium">{ticket.tipo_solicitacao}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campus</p>
                    <p className="font-medium">{ticket.campus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Abertura</p>
                    <p className="font-medium">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>

                {!ticket.eh_anonimo && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome</p>
                      <p className="font-medium">{ticket.nome_completo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                      <p className="font-medium">{ticket.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{ticket.contato_whatsapp}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{ticket.descricao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas Internas */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Internas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">
                          {note.profiles?.nome_completo || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.nota}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicionar nota interna..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={addNote} disabled={loading || !newNote.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Nota
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar direita */}
          <div className="space-y-6">
            {/* Histórico */}
            <TicketHistory ticketId={ticket.id} />

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Atualizar Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
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
                  <label className="text-sm font-medium">Resumo da Tratativa</label>
                  <Textarea
                    placeholder="Descreva o que foi feito para resolver esta solicitação..."
                    value={resumoTratativa}
                    onChange={(e) => setResumoTratativa(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={updateTicket} disabled={loading} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};