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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          file_url: string | null
          id: string
          subject_id: string
          title: string
          total_points: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          subject_id: string
          title: string
          total_points?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          subject_id?: string
          title?: string
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      career_news: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          posted_by: string | null
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          posted_by?: string | null
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          posted_by?: string | null
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_news_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          id: string
          issued_at: string
          issued_by: string
          student_id: string
          subject_id: string
        }
        Insert: {
          certificate_url?: string | null
          id?: string
          issued_at?: string
          issued_by: string
          student_id: string
          subject_id: string
        }
        Update: {
          certificate_url?: string | null
          id?: string
          issued_at?: string
          issued_by?: string
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          state: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          name: string
          state: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          enrolled_at: string
          id: string
          student_id: string
          subject_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          student_id: string
          subject_id: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          subject_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          subject_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          subject_id: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          subject_id: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college_id: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          quiz_id: string
          score: number | null
          student_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number | null
          student_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          questions: Json
          subject_id: string
          title: string
          total_points: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          questions: Json
          subject_id: string
          title: string
          total_points?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          questions?: Json
          subject_id?: string
          title?: string
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          college_id: string | null
          created_at: string
          description: string | null
          faculty_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          faculty_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          faculty_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          id: string
          status: string | null
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_completions: {
        Row: {
          completed_at: string
          id: string
          student_id: string
          video_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          student_id: string
          video_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          student_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_completions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          subject_id: string
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id: string
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id?: string
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role_new: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "admin"
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
      app_role: ["student", "faculty", "admin"],
    },
  },
} as const
