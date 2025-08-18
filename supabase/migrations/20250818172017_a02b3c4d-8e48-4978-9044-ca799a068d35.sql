-- Criar tabela de histórico de tickets
CREATE TABLE public.ticket_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  agente_id UUID REFERENCES public.profiles(user_id),
  action_type TEXT NOT NULL, -- 'status_change', 'note_added', 'assignment', 'created', 'updated'
  field_name TEXT, -- nome do campo alterado
  old_value TEXT, -- valor anterior
  new_value TEXT, -- novo valor
  description TEXT, -- descrição da ação
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ver todo o histórico
CREATE POLICY "Admins podem ver todo o histórico" 
ON public.ticket_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::user_role
));

-- Política para admins poderem inserir no histórico
CREATE POLICY "Admins podem inserir no histórico" 
ON public.ticket_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::user_role
));

-- Função para registrar mudanças automaticamente
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for INSERT (novo ticket)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ticket_history (
      ticket_id, 
      action_type, 
      description,
      new_value
    ) VALUES (
      NEW.id,
      'created',
      'Ticket criado',
      'Status: ' || NEW.status::text
    );
    RETURN NEW;
  END IF;

  -- Se for UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Mudança de status
    IF OLD.status != NEW.status THEN
      INSERT INTO public.ticket_history (
        ticket_id,
        agente_id,
        action_type,
        field_name,
        old_value,
        new_value,
        description
      ) VALUES (
        NEW.id,
        auth.uid(),
        'status_change',
        'status',
        OLD.status::text,
        NEW.status::text,
        'Status alterado de "' || OLD.status::text || '" para "' || NEW.status::text || '"'
      );
    END IF;

    -- Mudança de agente responsável
    IF COALESCE(OLD.agente_responsavel::text, '') != COALESCE(NEW.agente_responsavel::text, '') THEN
      INSERT INTO public.ticket_history (
        ticket_id,
        agente_id,
        action_type,
        field_name,
        old_value,
        new_value,
        description
      ) VALUES (
        NEW.id,
        auth.uid(),
        'assignment',
        'agente_responsavel',
        COALESCE(OLD.agente_responsavel::text, 'Não atribuído'),
        COALESCE(NEW.agente_responsavel::text, 'Não atribuído'),
        'Agente responsável alterado'
      );
    END IF;

    -- Mudança de resumo de tratativa
    IF COALESCE(OLD.resumo_tratativa, '') != COALESCE(NEW.resumo_tratativa, '') THEN
      INSERT INTO public.ticket_history (
        ticket_id,
        agente_id,
        action_type,
        field_name,
        old_value,
        new_value,
        description
      ) VALUES (
        NEW.id,
        auth.uid(),
        'updated',
        'resumo_tratativa',
        COALESCE(OLD.resumo_tratativa, ''),
        COALESCE(NEW.resumo_tratativa, ''),
        'Resumo de tratativa atualizado'
      );
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para log automático
CREATE TRIGGER ticket_changes_log
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ticket_changes();

-- Função para registrar quando uma nota é adicionada
CREATE OR REPLACE FUNCTION public.log_note_added()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticket_history (
    ticket_id,
    agente_id,
    action_type,
    description
  ) VALUES (
    NEW.ticket_id,
    NEW.agente_id,
    'note_added',
    'Nota interna adicionada'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notas
CREATE TRIGGER note_added_log
  AFTER INSERT ON public.ticket_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_note_added();