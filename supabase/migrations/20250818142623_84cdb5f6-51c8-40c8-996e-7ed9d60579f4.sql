-- Limpar dados inconsistentes na tabela auth.users se houver problema com email_change
-- e garantir que o usuário possa fazer login

-- Primeiro, verificar se há algum problema com dados NULL em colunas de string
-- Se necessário, limpar registros órfãos ou corrompidos

-- Limpar qualquer perfil órfão que possa estar causando problemas
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Garantir que não há conflitos na tabela de usuários
-- Isso vai permitir ao usuário criar uma nova conta se necessário
UPDATE auth.users 
SET email_change = NULL, 
    email_change_token_new = NULL, 
    email_change_token_current = NULL,
    email_change_sent_at = NULL
WHERE email_change = '' OR email_change IS NULL;