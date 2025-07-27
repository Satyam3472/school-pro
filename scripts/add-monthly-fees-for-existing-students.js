const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMonthlyFeesForExistingStudents() {
  try {
    console.log('🔍 Finding students without monthly fees...\n');

    // Get all students with their admissions
    const students = await prisma.student.findMany({
      include: {
        admission: true,
        monthlyFees: true
      }
    });

    console.log(`📊 Total students found: ${students.length}`);

    // Find students without monthly fees
    const studentsWithoutFees = students.filter(student => student.monthlyFees.length === 0);
    
    console.log(`📋 Students without monthly fees: ${studentsWithoutFees.length}`);

    if (studentsWithoutFees.length === 0) {
      console.log('✅ All students already have monthly fees!');
      return;
    }

    // Get school settings for class fees
    const settings = await prisma.setting.findFirst({
      where: { schoolId: "KidsLifeSchool" },
      include: { classes: true }
    });

    if (!settings) {
      console.error("❌ School settings not found");
      return;
    }

    console.log('\n💰 Processing students without monthly fees...\n');

    let processedCount = 0;
    let errorCount = 0;

    for (const student of studentsWithoutFees) {
      try {
        if (!student.admission) {
          console.log(`⚠️  Student ${student.studentName} (ID: ${student.id}) has no admission record, skipping...`);
          continue;
        }

        console.log(`📝 Processing: ${student.studentName} (Class: ${student.admission.classEnrolled})`);

        // Find class fees
        const classFee = settings.classes.find(cls => cls.name === student.admission.classEnrolled);
        if (!classFee) {
          console.log(`❌ Class fees not found for ${student.admission.classEnrolled}, skipping...`);
          continue;
        }

        const admissionFee = parseFloat(classFee.admissionFee.toString());
        const tuitionFee = parseFloat(classFee.tuitionFee.toString());
        
        // Calculate financial year based on admission date
        const admissionDate = new Date(student.admission.admissionDate);
        const admissionYear = admissionDate.getFullYear();
        const admissionMonth = admissionDate.getMonth() + 1; // 1-12
        const financialYear = admissionMonth >= 4 ? admissionYear : admissionYear - 1;

        console.log(`   📅 Financial Year: ${financialYear}-${financialYear + 1}`);

        // Create exactly 12 monthly fees from April to March
        const monthlyFees = [];

        // Create fees for April to December of current financial year
        for (let month = 4; month <= 12; month++) {
          const dueDate = new Date(financialYear, month - 1, 1); // 1st of each month
          const totalAmount = month === 4 ? tuitionFee + admissionFee : tuitionFee;
          
          monthlyFees.push({
            studentId: student.id,
            month,
            year: financialYear,
            tuitionFee,
            admissionFee: month === 4 ? admissionFee : 0,
            totalAmount,
            paidAmount: 0,
            dueDate,
            status: 'PENDING'
          });
        }

        // Create fees for January to March of next financial year
        for (let month = 1; month <= 3; month++) {
          const dueDate = new Date(financialYear + 1, month - 1, 1); // 1st of each month
          
          monthlyFees.push({
            studentId: student.id,
            month,
            year: financialYear + 1,
            tuitionFee,
            admissionFee: 0,
            totalAmount: tuitionFee,
            paidAmount: 0,
            dueDate,
            status: 'PENDING'
          });
        }

        // Insert all monthly fees
        await prisma.monthlyFee.createMany({
          data: monthlyFees,
          skipDuplicates: true
        });

        console.log(`   ✅ Created ${monthlyFees.length} monthly fees`);
        console.log(`   💰 Fee structure: April ₹${monthlyFees[0].totalAmount} (with admission), others ₹${tuitionFee} each`);
        
        processedCount++;

      } catch (error) {
        console.error(`❌ Error processing student ${student.studentName}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully processed: ${processedCount} students`);
    console.log(`   ❌ Errors: ${errorCount} students`);
    console.log(`   📋 Total students without fees: ${studentsWithoutFees.length}`);

    if (processedCount > 0) {
      console.log('\n🎉 Monthly fees have been created for existing students!');
      console.log('💡 New admissions will automatically create monthly fees going forward.');
    }

  } catch (error) {
    console.error('❌ Error in script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMonthlyFeesForExistingStudents(); 