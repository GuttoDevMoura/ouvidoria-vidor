-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ajustar o trigger para usar SECURITY DEFINER e ser mais permissivo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil para o novo usuário com bypass de RLS usando SECURITY DEFINER
  INSERT INTO public.profiles (user_id, nome_completo, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    'user'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se falhar, logar erro mas não bloquear o signup
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;