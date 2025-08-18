-- Corrigir o usuário Charles que foi criado como agente mas aparece como admin
-- Vamos buscar e corrigir qualquer inconsistência nos roles

-- Primeiro, vamos verificar se existe algum usuário chamado Charles e corrigir seu role se necessário
UPDATE profiles 
SET role = 'agent'::user_role 
WHERE nome_completo ILIKE '%charles%' 
  AND role = 'admin'::user_role;

-- Também vamos garantir que não há inconsistências no sistema
-- Verificar se há profiles sem role definido e definir como 'agent' por padrão para novos usuários
UPDATE profiles 
SET role = 'agent'::user_role 
WHERE role IS NULL;