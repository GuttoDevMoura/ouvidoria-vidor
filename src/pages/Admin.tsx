import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Users, FileText, TrendingUp, Mail, User, BarChart3, Circle, Clock } from "lucide-react";
import { TicketDetails } from "@/components/admin/TicketDetails";

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

const Admin = () => {
  const { user, isAdmin, isAgent, userRole, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    abertos: 0,
    em_andamento: 0,
    aguardando: 0,
    fechados: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('Admin.tsx - useEffect executado:', { user: user?.email, isAdmin, isAgent, userRole, authLoading });
    
    if (!authLoading && !user) {
      console.log('Admin.tsx - Usuário não logado, redirecionando para auth');
      navigate('/auth?redirect=/admin');
      return;
    }
    
    if (!authLoading && user && !isAdmin && !isAgent) {
      console.log('Admin.tsx - Usuário sem permissão, redirecionando para home');
      navigate('/');
      return;
    }
    
    if (!authLoading && (isAdmin || isAgent)) {
      console.log('Admin.tsx - Usuário logado e tem permissão, carregando dados');
      loadTickets();
      loadStats();
    }
  }, [user, isAdmin, isAgent, authLoading, navigate]);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: true }); // Oldest first

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tickets.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('status');

      if (error) throw error;

      const statusCount = data?.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        total: data?.length || 0,
        abertos: statusCount['Aberto'] || 0,
        em_andamento: statusCount['Em andamento'] || 0,
        aguardando: statusCount['Aguardando'] || 0,
        fechados: statusCount['Fechado'] || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Aberto': return 'destructive';
      case 'Em andamento': return 'default'; // Will be styled as orange with custom CSS
      case 'Aguardando': return 'secondary';
      case 'Fechado': 
      case 'Concluído': return 'outline'; // Will be styled as green with custom CSS
      case 'Reaberto': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateBusinessDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const getSLAStatus = (createdAt: string, status: string, isAnonymous: boolean = false) => {
    if (status === 'Fechado') return null;
    
    const created = new Date(createdAt);
    const now = new Date();
    const businessDaysElapsed = calculateBusinessDays(created, now);
    const slaLimit = isAnonymous ? 30 : 15; // 30 dias para anônimas, 15 para identificadas
    const warningThreshold = Math.floor(slaLimit * 0.7); // 70% do prazo como aviso
    
    if (businessDaysElapsed >= slaLimit) {
      return 'overdue'; // Vencido
    } else if (businessDaysElapsed >= warningThreshold) {
      return 'warning'; // Próximo do vencimento
    } else {
      return 'ok'; // No prazo
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  });

  const getSLAIcon = (slaStatus: string | null, ticketStatus: string) => {
    if (!slaStatus) return null;
    
    const baseClasses = "h-3 w-3 mr-2 fill-current";
    
    // Se o status for "Em andamento", sempre laranja
    if (ticketStatus === 'Em andamento') {
      return <Circle className={`${baseClasses} text-orange-500 animate-pulse`} />;
    }
    
    switch (slaStatus) {
      case 'overdue':
        return <Circle className={`${baseClasses} text-destructive animate-pulse`} />;
      case 'warning':
        return <Circle className={`${baseClasses} text-orange-500 animate-pulse`} />;
      case 'ok':
        return <Circle className={`${baseClasses} text-green-500 animate-pulse`} />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? "Verificando autenticação..." : "Carregando dados..."}
          </p>
        </div>
      </div>
    );
  }


  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onTicketUpdate={loadTickets}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/emails-pendentes"}
              >
                <Mail className="mr-2 h-4 w-4" />
                Emails Pendentes
              </Button>
              
              {/* Dashboard - apenas para admins */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
              
              {/* Gerenciar Equipe - apenas para admins */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/gerenciar-equipe')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Gerenciar Equipe
                </Button>
              )}
              
              <h1 className="text-sm font-medium">Admin - Ouvidoria</h1>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <Card className="border-0 shadow-none bg-muted/50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Abertos</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.abertos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Em Andamento</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{stats.em_andamento}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-yellow-egg dark:bg-yellow-500/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Aguardando</p>
                <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{stats.aguardando}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Fechados</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.fechados}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tickets da Ouvidoria</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em andamento">Em Andamento</SelectItem>
                  <SelectItem value="Fechado">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      {getSLAIcon(getSLAStatus(ticket.created_at, ticket.status, ticket.eh_anonimo), ticket.status)}
                       <Badge 
                         variant={getStatusBadgeVariant(ticket.status)}
                         className={
                           ticket.status === 'Em andamento' 
                             ? 'bg-orange hover:bg-orange text-orange-foreground border-orange' 
                             : ticket.status === 'Aguardando'
                             ? 'bg-yellow-egg hover:bg-yellow-egg text-yellow-egg-foreground border-yellow-egg'
                             : (ticket.status === 'Fechado' || ticket.status === 'Concluído')
                             ? 'bg-success hover:bg-success text-success-foreground border-success'
                             : ''
                         }
                       >
                         {ticket.status}
                       </Badge>
                      <span className="font-medium">{ticket.numero_protocolo}</span>
                      <span className="text-sm text-muted-foreground">
                        {ticket.eh_anonimo ? (
                          <span className="flex items-center gap-1">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Anônima
                            </Badge>
                            <span className="text-xs">(30 dias úteis)</span>
                          </span>
                        ) : (
                          <span>{ticket.nome_completo} <span className="text-xs">(15 dias úteis)</span></span>
                        )}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {ticket.campus} • {ticket.tipo_solicitacao}
                      </p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {ticket.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Aberto: {formatDate(ticket.created_at)}</p>
                    <p>Vence: {formatDate(ticket.data_vencimento)}</p>
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {statusFilter === "all" ? "Nenhum ticket encontrado." : `Nenhum ticket com status "${statusFilter}" encontrado.`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;