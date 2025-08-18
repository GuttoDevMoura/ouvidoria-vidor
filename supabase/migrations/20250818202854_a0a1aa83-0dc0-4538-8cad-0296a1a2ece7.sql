-- Remover todas as políticas que dependem da coluna role
DROP POLICY IF EXISTS "Admins podem atualizar todos os tickets" ON tickets;
DROP POLICY IF EXISTS "Apenas admins podem ver notas internas" ON ticket_notes;
DROP POLICY IF EXISTS "Apenas admins podem criar notas internas" ON ticket_notes;
DROP POLICY IF EXISTS "Apenas admins podem atualizar configurações" ON content_settings;
DROP POLICY IF EXISTS "Admins podem ver todo o histórico" ON ticket_history;
DROP POLICY IF EXISTS "Admins podem inserir no histórico" ON ticket_history;

-- Adicionar nova coluna role_new temporariamente
ALTER TABLE profiles ADD COLUMN role_new TEXT;

-- Copiar dados existentes
UPDATE profiles SET role_new = role::text;

-- Remover coluna antiga
ALTER TABLE profiles DROP COLUMN role;

-- Recriar enum com novos valores
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('user', 'admin', 'agent');

-- Recriar coluna role com novo tipo
ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user'::user_role;

-- Restaurar dados
UPDATE profiles SET role = role_new::user_role WHERE role_new IN ('user', 'admin');

-- Remover coluna temporária
ALTER TABLE profiles DROP COLUMN role_new;

-- Criar função para verificar admin ou agent
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

-- Função para verificar apenas admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role = 'admin'::user_role
  );
END;
$function$;

-- Recriar políticas para tickets (agentes e admins podem atualizar)
CREATE POLICY "Admins e agentes podem atualizar tickets" 
ON tickets FOR UPDATE 
USING (is_admin_or_agent());

-- Recriar políticas para ticket_notes (agentes e admins)
CREATE POLICY "Admins e agentes podem ver notas" 
ON ticket_notes FOR SELECT 
USING (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem criar notas" 
ON ticket_notes FOR INSERT 
WITH CHECK (is_admin_or_agent());

-- Recriar políticas para content_settings (apenas admins)
CREATE POLICY "Apenas admins podem atualizar configurações" 
ON content_settings FOR UPDATE 
USING (is_admin());

-- Recriar políticas para ticket_history (agentes e admins)
CREATE POLICY "Admins e agentes podem ver histórico" 
ON ticket_history FOR SELECT 
USING (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem inserir no histórico" 
ON ticket_history FOR INSERT 
WITH CHECK (is_admin_or_agent());