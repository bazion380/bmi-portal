import { prisma } from "../data/prisma.js";
import { Student } from "../../src/types/index.js";
import { logServerAudit } from "../data/db.js";

export class StudentService {
  static async getAllStudents() {
    return prisma.student.findMany();
  }

  static async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id }
    });
  }

  static async createStudent(data: any, userRole: string, userName: string) {
    if (!data.firstName || !data.lastName || !data.email || !data.nationalId || !data.gender || !data.nationality || !data.program || !data.department || !data.dateOfBirth) {
      throw new Error("Missing required biographic fields");
    }

    const student = await prisma.student.create({
      data: {
        studentUid: data.studentUid,
        registrationNumber: data.registrationNumber,
        studentNumber: data.studentNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        nationalId: data.nationalId,
        gender: data.gender,
        nationality: data.nationality,
        career: data.career || 'UG',
        program: data.program,
        department: data.department,
        cohortYear: data.cohortYear,
        currentSemester: data.currentSemester || 1,
        academicStatus: data.academicStatus || 'Active',
      }
    });

    logServerAudit(
      "Student Created",
      `New SIS student record created for ${student.firstName} ${student.lastName} (${student.registrationNumber})`,
      userRole,
      userName
    );

    return student;
  }

  static async updateStudent(id: string, updates: any, userRole: string, userName: string) {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Student not found");
    }

    const ALLOWED_FIELDS = [
      "firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "nationality",
      "program", "department", "cohortYear", "currentSemester", "academicStatus",
      "financialHold", "academicHold", "gpa", "cgpa", "creditsEarned", "creditsRequired",
      "advisorName", "advisorEmail"
    ];

    const sanitizedUpdates: any = {};
    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) {
        if (field === 'dateOfBirth') {
          sanitizedUpdates[field] = new Date(updates[field]);
        } else {
          sanitizedUpdates[field] = updates[field];
        }
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: sanitizedUpdates
    });

    logServerAudit(
      "Student Updated",
      `Student record updated for ${student.firstName} ${student.lastName}`,
      userRole,
      userName
    );

    return student;
  }
}
