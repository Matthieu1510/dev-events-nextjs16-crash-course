import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Temporary route to verify MongoDB connectivity.
// Visit http://localhost:3000/api/health after starting the dev server.
export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: "ok", mongodb: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
