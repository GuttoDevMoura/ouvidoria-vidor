-- Atualizar a senha do usuário existente
UPDATE auth.users 
SET 
  encrypted_password = crypt('NC#2025!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'gutto.moura@igrejanovoscomecos.com.br';

-- Atualizar o perfil para admin
UPDATE public.profiles 
SET 
  role = 'admin'::user_role,
  nome_completo = 'Gutto Moura',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'gutto.moura@igrejanovoscomecos.com.br'
);