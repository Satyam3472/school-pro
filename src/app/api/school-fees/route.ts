import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get session from cookies
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "No session found" }, { status: 401 })
    }

    // Verify session and get schoolId
    const session = await verifySession(sessionCookie.value)
    if (!session || !session.schoolId || typeof session.schoolId !== 'string') {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Fetch school settings with classes and transport fees
    const schoolSettings = await prisma.setting.findUnique({
      where: { schoolId: session.schoolId },
      include: {
        classes: {
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!schoolSettings) {
      return NextResponse.json({ success: false, error: "School settings not found" }, { status: 404 })
    }

    // Extract fee structure
    const feeStructure = {
      classes: schoolSettings.classes?.map((cls: any) => ({
        name: cls.name,
        tuitionFee: cls.tuitionFee,
        admissionFee: cls.admissionFee
      })) || [],
      transportFees: {
        below3: schoolSettings.transportFeeBelow3 || 0,
        between3and5: schoolSettings.transportFeeBetween3and5 || 0,
        between5and10: schoolSettings.transportFeeBetween5and10 || 0,
        above10: schoolSettings.transportFeeAbove10 || 0
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: feeStructure 
    })

  } catch (error) {
    console.error("Error fetching school fees:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch school fees" 
    }, { status: 500 })
  }
} 