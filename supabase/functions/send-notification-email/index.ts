import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  to: string;
  subject: string;
  protocolNumber: string;
  status: string;
  nome?: string;
  isAnonymous: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== FUNÇÃO DE EMAIL INICIADA ===");

    const { to, subject, protocolNumber, status, nome, isAnonymous }: EmailData = await req.json();
    console.log("Dados do email recebidos:", { to, subject, protocolNumber, status, nome, isAnonymous });

    const greeting = isAnonymous ? "Prezado(a) solicitante" : `Prezado(a) ${nome}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .protocol { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .status.aberto { background: #fef3c7; color: #92400e; }
          .status.andamento { background: #dbeafe; color: #1e40af; }
          .status.concluido { background: #d1fae5; color: #065f46; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .contact-info { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ouvidoria Igreja Novos Começos</h1>
            <p>Acompanhamento de Manifestação</p>
          </div>
          <div class="content">
            <p>${greeting},</p>
            <p>Informamos que houve uma atualização em sua manifestação:</p>
            
            <div class="protocol">
              <strong>Código da Manifestação: ${protocolNumber}</strong>
            </div>
            
            <p><strong>Status atual:</strong></p>
            <div class="status ${status.toLowerCase().replace(' ', '')}">
              ${status}
            </div>
            
            <p>Para acompanhar o andamento completo de sua manifestação, acesse nosso portal e informe o código acima.</p>
            
            <div class="contact-info">
              <p><strong>Contato da Ouvidoria:</strong></p>
              <p>📧 Email: ouvidoria@igrejanovoscomecos.com.br</p>
              <p>🏢 Igreja Novos Começos</p>
            </div>
            
            <p>Agradecemos por utilizar nossos serviços.</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe da Ouvidoria</strong><br>
            Igreja Novos Começos</p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Não responda a esta mensagem.</p>
            <p>Para dúvidas, entre em contato: ouvidoria@igrejanovoscomecos.com.br</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Salvar email pendente no banco para envio manual
    try {
      console.log("=== SALVANDO EMAIL PENDENTE ===");
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Protocolo: ${protocolNumber}`);
      
      // Inicializar cliente Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qkuocpywdymmvojkiwzg.supabase.co';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
      
      if (!supabaseKey) {
        throw new Error('Chave do Supabase não encontrada');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Salvar email pendente
      const { data, error } = await supabase
        .from('emails_pendentes')
        .insert({
          destinatario: to,
          assunto: subject,
          protocolo: protocolNumber,
          status: status,
          nome: nome || "Solicitante",
          conteudo_html: htmlContent
        });
      
      if (error) {
        console.error('Erro ao salvar email pendente:', error);
        throw error;
      }
      
      console.log("=== EMAIL PENDENTE SALVO COM SUCESSO ===");
      console.log("O email foi salvo na tabela emails_pendentes para envio manual");
      
    } catch (emailError) {
      console.error("Erro ao salvar email pendente:", emailError);
      throw new Error(`Falha ao salvar email: ${emailError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    console.error("Stack trace:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);