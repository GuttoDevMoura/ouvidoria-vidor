-- Verificar e recriar trigger que pode estar causando o problema
-- Primeiro, verificar se existe o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar o trigger de forma mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil para o novo usuário com tratamento de erro robusto
  INSERT INTO public.profiles (user_id, nome_completo, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    'user'::user_role
  );
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