-- Criar usuário admin diretamente no auth.users com email já confirmado
-- Primeiro, limpar possíveis registros existentes
DELETE FROM auth.users WHERE email = 'admin@ouvidoria.com';
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@ouvidoria.com'
);

-- Inserir usuário admin com email já confirmado
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ouvidoria.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nome_completo":"Administrador Sistema"}',
  false,
  'authenticated',
  'authenticated'
);

-- Inserir perfil correspondente
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Administrador Sistema',
  'admin'::user_role
) ON CONFLICT (user_id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  role = EXCLUDED.role;