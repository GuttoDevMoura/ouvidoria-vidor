import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, FileText, TrendingUp, Award, MapPin, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";

interface DashboardData {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingTickets: number;
  closedTickets: number;
  ticketsByType: { name: string; value: number }[];
  ticketsByCampus: { name: string; value: number }[];
  agentStats: { name: string; closed: number }[];
  monthlyStats: { month: string; tickets: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const { user, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    waitingTickets: 0,
    closedTickets: 0,
    ticketsByType: [],
    ticketsByCampus: [],
    agentStats: [],
    monthlyStats: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      // Verificar se é admin antes de carregar dados
      if (!isAdmin) {
        navigate('/admin');
        return;
      }
      loadDashboardData();
    }
  }, [session, isAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      // Buscar todos os tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*');

      if (!tickets) return;

      // Estatísticas gerais
      const totalTickets = tickets.length;
      const openTickets = tickets.filter(t => t.status === 'Aberto').length;
      const inProgressTickets = tickets.filter(t => t.status === 'Em andamento').length;
      const waitingTickets = tickets.filter(t => t.status === 'Aguardando').length;
      const closedTickets = tickets.filter(t => t.status === 'Fechado').length;

      // Tickets por tipo
      const typeStats = tickets.reduce((acc, ticket) => {
        acc[ticket.tipo_solicitacao] = (acc[ticket.tipo_solicitacao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ticketsByType = Object.entries(typeStats).map(([name, value]) => ({
        name,
        value
      }));

      // Tickets por campus
      const campusStats = tickets.reduce((acc, ticket) => {
        acc[ticket.campus] = (acc[ticket.campus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ticketsByCampus = Object.entries(campusStats).map(([name, value]) => ({
        name,
        value
      }));

      // Buscar estatísticas dos agentes
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome_completo')
        .eq('role', 'admin');

      const agentStats = [];
      if (profiles) {
        for (const profile of profiles) {
          const closedByAgent = tickets.filter(
            t => t.agente_responsavel === profile.id && t.status === 'Fechado'
          ).length;
          
          if (closedByAgent > 0) {
            agentStats.push({
              name: profile.nome_completo || 'Agente',
              closed: closedByAgent
            });
          }
        }
      }

      // Estatísticas mensais (últimos 6 meses)
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const monthTickets = tickets.filter(ticket => {
          const ticketDate = new Date(ticket.created_at);
          return ticketDate.getMonth() === date.getMonth() && 
                 ticketDate.getFullYear() === date.getFullYear();
        }).length;

        monthlyStats.push({
          month: monthName,
          tickets: monthTickets
        });
      }

      setData({
        totalTickets,
        openTickets,
        inProgressTickets,
        waitingTickets,
        closedTickets,
        ticketsByType,
        ticketsByCampus,
        agentStats,
        monthlyStats
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header minimalista */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Painel de Fila
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <Card className="border-0 shadow-none bg-muted/50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{data.totalTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Abertos</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{data.openTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Em Andamento</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{data.inProgressTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-yellow-egg dark:bg-yellow-500/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Aguardando</p>
                <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{data.waitingTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Concluídos</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{data.closedTickets}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets por Tipo */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Tickets por Tipo de Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.ticketsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.ticketsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tickets por Campus */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Tickets por Campus
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ticketsByCampus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance dos Agentes */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Users className="h-5 w-5 text-muted-foreground" />
                Tickets Fechados por Agente
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.agentStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="closed" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução Mensal */}
          <Card className="border-0 shadow-none">
            <CardHeader className="px-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}