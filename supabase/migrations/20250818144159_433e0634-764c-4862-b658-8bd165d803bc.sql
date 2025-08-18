-- Resolver o problema criando um usuário admin simples
-- Primeiro, vamos limpar qualquer problema de schema na auth.users

-- Criar um perfil de admin que pode ser usado 
INSERT INTO public.profiles (user_id, nome_completo, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Administrador Sistema',
  'admin'::user_role
) ON CONFLICT (user_id) DO NOTHING;

-- Corrigir trigger para ser mais robusto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
      COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
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