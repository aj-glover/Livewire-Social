export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          bio: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          phone: string | null
          public_key: string | null
          location: string | null
          gender: string | null
          political_lean: string | null
          ethnicity: string | null
          is_verified: boolean
          is_admin: boolean
        }
        Insert: {
          id: string
          username: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          phone?: string | null
          public_key?: string | null
          location?: string | null
          gender?: string | null
          political_lean?: string | null
          ethnicity?: string | null
          is_verified?: boolean
          is_admin?: boolean
        }
        Update: {
          username?: string
          bio?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          phone?: string | null
          public_key?: string | null
          location?: string | null
          gender?: string | null
          political_lean?: string | null
          ethnicity?: string | null
          is_verified?: boolean
          is_admin?: boolean
        }
        Relationships: []
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          full_name: string
          date_of_birth: string
          location: string
          id_type: string
          id_document_path: string
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
          reviewed_at: string | null
          reviewer_id: string | null
          rejection_reason: string | null
        }
        Insert: {
          user_id: string
          full_name: string
          date_of_birth: string
          location: string
          id_type: string
          id_document_path: string
        }
        Update: {
          status?: string
          reviewed_at?: string
          reviewer_id?: string
          rejection_reason?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: DirectMessage
        Insert: Omit<DirectMessage, 'id' | 'created_at'>
        Update: Partial<Omit<DirectMessage, 'id'>>
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          is_adult_content: boolean
          repost_of: string | null
          is_repost: boolean
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          is_adult_content?: boolean
          repost_of?: string | null
          is_repost?: boolean
        }
        Update: {
          content?: string
          image_url?: string | null
          is_adult_content?: boolean
          repost_of?: string | null
          is_repost?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'likes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      bookmarks: {
        Row: { user_id: string; post_id: string; created_at: string }
        Insert: { user_id: string; post_id: string; created_at?: string }
        Update: never
        Relationships: []
      }
      blocks: {
        Row: { blocker_id: string; blocked_id: string; created_at: string }
        Insert: { blocker_id: string; blocked_id: string; created_at?: string }
        Update: never
        Relationships: []
      }
      mutes: {
        Row: { muter_id: string; muted_id: string; created_at: string }
        Insert: { muter_id: string; muted_id: string; created_at?: string }
        Update: never
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_post_id: string | null
          reported_user_id: string | null
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_post_id?: string | null
          reported_user_id?: string | null
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'dismissed'
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      check_post_similarity: {
        Args: { input_content: string; similarity_threshold?: number }
        Returns: { post_id: string; author_username: string; similarity_score: number }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type DirectMessage = {
  id: string
  sender_id: string
  recipient_id: string
  ciphertext: string
  iv: string
  created_at: string
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Verification = Database['public']['Tables']['verifications']['Row']

export type PostProfile = Pick<Profile, 'id' | 'username' | 'avatar_url'>

export type RepostPreview = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  profiles: { id: string; username: string; avatar_url: string | null }
}

export type PostWithProfile = Post & {
  profiles: PostProfile
  likes: { id: string; user_id: string }[]
  comments: { id: string }[]
  is_adult_content: boolean
  bookmarks?: { user_id: string }[]
  repost_of: string | null
  is_repost: boolean
  repost_post?: RepostPreview | null
}
