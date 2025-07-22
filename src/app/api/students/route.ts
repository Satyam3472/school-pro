import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all students with their admission info
    const students = await prisma.student.findMany({
      include: {
        admission: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch students." }, { status: 500 });
  }
} 