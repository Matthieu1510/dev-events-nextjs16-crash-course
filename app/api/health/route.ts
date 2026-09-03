import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Temporary route to verify MongoDB connectivity.
// Visit http://localhost:3000/api/health after starting the dev server.
export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: "ok", mongodb: "connected" });
  } catch (error) {
    // Log the real error server-side only — never leak internals
    // (stack traces, DB details) to the caller of a public endpoint.
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 }
    );
  }
}
