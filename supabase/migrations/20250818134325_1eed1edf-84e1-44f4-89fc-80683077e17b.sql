-- Remover políticas que impedem INSERT na tabela profiles
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON profiles;

-- Criar política que permite INSERT durante signup automático
CREATE POLICY "Permitir criação de perfil durante signup" 
ON profiles 
FOR INSERT 
WITH CHECK (true);

-- Criar política que permite admins criarem perfis para outros usuários
CREATE POLICY "Admins podem criar perfis para outros usuários" 
ON profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::user_role
  )
);