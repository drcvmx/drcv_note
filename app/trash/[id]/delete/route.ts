import { type NextRequest, NextResponse } from "next/server"
import { permanentlyDeleteNote } from "@/app/actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  const result = await permanentlyDeleteNote(id)

  if (result.success) {
    return NextResponse.redirect(new URL("/trash", request.url))
  } else {
    return NextResponse.redirect(new URL(`/trash?error=${result.error}`, request.url))
  }
}
