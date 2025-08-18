-- Adicionar política para admins poderem deletar perfis
CREATE POLICY "Admins podem deletar perfis" 
ON public.profiles 
FOR DELETE 
USING (is_admin());