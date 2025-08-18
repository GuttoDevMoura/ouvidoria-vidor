-- Atualizar email do usuário Gutto Moura
UPDATE public.profiles 
SET email = 'guttomoura@hotmail.com' 
WHERE nome_completo = 'Gutto Moura';

-- Verificar se há outros usuários sem email e definir um padrão se necessário
UPDATE public.profiles 
SET email = LOWER(REPLACE(nome_completo, ' ', '.')) || '@ouvidoria.com'
WHERE email IS NULL OR email = '';