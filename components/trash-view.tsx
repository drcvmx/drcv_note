"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { restoreNoteFromTrash, permanentlyDeleteNote } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { formatDate, truncateText } from "@/lib/utils"
import { Trash2, RefreshCw } from "lucide-react"
import type { Note } from "@/types/notes"

export default function TrashView() {
  const router = useRouter()
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrashedNotes()
  }, [])

  const fetchTrashedNotes = async () => {
    setIsLoading(true)
    try {
      // Get notes that have been deleted
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })

      if (error) throw error
      setTrashedNotes(data || [])
    } catch (error) {
      console.error("Error fetching trashed notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      const result = await restoreNoteFromTrash(id)

      if (result.success) {
        // Remove from local state
        setTrashedNotes((prev) => prev.filter((note) => note.id !== id))
      } else {
        console.error("Failed to restore note:", result.error)
        alert("Failed to restore note. Please try again.")
      }
    } catch (error) {
      console.error("Error restoring note:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) {
      try {
        const result = await permanentlyDeleteNote(id)

        if (result.success) {
          // Remove from local state
          setTrashedNotes((prev) => prev.filter((note) => note.id !== id))
        } else {
          console.error("Failed to delete note:", result.error)
          alert("Failed to delete note. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting note:", error)
        alert("An error occurred. Please try again.")
      }
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Trash</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : trashedNotes.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Trash is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trashedNotes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{note.title || "Untitled"}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(note.id)} title="Restore">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(note.id)}
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{truncateText(note.content || "No content", 100)}</p>
                <div className="text-xs text-muted-foreground">Deleted: {formatDate(note.deleted_at || "")}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
