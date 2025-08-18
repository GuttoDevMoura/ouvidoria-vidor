export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      content_settings: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      emails_pendentes: {
        Row: {
          assunto: string
          conteudo_html: string
          data_envio: string | null
          data_solicitacao: string
          destinatario: string
          enviado: boolean | null
          id: string
          nome: string | null
          protocolo: string
          status: string
          tentativas: number | null
        }
        Insert: {
          assunto: string
          conteudo_html: string
          data_envio?: string | null
          data_solicitacao?: string
          destinatario: string
          enviado?: boolean | null
          id?: string
          nome?: string | null
          protocolo: string
          status: string
          tentativas?: number | null
        }
        Update: {
          assunto?: string
          conteudo_html?: string
          data_envio?: string | null
          data_solicitacao?: string
          destinatario?: string
          enviado?: boolean | null
          id?: string
          nome?: string | null
          protocolo?: string
          status?: string
          tentativas?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome_completo: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_history: {
        Row: {
          action_type: string
          agente_id: string | null
          created_at: string
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          action_type: string
          agente_id?: string | null
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          action_type?: string
          agente_id?: string | null
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_history_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_notes: {
        Row: {
          agente_id: string
          created_at: string
          id: string
          nota: string
          ticket_id: string
        }
        Insert: {
          agente_id: string
          created_at?: string
          id?: string
          nota: string
          ticket_id: string
        }
        Update: {
          agente_id?: string
          created_at?: string
          id?: string
          nota?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_notes_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ticket_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          agente_responsavel: string | null
          campus: Database["public"]["Enums"]["campus_type"]
          contato_whatsapp: string | null
          created_at: string
          data_vencimento: string
          descricao: string
          eh_anonimo: boolean
          email: string | null
          id: string
          nome_completo: string | null
          numero_protocolo: string
          resumo_tratativa: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          tipo_solicitacao: Database["public"]["Enums"]["solicitacao_type"]
          updated_at: string
        }
        Insert: {
          agente_responsavel?: string | null
          campus: Database["public"]["Enums"]["campus_type"]
          contato_whatsapp?: string | null
          created_at?: string
          data_vencimento: string
          descricao: string
          eh_anonimo?: boolean
          email?: string | null
          id?: string
          nome_completo?: string | null
          numero_protocolo: string
          resumo_tratativa?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tipo_solicitacao: Database["public"]["Enums"]["solicitacao_type"]
          updated_at?: string
        }
        Update: {
          agente_responsavel?: string | null
          campus?: Database["public"]["Enums"]["campus_type"]
          contato_whatsapp?: string | null
          created_at?: string
          data_vencimento?: string
          descricao?: string
          eh_anonimo?: boolean
          email?: string | null
          id?: string
          nome_completo?: string | null
          numero_protocolo?: string
          resumo_tratativa?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tipo_solicitacao?: Database["public"]["Enums"]["solicitacao_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_agente_responsavel_fkey"
            columns: ["agente_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_due_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_protocol_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_admin_or_agent: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      campus_type:
        | "Niterói"
        | "Barra"
        | "Búzios"
        | "Zona Sul"
        | "Caxias"
        | "Itaboraí"
        | "Petrópolis"
        | "Friburgo"
        | "Teresópolis"
        | "Cabo Frio"
        | "Macaé"
        | "Maricá"
        | "Online"
      solicitacao_type: "Elogio" | "Crítica" | "Denúncia" | "Sugestão"
      ticket_status:
        | "Aberto"
        | "Em andamento"
        | "Aguardando"
        | "Fechado"
        | "Reaberto"
      user_role: "user" | "admin" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campus_type: [
        "Niterói",
        "Barra",
        "Búzios",
        "Zona Sul",
        "Caxias",
        "Itaboraí",
        "Petrópolis",
        "Friburgo",
        "Teresópolis",
        "Cabo Frio",
        "Macaé",
        "Maricá",
        "Online",
      ],
      solicitacao_type: ["Elogio", "Crítica", "Denúncia", "Sugestão"],
      ticket_status: [
        "Aberto",
        "Em andamento",
        "Aguardando",
        "Fechado",
        "Reaberto",
      ],
      user_role: ["user", "admin", "agent"],
    },
  },
} as const
