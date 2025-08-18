-- Corrigir o problema do schema auth.users e criar usuário admin
-- Primeiro, vamos garantir que a tabela auth.users tenha todas as colunas necessárias

-- Inserir usuário admin diretamente na tabela auth.users
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
  email_change_token_current,
  email_change_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ouvidoria.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Inserir perfil para o admin
INSERT INTO public.profiles (user_id, nome_completo, role)
SELECT id, 'Administrador', 'admin'::user_role
FROM auth.users 
WHERE email = 'admin@ouvidoria.com'
ON CONFLICT (user_id) DO NOTHING;

-- Limpar dados problemáticos da tabela auth.users
UPDATE auth.users 
SET 
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change_sent_at = NULL
WHERE email_change IS NULL OR email_change_token_new IS NULL OR email_change_token_current IS NULL;