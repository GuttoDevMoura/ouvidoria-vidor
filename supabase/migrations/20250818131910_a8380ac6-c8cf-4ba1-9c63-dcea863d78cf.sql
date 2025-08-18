-- Criar tabela para emails pendentes
CREATE TABLE public.emails_pendentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  protocolo TEXT NOT NULL,
  status TEXT NOT NULL,
  nome TEXT,
  conteudo_html TEXT NOT NULL,
  enviado BOOLEAN DEFAULT false,
  data_solicitacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_envio TIMESTAMP WITH TIME ZONE,
  tentativas INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.emails_pendentes ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view all pending emails" 
ON public.emails_pendentes 
FOR ALL 
USING (true);