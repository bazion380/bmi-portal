import { prisma } from "../data/prisma.js";
import { logServerAudit } from "../data/db.js";

export class StaffService {
  static async getAllStaff() {
    return prisma.staff.findMany();
  }

  static async createStaff(data: any, userRole: string, userName: string) {
    const staff = await prisma.staff.create({
      data: {
        role: data.role,
        name: data.name,
        email: data.email,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    logServerAudit("Staff Created", `New staff member ${staff.name} added.`, userRole, userName);
    return staff;
  }

  static async updateStaff(id: string, updates: any, userRole: string, userName: string) {
    const staff = await prisma.staff.update({
      where: { id },
      data: updates
    });

    logServerAudit("Staff Updated", `Staff member ${staff.name} updated.`, userRole, userName);
    return staff;
  }
}
