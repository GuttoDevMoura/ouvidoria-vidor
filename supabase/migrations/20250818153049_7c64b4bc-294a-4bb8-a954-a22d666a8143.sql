-- Confirmar automaticamente o usuário admin existente
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE email = 'admin@ouvidoria.com';