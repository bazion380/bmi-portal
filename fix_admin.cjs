const fs = require('fs');
const path = require('path');
const dir = 'src/components/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // AdvisorView
  content = content.replace(
    /const \{\s*advisingNotes,\s*addAdvisingNote,\s*resolveAdvisingNote\s*\}\s*=\s*useApp\(\);/,
    'const { advisingNotes, addAdvisingNote, resolveAdvisingNote } = useAcademicStore();'
  );

  // FinanceView
  content = content.replace(
    /const \{\s*toggleStudentHold,\s*processInvoicePayment,\s*createInvoice,\s*applyScholarshipToInvoice\s*\}\s*=\s*useApp\(\);/,
    `const { mutateAsync: toggleStudentHold } = useToggleStudentHold();
  const { mutateAsync: processInvoicePayment } = useProcessPayment();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: applyScholarshipToInvoice } = useApplyScholarship();`
  );

  // HRView
  content = content.replace(
    /const \{\s*addStaffRecord,\s*updateStaffRecord\s*\}\s*=\s*useApp\(\);/,
    `const { mutateAsync: addStaffRecord } = useAddStaff();
  const { mutateAsync: updateStaffRecord } = useUpdateStaff();`
  );

  // LecturerView
  content = content.replace(
    /const \{\s*enrollments,\s*updateStudentGrade,\s*recordAttendance,\s*logAudit\s*\}\s*=\s*useApp\(\);/,
    `const { enrollments, updateStudentGrade, recordAttendance } = useAcademicStore();
  const { mutateAsync: logAudit } = useLogAudit();`
  );

  // LibrarianView
  content = content.replace(
    /const \{\s*addLibraryBook,\s*checkoutLibraryBook,\s*returnLibraryBook\s*\}\s*=\s*useApp\(\);/,
    `const { mutateAsync: addLibraryBook } = useAddBook();
  const { mutateAsync: checkoutLibraryBook } = useCheckoutBook();
  const { mutateAsync: returnLibraryBook } = useReturnBook();`
  );

  // RegistrarView
  content = content.replace(
    /const \{\s*enrollments,\s*addCourse,\s*updateCourse,\s*deleteCourse,\s*graduateStudent,\s*toggleStudentHold\s*\}\s*=\s*useApp\(\);/,
    `const { enrollments } = useAcademicStore();
  const { mutateAsync: addCourse } = useAddCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();
  const { mutateAsync: deleteCourse } = useDeleteCourse();
  const { mutateAsync: graduateStudent } = useGraduateStudent();
  const { mutateAsync: toggleStudentHold } = useToggleStudentHold();`
  );

  // Now fix imports
  let newStoreImports = [];
  if (content.includes('useAcademicStore')) newStoreImports.push('useAcademicStore');

  if (newStoreImports.length > 0 && !content.includes('import { useAcademicStore }')) {
    content = "import { useAcademicStore } from '../../store/academicStore';\n" + content;
  }

  let newApiImports = [];
  if (content.includes('useToggleStudentHold')) newApiImports.push('useToggleStudentHold');
  if (content.includes('useProcessPayment')) newApiImports.push('useProcessPayment');
  if (content.includes('useCreateInvoice')) newApiImports.push('useCreateInvoice');
  if (content.includes('useApplyScholarship')) newApiImports.push('useApplyScholarship');
  if (content.includes('useAddStaff')) newApiImports.push('useAddStaff');
  if (content.includes('useUpdateStaff')) newApiImports.push('useUpdateStaff');
  if (content.includes('useLogAudit')) newApiImports.push('useLogAudit');
  if (content.includes('useAddBook')) newApiImports.push('useAddBook');
  if (content.includes('useCheckoutBook')) newApiImports.push('useCheckoutBook');
  if (content.includes('useReturnBook')) newApiImports.push('useReturnBook');
  if (content.includes('useAddCourse')) newApiImports.push('useAddCourse');
  if (content.includes('useUpdateCourse')) newApiImports.push('useUpdateCourse');
  if (content.includes('useDeleteCourse')) newApiImports.push('useDeleteCourse');
  if (content.includes('useGraduateStudent')) newApiImports.push('useGraduateStudent');

  if (newApiImports.length > 0) {
    const apiImportRegex = /import\s*\{([^}]+)\}\s*from\s*'..\/..\/hooks\/api';/;
    const match = content.match(apiImportRegex);
    if (match) {
      const existing = match[1].split(',').map(s => s.trim());
      for (const newImp of newApiImports) {
        if (!existing.includes(newImp)) existing.push(newImp);
      }
      content = content.replace(apiImportRegex, `import { ${existing.join(', ')} } from '../../hooks/api';`);
    } else {
      content = `import { ${newApiImports.join(', ')} } from '../../hooks/api';\n` + content;
    }
  }

  // Remove useApp import if no longer used
  if (!content.includes('useApp()')) {
    content = content.replace(/import\s*\{\s*useApp\s*\}\s*from\s*'[^']+AppContext';\n?/, '');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed admin components');
