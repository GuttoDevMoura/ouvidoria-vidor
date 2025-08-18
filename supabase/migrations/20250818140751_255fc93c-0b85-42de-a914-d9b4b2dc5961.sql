-- Solução mais simples: remover trigger e garantir dados limpos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Garantir que o perfil admin existe sem problemas de constraint
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '47179b5c-cd61-4f23-a687-d7018dc801f6',
  'Gutto Moura',
  'admin'::user_role
)
ON CONFLICT (user_id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  role = EXCLUDED.role;