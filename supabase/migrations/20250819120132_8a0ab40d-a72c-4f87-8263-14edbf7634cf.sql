-- Verificar se a trigger existe para log_ticket_changes
SELECT tgname, tgrelid::regclass as table_name, tgfoid::regproc as function_name 
FROM pg_trigger 
WHERE tgname LIKE '%ticket%';

-- Criar a trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_log_ticket_changes' 
        AND tgrelid = 'public.tickets'::regclass
    ) THEN
        CREATE TRIGGER trigger_log_ticket_changes
            AFTER INSERT OR UPDATE ON public.tickets
            FOR EACH ROW
            EXECUTE FUNCTION public.log_ticket_changes();
    END IF;
END $$;