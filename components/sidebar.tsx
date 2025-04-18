"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown, Home, Settings, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "@/types/notes"
import { useTheme } from "next-themes"

// Modificar la interfaz SidebarProps para incluir selectedNote
interface SidebarProps {
  notes: Note[]
  trashCount: number
  onSelectNote?: (note: Note) => void
  selectedNote?: Note | null
}

// Actualizar la desestructuración de props en la definición de la función
export function Sidebar({ notes, trashCount, onSelectNote, selectedNote }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  // Filter root notes (no parent)
  const rootNotes = notes.filter((note) => !note.parent_id && !note.deleted_at)

  // Get child notes for a parent
  const getChildNotes = (parentId: string) => {
    return notes.filter((note) => note.parent_id === parentId && !note.deleted_at)
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleNoteClick = (e: React.MouseEvent, note: Note) => {
    if (onSelectNote) {
      e.preventDefault()
      onSelectNote(note)
    }
  }

  const renderNote = (note: Note, level = 0) => {
    const isFolder = note.type === "structured"
    const hasChildren = isFolder && getChildNotes(note.id).length > 0
    const isExpanded = expandedFolders[note.id]
    const children = hasChildren ? getChildNotes(note.id) : []

    return (
      <div key={note.id} className="mb-1">
        <Link
          href={onSelectNote ? "#" : `/notes/${note.id}`}
          onClick={(e) => {
            // Siempre manejar el clic para seleccionar la nota, independientemente del tipo
            if (onSelectNote) {
              e.preventDefault()
              onSelectNote(note)
            }

            // Si es una carpeta con hijos, también alternar la expansión
            if (isFolder && hasChildren && !onSelectNote) {
              toggleFolder(note.id)
            }
          }}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
            pathname === `/notes/${note.id}` || (onSelectNote && selectedNote?.id === note.id)
              ? "bg-white/20 text-white"
              : "text-white/80 hover:bg-white/10",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleFolder(note.id)
              }}
              className="p-1 rounded-sm hover:bg-white/10 text-white"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-5"></span>
          )}

          {isFolder ? (
            <>
              <FolderOpen className="h-4 w-4 text-blue-300" />
              <span className="truncate flex items-center">
                {note.title || "Untitled"}
                <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Folder</span>
              </span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-white/70" />
              <span className="truncate">{note.title || "Untitled"}</span>
            </>
          )}
        </Link>

        {isExpanded && hasChildren && (
          <div className="mt-1">{children.map((child) => renderNote(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 h-full flex flex-col backdrop-blur-lg bg-white/10 border-r border-white/20">
      <div className="p-4 border-b border-white/20">
        <Link href="/">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-300" />
            <span>Simplify Notes</span>
          </h1>
        </Link>
      </div>

      <div className="p-2">
        <Link href="/notes/new">
          <Button className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
              pathname === "/" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        <div className="mt-4 mb-2">
          <h2 className="px-2 text-xs font-semibold text-white/50 uppercase tracking-wider">My Notes</h2>
        </div>

        <div className="space-y-1">{rootNotes.map((note) => renderNote(note))}</div>
      </nav>

      <div className="p-2 border-t border-white/20 mt-auto">
        <Link
          href="/trash"
          className={cn(
            "flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm",
            pathname === "/trash" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10",
          )}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Trash</span>
          </div>
          {trashCount > 0 && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{trashCount}</span>
          )}
        </Link>

        <div className="flex items-center justify-between mt-2 px-2 py-1.5">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Settings className="h-4 w-4" />
            <span>Theme</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-white hover:bg-white/10"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
