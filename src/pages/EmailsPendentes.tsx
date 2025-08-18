import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Mail, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmailPendente {
  id: string;
  destinatario: string;
  assunto: string;
  protocolo: string;
  status: string;
  nome: string;
  conteudo_html: string;
  enviado: boolean;
  data_solicitacao: string;
  data_envio: string | null;
  tentativas: number;
}

const EmailsPendentes = () => {
  const [emails, setEmails] = useState<EmailPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailPendente | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/emails-pendentes');
      return;
    }

    if (user && !isAdmin) {
      toast.error("Acesso negado. Você não tem permissão para acessar esta área.");
      navigate("/");
      return;
    }

    if (user && isAdmin) {
      loadEmails();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails_pendentes')
        .select('*')
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      toast.error("Erro ao carregar emails pendentes");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoEnviado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emails_pendentes')
        .update({ 
          enviado: true, 
          data_envio: new Date().toISOString(),
          tentativas: emails.find(e => e.id === id)?.tentativas || 0 + 1
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Email marcado como enviado!");
      loadEmails();
    } catch (error) {
      console.error('Erro ao atualizar email:', error);
      toast.error("Erro ao atualizar status do email");
    }
  };

  const copiarConteudo = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Conteúdo copiado!");
  };

  const abrirEmailCliente = (email: EmailPendente) => {
    const subject = encodeURIComponent(email.assunto);
    const body = encodeURIComponent(
      `Para: ${email.destinatario}\n\nProtocolo: ${email.protocolo}\n\n` +
      `Prezado(a) ${email.nome},\n\n` +
      `Confirmamos o recebimento de sua manifestação.\n` +
      `Protocolo: ${email.protocolo}\n` +
      `Status: ${email.status}\n\n` +
      `Você receberá uma resposta em até 15 dias úteis.\n\n` +
      `Atenciosamente,\nEquipe da Ouvidoria\nIgreja Novos Começos`
    );
    
    window.open(`mailto:${email.destinatario}?subject=${subject}&body=${body}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando emails pendentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emails Pendentes</h1>
            <p className="text-gray-600">Gerencie emails que precisam ser enviados manualmente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de emails */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Emails Pendentes ({emails.filter(e => !e.enviado).length})
                </CardTitle>
                <CardDescription>
                  Total de {emails.length} emails • {emails.filter(e => e.enviado).length} enviados
                </CardDescription>
              </CardHeader>
            </Card>

            {emails.map((email) => (
              <Card 
                key={email.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedEmail?.id === email.id ? 'ring-2 ring-blue-500' : ''
                } ${email.enviado ? 'opacity-75' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={email.enviado ? "default" : "secondary"}>
                      {email.enviado ? "Enviado" : "Pendente"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(email.data_solicitacao).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">{email.protocolo}</p>
                    <p className="text-sm text-gray-600">{email.nome}</p>
                    <p className="text-sm text-blue-600">{email.destinatario}</p>
                  </div>
                  
                  {email.enviado && email.data_envio && (
                    <p className="text-xs text-green-600 mt-2">
                      Enviado em: {new Date(email.data_envio).toLocaleString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {emails.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum email pendente encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detalhes do email selecionado */}
          <div className="space-y-4">
            {selectedEmail ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Detalhes do Email
                      {!selectedEmail.enviado && (
                        <Button 
                          onClick={() => marcarComoEnviado(selectedEmail.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar como Enviado
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Para:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm bg-gray-100 p-2 rounded flex-1">{selectedEmail.destinatario}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarConteudo(selectedEmail.destinatario)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Assunto:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm bg-gray-100 p-2 rounded flex-1">{selectedEmail.assunto}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarConteudo(selectedEmail.assunto)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Protocolo:</label>
                      <p className="text-sm bg-gray-100 p-2 rounded mt-1">{selectedEmail.protocolo}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome:</label>
                      <p className="text-sm bg-gray-100 p-2 rounded mt-1">{selectedEmail.nome}</p>
                    </div>

                    <Button 
                      onClick={() => abrirEmailCliente(selectedEmail)}
                      className="w-full flex items-center gap-2"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir no Cliente de Email
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo HTML do Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarConteudo(selectedEmail.conteudo_html)}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar HTML Completo
                      </Button>
                      <Textarea
                        value={selectedEmail.conteudo_html}
                        readOnly
                        className="h-64 text-xs font-mono"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecione um email para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailsPendentes;