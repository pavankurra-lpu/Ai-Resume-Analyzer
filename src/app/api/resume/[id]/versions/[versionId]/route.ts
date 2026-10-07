import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { id, versionId } = params;
    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({
      versionId: version.id,
      content: JSON.parse(version.contentJson),
      createdAt: version.createdAt,
    });
  } catch (error) {
    console.error("Fetch version error:", error);
    return NextResponse.json(
      { error: "Failed to fetch version content" },
      { status: 500 }
    );
  }
}
