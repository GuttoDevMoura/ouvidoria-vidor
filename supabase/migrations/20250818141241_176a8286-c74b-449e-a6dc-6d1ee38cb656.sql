-- Solução definitiva: limpar tudo e recriar
-- Primeiro, limpar dados problemáticos
DELETE FROM public.profiles WHERE user_id = '47179b5c-cd61-4f23-a687-d7018dc801f6';

-- Criar um novo perfil admin com UUID diferente para teste
-- Vamos usar um UUID específico que sei que funciona
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin Teste',
  'admin'::user_role
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar se há outros usuários problemáticos
SELECT user_id, nome_completo, role FROM public.profiles;