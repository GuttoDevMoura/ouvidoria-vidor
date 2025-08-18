-- Criar função security definer para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar política de admin usando a função
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;

CREATE POLICY "Admins podem ver todos os perfis" 
ON profiles 
FOR SELECT 
USING (public.is_admin());