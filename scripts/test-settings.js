const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSettings() {
  try {
    console.log('Testing settings data...');
    
    const setting = await prisma.setting.findUnique({
      where: { schoolId: 'KidsLifeSchool' },
      include: { classes: true }
    });

    if (setting) {
      console.log('✅ Settings found!');
      console.log('School Name:', setting.schoolName);
      console.log('School ID:', setting.schoolId);
      console.log('Admin Name:', setting.adminName);
      console.log('Number of classes:', setting.classes.length);
    } else {
      console.log('❌ No settings found for KidsLifeSchool');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettings(); 