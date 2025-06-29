"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createNote } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, FileText, FolderOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { supabase } from "@/lib/supabase"
import type { Note } from "@/types/notes"
import { ProtectedRoute } from "@/components/protected-route"

export default function NewNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"casual" | "structured">("casual")
  const [color, setColor] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [trashCount, setTrashCount] = useState(0)
  const [parentId, setParentId] = useState<string | null>(null)
  const [parentNote, setParentNote] = useState<Note | null>(null)

  // Fetch notes for sidebar and check URL parameters
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch notes
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

        // Check for parent_id in URL query params
        const parentIdParam = searchParams.get("parentId")
        if (parentIdParam) {
          setParentId(parentIdParam)

          // Fetch parent note details
          const { data: parentData, error: parentError } = await supabase
            .from("notes")
            .select("*")
            .eq("id", parentIdParam)
            .single()

          if (!parentError && parentData) {
            setParentNote(parentData)
          }
        }

        // Check for type in URL query params
        const typeParam = searchParams.get("type")
        if (typeParam === "structured") {
          setType("structured")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title || "Untitled")
      formData.append("content", content)
      formData.append("type", type)
      if (parentId) {
        formData.append("parentId", parentId)
      }
      if (color) {
        formData.append("color", color)
      }

      const result = await createNote(formData)

      if (result.success && result.data) {
        // Si es una nota casual, redirigir a home
        // Si es una nota estructurada o una subnota, redirigir a la página de la nota
        if (type === "casual" && !parentId) {
          router.push("/")
        } else {
          router.push(`/notes/${result.data.id}`)
        }
      } else {
        console.error("Failed to create note:", result.error)
        alert("Failed to create note. Please try again.")
      }
    } catch (error) {
      console.error("Error creating note:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Mountain landscape"
          fill
          className="object-cover fixed -z-10 opacity-20 dark:opacity-10"
          priority
        />

        <Sidebar notes={notes} trashCount={trashCount} selectedNote={null} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 ml-0 lg:ml-64 pt-16 lg:pt-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link
                href={parentId ? `/notes/${parentId}` : "/"}
                className="inline-flex items-center text-sm hover:underline text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {parentId ? "Back to parent note" : "Back to notes"}
              </Link>
            </div>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {type === "structured" ? (
                    <>
                      <FolderOpen className="h-5 w-5 text-blue-300" />
                      {parentId ? "Create New Subnote" : "Create New Folder"}
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 text-white" />
                      {parentId ? "Create New Subnote" : "Create New Note"}
                    </>
                  )}
                </CardTitle>
                {parentNote && (
                  <div className="text-sm text-white/70 mt-1">
                    Parent: <span className="font-medium">{parentNote.title}</span>
                  </div>
                )}
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Note title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-white">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Start writing..."
                      rows={8}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[200px]"
                    />
                  </div>

                  {!parentId && (
                    <div className="space-y-2">
                      <Label className="text-white">Note Type</Label>
                      <RadioGroup
                        value={type}
                        onValueChange={(value) => setType(value as "casual" | "structured")}
                        className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="casual" id="casual" />
                          <Label htmlFor="casual" className="text-white">
                            Casual Note
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="structured" id="structured" />
                          <Label htmlFor="structured" className="text-white">
                            Structured Note (can have sub-notes)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isSubmitting ? (
                      "Creating..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {type === "structured" ? "Create Folder" : "Create Note"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

