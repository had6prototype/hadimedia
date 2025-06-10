"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function deleteAllPrograms() {
  try {
    const supabase = createServerSupabaseClient()

    // Delete all program_tags relationships first
    const { error: programTagsError } = await supabase.from("program_tags").delete().neq("id", 0) // This deletes all rows

    if (programTagsError) throw programTagsError

    // Delete all programs
    const { error: programsError } = await supabase.from("programs").delete().neq("id", 0) // This deletes all rows

    if (programsError) throw programsError

    revalidatePath("/admin/programs")
    return { success: true, message: "تمام برنامه‌ها با موفقیت حذف شدند" }
  } catch (error) {
    console.error("Failed to delete all programs:", error)
    return { error: "خطا در حذف برنامه‌ها" }
  }
}
