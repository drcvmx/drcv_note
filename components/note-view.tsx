"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateNote, moveNoteToTrash } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/utils"
import { FileText, FolderOpen, Trash2, Plus, Palette, Edit, Check, X } from "lucide-react"
import type { Note } from "@/types/notes"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface NoteViewProps {
  initialNote: Note
  onNoteUpdated?: () => void
}

export default function NoteView({ initialNote, onNoteUpdated }: NoteViewProps) {
  const router = useRouter()
  const [note, setNote] = useState<Note>(initialNote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [childNotes, setChildNotes] = useState<Note[]>([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)

  const noteColors = [
    { name: "Default", value: "bg-white/10" },
    { name: "Green", value: "bg-green-500/10" },
    { name: "Blue", value: "bg-blue-500/10" },
    { name: "Purple", value: "bg-purple-500/10" },
    { name: "Yellow", value: "bg-yellow-500/10" },
    { name: "Red", value: "bg-red-500/10" },
    { name: "Pink", value: "bg-pink-500/10" },
    { name: "Orange", value: "bg-orange-500/10" },
  ]

  // Actualizar la nota cuando cambia initialNote
  useEffect(() => {
    setNote(initialNote)
    setIsEditing(false)

    // Si es una nota estructurada, cargar sus hijos
    if (initialNote.type === "structured") {
      fetchChildNotes(initialNote.id)
    } else {
      setChildNotes([])
    }
  }, [initialNote])

  // Función para obtener las notas hijas
  const fetchChildNotes = async (parentId: string) => {
    setIsLoadingChildren(true)
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("parent_id", parentId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setChildNotes(data || [])
    } catch (error) {
      console.error("Error fetching child notes:", error)
    } finally {
      setIsLoadingChildren(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNote((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("id", note.id)
      formData.append("title", note.title || "Untitled")
      formData.append("content", note.content || "")
      formData.append("color", note.color || "")

      const result = await updateNote(formData)

      if (result.success) {
        // Si es una nota estructurada, redirigir a home
        if (note.type === "structured" && !onNoteUpdated) {
          router.push("/")
        } else if (onNoteUpdated) {
          // Si estamos en la página principal, actualizar la lista de notas
          onNoteUpdated()
        }

        // Salir del modo edición
        setIsEditing(false)
      } else {
        console.error("Failed to update note:", result.error)
        alert("Failed to update note. Please try again.")
      }
    } catch (error) {
      console.error("Error updating note:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to move this note to trash?")) {
      try {
        const result = await moveNoteToTrash(note.id)

        if (result.success) {
          router.push("/")
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

  const setNoteColor = (color: string) => {
    setNote((prev) => ({ ...prev, color }))
    setShowColorPicker(false)
  }

  return (
    <Card className="h-full flex flex-col backdrop-blur-lg bg-white/10 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/20">
        <div className="flex items-center gap-2">
          {note.type === "structured" ? (
            <FolderOpen className="h-5 w-5 text-blue-300" />
          ) : (
            <FileText className="h-5 w-5 text-white" />
          )}
          <h2 className="text-lg font-semibold text-white">{note.title || "Untitled"}</h2>
          <div className="text-xs text-white/50 ml-2">Last updated: {formatDate(note.updated_at)}</div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
              title="Edit note"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(false)}
                title="Cancel editing"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSave}
                disabled={isSubmitting}
                title="Save changes"
                className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}

          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Change color"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="grid grid-cols-4 gap-2">
                {noteColors.map((color) => (
                  <div
                    key={color.value}
                    className={`w-12 h-8 rounded cursor-pointer ${color.value} border border-white/20`}
                    onClick={() => setNoteColor(color.value)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {note.type === "structured" && (
            <Link href={`/notes/new?parentId=${note.id}`}>
              <Button
                variant="outline"
                title="Add subnote"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add Subnote</span>
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            title="Move to trash"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <div className={`h-full flex flex-col p-4 ${note.color || "bg-white/5"}`}>
          {isEditing ? (
            // Modo edición
            <>
              <Input
                name="title"
                value={note.title}
                onChange={handleChange}
                placeholder="Untitled"
                className="text-xl font-semibold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50"
              />
              <Textarea
                name="content"
                value={note.content || ""}
                onChange={handleChange}
                placeholder="Start writing..."
                className="flex-1 resize-none border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[300px] text-white placeholder:text-white/50"
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="text-white">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            // Modo visualización
            <div className="flex flex-col h-full">
              <h1 className="text-2xl font-bold text-white mb-4">{note.title || "Untitled"}</h1>
              <div className="prose prose-invert max-w-none flex-1 overflow-auto">
                {note.content ? (
                  <div className="whitespace-pre-wrap text-white/90">{note.content}</div>
                ) : (
                  <div className="text-white/50 italic">No content</div>
                )}
              </div>

              {/* Mostrar subnotas si es una nota estructurada */}
              {note.type === "structured" && (
                <div className="mt-6 border-t border-white/20 pt-4">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-300" />
                    Subnotes
                  </h2>

                  {isLoadingChildren ? (
                    <div className="text-white/50 text-sm">Loading subnotes...</div>
                  ) : childNotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {childNotes.map((childNote) => (
                        <Link href={`/notes/${childNote.id}`} key={childNote.id}>
                          <div
                            className={`${childNote.color || "bg-white/10"} p-3 rounded-md border border-white/20 hover:bg-white/20 transition-colors`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3.5 w-3.5 text-white/70" />
                              <h3 className="font-medium text-sm text-white truncate">
                                {childNote.title || "Untitled"}
                              </h3>
                            </div>
                            <p className="text-xs text-white/70 line-clamp-2">{childNote.content || "No content"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/50 text-sm flex items-center gap-2">
                      <span>No subnotes yet.</span>
                      <Link href={`/notes/new?parentId=${note.id}`}>
                        <Button variant="link" className="text-blue-300 p-0 h-auto">
                          Create one
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
