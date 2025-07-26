import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      schoolName,
      schoolId,
      slogan,
      adminName,
      adminEmail,
      password,
      logoBase64,
      adminImageBase64,
      classes
    } = data;

    // Check if settings already exist for this school
    const existingSetting = await prisma.setting.findUnique({
      where: { schoolId },
      include: { classes: true }
    });

    let result;
    
    if (existingSetting) {
      // Update existing settings
      // First, delete existing classes
      await prisma.class.deleteMany({
        where: { settingId: existingSetting.id }
      });

      // Update the setting
      result = await prisma.setting.update({
        where: { schoolId },
        data: {
          schoolName,
          slogan,
          adminName,
          adminEmail,
          password,
          logoBase64,
          adminImageBase64,
          classes: {
            create: classes.map((cls: any) => ({
              name: cls.name,
              tuitionFee: parseFloat(cls.tuitionFee),
              admissionFee: parseFloat(cls.admissionFee)
            }))
          }
        },
        include: { classes: true }
      });
    } else {
      // Create new settings
      result = await prisma.setting.create({
        data: {
          schoolName,
          schoolId,
          slogan,
          adminName,
          adminEmail,
          password,
          logoBase64,
          adminImageBase64,
          classes: {
            create: classes.map((cls: any) => ({
              name: cls.name,
              tuitionFee: parseFloat(cls.tuitionFee),
              admissionFee: parseFloat(cls.admissionFee)
            }))
          }
        },
        include: { classes: true }
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
