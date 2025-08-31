const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeSettings() {
  try {
    console.log('Initializing settings for KidsLifeSchool...');

    // Check if settings already exist
    const existingSetting = await prisma.setting.findUnique({
      where: { schoolId: 'KidsLifeSchool' }
    });

    if (existingSetting) {
      console.log('Settings for KidsLifeSchool already exist. Skipping...');
      return;
    }

    // Create base64 encoded images (you can replace these with actual base64 strings)
    const defaultLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const defaultAdminImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    // Sample classes data
    const classes = [
      { name: 'Nursery', tuitionFee: 400, admissionFee: 1000 },
      { name: 'LKG', tuitionFee: 400, admissionFee: 1000 },
      { name: 'UKG', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 1', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 2', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 3', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 4', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 5', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 6', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 7', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 8', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 9', tuitionFee: 400, admissionFee: 1000 },
      { name: 'Class 10', tuitionFee: 400, admissionFee: 1000 }
    ];

    // Create the setting with classes
    const setting = await prisma.setting.create({
      data: {
        schoolName: 'KidsLife School',
        schoolId: 'KidsLifeSchool',
        slogan: 'Nurturing Minds, Building Futures',
        adminName: 'Roshan Kumar',
        adminEmail: 'principal@kidslifeschool.com',
        password: 'admin123', // This should be hashed in production
        logoBase64: defaultLogoBase64,
        adminImageBase64: defaultAdminImageBase64,
        classes: {
          create: classes
        }
      },
      include: {
        classes: true
      }
    });

    console.log('Settings created successfully!');
    console.log('School ID:', setting.schoolId);
    console.log('School Name:', setting.schoolName);
    console.log('Number of classes created:', setting.classes.length);
    console.log('Classes:', setting.classes.map(c => `${c.name} - Tuition: ₹${c.tuitionFee}, Admission: ₹${c.admissionFee}`));

  } catch (error) {
    console.error('Error initializing settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeSettings(); 