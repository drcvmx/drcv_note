export type NoteType = "casual" | "structured"

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  parent_id: string | null
  deleted_at: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface NoteWithChildren extends Note {
  children?: NoteWithChildren[]
}

export interface TrashItem {
  note_id: string
  original_parent_id: string | null
  deleted_at: string
}
