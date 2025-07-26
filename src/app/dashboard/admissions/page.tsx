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
import { useDashboardNav } from "../layout";
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"

const steps = ["Student Info", "Parent Info", "Address & Admission"]

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
  })
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setBreadcrumb, setPageTitle } = useDashboardNav();
  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Admissions" },
    ]);
    setPageTitle("Admissions");
  }, [setBreadcrumb, setPageTitle]);

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
                  <Label className="text-sm">Full Name</Label>
                  <Input
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={(e) => handleChange("studentName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-sm">Gender</Label>
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
                  <Label className="text-sm">Grade Applying For</Label>
                  <Select value={formData.grade} onValueChange={(v) => handleChange("grade", v)}>
                    <SelectTrigger className="text-sm w-[80%]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nursery">Nursery</SelectItem>
                      <SelectItem value="LKG">LKG</SelectItem>
                      <SelectItem value="UKG">UKG</SelectItem>
                      <SelectItem value="Class 1">Class 1</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                      <SelectItem value="Class 6">Class 6</SelectItem>
                      <SelectItem value="Class 7">Class 7</SelectItem>
                      <SelectItem value="Class 8">Class 8</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Father's Name</Label>
                  <Input
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mother's Name</Label>
                  <Input
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={(e) => handleChange("motherName", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label className="text-sm">Address</Label>
                  <Input
                    placeholder="House No, Street, Area"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    value={formData.city}
                    placeholder="City name"
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    value={formData.state}
                    placeholder="State name"
                    onChange={(e) => handleChange("state", e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Admission Date</Label>
                  <Input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleChange("admissionDate", e.target.value)}
                    required
                    className="text-sm"
                  />
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
