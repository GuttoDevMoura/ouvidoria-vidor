-- Atualizar configurações de conteúdo para OUVIDORIA NC
UPDATE public.content_settings 
SET valor = 'OUVIDORIA NC' 
WHERE chave = 'hero_title';

UPDATE public.content_settings 
SET valor = 'Ouvidoria - Igreja Novos Começos' 
WHERE chave = 'site_title';