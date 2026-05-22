export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Roles stored in production (`profiles.role` CHECK constraint). */
export type UserRole = 'student' | 'mentor' | 'staff' | 'admin' | 'super_admin'
export type ProfileStatus = 'active' | 'suspended'
/** Application statuses in production DB. */
export type ApplicationStatus = 'submitted' | 'waitlist' | 'approved' | 'rejected'
export type LessonStatus = 'draft' | 'published'
export type EnrollmentStatus = 'active' | 'paused' | 'completed'

/** Spec / checklist enums (may differ from live columns — see docs/SUPABASE_MIGRATION_AUDIT.md). */
export type SpecUserRole = 'member' | 'staff' | 'admin' | 'super_admin'
export type SpecApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type ResourceType = 'file' | 'link' | 'template' | 'guide'
export type SessionType = 'group' | 'one_on_one' | 'workshop' | 'pitch'
export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string
          email: string | null
          role: UserRole
          status: ProfileStatus
          mentor_user_id: string | null
          profile_image_url: string | null
          avatar_path: string | null
          avatar_url: string | null
          username: string | null
          joined_at: string
          bio: string | null
          phone: string | null
          country: string | null
          goals: string | null
          linkedin_url: string | null
          cohort: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string
          email?: string | null
          role?: UserRole
          status?: ProfileStatus
          mentor_user_id?: string | null
          profile_image_url?: string | null
          avatar_path?: string | null
          avatar_url?: string | null
          username?: string | null
          joined_at?: string
          bio?: string | null
          phone?: string | null
          country?: string | null
          goals?: string | null
          linkedin_url?: string | null
          cohort?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          status: ApplicationStatus
          reviewed_at: string | null
          reviewed_by: string | null
          notes: string | null
          full_name: string
          email: string
          phone: string | null
          address: string | null
          interest_role: string | null
          message: string | null
          invited_user_id: string | null
          invited_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: ApplicationStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
          notes?: string | null
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          interest_role?: string | null
          message?: string | null
          invited_user_id?: string | null
          invited_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor: string | null
          duration: string | null
          thumbnail_url: string | null
          category: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor?: string | null
          duration?: string | null
          thumbnail_url?: string | null
          category?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          published?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          position: number
          content: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          position: number
          content?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          position: number
          content: Json | null
          created_at: string
          updated_at: string
          status: LessonStatus
          published_at: string | null
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          position: number
          content?: Json | null
          created_at?: string
          updated_at?: string
          status?: LessonStatus
          published_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          status: EnrollmentStatus
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          status?: EnrollmentStatus
        }
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      lesson_completions: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed_at: string
          marked_by: string | null
          marked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed_at?: string
          marked_by?: string | null
          marked_at?: string
        }
        Update: Partial<Database['public']['Tables']['lesson_completions']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          title: string
          body: string
          audience: 'all' | 'students' | 'mentors'
          published_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          title: string
          body: string
          audience?: 'all' | 'students' | 'mentors'
          published_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      resources: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          title: string
          description: string | null
          category: string | null
          bucket: string
          path: string | null
          file_url: string | null
          mime_type: string | null
          size_bytes: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          title: string
          description?: string | null
          category?: string | null
          bucket?: string
          path?: string | null
          file_url?: string | null
          mime_type?: string | null
          size_bytes?: number | null
        }
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          title: string
          description: string | null
          starts_at: string
          ends_at: string | null
          meeting_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          title: string
          description?: string | null
          starts_at: string
          ends_at?: string | null
          meeting_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      session_attendees: {
        Row: {
          session_id: string
          user_id: string
          status: 'invited' | 'confirmed' | 'declined'
        }
        Insert: {
          session_id: string
          user_id: string
          status?: 'invited' | 'confirmed' | 'declined'
        }
        Update: Partial<Database['public']['Tables']['session_attendees']['Insert']>
      }
      site_content: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
          description: string | null
        }
        Insert: {
          key: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
          description?: string | null
        }
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>
      }
      cms_content: {
        Row: {
          id: string
          page_key: string
          section_key: string
          title: string | null
          body: string | null
          media_url: string | null
          published: boolean
          updated_by: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          page_key: string
          section_key: string
          title?: string | null
          body?: string | null
          media_url?: string | null
          published?: boolean
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['cms_content']['Insert']>
      }
    }
    Views: {
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string
          updated_at: string
        }
      }
      course_progress: {
        Row: {
          user_id: string
          course_id: string
          total_modules: number
          completed_modules: number
          percentage: number
        }
      }
      profiles_admin: {
        Row: {
          user_id: string
          full_name: string
          email: string | null
          role: UserRole
          status: ProfileStatus
          joined_at: string
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type LessonProgress = Database['public']['Views']['lesson_progress']['Row']
/** Alias: app code uses `lesson_completions` table; `lesson_progress` is a compatibility view. */
export type LessonProgressRow = LessonProgress
export type LessonCompletion = Database['public']['Tables']['lesson_completions']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionAttendee = Database['public']['Tables']['session_attendees']['Row']
export type SiteContent = Database['public']['Tables']['site_content']['Row']
