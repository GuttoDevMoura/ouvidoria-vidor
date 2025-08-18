import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Building2, UserPlus } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate(redirect);
    }
  }, [user, authLoading, navigate, redirect]);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nomeCompleto) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      console.log("Tentando criar conta para:", email);
      
      const { error } = await signUp(email, password, nomeCompleto);
      
      if (error) {
        console.error("Erro no cadastro:", error);
        if (error.message.includes('already registered')) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(error.message || "Erro ao criar conta");
        }
      } else {
        toast.success("Conta criada com sucesso! Verificando autenticação...");
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast.error("Erro inesperado ao criar conta");
    } finally {
      setLoading(false);
    }
  };


  if (authLoading) {
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
              Área restrita para membros da equipe da ouvidoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSignUp ? (
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
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Senha
                  </Label>
                  <Input
                    id="signup-password"
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
                  {loading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
                className="text-sm"
              >
                {isSignUp ? "Já tem conta? Faça login" : "Precisa criar uma conta?"}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">
                Esta área é restrita à equipe da Ouvidoria da Igreja Novos Começos.
              </p>
              
              {/* Credenciais de teste */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">
                  🚀 Credenciais de Teste:
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Use as credenciais abaixo para acessar o sistema:
                </p>
                <div className="bg-white p-3 rounded border text-xs mb-3">
                  <p><strong>Email:</strong> admin@ouvidoria.com</p>
                  <p><strong>Senha:</strong> admin123</p>
                </div>
                <Button
                  onClick={async () => {
                    const testEmail = "admin@ouvidoria.com";
                    const testPassword = "admin123";
                    const testNome = "Administrador Sistema";
                    
                    setLoading(true);
                    
                    try {
                      console.log('Criando usuário admin automaticamente...');
                      
                      // Primeiro tentar criar a conta
                      const { error: signUpError } = await signUp(testEmail, testPassword, testNome);
                      
                      if (signUpError && !signUpError.message.includes('already registered')) {
                        console.error('Erro ao criar usuário:', signUpError);
                        toast.error(`Erro ao criar conta: ${signUpError.message}`);
                        return;
                      }
                      
                      // Aguardar um pouco para o usuário ser criado
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      // Tentar fazer login
                      console.log('Tentando fazer login...');
                      const { error: signInError } = await signIn(testEmail, testPassword);
                      
                      if (signInError) {
                        console.error('Erro no login:', signInError);
                        // Se falhar, apenas preencher credenciais
                        setEmail(testEmail);
                        setPassword(testPassword);
                        toast.info("Conta criada. Use o botão 'Entrar' abaixo.");
                      } else {
                        toast.success("Login realizado com sucesso!");
                        navigate(redirect);
                      }
                      
                    } catch (error) {
                      console.error('Erro inesperado:', error);
                      setEmail(testEmail);
                      setPassword(testPassword);
                      toast.info("Credenciais preenchidas. Use o botão 'Entrar'.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-blue-100 hover:bg-blue-200 border-blue-300"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar & Acessar Admin"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;