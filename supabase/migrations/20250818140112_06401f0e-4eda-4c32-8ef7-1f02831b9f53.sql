-- Limpeza adicional para garantir que o sistema auth funcione
-- Verificar se há perfis sem usuário correspondente e remover
DELETE FROM public.profiles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- Garantir que todos os usuários existentes tenham perfis
INSERT INTO public.profiles (user_id, nome_completo, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'nome_completo', au.email),
  'user'::user_role
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;