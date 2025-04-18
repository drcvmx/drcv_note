"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNote, updateNote } from "@/app/actions"
import type { Note, NoteType } from "@/types/notes"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { noteColors } from "@/lib/utils"

interface NoteEditorProps {
  note?: Note
  parentId?: string | null
  notes?: Note[]
}

export function NoteEditor({ note, parentId = null, notes = [] }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [type, setType] = useState<NoteType>(note?.type || "casual")
  const [selectedParentId, setSelectedParentId] = useState(note?.parent_id || parentId)
  const [color, setColor] = useState(note?.color || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out the current note and its children from potential parents
  const potentialParents = notes.filter((n) => n.type === "structured" && n.id !== note?.id && !n.deleted_at)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("type", type)

    if (selectedParentId) {
      formData.append("parentId", selectedParentId)
    }

    if (color) {
      formData.append("color", color)
    }

    try {
      if (note) {
        // Update existing note
        formData.append("id", note.id)
        const result = await updateNote(formData)

        if (result.success) {
          toast({
            title: "Note updated",
            description: "Your note has been updated successfully.",
          })
          router.push("/")
        } else {
          throw new Error(result.error || "Failed to update note")
        }
      } else {
        // Create new note
        const result = await createNote(formData)

        if (result.success) {
          toast({
            title: "Note created",
            description: "Your note has been created successfully.",
          })
          router.push("/")
        } else {
          throw new Error(result.error || "Failed to create note")
        }
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          className="min-h-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Note Type</Label>
          <Select value={type} onValueChange={(value: NoteType) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual Note</SelectItem>
              <SelectItem value="structured">Structured Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent">Parent Note (Optional)</Label>
          <Select
            value={selectedParentId || ""}
            onValueChange={(value) => setSelectedParentId(value || null)}
            disabled={potentialParents.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent note" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Parent</SelectItem>
              {potentialParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Note Color</Label>
        <div className="flex flex-wrap gap-2">
          {noteColors.map((noteColor) => (
            <button
              key={noteColor.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === noteColor.value ? "border-primary" : "border-transparent"
              } ${noteColor.value}`}
              onClick={() => setColor(noteColor.value)}
              title={noteColor.name}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : note ? "Update Note" : "Create Note"}
        </Button>
      </div>
    </form>
  )
}
