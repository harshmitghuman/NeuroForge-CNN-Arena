import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const model = await request.json()

    console.log("[v0] Received model for training:", model)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend error:", errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Return the backend response directly
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error calling backend:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to process model",
      },
      { status: 500 },
    )
  }
}
