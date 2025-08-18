import React from "react";
import { Loader2, AlertCircle, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export const LoadingFallback = ({ 
  message = "Carregando...", 
  className = "" 
}: LoadingFallbackProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground font-light">{message}</p>
      </div>
    </div>
  );
};

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export const ErrorFallback = ({
  error,
  resetError,
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Tente novamente.",
  className = ""
}: ErrorFallbackProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-80" />
            <div>
              <h3 className="text-lg font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            
            {error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Detalhes do erro
                </summary>
                <pre className="text-xs text-destructive mt-2 p-2 bg-muted rounded overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
            
            {resetError && (
              <Button 
                onClick={resetError}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface NetworkErrorFallbackProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkErrorFallback = ({ 
  onRetry, 
  className = "" 
}: NetworkErrorFallbackProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto opacity-60" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Sem conexão</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Verifique sua conexão com a internet e tente novamente.
              </p>
            </div>
            
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface EmptyStateFallbackProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyStateFallback = ({
  title = "Nenhum item encontrado",
  description = "Não há dados para exibir no momento.",
  action,
  icon,
  className = ""
}: EmptyStateFallbackProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[300px] p-4 ${className}`}>
      <div className="text-center space-y-4 max-w-md">
        {icon || (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <div className="w-8 h-8 rounded-full bg-muted-foreground/20"></div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        
        {action && (
          <Button 
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Componente principal que escolhe o fallback apropriado
interface FallbackProps {
  type: 'loading' | 'error' | 'network' | 'empty';
  error?: Error;
  onRetry?: () => void;
  message?: string;
  title?: string;
  description?: string;
  className?: string;
}

export const Fallback = ({ type, ...props }: FallbackProps) => {
  switch (type) {
    case 'loading':
      return <LoadingFallback message={props.message} className={props.className} />;
    case 'error':
      return (
        <ErrorFallback 
          error={props.error}
          resetError={props.onRetry}
          title={props.title}
          description={props.description}
          className={props.className}
        />
      );
    case 'network':
      return <NetworkErrorFallback onRetry={props.onRetry} className={props.className} />;
    case 'empty':
      return (
        <EmptyStateFallback 
          title={props.title}
          description={props.description}
          className={props.className}
        />
      );
    default:
      return <LoadingFallback className={props.className} />;
  }
};