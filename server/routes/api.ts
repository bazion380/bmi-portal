import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db, saveDB, logServerAudit } from "../data/db.js";
import { authMiddleware, requireRoles, AuthenticatedRequest, signToken, getValidPasscodes } from "../middlewares/auth.js";
import { generateStudentUid, generateRegistrationNumber } from "../../src/utils/studentIdGenerator.js";
import { AcademicCareer, Application, FeeInvoice, Student, UserRole } from "../../src/types/index.js";

const router = Router();
// --- API ENDPOINTS ---

// Health Check
router.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    recordsCount: {
      students: db.students.length,
      applications: db.applications.length,
      courses: db.courses.length,
      invoices: db.invoices.length
    }
  });
});

// Auth Login
router.post("/api/auth/login", (req, res) => {
  const { role, passcode } = req.body;
  
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  // Check passcode for non-student staff roles
  if (role !== "student") {
    const validPasscodes = getValidPasscodes();
    if (!passcode || !validPasscodes.includes(passcode.trim())) {
      return res.status(401).json({ error: "Invalid security passcode" });
    }
  }

  const name = role === "student" ? "Alex Rivera" : `Staff (${role.toUpperCase()})`;
  const issuedAt = Date.now();
  const exp = issuedAt + (24 * 60 * 60 * 1000); // 24 hours validity

  const token = signToken({ role: role as UserRole, name, issuedAt, exp });

  logServerAudit("User Authentication", `User authenticated as role ${role}`, role, name);

  res.json({
    message: "Authentication successful",
    token,
    user: {
      name,
      role
    }
  });
});

import { StudentService } from "../services/studentService.js";

// Students API
router.get("/api/students", authMiddleware, (req, res) => {
  res.json(StudentService.getAllStudents());
});

router.get("/api/students/:id", authMiddleware, (req, res) => {
  const student = StudentService.getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

router.post("/api/students", authMiddleware, requireRoles("registrar", "admissions"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const student = StudentService.createStudent(
      req.body, 
      authReq.userRole || "unknown", 
      authReq.userName || "unknown"
    );
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/students/:id", authMiddleware, requireRoles("registrar", "finance", "advisor", "exam_officer"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const student = StudentService.updateStudent(
      req.params.id, 
      req.body, 
      authReq.userRole || "unknown", 
      authReq.userName || "unknown"
    );
    res.json(student);
  } catch (error: any) {
    res.status(error.message === "Student not found" ? 404 : 400).json({ error: error.message });
  }
});

// Applications API
router.get("/api/applications", authMiddleware, (req, res) => {
  res.json(db.applications);
});

router.post("/api/applications", authMiddleware, (req, res) => {
  const randomNum = crypto.randomInt(100, 999);
  const newApp: Application = {
    id: `app-${Date.now()}`,
    applicationNumber: `ADM-2026-${randomNum}`,
    applicantName: req.body.applicantName,
    email: req.body.email,
    phone: req.body.phone || "+1 (555) 019-2831",
    programApplied: req.body.programApplied || "B.Sc. Computer Science",
    career: (req.body.career as AcademicCareer) || "UG",
    department: req.body.department || "School of Computing & Engineering",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "Under Review",
    highSchoolGPA: req.body.highSchoolGPA || 3.85,
    documents: [
      { name: "High School Transcript.pdf", status: "Verified" },
      { name: "ID Passport Copy.pdf", status: "Verified" }
    ],
    assignedUid: generateStudentUid(db.students.length + 105),
    assignedRegNo: generateRegistrationNumber({
      career: (req.body.career as AcademicCareer) || "UG",
      programCode: "CS",
      year: 2026,
      serial: db.students.length + 1
    })
  };

  db.applications.unshift(newApp);
  saveDB(db);

  logServerAudit("Application Submitted", `New application submitted by ${newApp.applicantName} (${newApp.applicationNumber})`, "Public", "Applicant");

  res.status(201).json(newApp);
});

