import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionJwt } from "@/lib/auth-verify";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Verify the ID token using REST (no gRPC)
    const user = await verifySessionJwt(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Store the raw ID token as the session cookie (valid for 5 days)
    const expiresIn = 60 * 60 * 24 * 5;
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ active: false });
    }
    const user = await verifySessionJwt(session.value);
    if (!user) {
      return NextResponse.json({ active: false });
    }
    // Parse JWT roughly to get expiry
    const payload = JSON.parse(Buffer.from(session.value.split(".")[1], "base64").toString());
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return NextResponse.json({ active: true, expiresIn: exp - now });
  } catch {
    return NextResponse.json({ active: false });
  }
}
