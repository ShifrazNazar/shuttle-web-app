import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

export const runtime = "edge";

const createPostSchema = z.object({
  name: z.string().min(1, "name is required"),
});

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as z.infer<typeof createPostSchema>;
    const { name } = createPostSchema.parse(json);

    const created = await db.post.create({
      data: { name },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.issues },
        { status: 400 },
      );
    }
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
