const fs = require('fs');
const path = require('path');

const dir = 'src/components/student';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if it doesn't have useApp
  if (!content.includes('useApp')) continue;

  // Replace import
  content = content.replace(/import\s*\{\s*useApp\s*\}\s*from\s*'[^']+AppContext';\n?/, '');

  let newImports = [];
  if (content.match(/enrollments|enrollStudentInCourse|dropStudentFromCourse|advisingNotes|addAdvisingNote/)) {
    newImports.push("import { useAcademicStore } from '../../store/academicStore';");
  }

  if (newImports.length > 0) {
    const importStr = newImports.join('\n') + '\n';
    if (content.includes('import React')) {
      content = content.replace(/(import React.*?;\n)/, '$1' + importStr);
    } else {
      content = importStr + content;
    }
  }

  content = content.replace(/const\s*\{\s*enrollments\s*\}\s*=\s*useApp\(\);/g, 'const { enrollments } = useAcademicStore();');
  content = content.replace(/const\s*\{\s*checkoutLibraryBook,\s*createInvoice\s*\}\s*=\s*useApp\(\);/g, 'const { mutateAsync: checkoutLibraryBook } = useCheckoutBook();\n  const { mutateAsync: createInvoice } = useCreateInvoice();');
  content = content.replace(/const\s*\{\s*processInvoicePayment\s*\}\s*=\s*useApp\(\);/g, 'const { mutateAsync: processInvoicePayment } = useProcessPayment();');
  content = content.replace(/const\s*\{\s*updateStudentProfile\s*\}\s*=\s*useApp\(\);/g, 'const { mutateAsync: updateStudentProfile } = useUpdateStudent();');
  content = content.replace(/const\s*\{\s*enrollments,\s*enrollStudentInCourse,\s*dropStudentFromCourse\s*\}\s*=\s*useApp\(\);/g, 'const { enrollments, enrollStudentInCourse, dropStudentFromCourse } = useAcademicStore();');
  content = content.replace(/const\s*\{\s*advisingNotes,\s*addAdvisingNote\s*\}\s*=\s*useApp\(\);/g, 'const { advisingNotes, addAdvisingNote } = useAcademicStore();');

  const needsCheckout = content.includes('useCheckoutBook');
  const needsCreateInvoice = content.includes('useCreateInvoice');
  const needsProcessPayment = content.includes('useProcessPayment');
  const needsUpdateStudent = content.includes('useUpdateStudent');

  let apiImports = [];
  if (needsCheckout) apiImports.push('useCheckoutBook');
  if (needsCreateInvoice) apiImports.push('useCreateInvoice');
  if (needsProcessPayment) apiImports.push('useProcessPayment');
  if (needsUpdateStudent) apiImports.push('useUpdateStudent');

  if (apiImports.length > 0) {
    const apiImportRegex = /import\s*\{([^}]+)\}\s*from\s*'..\/..\/hooks\/api';/;
    const match = content.match(apiImportRegex);
    if (match) {
      const existing = match[1].split(',').map(s => s.trim());
      for (const newImp of apiImports) {
        if (!existing.includes(newImp)) existing.push(newImp);
      }
      content = content.replace(apiImportRegex, `import { ${existing.join(', ')} } from '../../hooks/api';`);
    } else {
      content = `import { ${apiImports.join(', ')} } from '../../hooks/api';\n` + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Done refactoring student components');
