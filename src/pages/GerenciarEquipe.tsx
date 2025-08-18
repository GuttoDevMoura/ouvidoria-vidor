import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Mail, User, Shield, Copy } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  nome_completo: string;
  role: string;
  created_at: string;
}

const GerenciarEquipe = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/gerenciar-equipe');
      return;
    }

    if (user && !isAdmin) {
      toast.error("Acesso negado. Apenas admins podem gerenciar a equipe.");
      navigate("/admin");
      return;
    }

    if (user && isAdmin) {
      loadTeamMembers();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error("Erro ao carregar membros da equipe");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setInviteLoading(true);
    try {
      // Gerar senha temporária
      const tempPassword = generateRandomPassword();
      
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nome_completo: inviteName
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(authError.message || "Erro ao criar usuário");
        }
        return;
      }

        // Atualizar profile com role
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: inviteRole as any })
            .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Erro ao definir role:', profileError);
        }
      }

      // Enviar email com credenciais (simulado por enquanto)
      toast.success(
        `Usuário criado com sucesso! Credenciais temporárias:\nEmail: ${inviteEmail}\nSenha: ${tempPassword}\n\nCompartilhe essas credenciais com o novo membro.`,
        { duration: 10000 }
      );

      // Copiar credenciais para clipboard
      navigator.clipboard.writeText(`Email: ${inviteEmail}\nSenha: ${tempPassword}\nLink: ${window.location.origin}/auth`);
      
      // Reset form
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
      setDialogOpen(false);
      
      // Reload members
      loadTeamMembers();
    } catch (error) {
      console.error('Erro ao convidar membro:', error);
      toast.error("Erro inesperado ao convidar membro");
    } finally {
      setInviteLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'moderator':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Usuário';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? "Verificando autenticação..." : "Carregando equipe..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipe</h1>
            <p className="text-gray-600">Adicione e gerencie membros da equipe da ouvidoria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Membros da Equipe ({members.length})
                  </CardTitle>
                  <CardDescription>
                    Gerencie acesso e permissões da equipe da ouvidoria
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Convidar Membro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Novo Membro</DialogTitle>
                      <DialogDescription>
                        Crie uma conta para um novo membro da equipe da ouvidoria
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-name">Nome Completo</Label>
                        <Input
                          id="invite-name"
                          type="text"
                          placeholder="João Silva"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          required
                          disabled={inviteLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="joao@exemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          disabled={inviteLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Nível de Acesso</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário - Acesso básico</SelectItem>
                            <SelectItem value="moderator">Moderador - Pode gerenciar tickets</SelectItem>
                            <SelectItem value="admin">Administrador - Acesso completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="submit" 
                          disabled={inviteLoading} 
                          className="flex-1"
                        >
                          {inviteLoading ? "Criando..." : "Criar Conta"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                          disabled={inviteLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.nome_completo || "Nome não informado"}
                        </p>
                        <p className="text-sm text-gray-600">ID: {member.user_id}</p>
                        <p className="text-xs text-gray-500">
                          Criado em: {new Date(member.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                      {member.role === 'admin' && (
                        <Shield className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}

                {members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum membro da equipe encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GerenciarEquipe;