-- Criar enum para campus da igreja
CREATE TYPE public.campus_type AS ENUM ('Niterói', 'Barra', 'Búzios', 'Zona Sul', 'Caxias', 'Itaboraí', 'Petrópolis', 'Friburgo', 'Teresópolis', 'Cabo Frio', 'Macaé', 'Maricá', 'Online');

-- Criar enum para tipo de solicitação
CREATE TYPE public.solicitacao_type AS ENUM ('Elogio', 'Crítica', 'Denúncia', 'Sugestão');

-- Criar enum para status do ticket
CREATE TYPE public.ticket_status AS ENUM ('Aberto', 'Em andamento', 'Aguardando', 'Fechado', 'Reaberto');

-- Criar enum para roles de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tickets
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_protocolo TEXT NOT NULL UNIQUE,
  eh_anonimo BOOLEAN NOT NULL DEFAULT false,
  nome_completo TEXT,
  contato_whatsapp TEXT,
  email TEXT,
  campus campus_type NOT NULL,
  tipo_solicitacao solicitacao_type NOT NULL,
  descricao TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'Aberto',
  resumo_tratativa TEXT,
  agente_responsavel UUID REFERENCES public.profiles(id),
  data_vencimento DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de notas internas dos tickets
CREATE TABLE public.ticket_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  agente_id UUID NOT NULL REFERENCES public.profiles(id),
  nota TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações de conteúdo dinâmico
CREATE TABLE public.content_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas RLS para tickets
CREATE POLICY "Tickets são visíveis para todos (leitura pública)" 
ON public.tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer pessoa pode criar tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar todos os tickets"
ON public.tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas RLS para ticket_notes
CREATE POLICY "Apenas admins podem ver notas internas"
ON public.ticket_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Apenas admins podem criar notas internas"
ON public.ticket_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas RLS para content_settings
CREATE POLICY "Configurações de conteúdo são visíveis para todos"
ON public.content_settings
FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem atualizar configurações"
ON public.content_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em tickets
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em content_settings
CREATE TRIGGER update_content_settings_updated_at
  BEFORE UPDATE ON public.content_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de protocolo
CREATE OR REPLACE FUNCTION public.generate_protocol_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'OUV' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('ticket_protocol_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para números de protocolo
CREATE SEQUENCE IF NOT EXISTS ticket_protocol_seq START 1;

-- Função para definir data de vencimento (15 dias úteis)
CREATE OR REPLACE FUNCTION public.calculate_due_date()
RETURNS DATE AS $$
DECLARE
  due_date DATE := CURRENT_DATE;
  business_days INTEGER := 0;
BEGIN
  WHILE business_days < 15 LOOP
    due_date := due_date + 1;
    -- Contar apenas dias úteis (segunda a sexta)
    IF EXTRACT(DOW FROM due_date) BETWEEN 1 AND 5 THEN
      business_days := business_days + 1;
    END IF;
  END LOOP;
  RETURN due_date;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir protocolo e data de vencimento automaticamente
CREATE OR REPLACE FUNCTION public.set_ticket_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_protocolo IS NULL THEN
    NEW.numero_protocolo := public.generate_protocol_number();
  END IF;
  
  IF NEW.data_vencimento IS NULL THEN
    NEW.data_vencimento := public.calculate_due_date();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_defaults_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_defaults();

-- Função para gerenciar criação de perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome_completo, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir configurações de conteúdo padrão
INSERT INTO public.content_settings (chave, valor, descricao) VALUES
('site_title', 'Ouvidoria - Igreja Novos Começos', 'Título do site'),
('hero_title', 'Vidorê - Ouvidoria da Igreja', 'Título principal da página'),
('hero_subtitle', 'Sua voz é importante para nós. Compartilhe suas experiências, sugestões e feedbacks.', 'Subtítulo da página principal'),
('about_text', 'A Ouvidoria da Igreja Novos Começos é um canal direto de comunicação entre nossa comunidade e a liderança. Aqui você pode compartilhar elogios, críticas, denúncias ou sugestões de forma segura e acolhedora. Valorizamos cada feedback recebido e nos comprometemos a responder em até 15 dias úteis.', 'Texto explicativo sobre a ouvidoria'),
('contact_phone', '(21) 99999-9999', 'Telefone de contato'),
('contact_email', 'ouvidoria@igrejanovoscomecos.com.br', 'Email de contato'),
('church_address', 'Rua da Igreja, 123 - Niterói/RJ', 'Endereço da igreja');