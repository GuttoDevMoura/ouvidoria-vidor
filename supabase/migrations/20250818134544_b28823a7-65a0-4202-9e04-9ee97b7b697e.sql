-- Criar usuário admin no sistema de autenticação
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'gutto.moura@igrejanovoscomecos.com.br',
  crypt('NC#2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Gutto Moura"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar perfil do admin na tabela profiles
INSERT INTO public.profiles (
  user_id,
  nome_completo,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'gutto.moura@igrejanovoscomecos.com.br'),
  'Gutto Moura',
  'admin'::user_role
);