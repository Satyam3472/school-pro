const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDefaultSettings() {
  try {
    console.log('Initializing default school settings...');

    // Check if settings already exist
    const existingSettings = await prisma.setting.findUnique({
      where: { schoolId: 'KidsLifeSchool' },
      include: { classes: true }
    });

    if (existingSettings) {
      console.log('Settings already exist for KidsLifeSchool');
      console.log('Existing classes:', existingSettings.classes.length);
      
      // If no classes exist, add them
      if (existingSettings.classes.length === 0) {
        console.log('Adding default classes...');
        
        const defaultClasses = [
          { name: 'Nursery', tuitionFee: 2000, admissionFee: 5000 },
          { name: 'LKG', tuitionFee: 2500, admissionFee: 5000 },
          { name: 'UKG', tuitionFee: 3000, admissionFee: 5000 },
          { name: 'Class 1', tuitionFee: 3500, admissionFee: 5000 },
          { name: 'Class 2', tuitionFee: 4000, admissionFee: 5000 },
          { name: 'Class 3', tuitionFee: 4500, admissionFee: 5000 },
          { name: 'Class 4', tuitionFee: 5000, admissionFee: 5000 },
          { name: 'Class 5', tuitionFee: 5500, admissionFee: 5000 },
        ];

        for (const cls of defaultClasses) {
          await prisma.class.create({
            data: {
              ...cls,
              settingId: existingSettings.id
            }
          });
        }

        console.log('Default classes added successfully!');
      } else {
        console.log('Classes already exist:');
        existingSettings.classes.forEach(cls => {
          console.log(`- ${cls.name}: Tuition ₹${cls.tuitionFee}, Admission ₹${cls.admissionFee}`);
        });
      }
      return;
    }

    // Create default settings
    const settings = await prisma.setting.create({
      data: {
        schoolName: 'Kids Life School',
        schoolId: 'KidsLifeSchool',
        slogan: 'Nurturing Minds, Building Futures',
        adminName: 'Principal',
        adminEmail: 'principal@kidslifeschool.com',
        password: 'admin123456',
        logoBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        adminImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        // Default transport fees
        transportFeeBelow3: 500,
        transportFeeBetween3and5: 800,
        transportFeeBetween5and10: 1200,
        transportFeeAbove10: 1500,
        classes: {
          create: [
            { name: 'Nursery', tuitionFee: 2000, admissionFee: 5000 },
            { name: 'LKG', tuitionFee: 2500, admissionFee: 5000 },
            { name: 'UKG', tuitionFee: 3000, admissionFee: 5000 },
            { name: 'Class 1', tuitionFee: 3500, admissionFee: 5000 },
            { name: 'Class 2', tuitionFee: 4000, admissionFee: 5000 },
            { name: 'Class 3', tuitionFee: 4500, admissionFee: 5000 },
            { name: 'Class 4', tuitionFee: 5000, admissionFee: 5000 },
            { name: 'Class 5', tuitionFee: 5500, admissionFee: 5000 },
          ]
        }
      },
      include: { classes: true }
    });

    console.log('Default settings created successfully!');
    console.log('School ID:', settings.schoolId);
    console.log('Classes created:', settings.classes.length);
    settings.classes.forEach(cls => {
      console.log(`- ${cls.name}: Tuition ₹${cls.tuitionFee}, Admission ₹${cls.admissionFee}`);
    });

  } catch (error) {
    console.error('Error initializing default settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initDefaultSettings(); 