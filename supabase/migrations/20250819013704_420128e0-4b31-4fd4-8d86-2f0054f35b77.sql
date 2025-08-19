-- Adicionar o status "Reaberto" ao enum ticket_status se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'ticket_status' AND e.enumlabel = 'Reaberto'
    ) THEN
        ALTER TYPE ticket_status ADD VALUE 'Reaberto';
    END IF;
END $$;