-- Verificar se o usuário pode fazer login sem problemas
-- Primeiro, vamos limpar dados problemáticos na tabela profiles
DELETE FROM public.profiles WHERE user_id = '47179b5c-cd61-4f23-a687-d7018dc801f6';

-- Inserir novamente o perfil de forma limpa
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '47179b5c-cd61-4f23-a687-d7018dc801f6',
  'gutto.moura@igrejanovoscomecos.com.br',
  'admin'::user_role
)
ON CONFLICT (user_id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  role = EXCLUDED.role;