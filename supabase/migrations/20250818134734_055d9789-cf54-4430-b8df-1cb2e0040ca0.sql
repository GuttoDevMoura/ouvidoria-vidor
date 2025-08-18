-- Verificar se o usuário já existe e atualizar role para admin
UPDATE public.profiles 
SET role = 'admin'::user_role, nome_completo = 'Gutto Moura'
WHERE user_id = '8ec8bfbb-e44a-4993-a09a-8343812b26e0';

-- Se não existe, vamos tentar criar um novo usuário admin com método diferente
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Verificar se o usuário já existe
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'gutto.moura@igrejanovoscomecos.com.br';
    
    -- Se não existe, criar
    IF new_user_id IS NULL THEN
        -- Gerar novo UUID
        new_user_id := gen_random_uuid();
        
        -- Inserir na auth.users
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
            raw_user_meta_data
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'gutto.moura@igrejanovoscomecos.com.br',
            crypt('NC#2025!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"nome_completo": "Gutto Moura"}'
        );
        
        -- Inserir na profiles
        INSERT INTO public.profiles (
            user_id,
            nome_completo,
            role
        ) VALUES (
            new_user_id,
            'Gutto Moura',
            'admin'::user_role
        );
    END IF;
END $$;