const fs = require('fs');
const path = require('path');
const dir = 'src/components/student';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useAcademicStore()') && !content.includes('import { useAcademicStore }')) {
    content = "import { useAcademicStore } from '../../store/academicStore';\n" + content;
  }
  
  // Revert mutateAsync replacements for now because they break signatures.
  content = content.replace(/const \{ mutateAsync: checkoutLibraryBook \} = useCheckoutBook\(\);\n  const \{ mutateAsync: createInvoice \} = useCreateInvoice\(\);/, 'const { checkoutLibraryBook, createInvoice } = useApp();');
  content = content.replace(/const \{ mutateAsync: processInvoicePayment \} = useProcessPayment\(\);/, 'const { processInvoicePayment } = useApp();');
  content = content.replace(/const \{ mutateAsync: updateStudentProfile \} = useUpdateStudent\(\);/, 'const { updateStudentProfile } = useApp();');

  // Need to also put back the useApp import if we reverted anything.
  if (content.includes('useApp()') && !content.includes('useApp } from')) {
    content = "import { useApp } from '../../context/AppContext';\n" + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed imports');
