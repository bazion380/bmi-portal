const fs = require('fs');
const path = require('path');
const dir = 'src/components/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /const \{ mutateAsync: toggleStudentHold \} = useToggleStudentHold\(\);\n  const \{ mutateAsync: processInvoicePayment \} = useProcessPayment\(\);\n  const \{ mutateAsync: createInvoice \} = useCreateInvoice\(\);\n  const \{ mutateAsync: applyScholarshipToInvoice \} = useApplyScholarship\(\);/,
    'const { toggleStudentHold, processInvoicePayment, createInvoice, applyScholarshipToInvoice } = useApp();'
  );

  content = content.replace(
    /const \{ mutateAsync: addStaffRecord \} = useAddStaff\(\);\n  const \{ mutateAsync: updateStaffRecord \} = useUpdateStaff\(\);/,
    'const { addStaffRecord, updateStaffRecord } = useApp();'
  );

  content = content.replace(
    /const \{ enrollments, updateStudentGrade, recordAttendance \} = useAcademicStore\(\);\n  const \{ mutateAsync: logAudit \} = useLogAudit\(\);/,
    'const { enrollments, updateStudentGrade, recordAttendance, logAudit } = useApp();'
  );

  content = content.replace(
    /const \{ mutateAsync: addLibraryBook \} = useAddBook\(\);\n  const \{ mutateAsync: checkoutLibraryBook \} = useCheckoutBook\(\);\n  const \{ mutateAsync: returnLibraryBook \} = useReturnBook\(\);/,
    'const { addLibraryBook, checkoutLibraryBook, returnLibraryBook } = useApp();'
  );

  content = content.replace(
    /const \{ enrollments \} = useAcademicStore\(\);\n  const \{ mutateAsync: addCourse \} = useAddCourse\(\);\n  const \{ mutateAsync: updateCourse \} = useUpdateCourse\(\);\n  const \{ mutateAsync: deleteCourse \} = useDeleteCourse\(\);\n  const \{ mutateAsync: graduateStudent \} = useGraduateStudent\(\);\n  const \{ mutateAsync: toggleStudentHold \} = useToggleStudentHold\(\);/,
    'const { enrollments, addCourse, updateCourse, deleteCourse, graduateStudent, toggleStudentHold } = useApp();'
  );

  // Bring back useApp import if it was removed
  if (content.includes('useApp()') && !content.includes('useApp } from')) {
    content = "import { useApp } from '../../context/AppContext';\n" + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Reverted admin components mutations to useApp');
