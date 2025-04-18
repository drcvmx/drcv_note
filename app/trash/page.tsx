import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import TrashView from "@/components/trash-view"
import Image from "next/image"
import type { Note } from "@/types/notes"

export default async function TrashPage() {
  const supabase = createClient()

  // Fetch all notes for the sidebar
  const { data: notes } = await supabase.from("notes").select("*").is("deleted_at", null)

  // Fetch trash count
  const { count: trashCount } = await supabase.from("trash").select("*", { count: "exact", head: true })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Mountain landscape"
        fill
        className="object-cover fixed -z-10 opacity-20 dark:opacity-10"
        priority
      />

      <Sidebar notes={(notes as Note[]) || []} trashCount={trashCount || 0} selectedNote={null} />

      <main className="flex-1 overflow-hidden p-6">
        <TrashView />
      </main>
    </div>
  )
}
