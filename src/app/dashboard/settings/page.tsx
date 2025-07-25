'use client'
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [classes, setClasses] = useState([
    { id: 1, name: '', tuitionFee: '', admissionFee: '' }
  ]);

  const addClass = () => {
    setClasses([...classes, { id: Date.now(), name: '', tuitionFee: '', admissionFee: '' }]);
  };

  const removeClass = (id) => {
    if (classes.length > 1) {
      setClasses(classes.filter(cls => cls.id !== id));
    }
  };

  const handleClassChange = (id, field, value) => {
    setClasses(classes.map(cls => 
      cls.id === id ? { ...cls, [field]: value } : cls
    ));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg rounded-xl overflow-hidden py-0">
        <CardHeader className="bg-primary/5 py-2">
          <CardTitle className="text-3xl font-bold tracking-tight">School Settings</CardTitle>
          <p className="text-muted-foreground">Manage your school's profile, classes, and fees</p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form className="space-y-8">
            {/* School Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">School Information</h3>
              <Separator />
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolLogo">School Logo</Label>
                  <Input id="schoolLogo" name="schoolLogo" type="file" accept="image/*" className="cursor-pointer" />
                  <p className="text-sm text-muted-foreground">Recommended size: 200x200 pixels</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name*</Label>
                  <Input id="schoolName" name="schoolName" type="text" placeholder="Enter school name" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input id="slogan" name="slogan" type="text" placeholder="Enter school slogan" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolId">School ID*</Label>
                  <Input id="schoolId" name="schoolId" type="text" placeholder="Enter school ID" required />
                </div>
              </div>
            </div>
            
            {/* Classes and Fees Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Classes & Fees</h3>
                <Button 
                  type="button" 
                  onClick={addClass}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Class
                </Button>
              </div>
              <Separator />
              
              <div className="space-y-4">
                {classes.map((cls, index) => (
                  <div key={cls.id} className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end border rounded-lg p-4">
                    <div className="sm:col-span-4 space-y-2">
                      <Label htmlFor={`className-${cls.id}`}>Class Name*</Label>
                      <Input
                        id={`className-${cls.id}`}
                        value={cls.name}
                        onChange={(e) => handleClassChange(cls.id, 'name', e.target.value)}
                        placeholder="e.g., Class 1, Grade 2"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`tuitionFee-${cls.id}`}>Tuition Fee*</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                        <Input
                          id={`tuitionFee-${cls.id}`}
                          value={cls.tuitionFee}
                          onChange={(e) => handleClassChange(cls.id, 'tuitionFee', e.target.value)}
                          type="number"
                          placeholder="0.00"
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor={`admissionFee-${cls.id}`}>Admission Fee*</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                        <Input
                          id={`admissionFee-${cls.id}`}
                          value={cls.admissionFee}
                          onChange={(e) => handleClassChange(cls.id, 'admissionFee', e.target.value)}
                          type="number"
                          placeholder="0.00"
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeClass(cls.id)}
                        disabled={classes.length <= 1}
                        className={classes.length <= 1 ? 'opacity-50' : 'text-destructive hover:text-destructive'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Administrator Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Administrator Details</h3>
              <Separator />
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Name*</Label>
                  <Input id="adminName" name="adminName" type="text" placeholder="Enter admin name" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email*</Label>
                  <Input id="adminEmail" name="adminEmail" type="email" placeholder="Enter admin email" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminImage">Admin Image</Label>
                  <Input id="adminImage" name="adminImage" type="file" accept="image/*" className="cursor-pointer" />
                  <p className="text-sm text-muted-foreground">Optional profile picture</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password*</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter password" required />
                  <p className="text-sm text-muted-foreground">Minimum 8 characters</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full sm:w-auto px-8 py-4 text-lg">
                Save All Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}