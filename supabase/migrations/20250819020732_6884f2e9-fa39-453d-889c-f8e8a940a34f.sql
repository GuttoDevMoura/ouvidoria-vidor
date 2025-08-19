-- Atualizar função para calcular prazo de 30 dias úteis para solicitações anônimas
CREATE OR REPLACE FUNCTION public.calculate_due_date(is_anonymous boolean DEFAULT false)
RETURNS date
LANGUAGE plpgsql
AS $function$
DECLARE
  due_date DATE := CURRENT_DATE;
  business_days INTEGER := 0;
  target_days INTEGER := CASE WHEN is_anonymous THEN 30 ELSE 15 END;
BEGIN
  WHILE business_days < target_days LOOP
    due_date := due_date + 1;
    -- Contar apenas dias úteis (segunda a sexta)
    IF EXTRACT(DOW FROM due_date) BETWEEN 1 AND 5 THEN
      business_days := business_days + 1;
    END IF;
  END LOOP;
  RETURN due_date;
END;
$function$;

-- Atualizar trigger para usar o novo parâmetro
CREATE OR REPLACE FUNCTION public.set_ticket_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.numero_protocolo IS NULL THEN
    NEW.numero_protocolo := public.generate_protocol_number();
  END IF;
  
  IF NEW.data_vencimento IS NULL THEN
    NEW.data_vencimento := public.calculate_due_date(NEW.eh_anonimo);
  END IF;
  
  RETURN NEW;
END;
$function$;