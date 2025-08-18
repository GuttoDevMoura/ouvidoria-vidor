-- Remover trigger temporariamente e recriá-lo para garantir que funcione
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função de forma mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o perfil já existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.profiles (user_id, nome_completo, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
      'admin'::user_role
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o signup
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Limpar qualquer dado problemático no auth.users que pode estar causando erro
UPDATE auth.users 
SET 
  email_change = NULL,
  email_change_token_new = NULL, 
  email_change_token_current = NULL,
  email_change_sent_at = NULL
WHERE email = 'gutto.moura@igrejanovoscomecos.com.br';