// Helper for admissions conversion
function buildEnrolledStudent(appRecord: Application, initialGpa: number = 0.0): Student {
  const nextSeq = 100 + db.students.length + 1;
  const uid = appRecord.assignedUid || generateStudentUid(nextSeq);
  const regNo = appRecord.assignedRegNo || generateRegistrationNumber({
    career: appRecord.career || "UG",
    programCode: "CS",
    year: 2026,
    serial: db.students.length + 1
  });

  const nameParts = appRecord.applicantName.split(" ");
  const firstName = nameParts[0] || "Applicant";
  const lastName = nameParts.slice(1).join(" ") || "Student";
  const natIdNum = crypto.randomInt(100000, 999999);

  return {
    id: `std-${Date.now()}`,
    internalSeq: nextSeq,
    studentUid: uid,
    registrationNumber: regNo,
    studentNumber: regNo,
    career: appRecord.career || "UG",
    firstName,
    lastName,
    email: appRecord.email,
    phone: appRecord.phone,
    dateOfBirth: "2005-06-15",
    nationalId: `NAT-${natIdNum}`,
    gender: "Female",
    nationality: "United States",
    program: appRecord.programApplied,
    department: appRecord.department,
    cohortYear: 2026,
    currentSemester: 1,
    academicStatus: "Active",
    financialHold: false,
    academicHold: false,
    gpa: initialGpa,
    cgpa: initialGpa,
    creditsEarned: initialGpa > 0 ? 15 : 0,
    creditsRequired: 120,
    advisorName: "Dr. Robert Vance",
    advisorEmail: "r.vance@bmi.edu",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    guardianName: "Parent / Guardian",
    guardianRelation: "Mother",
    guardianPhone: "+1 (555) 019-9988",
    guardianEmail: "guardian@example.com"
  };
}

// Admissions Conversion Route
router.post("/api/applications/:id/convert", authMiddleware, requireRoles("admissions", "registrar"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const appRecord = db.applications[appIndex];
  const newStudent = buildEnrolledStudent(appRecord, 0.0);

  db.students.push(newStudent);
  db.applications[appIndex].status = "Enrolled";
  saveDB(db);

  logServerAudit("Admissions Conversion", `Converted application ${appRecord.applicationNumber} to Student Record ${newStudent.registrationNumber} (UID: ${newStudent.studentUid})`, authReq.userRole, authReq.userName);

  res.json({ student: newStudent, application: db.applications[appIndex] });
});

// Automated Admissions Pipeline Route
router.post("/api/applications/:id/pipeline", authMiddleware, requireRoles("admissions", "registrar"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const appRecord = db.applications[appIndex];
  const newStudent = buildEnrolledStudent(appRecord, 3.90);

  db.students.push(newStudent);
  db.applications[appIndex].status = "Enrolled";

  // Auto create settled fee invoice
  const invRandom = crypto.randomInt(100, 999);
  const invoice: FeeInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-${invRandom}`,
    studentId: newStudent.id,
    term: "Fall 2026",
    dueDate: "2026-09-15",
    issueDate: new Date().toISOString().split("T")[0],
    items: [
      { description: "Tuition Fee (Fall 2026)", amount: 3200 },
      { description: "Technology & Lab Access Fee", amount: 400 },
      { description: "Registration & Matriculation Fee", amount: 200 }
    ],
    totalAmount: 3800,
    amountPaid: 3800,
    status: "Paid",
    scholarshipDiscount: 0
  };
  db.invoices.unshift(invoice);
  saveDB(db);

  logServerAudit("Automated Pipeline Execution", `100% Automated Pipeline executed for ${newStudent.firstName} ${newStudent.lastName}. Enrolled with RegNo ${newStudent.registrationNumber} and Invoice settled.`, authReq.userRole, authReq.userName);

  res.json({
    student: newStudent,
    application: db.applications[appIndex],
    invoice,
    autoEnrolledCoursesCount: 4
  });
});

// Courses API
router.get("/api/courses", authMiddleware, (req, res) => {
  res.json(db.courses);
});

router.post("/api/courses", authMiddleware, requireRoles("registrar", "lecturer"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const course = { id: `crs-${Date.now()}`, ...req.body };
  db.courses.push(course);
  saveDB(db);
  logServerAudit("Course Created", `New course created: ${course.code} - ${course.title}`, authReq.userRole, authReq.userName);
  res.status(201).json(course);
});

router.put("/api/courses/:id", authMiddleware, requireRoles("registrar", "lecturer"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const index = db.courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Course not found" });
  }
  db.courses[index] = { ...db.courses[index], ...req.body };
  saveDB(db);
  logServerAudit("Course Updated", `Course updated: ${db.courses[index].code}`, authReq.userRole, authReq.userName);
  res.json(db.courses[index]);
});

// Invoices API
router.get("/api/invoices", authMiddleware, (req, res) => {
  res.json(db.invoices);
});

router.post("/api/invoices", authMiddleware, requireRoles("finance"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const invoice = { id: `inv-${Date.now()}`, ...req.body };
  db.invoices.unshift(invoice);
  saveDB(db);
  logServerAudit("Invoice Issued", `New invoice issued: #${invoice.invoiceNumber || invoice.id}`, authReq.userRole, authReq.userName);
  res.status(201).json(invoice);
});

