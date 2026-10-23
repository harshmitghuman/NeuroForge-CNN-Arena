import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { trainingId: string } }) {
  try {
    const { trainingId } = params

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/status/${trainingId}`)

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()

    // Return the backend response directly
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching training status:", error)
    return NextResponse.json(
      {
        status: "failed",
        message: "Failed to fetch training status",
      },
      { status: 500 },
    )
  }
}
