import { db, saveDB, logServerAudit } from "../data/db.js";
import { Student } from "../../src/types/index.js";

export class StudentService {
  static getAllStudents(): Student[] {
    return db.students;
  }

  static getStudentById(id: string): Student | undefined {
    return db.students.find(s => s.id === id);
  }

  static createStudent(data: Student, userRole: string, userName: string): Student {
    if (!data.firstName || !data.lastName || !data.email) {
      throw new Error("Missing required biographic fields");
    }

    db.students.push(data);
    saveDB(db);

    logServerAudit(
      "Student Created",
      `New SIS student record created for ${data.firstName} ${data.lastName} (${data.registrationNumber})`,
      userRole,
      userName
    );

    return data;
  }

  static updateStudent(id: string, updates: Partial<Student>, userRole: string, userName: string): Student {
    const index = db.students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error("Student not found");
    }

    const ALLOWED_FIELDS: (keyof Student)[] = [
      "firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "nationality",
      "program", "department", "cohortYear", "currentSemester", "academicStatus",
      "financialHold", "academicHold", "gpa", "cgpa", "creditsEarned", "creditsRequired",
      "advisorName", "advisorEmail", "avatarUrl", "guardianName", "guardianRelation",
      "guardianPhone", "guardianEmail"
    ];

    const sanitizedUpdates: Partial<Student> = {};
    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) {
        (sanitizedUpdates as Record<string, unknown>)[field] = updates[field];
      }
    }

    db.students[index] = { ...db.students[index], ...sanitizedUpdates };
    saveDB(db);

    logServerAudit(
      "Student Updated",
      `Student record updated for ${db.students[index].firstName} ${db.students[index].lastName}`,
      userRole,
      userName
    );

    return db.students[index];
  }
}
