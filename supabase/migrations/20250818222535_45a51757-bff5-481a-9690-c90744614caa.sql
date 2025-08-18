-- Corrigir o usuário Charles confirmando apenas o email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'guttomoura@hotmail.com' 
  AND email_confirmed_at IS NULL;