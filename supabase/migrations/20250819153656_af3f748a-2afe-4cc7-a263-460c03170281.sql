-- Alterar a função de geração do número do protocolo para usar data/hora + número randômico
-- Isso elimina a vulnerabilidade de sequência previsível

CREATE OR REPLACE FUNCTION public.generate_protocol_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  random_digit INTEGER;
BEGIN
  -- Gerar um número randômico entre 1 e 99
  random_digit := floor(random() * 99 + 1)::INTEGER;
  
  -- Formato: OUV + YYYY + DD + MM + HHMM + - + número randômico
  -- Exemplo: OUV202519081234-67
  RETURN 'OUV' || 
         TO_CHAR(NOW(), 'YYYY') ||     -- Ano (2025)
         TO_CHAR(NOW(), 'DD') ||       -- Dia (19)
         TO_CHAR(NOW(), 'MM') ||       -- Mês (08)
         TO_CHAR(NOW(), 'HH24MI') ||   -- Hora e minuto (1234)
         '-' ||
         LPAD(random_digit::TEXT, 2, '0'); -- Número randômico de 1-99 com zero à esquerda
END;
$function$;