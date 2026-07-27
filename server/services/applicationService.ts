import { prisma } from "../data/prisma.js";
import { logServerAudit } from "../data/db.js";
import crypto from "crypto";

export class ApplicationService {
  static async getAllApplications() {
    return prisma.application.findMany();
  }

  static async createApplication(data: any) {
    const randomNum = crypto.randomInt(100, 999);
    
    const newApp = await prisma.application.create({
      data: {
        applicationNumber: `ADM-2026-${randomNum}`,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone || "+1 (555) 019-2831",
        programApplied: data.programApplied || "B.Sc. Computer Science",
        career: data.career || "UG",
        department: data.department || "School of Computing & Engineering",
        status: "Under Review",
        highSchoolGPA: data.highSchoolGPA || 3.85
      }
    });

    logServerAudit("Application Submitted", `New application submitted by ${newApp.applicantName} (${newApp.applicationNumber})`, "Public", "Applicant");

    return newApp;
  }
}
