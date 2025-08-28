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
      { name: 'Nursery', tuitionFee: 5000, admissionFee: 2000 },
      { name: 'LKG', tuitionFee: 6000, admissionFee: 2500 },
      { name: 'UKG', tuitionFee: 7000, admissionFee: 3000 },
      { name: 'Class 1', tuitionFee: 8000, admissionFee: 3500 },
      { name: 'Class 2', tuitionFee: 8500, admissionFee: 4000 },
      { name: 'Class 3', tuitionFee: 9000, admissionFee: 4500 },
      { name: 'Class 4', tuitionFee: 9500, admissionFee: 5000 },
      { name: 'Class 5', tuitionFee: 10000, admissionFee: 5500 },
      { name: 'Class 6', tuitionFee: 11000, admissionFee: 6000 },
      { name: 'Class 7', tuitionFee: 12000, admissionFee: 6500 },
      { name: 'Class 8', tuitionFee: 13000, admissionFee: 7000 },
      { name: 'Class 9', tuitionFee: 14000, admissionFee: 7500 },
      { name: 'Class 10', tuitionFee: 15000, admissionFee: 8000 }
    ];

    // Create the setting with classes
    const setting = await prisma.setting.create({
      data: {
        schoolName: 'KidsLife School',
        schoolId: 'KidsLifeSchool',
        slogan: 'Nurturing Minds, Building Futures',
        adminName: 'Principal Smith',
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