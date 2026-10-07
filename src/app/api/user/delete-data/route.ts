import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dataStore } from "@/lib/data";

const DeleteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = DeleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const { count } = await dataStore.deleteUserData(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all records associated with ${normalizedEmail}.`,
      deletedCount: count,
    });
  } catch (error) {
    console.error("Delete user data error:", error);
    return NextResponse.json(
      { error: "Failed to erase candidate data." },
      { status: 500 }
    );
  }
}
