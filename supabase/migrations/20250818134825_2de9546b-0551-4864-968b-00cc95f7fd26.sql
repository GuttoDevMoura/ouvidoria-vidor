-- Limpar possíveis registros órfãos
DELETE FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Criar usuário admin usando método simplificado  
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
BEGIN
    -- Inserir usuário no auth
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
        admin_user_id,
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

    -- Inserir perfil
    INSERT INTO public.profiles (
        user_id,
        nome_completo,
        role
    ) VALUES (
        admin_user_id,
        'Gutto Moura',
        'admin'::user_role
    );
    
    RAISE NOTICE 'Usuário admin criado com sucesso: %', admin_user_id;
END $$;