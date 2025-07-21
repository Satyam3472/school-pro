// app/api/admissions/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newAdmission = await prisma.admission.create({
      data: {
        studentName: body.studentName,
        dob: new Date(body.dob),
        gender: body.gender,
        grade: body.grade,
        parentName: body.parentName,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        admissionDate: new Date(body.admissionDate),
      },
    });

    return NextResponse.json({ success: true, data: newAdmission });
  } catch (error) {
    console.error("Admission creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create admission." }, { status: 500 });
  }
}
