import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Utility: Validate required fields for Expense
function validateExpenseInput(body: any) {
  const requiredFields = ["title", "category", "amount", "expenseDate"];
  for (const field of requiredFields) {
    if (!body[field]) return `Missing required field: ${field}`;
  }
  return null;
}

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: "desc" },
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch expenses." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    // Map frontend fields to backend schema
    const body = {
      title: rawBody.title || rawBody.category, // Accept either
      description: rawBody.description || null,
      category: rawBody.category,
      amount: Number(rawBody.amount),
      expenseDate: rawBody.expenseDate || rawBody.date, // Accept either
    };

    // Validate input
    const validationError = validateExpenseInput(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // Convert date string to Date object
    let expenseDate: Date;
    try {
      expenseDate = new Date(body.expenseDate);
      if (isNaN(expenseDate.getTime())) {
        throw new Error();
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid date format for expenseDate." }, { status: 400 });
    }

    // Create Expense
    const expense = await prisma.expense.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        amount: body.amount,
        expenseDate,
      },
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors if needed
    }
    console.error("Expense creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create expense." }, { status: 500 });
  }
} 