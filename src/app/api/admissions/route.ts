// app/api/admissions/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Utility: Validate required fields (after mapping)
function validateAdmissionInput(body: any) {
  const requiredStudentFields = [
    "studentName",
    "dateOfBirth",
    "gender",
    "email",
    "phone",
    "address"
  ];
  const requiredAdmissionFields = [
    "admissionDate",
    "classEnrolled",
    "section",
    "academicYear"
  ];
  for (const field of requiredStudentFields) {
    if (!body[field]) return `Missing required student field: ${field}`;
  }
  for (const field of requiredAdmissionFields) {
    if (!body[field]) return `Missing required admission field: ${field}`;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    // Map frontend fields to backend schema
    const body = {
      studentName: rawBody.studentName,
      dateOfBirth: rawBody.dateOfBirth || rawBody.dob, // Accept both
      gender: rawBody.gender,
      email: rawBody.email,
      phone: rawBody.phone,
      address: rawBody.address,
      admissionDate: rawBody.admissionDate,
      classEnrolled: rawBody.classEnrolled || rawBody.grade, // Accept both
      section: rawBody.section || "", // Default to empty string if not provided
      academicYear: rawBody.academicYear || "", // Default to empty string if not provided
      remarks: rawBody.remarks || null,
    };

    // Validate input
    const validationError = validateAdmissionInput(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // Convert date strings to Date objects
    let dateOfBirth: Date, admissionDate: Date;
    try {
      dateOfBirth = new Date(body.dateOfBirth);
      admissionDate = new Date(body.admissionDate);
      if (isNaN(dateOfBirth.getTime()) || isNaN(admissionDate.getTime())) {
        throw new Error();
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid date format for dateOfBirth or admissionDate." }, { status: 400 });
    }

    // Create Student first
    const student = await prisma.student.create({
      data: {
        studentName: body.studentName,
        dateOfBirth,
        gender: body.gender,
        email: body.email,
        phone: body.phone,
        address: body.address,
      },
    });

    // Create Admission linked to student
    const admission = await prisma.admission.create({
      data: {
        studentId: student.id,
        admissionDate,
        classEnrolled: body.classEnrolled,
        section: body.section,
        academicYear: body.academicYear,
        remarks: body.remarks,
      },
    });

    return NextResponse.json({ success: true, data: { student, admission } }, { status: 201 });
  } catch (error: any) {
    // Prisma error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint failed
        return NextResponse.json({ success: false, error: "A student with this email already exists." }, { status: 409 });
      }
    }
    console.error("Admission creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create admission." }, { status: 500 });
  }
}
