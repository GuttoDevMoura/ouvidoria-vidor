-- Criar apenas o usuário, o trigger handle_new_user() criará o perfil automaticamente
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change_token_new
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gutto.moura@igrejanovoscomecos.com.br',
    crypt('NC#2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nome_completo": "Gutto Moura"}',
    '',
    '',
    ''
);

-- Atualizar o role para admin após a criação automática do perfil
UPDATE public.profiles 
SET role = 'admin'::user_role, nome_completo = 'Gutto Moura'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'gutto.moura@igrejanovoscomecos.com.br');