-- Atualizar enum user_role para incluir o tipo 'agent'
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('user', 'admin', 'agent');

-- Recriar as colunas que usavam o enum antigo
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Atualizar a função is_admin para verificar se é admin ou agent
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

-- Atualizar políticas que precisam incluir agentes
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
CREATE POLICY "Admins e agentes podem ver perfis necessários" 
ON profiles FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role))
);

-- Atualizar políticas para tickets permitindo acesso de agentes
DROP POLICY IF EXISTS "Admins podem atualizar todos os tickets" ON tickets;
CREATE POLICY "Admins e agentes podem atualizar tickets" 
ON tickets FOR UPDATE 
USING (is_admin_or_agent());

-- Atualizar políticas para ticket_history permitindo acesso de agentes
DROP POLICY IF EXISTS "Admins podem inserir no histórico" ON ticket_history;
DROP POLICY IF EXISTS "Admins podem ver todo o histórico" ON ticket_history;

CREATE POLICY "Admins e agentes podem inserir no histórico" 
ON ticket_history FOR INSERT 
WITH CHECK (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem ver histórico" 
ON ticket_history FOR SELECT 
USING (is_admin_or_agent());

-- Atualizar políticas para ticket_notes permitindo acesso de agentes
DROP POLICY IF EXISTS "Apenas admins podem criar notas internas" ON ticket_notes;
DROP POLICY IF EXISTS "Apenas admins podem ver notas internas" ON ticket_notes;

CREATE POLICY "Admins e agentes podem criar notas" 
ON ticket_notes FOR INSERT 
WITH CHECK (is_admin_or_agent());

CREATE POLICY "Admins e agentes podem ver notas" 
ON ticket_notes FOR SELECT 
USING (is_admin_or_agent());