"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { NoteType } from "@/types/notes"

// Create a new note
export async function createNote(formData: FormData) {
  const supabase = createClient()

  const title = (formData.get("title") as string) || "Untitled"
  const content = (formData.get("content") as string) || ""
  const type = (formData.get("type") as NoteType) || "casual"
  const parentId = (formData.get("parentId") as string) || null
  const color = (formData.get("color") as string) || null

  try {
    // Insert the new note into the database
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title,
        content,
        type,
        parent_id: parentId,
        color,
      })
      .select()
      .single()

    if (error) throw error

    // Revalidar todas las rutas que podrían verse afectadas
    revalidatePath("/")
    if (data?.id) {
      revalidatePath(`/notes/${data.id}`)
    }
    if (parentId) {
      revalidatePath(`/notes/${parentId}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating note:", error)
    return { success: false, error: "Failed to create note" }
  }
}

// Update an existing note
export async function updateNote(formData: FormData) {
  const supabase = createClient()

  const id = formData.get("id") as string
  const title = (formData.get("title") as string) || "Untitled"
  const content = (formData.get("content") as string) || ""
  const color = (formData.get("color") as string) || null

  try {
    const { data, error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/")
    revalidatePath(`/notes/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating note:", error)
    return { success: false, error: "Failed to update note" }
  }
}

// Move note to trash
export async function moveNoteToTrash(id: string) {
  const supabase = createClient()

  try {
    // Get the note to check if it has a parent
    const { data: note, error: noteError } = await supabase.from("notes").select("parent_id").eq("id", id).single()

    if (noteError) throw noteError

    // Begin transaction
    // 1. Mark note as deleted
    const { error: updateError } = await supabase
      .from("notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)

    if (updateError) throw updateError

    // 2. Add to trash table
    const { error: trashError } = await supabase.from("trash").insert({
      note_id: id,
      original_parent_id: note.parent_id,
      deleted_at: new Date().toISOString(),
    })

    if (trashError) throw trashError

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error moving note to trash:", error)
    return { success: false, error: "Failed to move note to trash" }
  }
}

// Restore note from trash
export async function restoreNoteFromTrash(id: string) {
  const supabase = createClient()

  try {
    // Get the original parent_id from trash
    const { data: trashItem, error: trashError } = await supabase
      .from("trash")
      .select("original_parent_id")
      .eq("note_id", id)
      .single()

    if (trashError) throw trashError

    // Begin transaction
    // 1. Update note to remove deleted_at
    const { error: updateError } = await supabase
      .from("notes")
      .update({
        deleted_at: null,
        parent_id: trashItem.original_parent_id,
      })
      .eq("id", id)

    if (updateError) throw updateError

    // 2. Remove from trash table
    const { error: deleteError } = await supabase.from("trash").delete().eq("note_id", id)

    if (deleteError) throw deleteError

    revalidatePath("/")
    revalidatePath("/trash")
    return { success: true }
  } catch (error) {
    console.error("Error restoring note from trash:", error)
    return { success: false, error: "Failed to restore note" }
  }
}

// Permanently delete note
export async function permanentlyDeleteNote(id: string) {
  const supabase = createClient()

  try {
    // Delete from trash first (to maintain referential integrity)
    const { error: trashError } = await supabase.from("trash").delete().eq("note_id", id)

    if (trashError) throw trashError

    // Then delete the note
    const { error: noteError } = await supabase.from("notes").delete().eq("id", id)

    if (noteError) throw noteError

    revalidatePath("/")
    revalidatePath("/trash")
    return { success: true }
  } catch (error) {
    console.error("Error permanently deleting note:", error)
    return { success: false, error: "Failed to delete note permanently" }
  }
}
