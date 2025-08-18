import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'confirmation' | 'recovery';
  confirmationUrl?: string;
  recoveryUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, confirmationUrl, recoveryUrl }: AuthEmailRequest = await req.json();

    let subject = "";
    let html = "";

    if (type === 'confirmation') {
      subject = "Confirme seu email - Ouvidoria Igreja Novos Começos";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ouvidoria Igreja Novos Começos</h1>
              <p>Confirmação de Email</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Obrigado por se cadastrar em nossa plataforma! Para completar seu cadastro, clique no botão abaixo para confirmar seu email:</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirmar Email</a>
              </div>
              
              <p>Se você não se cadastrou em nossa plataforma, pode ignorar este email.</p>
              
              <p>Atenciosamente,<br>
              <strong>Equipe da Ouvidoria</strong><br>
              Igreja Novos Começos</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'recovery') {
      subject = "Recuperação de senha - Ouvidoria Igreja Novos Começos";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ouvidoria Igreja Novos Começos</h1>
              <p>Recuperação de Senha</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
              
              <div style="text-align: center;">
                <a href="${recoveryUrl}" class="button">Redefinir Senha</a>
              </div>
              
              <p>Se você não solicitou a recuperação de senha, pode ignorar este email com segurança.</p>
              <p>Este link é válido por 1 hora.</p>
              
              <p>Atenciosamente,<br>
              <strong>Equipe da Ouvidoria</strong><br>
              Igreja Novos Começos</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Ouvidoria Igreja Novos Começos <noreply@resend.dev>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
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