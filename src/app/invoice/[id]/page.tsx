"use client"

import React, { useState, useEffect } from "react"
import Head from "next/head"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FeeItem {
  name: string
  amount: number
}

interface InvoiceData {
  logoUrl: string
  schoolName: string
  address: string
  mobileNumbers: string[]
  email: string
  receiptDate: string
  receiptNo: number
  admissionNo: number
  studentName: string
  studentClass: string
  paymentMode: string
  feeItems: FeeItem[]
}

export default function InvoicePage() {
  const params = useParams()
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!params?.id) {
        setError('Invoice ID not found')
        setLoading(false)
        return
      }

      try {
        // Fetch the fee data based on the ID
        const response = await fetch(`/api/monthly-fees/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch fee data')
        }
        
        const feeData = await response.json()
        
        // Fetch student data
        const studentResponse = await fetch(`/api/students/${feeData.studentId}`)
        if (!studentResponse.ok) {
          throw new Error('Failed to fetch student data')
        }
        
        const studentData = await studentResponse.json()
        
        // Calculate transport fee from total amount
        const tuitionFee = Number(feeData.tuitionFee);
        const admissionFee = Number(feeData.admissionFee);
        const totalAmount = Number(feeData.totalAmount);
        const transportFee = totalAmount - tuitionFee - admissionFee;
        
        // Get transport type from student admission
        const transportType = studentData.admission?.transportType || "None";

        // Create invoice data
        const invoice: InvoiceData = {
          logoUrl: "/assets/school_logo.png",
          schoolName: "Kids Life School",
          address: "Near Barhat Block, Laxmipur Jamui (BIHAR) 811313",
          mobileNumbers: ["+91 86748 14870", "+91 98765 43211"],
          email: "info@kidslifeschool.com",
          receiptDate: feeData.paidDate ? new Date(feeData.paidDate).toLocaleDateString() : new Date().toLocaleDateString(),
          receiptNo: feeData.id,
          admissionNo: feeData.studentId,
          studentName: studentData.studentName,
          studentClass: studentData.admission?.classEnrolled || "N/A",
          paymentMode: "Cash",
          feeItems: [
            {
              name: `Tuition Fee - ${getMonthName(feeData.month)} ${feeData.year}`,
              amount: tuitionFee
            },
            ...(admissionFee > 0 ? [{
              name: "Admission Fee",
              amount: admissionFee
            }] : []),
            ...(transportFee > 0 ? [{
              name: `Transport Fee (${transportType}) - ${getMonthName(feeData.month)} ${feeData.year}`,
              amount: transportFee
            }] : [])
          ]
        }
        
        setInvoiceData(invoice)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching invoice data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [params?.id])

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return months[month - 1] || "Unknown"
  }

  const handleDownloadPDF = async () => {
    if (!invoiceData) return

    try {
      // Show instructions for clean printing
      const shouldPrint = confirm(
        "To get a clean PDF without headers/footers:\n\n" +
        "1. Click OK to open print dialog\n" +
        "2. In print settings, disable 'Headers and footers'\n" +
        "3. Set margins to 'Minimum' or 'None'\n" +
        "4. Choose 'Save as PDF' as destination\n\n" +
        "Click OK to continue?"
      )
      
      if (shouldPrint) {
        window.print()
      }
    } catch (error) {
      console.error("Error printing:", error)
      alert("Failed to print. Please try using your browser's print function (Ctrl+P / Cmd+P)")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Invoice not found"}</p>
          <Link href="/dashboard/fee-management">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fee Management
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const total = invoiceData.feeItems.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <>
      <Head>
        <style>{`
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            /* Hide browser header/footer */
            @page :first {
              margin-top: 0 !important;
            }
            @page :left {
              margin-left: 0 !important;
            }
            @page :right {
              margin-right: 0 !important;
            }
            /* Hide navigation elements */
            .print\\:hidden {
              display: none !important;
            }
            /* Hide any potential headers/footers */
            header, footer, nav {
              display: none !important;
            }
            /* Ensure clean print */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            /* Remove any background colors that might interfere */
            html, body {
              background: white !important;
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with Back Button and Download */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/fee-management">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fee Management
            </Button>
          </Link>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '2rem',
            fontSize: '0.875rem'
          }}
        >
          {/* School Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1rem', 
            paddingBottom: '1rem', 
            borderBottom: '1px solid #d1d5db' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Image
                src={invoiceData.logoUrl}
                alt="School Logo"
                width={60}
                height={60}
                style={{ height: '4rem', width: '4rem', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{invoiceData.schoolName.toUpperCase()}</h1>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Shaping Minds, Building Future
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.875rem', lineHeight: '1.25rem' }}>
              <p>{invoiceData.address}</p>
              <p>Mobile: {invoiceData.mobileNumbers.join(", ")}</p>
              <p>Email: {invoiceData.email}</p>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '1rem', 
            fontWeight: '600', 
            textDecoration: 'underline', 
            marginBottom: '1.5rem' 
          }}>
            Fee Receipt
          </h2>

          {/* Student and Receipt Info */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.25rem 0', 
            fontSize: '0.875rem', 
            marginBottom: '1.5rem' 
          }}>
            <p><strong>Date:</strong> {invoiceData.receiptDate}</p>
            <p><strong>Receipt No.:</strong> {invoiceData.receiptNo}</p>
            <p><strong>Payment Mode:</strong> {invoiceData.paymentMode}</p>
            <p><strong>Student:</strong> {invoiceData.studentName}</p>
            <p><strong>Class:</strong> {invoiceData.studentClass}</p>
            <p><strong>Admission No.:</strong> {invoiceData.admissionNo}</p>
          </div>

          {/* Fee Details Table */}
          <table style={{ 
            width: '100%', 
            fontSize: '0.875rem', 
            marginBottom: '1.5rem', 
            border: '1px solid #d1d5db' 
          }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  width: '4rem', 
                  borderRight: '1px solid #d1d5db' 
                }}>Sr. #</th>
                <th style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  borderRight: '1px solid #d1d5db' 
                }}>Fee Name</th>
                <th style={{ 
                  padding: '0.5rem', 
                  textAlign: 'right' 
                }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.feeItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #d1d5db' }}>
                  <td style={{ 
                    padding: '0.5rem', 
                    borderRight: '1px solid #d1d5db' 
                  }}>{idx + 1}</td>
                  <td style={{ 
                    padding: '0.5rem', 
                    borderRight: '1px solid #d1d5db' 
                  }}>{item.name}</td>
                  <td style={{ 
                    padding: '0.5rem', 
                    textAlign: 'right' 
                  }}>₹{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start' 
          }}>
            <div style={{ 
              textAlign: 'right', 
              fontStyle: 'italic', 
              fontSize: '0.875rem', 
              marginBottom: '2rem',
              color: '#6b7280', 
              borderBottom: '1px solid #d1d5db', 
              paddingBottom: '0.25rem' 
            }}>
              (Signature of the person issuing the receipt)
            </div>

            <div style={{ 
              textAlign: 'right', 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem' 
            }}>
              Net Amount Payable: ₹{total.toLocaleString("en-IN", {
                minimumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
} 