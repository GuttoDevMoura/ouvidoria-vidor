-- Solução radical: remover trigger temporariamente para permitir login
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verificar se existe algum problema com constraints ou índices
-- Recriar índice único se necessário
DROP INDEX IF EXISTS profiles_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON public.profiles(user_id);

-- Garantir que o perfil admin existe
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '47179b5c-cd61-4f23-a687-d7018dc801f6',
  'Gutto Moura',
  'admin'::user_role
)
ON CONFLICT (user_id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  role = EXCLUDED.role;