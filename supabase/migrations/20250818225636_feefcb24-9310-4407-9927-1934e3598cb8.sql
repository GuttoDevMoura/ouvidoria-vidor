-- Adicionar coluna email na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Atualizar emails conhecidos
UPDATE public.profiles 
SET email = 'admin@ouvidoria.com' 
WHERE nome_completo = 'Administrador Sistema';

UPDATE public.profiles 
SET email = 'guttomoura@hotmail.com' 
WHERE nome_completo = 'Charles';