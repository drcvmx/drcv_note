import Link from "next/link"
import { FileText, FolderOpen } from "lucide-react"
import { formatDate, truncateText, getColorClass } from "@/lib/utils"
import type { Note } from "@/types/notes"

interface NoteCardProps {
  note: Note
  isChild?: boolean
}

export function NoteCard({ note, isChild = false }: NoteCardProps) {
  const isFolder = note.type === "structured"
  const colorClass = getColorClass(note.color)

  return (
    <Link href={`/notes/${note.id}`}>
      <div
        className={`${colorClass} backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
          isChild ? "ml-4 border-l-4 border-l-blue-300" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isFolder ? (
              <FolderOpen className="h-4 w-4 text-blue-300 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-white/70 flex-shrink-0" />
            )}
            <h3 className="font-medium truncate text-white">{note.title || "Untitled"}</h3>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-3 line-clamp-2">{truncateText(note.content || "No content", 100)}</p>

        <div className="text-xs text-white/50">Updated: {formatDate(note.updated_at)}</div>
      </div>
    </Link>
  )
}
