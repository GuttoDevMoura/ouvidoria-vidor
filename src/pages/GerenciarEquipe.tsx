import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, User, Mail, Key, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  user_id: string;
  nome_completo: string;
  role: string;
  created_at: string;
}

export default function GerenciarEquipe() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    senha: ""
  });

  useEffect(() => {
    if (session) {
      loadTeamMembers();
    }
  }, [session]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros da equipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da equipe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome_completo || !formData.email || !formData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome_completo: formData.nome_completo
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Atualizar o perfil para admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            nome_completo: formData.nome_completo,
            role: 'admin'
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "Sucesso",
          description: "Membro da equipe criado com sucesso.",
        });

        setIsDialogOpen(false);
        setFormData({ nome_completo: "", email: "", senha: "" });
        loadTeamMembers();
      }
    } catch (error: any) {
      console.error('Erro ao criar membro:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o membro da equipe.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro da equipe?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro removido da equipe.",
      });

      loadTeamMembers();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header minimalista */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-semibold">Gerenciar Equipe</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Editar Membro" : "Adicionar Novo Membro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="nome_completo"
                    placeholder="Nome do agente"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Senha do usuário"
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingMember ? "Atualizar" : "Criar Membro"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingMember(null);
                    setFormData({ nome_completo: "", email: "", senha: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <User className="h-5 w-5 text-muted-foreground" />
              Membros da Equipe ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum membro da equipe encontrado</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-medium">Nome</TableHead>
                      <TableHead className="font-medium">Função</TableHead>
                      <TableHead className="font-medium">Data de Criação</TableHead>
                      <TableHead className="text-right font-medium">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{member.nome_completo || 'Nome não informado'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {member.role === 'admin' ? 'Administrador' : member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(member.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMember(member);
                                setFormData({
                                  nome_completo: member.nome_completo || "",
                                  email: "",
                                  senha: ""
                                });
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}