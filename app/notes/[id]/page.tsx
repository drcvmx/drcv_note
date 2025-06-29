import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import NoteView from "@/components/note-view"
import Image from "next/image"
import type { Note } from "@/types/notes"
import { ProtectedRoute } from "@/components/protected-route"

export default async function NotePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Special case for "new" - should be handled by the /notes/new route
  if (params.id === "new") {
    notFound()
  }

  // Fetch the note
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", params.id)
    .is("deleted_at", null)
    .single()

  if (error || !note) {
    console.error("Error fetching note:", error)
    notFound()
  }

  // Fetch all notes for the sidebar
  const { data: notes } = await supabase.from("notes").select("*").is("deleted_at", null)

  // Fetch trash count
  const { count: trashCount } = await supabase.from("trash").select("*", { count: "exact", head: true })

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Mountain landscape"
          fill
          className="object-cover fixed -z-10 opacity-20 dark:opacity-10"
          priority
        />

        <Sidebar notes={(notes as Note[]) || []} trashCount={trashCount || 0} selectedNote={note as Note} />

        <main className="flex-1 overflow-hidden p-4 md:p-6 ml-0 lg:ml-64 pt-16 lg:pt-4">
          <NoteView initialNote={note as Note} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
