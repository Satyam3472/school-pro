// app/api/admissions/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma, FeeStatus } from "@prisma/client";

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

// Utility: Create monthly fees for a student
async function createMonthlyFees(studentId: number, classEnrolled: string, admissionDate: Date) {
  try {
    // Get class fees from settings
    const settings = await prisma.setting.findFirst({
      where: { schoolId: "KidsLifeSchool" },
      include: {
        classes: true
      }
    });

    if (!settings) {
      console.error("School settings not found");
      return;
    }

    const classFee = settings.classes.find(cls => cls.name === classEnrolled);
    if (!classFee) {
      console.error(`Class fees not found for ${classEnrolled}`);
      return;
    }

    // Calculate financial year (April to March)
    const admissionYear = admissionDate.getFullYear();
    const admissionMonth = admissionDate.getMonth() + 1; // 1-12
    const financialYear = admissionMonth >= 4 ? admissionYear : admissionYear - 1;

    // Create exactly 12 monthly fees from April to March
    const monthlyFees = [];
    const admissionFee = parseFloat(classFee.admissionFee.toString());
    const tuitionFee = parseFloat(classFee.tuitionFee.toString());

    // Create fees for April to December of current financial year
    for (let month = 4; month <= 12; month++) {
      const year = financialYear;
      const dueDate = new Date(year, month - 1, 1); // 1st of each month
      
      // Add admission fee only to the first month (April)
      const totalAmount = month === 4 ? tuitionFee + admissionFee : tuitionFee;
      
      monthlyFees.push({
        studentId,
        month,
        year,
        tuitionFee,
        admissionFee: month === 4 ? admissionFee : 0,
        totalAmount,
        paidAmount: 0,
        dueDate,
        status: FeeStatus.PENDING
      });
    }

    // Create fees for January to March of next financial year
    for (let month = 1; month <= 3; month++) {
      const year = financialYear + 1;
      const dueDate = new Date(year, month - 1, 1); // 1st of each month
      
      monthlyFees.push({
        studentId,
        month,
        year,
        tuitionFee,
        admissionFee: 0,
        totalAmount: tuitionFee,
        paidAmount: 0,
        dueDate,
        status: FeeStatus.PENDING
      });
    }

    // Create all monthly fees
    await prisma.monthlyFee.createMany({
      data: monthlyFees,
      skipDuplicates: true
    });

    console.log(`Created ${monthlyFees.length} monthly fees for student ${studentId} (April ${financialYear} to March ${financialYear + 1})`);
  } catch (error) {
    console.error("Error creating monthly fees:", error);
  }
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
      fatherName: rawBody.fatherName,
      motherName: rawBody.motherName,
      aadhaarNumber: rawBody.aadhaarNumber,
      studentPhotoBase64: rawBody.studentPhotoBase64,
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
        fatherName: body.fatherName,
        motherName: body.motherName,
        aadhaarNumber: body.aadhaarNumber,
        studentPhotoBase64: body.studentPhotoBase64,
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

    // Create monthly fees for the student
    await createMonthlyFees(student.id, body.classEnrolled, admissionDate);

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
