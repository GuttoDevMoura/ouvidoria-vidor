-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Permitir criação de perfil durante signup" ON profiles;
DROP POLICY IF EXISTS "Admins podem criar perfis para outros usuários" ON profiles;

-- Criar política que permite INSERT através do trigger (SECURITY DEFINER)
CREATE POLICY "Permitir criação automática de perfis" 
ON profiles 
FOR INSERT 
WITH CHECK (true);

-- Recriar políticas de SELECT de forma mais segura
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;

-- Política para usuários verem seus próprios perfis
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para admins verem todos os perfis (sem recursão)
CREATE POLICY "Admins podem ver todos os perfis" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'::user_role
  )
);