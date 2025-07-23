import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma, FeeStatus } from "@prisma/client";

// Utility: Validate required fields for Fee
function validateFeeInput(body: any) {
  const requiredFields = ["studentId", "amount", "dueDate", "status"];
  for (const field of requiredFields) {
    if (!body[field]) return `Missing required field: ${field}`;
  }
  return null;
}

// Map status string to FeeStatus enum
function mapStatus(status: string): FeeStatus {
  switch ((status || "").toUpperCase()) {
    case "PAID": return FeeStatus.PAID;
    case "PARTIALLY_PAID":
    case "PARTIAL": return FeeStatus.PARTIALLY_PAID;
    case "PENDING":
    case "UNPAID": return FeeStatus.PENDING;
    default: return FeeStatus.PENDING;
  }
}

export async function GET() {
  try {
    const fees = await prisma.fee.findMany({
      include: { student: true },
      orderBy: { dueDate: "desc" },
    });
    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    console.error("Failed to fetch fees:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch fees." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    // Accept either studentId or studentName (find student by name if needed)
    let studentId = rawBody.studentId;
    if (!studentId && rawBody.student) {
      const student = await prisma.student.findFirst({ where: { studentName: rawBody.student } });
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found." }, { status: 404 });
      }
      studentId = student.id;
    }
    const body = {
      studentId,
      amount: Number(rawBody.amount),
      dueDate: rawBody.dueDate,
      paidDate: rawBody.paidDate || null,
      status: mapStatus(rawBody.status),
      remarks: rawBody.remarks || null,
    };
    // Validate input
    const validationError = validateFeeInput(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }
    // Convert date strings to Date objects
    let dueDate: Date, paidDate: Date | null = null;
    try {
      dueDate = new Date(body.dueDate);
      if (body.paidDate) paidDate = new Date(body.paidDate);
      if (isNaN(dueDate.getTime()) || (body.paidDate && paidDate && isNaN(paidDate.getTime()))) {
        throw new Error();
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid date format for dueDate or paidDate." }, { status: 400 });
    }
    // Create Fee
    const fee = await prisma.fee.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        dueDate,
        paidDate,
        status: body.status,
        remarks: body.remarks,
      },
    });
    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors if needed
    }
    console.error("Fee creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create fee record." }, { status: 500 });
  }
} 