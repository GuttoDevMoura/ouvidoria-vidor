-- Corrigir foreign key da tabela ticket_notes
-- Primeiro remover a constraint existente
ALTER TABLE public.ticket_notes 
DROP CONSTRAINT IF EXISTS ticket_notes_agente_id_fkey;

-- Recriar a constraint correta apontando para profiles.user_id
ALTER TABLE public.ticket_notes 
ADD CONSTRAINT ticket_notes_agente_id_fkey 
FOREIGN KEY (agente_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Corrigir foreign key da tabela ticket_history também
ALTER TABLE public.ticket_history 
DROP CONSTRAINT IF EXISTS ticket_history_agente_id_fkey;

ALTER TABLE public.ticket_history 
ADD CONSTRAINT ticket_history_agente_id_fkey 
FOREIGN KEY (agente_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;