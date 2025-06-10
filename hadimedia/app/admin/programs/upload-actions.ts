"use server"

import { createServerSupabaseClient, STORAGE_BUCKET, generateUniqueFileName, getPublicUrl } from "@/lib/supabase"

// Upload a file to Supabase Storage
export async function uploadFile(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    // Generate a unique file name to prevent collisions
    const fileName = generateUniqueFileName(file.name)

    // Determine folder based on file type
    const isVideo = file.type.startsWith("video/")
    const folder = isVideo ? "videos" : "thumbnails"
    const filePath = `${folder}/${fileName}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: `Error uploading file: ${uploadError.message}` }
    }

    // Get the public URL
    const publicUrl = getPublicUrl(filePath)

    // For videos, we need to get the duration
    let duration = null
    if (isVideo) {
      // Note: We can't get the actual duration on the server
      // The client will need to calculate this
      duration = "00:00" // Placeholder
    }

    return {
      url: publicUrl,
      duration,
      fileName: fileName,
      filePath: filePath,
    }
  } catch (error) {
    console.error("File upload error:", error)
    return { error: "Failed to upload file" }
  }
}

// Delete a file from Supabase Storage
export async function deleteFile(filePath: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath])

    if (error) {
      console.error("Delete error:", error)
      return { error: `Error deleting file: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("File delete error:", error)
    return { error: "Failed to delete file" }
  }
}
