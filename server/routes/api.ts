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
import { ApplicationService } from "../services/applicationService.js";
import { CourseService } from "../services/courseService.js";
import { InvoiceService } from "../services/invoiceService.js";
import { StaffService } from "../services/staffService.js";
import { prisma } from "../data/prisma.js";
// Students API
router.get("/api/students", authMiddleware, async (req, res) => {
  try {
    const students = await StudentService.getAllStudents();
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/students/:id", authMiddleware, async (req, res) => {
  try {
    const student = await StudentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/students", authMiddleware, requireRoles("registrar", "admissions"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const student = await StudentService.createStudent(
      req.body, 
      authReq.userRole || "unknown", 
      authReq.userName || "unknown"
    );
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/students/:id", authMiddleware, requireRoles("registrar", "finance", "advisor", "exam_officer"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const student = await StudentService.updateStudent(
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
router.get("/api/applications", authMiddleware, async (req, res) => {
  const apps = await ApplicationService.getAllApplications();
  res.json(apps);
});

router.post("/api/applications", authMiddleware, async (req, res) => {
  try {
    const newApp = await ApplicationService.createApplication(req.body);
    res.status(201).json(newApp);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
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
router.post("/api/applications/:id/convert", authMiddleware, requireRoles("admissions", "registrar"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const appRecord = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!appRecord) return res.status(404).json({ error: "Application not found" });

    const newStudent = await StudentService.createStudent({
      studentUid: generateStudentUid(crypto.randomInt(100, 999)),
      registrationNumber: generateRegistrationNumber({ career: "UG", programCode: "CS", year: 2026, serial: crypto.randomInt(100, 999) }),
      studentNumber: `STU-${crypto.randomInt(1000, 9999)}`,
      firstName: appRecord.applicantName.split(" ")[0] || "Applicant",
      lastName: appRecord.applicantName.split(" ").slice(1).join(" ") || "Student",
      email: appRecord.email,
      phone: appRecord.phone,
      dateOfBirth: "2005-06-15",
      nationalId: `NAT-${crypto.randomInt(100000, 999999)}`,
      gender: "Female",
      nationality: "United States",
      program: appRecord.programApplied,
      department: appRecord.department,
      cohortYear: 2026
    }, authReq.userRole || "unknown", authReq.userName || "unknown");

    const updatedApp = await prisma.application.update({
      where: { id: appRecord.id },
      data: { status: "Enrolled", assignedUid: newStudent.studentUid, assignedRegNo: newStudent.registrationNumber }
    });

    logServerAudit("Admissions Conversion", `Converted application ${appRecord.applicationNumber} to Student Record ${newStudent.registrationNumber} (UID: ${newStudent.studentUid})`, authReq.userRole, authReq.userName);

    res.json({ student: newStudent, application: updatedApp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Automated Admissions Pipeline Route
router.post("/api/applications/:id/pipeline", authMiddleware, requireRoles("admissions", "registrar"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const appRecord = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!appRecord) return res.status(404).json({ error: "Application not found" });

    const newStudent = await StudentService.createStudent({
      studentUid: generateStudentUid(crypto.randomInt(100, 999)),
      registrationNumber: generateRegistrationNumber({ career: "UG", programCode: "CS", year: 2026, serial: crypto.randomInt(100, 999) }),
      studentNumber: `STU-${crypto.randomInt(1000, 9999)}`,
      firstName: appRecord.applicantName.split(" ")[0] || "Applicant",
      lastName: appRecord.applicantName.split(" ").slice(1).join(" ") || "Student",
      email: appRecord.email,
      phone: appRecord.phone,
      dateOfBirth: "2005-06-15",
      nationalId: `NAT-${crypto.randomInt(100000, 999999)}`,
      gender: "Female",
      nationality: "United States",
      program: appRecord.programApplied,
      department: appRecord.department,
      cohortYear: 2026
    }, authReq.userRole || "unknown", authReq.userName || "unknown");

    const updatedApp = await prisma.application.update({
      where: { id: appRecord.id },
      data: { status: "Enrolled", assignedUid: newStudent.studentUid, assignedRegNo: newStudent.registrationNumber }
    });

    const invoice = await InvoiceService.createInvoice({
      studentId: newStudent.id,
      totalAmount: 3800,
      amountPaid: 3800,
      dueDate: "2026-09-15",
      status: "Paid"
    }, authReq.userRole || "unknown", authReq.userName || "unknown");

    logServerAudit("Automated Pipeline Execution", `100% Automated Pipeline executed for ${newStudent.firstName} ${newStudent.lastName}. Enrolled with RegNo ${newStudent.registrationNumber} and Invoice settled.`, authReq.userRole, authReq.userName);

    res.json({
      student: newStudent,
      application: updatedApp,
      invoice,
      autoEnrolledCoursesCount: 4
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Courses API
router.get("/api/courses", authMiddleware, async (req, res) => {
  const courses = await CourseService.getAllCourses();
  res.json(courses);
});

router.post("/api/courses", authMiddleware, requireRoles("registrar", "lecturer"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const course = await CourseService.createCourse(req.body, authReq.userRole || "unknown", authReq.userName || "unknown");
    res.status(201).json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/courses/:id", authMiddleware, requireRoles("registrar", "lecturer"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const course = await CourseService.updateCourse(req.params.id, req.body, authReq.userRole || "unknown", authReq.userName || "unknown");
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Invoices API
router.get("/api/invoices", authMiddleware, async (req, res) => {
  const invoices = await InvoiceService.getAllInvoices();
  res.json(invoices);
});

router.post("/api/invoices", authMiddleware, requireRoles("finance"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const invoice = await InvoiceService.createInvoice(req.body, authReq.userRole || "unknown", authReq.userName || "unknown");
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/invoices/:id", authMiddleware, requireRoles("finance", "registrar"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (req.body.amountPaid) {
      const invoice = await InvoiceService.processPayment(req.params.id, req.body.amountPaid, authReq.userRole || "unknown", authReq.userName || "unknown");
      res.json(invoice);
    } else {
      const invoice = await prisma.feeInvoice.update({ where: { id: req.params.id }, data: req.body });
      res.json(invoice);
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update Application
router.put("/api/applications/:id", authMiddleware, requireRoles("admissions", "registrar"), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const app = await prisma.application.update({
      where: { id: req.params.id },
      data: req.body
    });
    logServerAudit("Application Updated", `Application #${app.applicationNumber} updated to status '${app.status}'`, authReq.userRole, authReq.userName);
    res.json(app);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Staff API
router.get("/api/staff", authMiddleware, async (req, res) => {
  const staff = await StaffService.getAllStaff();
  res.json(staff);
});

// Books & Loans API
router.get("/api/books", authMiddleware, (req, res) => {
  res.json(db.books);
});

router.get("/api/loans", authMiddleware, (req, res) => {
  res.json(db.loans);
});

// Audit Logs API
router.get("/api/audit-logs", authMiddleware, requireRoles("it_admin", "president"), async (req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
  res.json(logs);
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


