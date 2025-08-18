import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LoadingFallback, 
  ErrorFallback, 
  NetworkErrorFallback, 
  EmptyStateFallback,
  Fallback 
} from "@/components/ui/fallback";
import { FileText, Users, MessageCircle } from "lucide-react";

export const FallbackDemo = () => {
  const [currentDemo, setCurrentDemo] = useState<string>('loading');

  const demos = [
    { id: 'loading', label: 'Loading', component: <LoadingFallback message="Carregando dados..." /> },
    { 
      id: 'error', 
      label: 'Erro', 
      component: <ErrorFallback 
        error={new Error('Falha na conexão com o servidor')}
        resetError={() => console.log('Tentando novamente...')}
        title="Erro de conexão"
        description="Não foi possível conectar ao servidor. Verifique sua conexão."
      /> 
    },
    { 
      id: 'network', 
      label: 'Rede', 
      component: <NetworkErrorFallback onRetry={() => console.log('Reconectando...')} /> 
    },
    { 
      id: 'empty', 
      label: 'Vazio', 
      component: <EmptyStateFallback 
        title="Nenhum ticket encontrado"
        description="Não há tickets para exibir no momento."
        action={{
          label: "Criar novo ticket",
          onClick: () => console.log('Criando ticket...')
        }}
        icon={<FileText className="h-12 w-12 text-muted-foreground mx-auto" />}
      /> 
    },
    { 
      id: 'users-empty', 
      label: 'Usuários Vazio', 
      component: <EmptyStateFallback 
        title="Nenhum usuário cadastrado"
        description="Comece adicionando o primeiro usuário ao sistema."
        action={{
          label: "Adicionar usuário",
          onClick: () => console.log('Adicionando usuário...')
        }}
        icon={<Users className="h-12 w-12 text-muted-foreground mx-auto" />}
      /> 
    },
    { 
      id: 'messages-empty', 
      label: 'Mensagens Vazio', 
      component: <EmptyStateFallback 
        title="Nenhuma mensagem"
        description="Suas conversas aparecerão aqui quando você começar a trocar mensagens."
        icon={<MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />}
      /> 
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-4">
            Componentes de Fallback
          </h1>
          <p className="text-muted-foreground">
            Demonstração dos diferentes estados de fallback disponíveis no sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navegação */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demos.map((demo) => (
                    <Button
                      key={demo.id}
                      variant={currentDemo === demo.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setCurrentDemo(demo.id)}
                    >
                      {demo.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de demonstração */}
          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardHeader>
                <CardTitle className="text-lg">
                  {demos.find(d => d.id === currentDemo)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {demos.find(d => d.id === currentDemo)?.component}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exemplo de uso do componente Fallback genérico */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Componente Fallback Genérico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <Fallback type="loading" message="Carregando..." />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <Fallback 
                    type="error" 
                    title="Erro"
                    description="Algo deu errado"
                    onRetry={() => console.log('Retry')}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <Fallback type="network" onRetry={() => console.log('Retry network')} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <Fallback 
                    type="empty" 
                    title="Vazio"
                    description="Nenhum item"
                  />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};