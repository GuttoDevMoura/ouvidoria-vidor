import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Log do estado sem redirecionar automaticamente
  useEffect(() => {
    console.log('Auth.tsx: useEffect executado:', { 
      hasUser: !!user, 
      authLoading, 
      redirect,
      userEmail: user?.email 
    });
  }, [user, authLoading, redirect]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      console.log("Tentando fazer login com:", email);
      
      const { error } = await signIn(email, password);
      
      console.log("Resultado do login:", { error });
      
      if (error) {
        console.error("Erro detalhado:", error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Por favor, confirme seu email antes de fazer login");
        } else if (error.message.includes('Database error')) {
          toast.error("Erro no banco de dados. Tente novamente em alguns instantes.");
          console.error("Database error details:", error);
        } else {
          toast.error(error.message || "Erro ao fazer login");
        }
      } else {
        console.log("Login realizado com sucesso!");
        toast.success("Login realizado com sucesso!");
        navigate(redirect);
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, digite seu email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast.error("Erro inesperado ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  if (authLoading) {
    console.log('Auth.tsx: Ainda carregando autenticação...', { authLoading, hasUser: !!user });
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Ouvidoria Igreja Novos Começos</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-gray-600">
              {user ? `Logado como: ${user.email}` : "Área restrita para membros da equipe da ouvidoria"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">Usuário autenticado com sucesso!</p>
                  <p className="text-green-700 text-sm">Email: {user.email}</p>
                </div>
                <Button 
                  onClick={() => navigate(redirect)}
                  className="w-full"
                >
                  Acessar Área Administrativa
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Fazer Logout
                </Button>
              </div>
            ) : (
              <>
                {!showForgotPassword ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Senha
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email para recuperação
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "Enviar Email de Recuperação"}
                    </Button>
                  </form>
                )}

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    disabled={loading}
                    className="text-sm"
                  >
                    {showForgotPassword ? "Voltar ao login" : "Esqueceu a senha?"}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Esta área é restrita à equipe da Ouvidoria da Igreja Novos Começos.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;