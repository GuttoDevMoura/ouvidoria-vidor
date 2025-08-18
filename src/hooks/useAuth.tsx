import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, nomeCompleto: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  console.log('AuthProvider: Estado atual:', { hasUser: !!user, isAdmin, loading });

  useEffect(() => {
    console.log('useAuth: Iniciando configuração de autenticação...');
    
    try {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('useAuth: Auth state changed:', { event, hasSession: !!session, hasUser: !!session?.user });
          
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check admin status when user changes
          if (session?.user) {
            console.log('useAuth: Usuário logado, verificando status admin...');
            checkAdminStatus(session.user.id);
          } else {
            console.log('useAuth: Usuário deslogado, removendo status admin');
            setIsAdmin(false);
            setLoading(false);
          }
        }
      );

      // THEN check for existing session
      console.log('useAuth: Verificando sessão existente...');
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('useAuth: Sessão existente encontrada:', { hasSession: !!session, hasUser: !!session?.user });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('useAuth: Verificando admin status para sessão existente...');
          checkAdminStatus(session.user.id);
        }
        
        // Só marca como não loading se não há sessão
        if (!session) {
          console.log('useAuth: Nenhuma sessão existente, marcando loading como false');
          setLoading(false);
        }
      }).catch((error) => {
        console.error('useAuth: Erro ao verificar sessão existente:', error);
        setLoading(false);
      });

      return () => {
        console.log('useAuth: Limpando subscription de auth');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('useAuth: Erro CRÍTICO na configuração de autenticação:', error);
      setLoading(false);
    }
  }, []);

  const checkAdminStatus = async (userId: string) => {
    console.log('checkAdminStatus: INICIANDO verificação para userId:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('checkAdminStatus: RESULTADO da consulta:', { data, error, userId });
      
      if (error) {
        console.error('checkAdminStatus: ERRO na consulta:', error);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      if (data) {
        const adminOrAgentStatus = data.role === 'admin' || data.role === 'agent';
        console.log('checkAdminStatus: PROFILE ENCONTRADO:', { 
          role: data.role, 
          isAdminOrAgent: adminOrAgentStatus,
          roleType: typeof data.role,
          comparison: `${data.role} === 'admin' || 'agent' = ${adminOrAgentStatus}`
        });
        setIsAdmin(adminOrAgentStatus);
        setLoading(false);
      } else {
        console.log('checkAdminStatus: NENHUM PROFILE encontrado, CRIANDO profile padrão...');
        
        // Tentar criar um profile padrão se não existir
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'admin', // Por padrão, vamos criar como admin para testes
            nome_completo: 'Usuário Admin'
          });
          
        if (insertError) {
          console.error('checkAdminStatus: ERRO ao criar profile:', insertError);
          setIsAdmin(false);
        } else {
          console.log('checkAdminStatus: PROFILE ADMIN criado com SUCESSO');
          setIsAdmin(true);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('checkAdminStatus: ERRO INESPERADO:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nomeCompleto: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome_completo: nomeCompleto
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log("useAuth.signIn chamado para:", email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("supabase.auth.signInWithPassword resultado:", { error });
      return { error };
    } catch (err) {
      console.error("Erro capturado em signIn:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};