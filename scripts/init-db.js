const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('Initializing database with default school settings...');

    // Create default school settings
    const defaultSettings = await prisma.setting.create({
      data: {
        schoolName: "Kids Life School",
        schoolId: "KidsLifeSchool",
        slogan: "Nurturing Minds, Building Futures",
        adminName: "School Administrator",
        adminEmail: "admin@kidslifeschool.com",
        password: "admin123",
        logoBase64: "",
        adminImageBase64: "",
        classes: {
          create: [
            {
              name: "Nursery",
              tuitionFee: 5000,
              admissionFee: 2000
            },
            {
              name: "LKG",
              tuitionFee: 5500,
              admissionFee: 2000
            },
            {
              name: "UKG",
              tuitionFee: 6000,
              admissionFee: 2000
            },
            {
              name: "Class 1",
              tuitionFee: 6500,
              admissionFee: 2500
            },
            {
              name: "Class 2",
              tuitionFee: 7000,
              admissionFee: 2500
            },
            {
              name: "Class 3",
              tuitionFee: 7500,
              admissionFee: 2500
            },
            {
              name: "Class 4",
              tuitionFee: 8000,
              admissionFee: 3000
            },
            {
              name: "Class 5",
              tuitionFee: 8500,
              admissionFee: 3000
            }
          ]
        }
      },
      include: {
        classes: true
      }
    });

    console.log('✅ Database initialized successfully!');
    console.log('School Settings:', {
      schoolName: defaultSettings.schoolName,
      schoolId: defaultSettings.schoolId,
      classesCount: defaultSettings.classes.length
    });

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase(); 