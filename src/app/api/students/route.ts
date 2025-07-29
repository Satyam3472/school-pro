import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const students = await prisma.student.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        admission: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, studentName, fatherName, motherName, gender, address, aadhaarNumber, studentPhotoBase64, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        studentName,
        fatherName,
        motherName,
        gender,
        address,
        aadhaarNumber,
        studentPhotoBase64,
        isActive,
      },
      include: {
        admission: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        isActive: isActive,
      },
      include: {
        admission: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student status" },
      { status: 500 }
    );
  }
} 