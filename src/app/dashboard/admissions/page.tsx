// File: app/admission/page.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useDashboardNav, useSchoolData } from "../layout";
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"

const steps = ["Student Info", "Parent Info & Address", "Summary"]

export default function AdmissionForm() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    gender: "",
    grade: "",
    aadhaarNumber: "",
    studentPhotoBase64: "",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    admissionDate: "",
    section: "A",
    academicYear: "2025-2026",
    transportType: "None",
    regNo: "", // Registration Number field
  })
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setBreadcrumb, setPageTitle } = useDashboardNav();
  const { schoolData, loading: schoolLoading } = useSchoolData();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Admissions" },
    ]);
    setPageTitle("Admissions");
  }, [setBreadcrumb, setPageTitle]);

  // Debug schoolData
  useEffect(() => {
    console.log('Admission Form - schoolData:', schoolData);
    console.log('Admission Form - schoolLoading:', schoolLoading);
    console.log('Admission Form - classes:', schoolData?.classes);
  }, [schoolData, schoolLoading]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, studentPhotoBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const result = await res.json();
  
      if (result.success) {
        showSuccessAlert("Success", "Admission submitted successfully");
        console.log("Saved Admission:", result.data);
        setFormData({
          studentName: "",
          dob: "",
          gender: "",
          grade: "",
          aadhaarNumber: "",
          studentPhotoBase64: "",
          fatherName: "",
          motherName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          admissionDate: "",
          section: "A",
          academicYear: "2025-2026",
          transportType: "None",
          regNo: "",
        });
        setStep(0);
        router.push("/dashboard/students");
      } else {
        showErrorAlert("ERROR","Failed to submit admission.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("ERROR","Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  // Calculate monthly fees for summary
  const calculateMonthlyFees = () => {
    if (!formData.grade || !schoolData?.classes) return null;

    const selectedClass = schoolData.classes.find((cls: any) => cls.name === formData.grade);
    if (!selectedClass) return null;

    const tuitionFee = parseFloat(selectedClass.tuitionFee.toString());
    const admissionFee = parseFloat(selectedClass.admissionFee.toString());
    
    // Calculate transport fee
    let transportFee = 0;
    if (formData.transportType !== "None" && schoolData) {
      switch (formData.transportType) {
        case "Below 3KM":
          transportFee = schoolData.transportFeeBelow3 || 0;
          break;
        case "3-5KM":
          transportFee = schoolData.transportFeeBetween3and5 || 0;
          break;
        case "5-10KM":
          transportFee = schoolData.transportFeeBetween5and10 || 0;
          break;
        case "Above 10KM":
          transportFee = schoolData.transportFeeAbove10 || 0;
          break;
        default:
          transportFee = 0;
      }
    }

    // Calculate financial year (April to March)
    const admissionDate = formData.admissionDate ? new Date(formData.admissionDate) : new Date();
    const admissionYear = admissionDate.getFullYear();
    const admissionMonth = admissionDate.getMonth() + 1; // 1-12
    const financialYear = admissionMonth >= 4 ? admissionYear : admissionYear - 1;

    // Generate monthly fees from April to March
    const monthlyFees = [];
    const monthNames = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];

    for (let i = 0; i < 12; i++) {
      const month = i + 4; // Start from April (4)
      const year = month <= 12 ? financialYear : financialYear + 1;
      const monthName = monthNames[i];
      
      // Add admission fee only to the first month (April)
      const totalAmount = month === 4 ? tuitionFee + admissionFee + transportFee : tuitionFee + transportFee;
      
      monthlyFees.push({
        month: monthName,
        year: year,
        tuitionFee: tuitionFee,
        admissionFee: month === 4 ? admissionFee : 0,
        transportFee: transportFee,
        totalAmount: totalAmount
      });
    }

    return {
      classInfo: selectedClass,
      monthlyFees: monthlyFees,
      totalAnnualFee: monthlyFees.reduce((sum, fee) => sum + fee.totalAmount, 0)
    };
  };

  const feeBreakdown = calculateMonthlyFees();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">New Admission</h1>
        <p className="text-muted-foreground text-sm">Please fill all required details carefully.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-2">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`rounded-full px-3 py-1 text-xs font-medium border transition-all
              ${idx === step ? "bg-primary text-white border-primary shadow" : "bg-muted text-muted-foreground border-muted-foreground/20"}
            `}>
              Step {idx + 1}
            </div>
            {idx < steps.length - 1 && <span className="text-muted-foreground">→</span>}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="px-2">
        <Progress value={((step + 1) / steps.length) * 100} className="h-2 rounded-full" />
      </div>

      {/* Step Card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/60 rounded-t-2xl">
            <CardTitle className="text-lg font-semibold text-center">
              {steps[step]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm">Full Name *</Label>
                  <Input
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={(e) => handleChange("studentName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm">Date of Birth *</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-sm">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label className="text-sm">Class *</Label>
                  <Select value={formData.grade} onValueChange={(v) => handleChange("grade", v)} disabled={schoolLoading}>
                    <SelectTrigger className="text-sm w-[100%]">
                      <SelectValue placeholder={schoolLoading ? "Loading classes..." : "Select Class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolLoading ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : schoolData?.classes && schoolData.classes.length > 0 ? (
                        schoolData.classes.map((cls: any) => (
                          <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>No classes found. Please add classes in settings first.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {schoolLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Loading classes from settings...</p>
                  )}
                  {!schoolLoading && (!schoolData?.classes || schoolData.classes.length === 0) && (
                    <p className="text-xs text-orange-600 mt-1">No classes configured. Please add classes in Settings first.</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm">Aadhaar Number</Label>
                  <Input
                    placeholder="12-digit Aadhaar number"
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
                    maxLength={12}
                    className="text-sm"
                  />
                </div>
                <div className="relative space-y-2 md:col-span-4 flex flex-col gap-2 justify-start items-start"> 
                  <div className="flex gap-2 items-center justify-start">
                  <Label htmlFor="studentPhoto" className="text-sm">Student Photo</Label>
                  <div className="flex items-center gap-4"> 
                    <Input
                      id="studentPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('studentPhoto')?.click()} 
                      className="h-10 px-4 py-2" 
                    >
                      Upload Photo
                    </Button>
                  </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended size: <span className="font-medium">200x200 pixels</span>
                    </p>
                  </div>
                {formData.studentPhotoBase64 && (
                  <div className="mt-2 flex items-center gap-4 p-3 border rounded-md bg-muted/20"> {/* Enhanced preview container */}
                    <img
                      src={formData.studentPhotoBase64}
                      alt="Student Photo Preview"
                      className="w-20 h-20 object-cover border border-gray-300 rounded-md shadow-sm" // Slightly larger, more styled preview
                    />
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Photo Selected</span>
                      <Button
                        type="button"
                        variant="destructive" 
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, studentPhotoBase64: '' }))}
                        className="w-fit"
                      >
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              </div>
            )}

            {step === 1 && (
                <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm">Father's Name *</Label>
                  <Input
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm">Mother's Name *</Label>
                  <Input
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={(e) => handleChange("motherName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                  <div className="md:col-span-2">
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="text-sm"
                  />
                </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm">Address *</Label>
                  <Input
                    placeholder="House No, Street, Area"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                    <Label className="text-sm">City *</Label>
                  <Input
                    value={formData.city}
                    placeholder="City name"
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                    <Label className="text-sm">State *</Label>
                  <Input
                    value={formData.state}
                    placeholder="State name"
                    onChange={(e) => handleChange("state", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                  <div className="md:col-span-1">
                    <Label className="text-sm">Transport Type</Label>
                    <Select value={formData.transportType} onValueChange={(v) => handleChange("transportType", v)}>
                      <SelectTrigger className="text-sm w-[100%]">
                        <SelectValue placeholder="Select Transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Below 3KM">Below 3KM</SelectItem>
                        <SelectItem value="3-5KM">3-5KM</SelectItem>
                        <SelectItem value="5-10KM">5-10KM</SelectItem>
                        <SelectItem value="Above 10KM">Above 10KM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm">Registration Number</Label>
                    <Input
                      value={formData.regNo}
                      placeholder="Regsitration No"
                      onChange={(e) => handleChange("regNo", e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>
                <div>
                    <Label className="text-sm">Admission Date *</Label>
                  <Input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleChange("admissionDate", e.target.value)}
                    required
                    className="text-sm"
                  />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-2">Admission Summary</h3>
                  <p className="text-sm text-muted-foreground">Please review all the information before submitting</p>
                </div>

                {/* Student Information Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Student Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Full Name:</span>
                      <span className="ml-2">{formData.studentName || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date of Birth:</span>
                      <span className="ml-2">{formData.dob ? new Date(formData.dob).toLocaleDateString() : "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Gender:</span>
                      <span className="ml-2">{formData.gender || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Class:</span>
                      <span className="ml-2">{formData.grade || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Registration Number:</span>
                      <span className="ml-2">{formData.regNo || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Aadhaar Number:</span>
                      <span className="ml-2">{formData.aadhaarNumber || "Not provided"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Student Photo:</span>
                      <span className="ml-2">{formData.studentPhotoBase64 ? "✓ Uploaded" : "Not uploaded"}</span>
                    </div>
                  </div>
                </div>

                {/* Parent Information Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Parent Information & Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Father's Name:</span>
                      <span className="ml-2">{formData.fatherName || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mother's Name:</span>
                      <span className="ml-2">{formData.motherName || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone Number:</span>
                      <span className="ml-2">{formData.phone || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email Address:</span>
                      <span className="ml-2">{formData.email || "Not provided"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="ml-2">{formData.address || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">City:</span>
                      <span className="ml-2">{formData.city || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">State:</span>
                      <span className="ml-2">{formData.state || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Admission Details Summary */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Admission Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Admission Date:</span>
                      <span className="ml-2">{formData.admissionDate ? new Date(formData.admissionDate).toLocaleDateString() : "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Section:</span>
                      <span className="ml-2">{formData.section}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Academic Year:</span>
                      <span className="ml-2">{formData.academicYear}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Transport Type:</span>
                      <span className="ml-2">{formData.transportType}</span>
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown Summary */}
                {feeBreakdown && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Fee Structure & Monthly Breakdown
                    </h4>
                    
                    {/* Class Fee Information */}
                    <div className="mb-4 p-3 bg-white rounded-md border border-indigo-100">
                      <h5 className="font-medium text-indigo-700 mb-2">Class Fee Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Class:</span>
                          <span className="ml-2 text-gray-800">{formData.grade}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Tuition Fee:</span>
                          <span className="ml-2 text-gray-800">₹{feeBreakdown.classInfo.tuitionFee.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Admission Fee:</span>
                          <span className="ml-2 text-gray-800">₹{feeBreakdown.classInfo.admissionFee.toLocaleString()}</span>
                        </div>
                        {formData.transportType !== "None" && (
                          <div className="md:col-span-3">
                            <span className="font-medium text-gray-600">Transport Fee ({formData.transportType}):</span>
                            <span className="ml-2 text-gray-800">₹{feeBreakdown.monthlyFees[0].transportFee.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Monthly Fee Breakdown */}
                    <div className="mb-4">
                      <h5 className="font-medium text-indigo-700 mb-3">Monthly Fee Breakdown (April 2025 - March 2026)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {feeBreakdown.monthlyFees.map((fee, index) => (
                          <div key={index} className="bg-white p-3 rounded-md border border-indigo-100 text-sm">
                            <div className="font-medium text-indigo-600 mb-1">{fee.month} {fee.year}</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tuition:</span>
                                <span className="text-gray-800">₹{fee.tuitionFee.toLocaleString()}</span>
                              </div>
                              {fee.admissionFee > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Admission:</span>
                                  <span className="text-gray-800">₹{fee.admissionFee.toLocaleString()}</span>
                                </div>
                              )}
                              {fee.transportFee > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Transport:</span>
                                  <span className="text-gray-800">₹{fee.transportFee.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium border-t pt-1">
                                <span className="text-indigo-600">Total:</span>
                                <span className="text-indigo-800">₹{fee.totalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Annual Total */}
                    <div className="bg-indigo-100 p-3 rounded-md border border-indigo-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-indigo-800">Total Annual Fee:</span>
                        <span className="font-bold text-lg text-indigo-900">₹{feeBreakdown.totalAnnualFee.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-indigo-600 mt-1">
                        * Admission fee is charged only once in April. Transport fee applies to all months if selected.
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Summary */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Required Fields Check
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { field: "Student Name", value: formData.studentName, required: true },
                      { field: "Date of Birth", value: formData.dob, required: true },
                      { field: "Gender", value: formData.gender, required: true },
                      { field: "Class", value: formData.grade, required: true },
                      { field: "Father's Name", value: formData.fatherName, required: true },
                      { field: "Mother's Name", value: formData.motherName, required: true },
                      { field: "Phone Number", value: formData.phone, required: true },
                      { field: "Address", value: formData.address, required: true },
                      { field: "City", value: formData.city, required: true },
                      { field: "State", value: formData.state, required: true },
                      { field: "Admission Date", value: formData.admissionDate, required: true },
                    ].map((item) => (
                      <div key={item.field} className="flex items-center gap-2">
                        {item.value ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        <span className={item.value ? "text-gray-700" : "text-red-600"}>
                          {item.field} {item.required && "(Required)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 relative">
        <Button variant="ghost" onClick={prevStep} disabled={step === 0 || loading} className="rounded-full px-6">
          ⬅ Back
        </Button>
        {step === steps.length - 1 ? (
          <Button className="bg-primary text-white rounded-full px-6 flex items-center justify-center min-w-[180px]" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2">Saving...</span>
                <Skeleton className="w-5 h-5 inline-block align-middle" />
              </>
            ) : (
              <>🎉 Submit Admission</>
            )}
          </Button>
        ) : (
          <Button onClick={nextStep} className="rounded-full px-6" disabled={loading}>Next ➡</Button>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded-2xl">
            <div className="w-full">
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
