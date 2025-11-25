import { type NextRequest, NextResponse } from "next/server"
import { jamaiClient } from "@/lib/jamaibase"

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json()

    console.log("[v0] JamAI chat request:", { message, language })

    // Create a streaming response
    const stream = await jamaiClient.table.addRowStream({
      table_type: "action",
      table_id: "rental_assistant",
      data: [
        {
          user_message: message,
          language: language || "en",
        },
      ],
      reindex: null,
      concurrent: false,
    })

    const reader = stream.getReader()
    const encoder = new TextEncoder()

    // Create a readable stream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              break
            }

            // Send the chunk to the client
            if (value?.choices?.[0]?.message?.content) {
              const text = value.choices[0].message.content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
        } catch (error) {
          console.error("[v0] JamAI streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[v0] JamAI chat API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