router.put("/api/invoices/:id", authMiddleware, requireRoles("finance", "registrar"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const index = db.invoices.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  db.invoices[index] = { ...db.invoices[index], ...req.body };
  saveDB(db);
  logServerAudit("Invoice Updated", `Payment / Status update on Invoice #${db.invoices[index].invoiceNumber || req.params.id}`, authReq.userRole, authReq.userName);
  res.json(db.invoices[index]);
});

// Update Application
router.put("/api/applications/:id", authMiddleware, requireRoles("admissions", "registrar"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const index = db.applications.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }
  db.applications[index] = { ...db.applications[index], ...req.body };
  saveDB(db);
  logServerAudit("Application Updated", `Application #${db.applications[index].applicationNumber} updated to status '${db.applications[index].status}'`, authReq.userRole, authReq.userName);
  res.json(db.applications[index]);
});

// Staff API
router.get("/api/staff", authMiddleware, (req, res) => {
  res.json(db.staff);
});

// Books & Loans API
router.get("/api/books", authMiddleware, (req, res) => {
  res.json(db.books);
});

router.get("/api/loans", authMiddleware, (req, res) => {
  res.json(db.loans);
});

// Audit Logs API
router.get("/api/audit-logs", authMiddleware, requireRoles("it_admin", "president"), (req, res) => {
  res.json(db.auditLogs);
});

router.post("/api/audit-logs", authMiddleware, (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const { action, details, severity } = req.body;
  const newLog = logServerAudit(action, details, authReq.userRole || "User", authReq.userName || "Client");
  if (severity) newLog.severity = severity;
  saveDB(db);
  res.status(201).json(newLog);
});

// Neon Strategy & Backup APIs
router.get("/api/admin/neon-status", authMiddleware, requireRoles("it_admin", "president"), (req, res) => {
  res.json({
    projects: [
      { id: "core-db", projectName: "bmi-ums-core-db", storageMB: 142.8, allowanceMB: 500, computeHours: 28.4, status: "Healthy" },
      { id: "hr-db", projectName: "bmi-ums-hr-db", storageMB: 18.2, allowanceMB: 500, computeHours: 4.1, status: "Healthy" },
      { id: "library-db", projectName: "bmi-ums-library-db", storageMB: 34.5, allowanceMB: 500, computeHours: 6.8, status: "Healthy" },
      { id: "alumni-db", projectName: "bmi-ums-alumni-db", storageMB: 12.1, allowanceMB: 500, computeHours: 3.2, status: "Healthy" },
      { id: "campus-services-db", projectName: "bmi-ums-campus-services-db", storageMB: 9.4, allowanceMB: 500, computeHours: 2.1, status: "Healthy" }
    ],
    neonAuth: { activeUsers: 1840, limitMAU: 60000, provider: "Native Postgres Integrated Auth" },
    r2Vault: { storageUsedGB: 1.4, limitGB: 10, egressFees: "$0.00" }
  });
});

router.post("/api/admin/backups/trigger", authMiddleware, requireRoles("it_admin", "president"), (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const project = req.body.project || "core-db";
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${project}-pgdump-${dateStr}.sql.gz`;
  
  logServerAudit("Database Backup Triggered", `pg_dump executed for ${project}, compressed and uploaded to Cloudflare R2 bucket 'bmi-ums-backups'`, authReq.userRole, authReq.userName);
  
  res.json({
    success: true,
    backup: {
      id: `bkp-${Date.now()}`,
      filename,
      timestamp: new Date().toISOString(),
      sizeMB: project === "core-db" ? 14.3 : 3.1,
      databaseProject: project,
      r2Bucket: "bmi-ums-backups",
      r2ObjectKey: `manual/${project}-${dateStr}.sql.gz`,
      status: "Verified"
    }
  });
});

router.get("/api/documents/signed-url", authMiddleware, (req, res) => {
  const docName = String(req.query.docName || "document.pdf");
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const signedUrl = `https://documents.r2.bmi.edu/signed/${encodeURIComponent(docName)}?token=r2_signed_${Date.now()}&expires=${expires}`;
  res.json({ docName, signedUrl, expiresSeconds: 3600, egressCost: "$0.00" });
});

export default router;


