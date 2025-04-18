import { type NextRequest, NextResponse } from "next/server"
import { restoreNoteFromTrash } from "@/app/actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  const result = await restoreNoteFromTrash(id)

  if (result.success) {
    return NextResponse.redirect(new URL("/", request.url))
  } else {
    return NextResponse.redirect(new URL(`/trash?error=${result.error}`, request.url))
  }
}
