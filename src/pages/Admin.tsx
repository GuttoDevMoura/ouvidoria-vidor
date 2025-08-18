import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Users, FileText, TrendingUp, Mail, User, BarChart3, Circle } from "lucide-react";
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
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    abertos: 0,
    em_andamento: 0,
    fechados: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('Admin.tsx - useEffect executado:', { user: user?.email, isAdmin, authLoading });
    
    if (!authLoading && !user) {
      console.log('Admin.tsx - Usuário não logado, redirecionando para auth');
      navigate('/auth?redirect=/admin');
      return;
    }

    if (user && !isAdmin) {
      console.log('Admin.tsx - Usuário logado mas não é admin/agent, redirecionando para home');
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    if (user && isAdmin) {
      console.log('Admin.tsx - Usuário logado e tem permissão, carregando dados');
      loadUserRole();
      loadTickets();
      loadStats();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Erro ao carregar role do usuário:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

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
        fechados: statusCount['Fechado'] || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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

  const getSLAStatus = (createdAt: string, status: string) => {
    if (status === 'Fechado') return null;
    
    const created = new Date(createdAt);
    const now = new Date();
    const businessDaysElapsed = calculateBusinessDays(created, now);
    
    if (businessDaysElapsed >= 15) {
      return 'overdue'; // Vencido
    } else if (businessDaysElapsed >= 10) {
      return 'warning'; // Faltando 5 dias
    } else {
      return 'ok'; // No prazo
    }
  };

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
              {userRole === 'admin' && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
              
              {/* Gerenciar Equipe - apenas para admins */}
              {userRole === 'admin' && (
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Abertos</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.abertos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.em_andamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Fechados</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.fechados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets da Ouvidoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      {getSLAIcon(getSLAStatus(ticket.created_at, ticket.status), ticket.status)}
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span className="font-medium">{ticket.numero_protocolo}</span>
                      <span className="text-sm text-muted-foreground">
                        {ticket.eh_anonimo ? "Anônimo" : ticket.nome_completo}
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

              {tickets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum ticket encontrado.</p>
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