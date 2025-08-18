-- Limpar dados problemáticos completamente
DELETE FROM public.profiles WHERE user_id NOT IN (
  SELECT id FROM auth.users
);