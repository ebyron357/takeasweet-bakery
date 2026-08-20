import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  isCustomOrderStorageEnabled,
  saveCustomOrderRequest,
} from "@/server/database";
import { customOrderRequestSchema } from "@/server/custom-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isCustomOrderStorageEnabled()) {
    return NextResponse.json(
      { error: "Custom-order requests are temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const body = await request.text();
    if (body.length > 16_000) {
      return NextResponse.json(
        { error: "The request is too large." },
        { status: 413 }
      );
    }

    const payload = customOrderRequestSchema.parse(JSON.parse(body));

    // Treat filled honeypot submissions as successful without storing them.
    if (payload.website)
      return NextResponse.json({ success: true }, { status: 201 });

    await saveCustomOrderRequest(payload);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "The request body is invalid." },
        { status: 400 }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "The request is invalid." },
        { status: 400 }
      );
    }

    console.error("Custom-order request failed", error);
    return NextResponse.json(
      { error: "The request could not be submitted." },
      { status: 500 }
    );
  }
}
