import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { FeeStatus } from "@prisma/client";

// GET - Fetch monthly fees for a student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const year = searchParams.get('year');

    // If no studentId provided, return all monthly fees
    if (!studentId) {
      const allMonthlyFees = await prisma.monthlyFee.findMany({
        orderBy: [
          { year: 'asc' },
          { month: 'asc' }
        ],
        include: {
          student: {
            include: {
              admission: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: allMonthlyFees,
      });
    }

    const whereClause: any = {
      studentId: parseInt(studentId),
    };

    if (year) {
      whereClause.year = parseInt(year);
    }

    const monthlyFees = await prisma.monthlyFee.findMany({
      where: whereClause,
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ],
      include: {
        student: {
          include: {
            admission: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: monthlyFees,
    });
  } catch (error) {
    console.error("Error fetching monthly fees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monthly fees" },
      { status: 500 }
    );
  }
}

// POST - Create monthly fees for a student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, academicYear } = body;

    if (!studentId || !academicYear) {
      return NextResponse.json(
        { success: false, error: "Student ID and Academic Year are required" },
        { status: 400 }
      );
    }

    // Get student and admission details
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: {
        admission: true
      }
    });

    if (!student || !student.admission) {
      return NextResponse.json(
        { success: false, error: "Student or admission not found" },
        { status: 404 }
      );
    }

    // Get class fees from settings
    const settings = await prisma.setting.findFirst({
      where: { schoolId: "KidsLifeSchool" },
      include: {
        classes: true
      }
    });

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "School settings not found" },
        { status: 404 }
      );
    }

    const classFee = settings.classes.find(
      cls => cls.name === student.admission!.classEnrolled
    );

    if (!classFee) {
      return NextResponse.json(
        { success: false, error: "Class fees not found" },
        { status: 404 }
      );
    }

    // Calculate financial year (April to March)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1;

    // Create monthly fees for the financial year
    const monthlyFees = [];
    const admissionFee = parseFloat(classFee.admissionFee.toString());
    const tuitionFee = parseFloat(classFee.tuitionFee.toString());

    for (let month = 4; month <= 12; month++) {
      const year = financialYear;
      const dueDate = new Date(year, month - 1, 15); // 15th of each month
      
      const totalAmount = month === 4 ? tuitionFee + admissionFee : tuitionFee;
      
      monthlyFees.push({
        studentId: parseInt(studentId),
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

    // Add fees for next year (January to March)
    for (let month = 1; month <= 3; month++) {
      const year = financialYear + 1;
      const dueDate = new Date(year, month - 1, 15);
      
      monthlyFees.push({
        studentId: parseInt(studentId),
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
    const createdFees = await prisma.monthlyFee.createMany({
      data: monthlyFees,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      message: "Monthly fees created successfully",
      data: createdFees
    });
  } catch (error) {
    console.error("Error creating monthly fees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create monthly fees" },
      { status: 500 }
    );
  }
}

// PUT - Update monthly fee payment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, paidAmount, status, remarks } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Monthly fee ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    
    if (status === 'PAID' && paidAmount > 0) {
      updateData.paidDate = new Date();
    }

    const updatedFee = await prisma.monthlyFee.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        student: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Monthly fee updated successfully",
      data: updatedFee
    });
  } catch (error) {
    console.error("Error updating monthly fee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update monthly fee" },
      { status: 500 }
    );
  }
} 