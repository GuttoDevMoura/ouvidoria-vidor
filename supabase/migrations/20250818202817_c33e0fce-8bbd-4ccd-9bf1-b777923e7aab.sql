-- Primeiro, vamos verificar se o enum user_role já existe e recriá-lo
DO $$ 
BEGIN
    -- Criar backup dos dados existentes
    CREATE TEMP TABLE profiles_backup AS SELECT * FROM profiles;
    
    -- Remover a coluna role temporariamente
    ALTER TABLE profiles DROP COLUMN role;
    
    -- Recriar o enum com o novo valor
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'agent');
    
    -- Recriar a coluna role
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user'::user_role;
    
    -- Restaurar os dados (convertendo 'admin' existentes)
    UPDATE profiles SET role = 'admin'::user_role 
    WHERE id IN (SELECT id FROM profiles_backup WHERE profiles_backup.role = 'admin');
    
    -- Limpar temp table
    DROP TABLE profiles_backup;
END $$;

-- Criar função para verificar se é admin ou agent
CREATE OR REPLACE FUNCTION public.is_admin_or_agent(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role IN ('admin'::user_role, 'agent'::user_role)
  );
END;
$function$;

-- Atualizar políticas RLS para incluir agentes nas operações de tickets
DROP POLICY IF EXISTS "Admins e agentes podem atualizar tickets" ON tickets;
CREATE POLICY "Admins e agentes podem atualizar tickets" 
ON tickets FOR UPDATE 
USING (is_admin_or_agent());

-- Atualizar políticas para ticket_history
DROP POLICY IF EXISTS "Admins e agentes podem inserir no histórico" ON ticket_history;
DROP POLICY IF EXISTS "Admins e agentes podem ver histórico" ON ticket_history;

CREATE POLICY "Admins e agentes podem inserir no histórico" 
ON ticket_history FOR INSERT 
WITH CHECK (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem ver histórico" 
ON ticket_history FOR SELECT 
USING (is_admin_or_agent());

-- Atualizar políticas para ticket_notes
DROP POLICY IF EXISTS "Admins e agentes podem criar notas" ON ticket_notes;
DROP POLICY IF EXISTS "Admins e agentes podem ver notas" ON ticket_notes;

CREATE POLICY "Admins e agentes podem criar notas" 
ON ticket_notes FOR INSERT 
WITH CHECK (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem ver notas" 
ON ticket_notes FOR SELECT 
USING (is_admin_or_agent());