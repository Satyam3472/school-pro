import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const feeId = parseInt(id)
    
    if (isNaN(feeId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const monthlyFee = await prisma.monthlyFee.findUnique({
      where: { id: feeId },
      include: {
        student: {
          include: {
            admission: true
          }
        }
      }
    })

    if (!monthlyFee) {
      return NextResponse.json({ error: 'Monthly fee not found' }, { status: 404 })
    }

    return NextResponse.json(monthlyFee)
  } catch (error) {
    console.error('Error fetching monthly fee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 