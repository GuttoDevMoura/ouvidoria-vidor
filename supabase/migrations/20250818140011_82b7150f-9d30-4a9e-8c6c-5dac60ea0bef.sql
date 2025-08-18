-- Corrigir problema com coluna email_change no esquema auth
-- Verificar se a coluna existe e ajustar se necessário
DO $$
BEGIN
    -- Verificar se a coluna email_change existe na tabela auth.users
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'email_change'
    ) THEN
        -- Se existe, garantir que aceita NULL ou tem valor padrão
        ALTER TABLE auth.users ALTER COLUMN email_change SET DEFAULT '';
        UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
    END IF;
END $$;