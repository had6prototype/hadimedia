"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, type Program, type Tag, deleteFile } from "@/lib/supabase"

// Get all programs with their tags
export async function getPrograms() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all programs
    const { data: programs, error: programsError } = await supabase.from("programs").select("*").order("order")

    if (programsError) throw programsError

    // Get all program tags
    const { data: programTags, error: programTagsError } = await supabase.from("program_tags").select("*")

    if (programTagsError) throw programTagsError

    // Get all tags
    const { data: tags, error: tagsError } = await supabase.from("tags").select("*")

    if (tagsError) throw tagsError

    // Map tags to programs
    const programsWithTags = programs.map((program) => {
      const programTagIds = programTags.filter((pt) => pt.program_id === program.id).map((pt) => pt.tag_id)

      const programTagsList = tags.filter((tag) => programTagIds.includes(tag.id))

      return {
        ...program,
        tags: programTagsList,
      }
    })

    return { programs: programsWithTags }
  } catch (error) {
    console.error("Failed to get programs:", error)
    return { error: "Failed to get programs" }
  }
}

// Get a single program by ID
export async function getProgram(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get program
    const { data: program, error: programError } = await supabase.from("programs").select("*").eq("id", id).single()

    if (programError) throw programError

    // Get program tags
    const { data: programTags, error: programTagsError } = await supabase
      .from("program_tags")
      .select("tag_id")
      .eq("program_id", id)

    if (programTagsError) throw programTagsError

    const tagIds = programTags.map((pt) => pt.tag_id)

    // Get tags
    let programTagsList: Tag[] = []
    if (tagIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase.from("tags").select("*").in("id", tagIds)

      if (tagsError) throw tagsError
      programTagsList = tags
    }

    return {
      program: {
        ...program,
        tags: programTagsList,
      },
    }
  } catch (error) {
    console.error("Failed to get program:", error)
    return { error: "Failed to get program" }
  }
}

// Create a new program
export async function createProgram(data: Partial<Program> & { tags: string[] }) {
  try {
    const supabase = createServerSupabaseClient()
    const { tags: tagNames, ...programData } = data

    // Insert the program
    const { data: newProgram, error: programError } = await supabase
      .from("programs")
      .insert(programData)
      .select()
      .single()

    if (programError) throw programError

    // Handle tags if provided
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle()

        if (tagError) throw tagError

        let tagId: number

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
            })
            .select()
            .single()

          if (newTagError) throw newTagError
          tagId = newTag.id
        }

        // Create program-tag relation
        const { error: relationError } = await supabase.from("program_tags").insert({
          program_id: newProgram.id,
          tag_id: tagId,
        })

        if (relationError) throw relationError
      }
    }

    revalidatePath("/admin/programs")
    return { program: newProgram }
  } catch (error) {
    console.error("Failed to create program:", error)
    return { error: "Failed to create program" }
  }
}

// Helper function to extract file path from URL
function extractPathFromUrl(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/videos\/(.+)/)
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1]
    }
  } catch (e) {
    console.error("Error extracting path from URL:", e)
  }

  return null
}

// Update a program
export async function updateProgram(id: number, data: Partial<Program> & { tags?: string[] }) {
  try {
    const supabase = createServerSupabaseClient()
    const { tags: tagNames, ...programData } = data

    // Get the current program to check for file changes
    const { data: currentProgram, error: getCurrentError } = await supabase
      .from("programs")
      .select("video_url, thumbnail_url")
      .eq("id", id)
      .single()

    if (getCurrentError) throw getCurrentError

    // Update the program
    const { data: updatedProgram, error: programError } = await supabase
      .from("programs")
      .update(programData)
      .eq("id", id)
      .select()
      .single()

    if (programError) throw programError

    // Handle tags if provided
    if (tagNames) {
      // Delete existing program-tag relations
      const { error: deleteError } = await supabase.from("program_tags").delete().eq("program_id", id)

      if (deleteError) throw deleteError

      // Add new tags
      for (const tagName of tagNames) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle()

        if (tagError) throw tagError

        let tagId: number

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
            })
            .select()
            .single()

          if (newTagError) throw newTagError
          tagId = newTag.id
        }

        // Create program-tag relation
        const { error: relationError } = await supabase.from("program_tags").insert({
          program_id: id,
          tag_id: tagId,
        })

        if (relationError) throw relationError
      }
    }

    revalidatePath("/admin/programs")
    return { program: updatedProgram }
  } catch (error) {
    console.error("Failed to update program:", error)
    return { error: "Failed to update program" }
  }
}

// Delete a program
export async function deleteProgram(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the program to delete its files
    const { data: program, error: getError } = await supabase
      .from("programs")
      .select("video_url, thumbnail_url")
      .eq("id", id)
      .single()

    if (getError) throw getError

    // Delete files from storage if they exist
    if (program) {
      // Delete video file
      const videoPath = extractPathFromUrl(program.video_url)
      if (videoPath) {
        await deleteFile(videoPath)
      }

      // Delete thumbnail file
      const thumbnailPath = extractPathFromUrl(program.thumbnail_url)
      if (thumbnailPath) {
        await deleteFile(thumbnailPath)
      }
    }

    // Delete program (cascade will delete program-tag relations)
    const { error } = await supabase.from("programs").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin/programs")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete program:", error)
    return { error: "Failed to delete program" }
  }
}

// Update program views
export async function incrementProgramViews(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get current views
    const { data: program, error: getError\
