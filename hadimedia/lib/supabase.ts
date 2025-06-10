import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type Program = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  thumbnail_url: string | null
  duration: string | null
  views: number
  order: number
  status: "published" | "draft" | "archived"
  created_at: string
  updated_at: string
}

export type Tag = {
  id: number
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export type ProgramTag = {
  id: number
  program_id: number
  tag_id: number
}

// Supabase configuration
const supabaseUrl = "https://wbatzbtyajmynfhemsjx.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYXR6YnR5YWpteW5maGVtc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODEwOTksImV4cCI6MjA2NDk1NzA5OX0.FwkVEZzJZUYZLC_Yli4C6sKXasIQ-PQ1eLGABwuF08Y"

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client (singleton pattern)
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (!clientSupabaseClient) {
    clientSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return clientSupabaseClient
}

// Export the main client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket name
export const STORAGE_BUCKET = "videos"

// Helper function to generate a unique file name
export const generateUniqueFileName = (originalName: string) => {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 10)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Helper function to get public URL for a file
export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
