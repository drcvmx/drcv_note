"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, FileText, FolderOpen, FolderPlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Note } from "@/types/notes"
import { supabase } from "@/lib/supabase"
import NoteView from "@/components/note-view"

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [trashCount, setTrashCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch all notes
        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })

        if (notesError) throw notesError
        setNotes(notesData || [])

        // Fetch trash count
        const { count, error: countError } = await supabase.from("trash").select("*", { count: "exact", head: true })
        if (countError) throw countError
        setTrashCount(count || 0)

        // Si hay notas, seleccionar la primera por defecto
        if (notesData && notesData.length > 0) {
          setSelectedNote(notesData[0])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Función para actualizar la lista de notas después de editar
  const refreshNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setNotes(data || [])

      // Actualizar la nota seleccionada si existe
      if (selectedNote) {
        const updatedNote = data?.find((note) => note.id === selectedNote.id)
        if (updatedNote) {
          setSelectedNote(updatedNote)
        }
      }
    } catch (error) {
      console.error("Error refreshing notes:", error)
    }
  }

  // Get root notes (no parent)
  const rootNotes = notes.filter((note) => !note.parent_id)

  // Función para seleccionar una nota
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

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

      <Sidebar notes={notes} trashCount={trashCount} onSelectNote={handleSelectNote} selectedNote={selectedNote} />

      <main className="flex-1 overflow-y-auto p-6 bg-grid-pattern">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">My Notes</h1>
            <div className="flex gap-2">
              <Link href="/notes/new?type=structured">
                <Button className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                  <FolderPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
              </Link>
              <Link href="/notes/new">
                <Button className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Note</span>
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-white">Loading...</div>
            </div>
          ) : selectedNote ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de notas (1/3 del ancho en pantallas grandes) */}
              <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {rootNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`${
                      note.color || "bg-white/10"
                    } backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      selectedNote.id === note.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.type === "structured" ? (
                          <FolderOpen className="h-4 w-4 text-blue-300 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-white/70 flex-shrink-0" />
                        )}
                        <h3 className="font-medium truncate text-white">{note.title || "Untitled"}</h3>
                        {note.type === "structured" && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                            Folder
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{note.content || "No content"}</p>

                    <div className="text-xs text-white/50">
                      Updated: {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contenido de la nota seleccionada (2/3 del ancho en pantallas grandes) */}
              <div className="lg:col-span-2">
                <NoteView initialNote={selectedNote} onNoteUpdated={refreshNotes} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 backdrop-blur-sm bg-white/10 rounded-xl border border-white/20 shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <FileText className="h-8 w-8 text-blue-300" />
              </div>
              <h2 className="text-xl font-medium mb-2 text-white">No notes yet</h2>
              <p className="text-white/70 mb-6">Create your first note to get started</p>
              <div className="flex gap-4 justify-center">
                <Link href="/notes/new?type=structured">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Folder
                  </Button>
                </Link>
                <Link href="/notes/new">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
