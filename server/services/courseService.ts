import { prisma } from "../data/prisma.js";
import { logServerAudit } from "../data/db.js";

export class CourseService {
  static async getAllCourses() {
    return prisma.course.findMany();
  }

  static async createCourse(data: any, userRole: string, userName: string) {
    const course = await prisma.course.create({
      data: {
        code: data.code,
        title: data.title,
        credits: data.credits,
        department: data.department,
        level: data.level,
        capacity: data.capacity,
        instructor: data.instructor
      }
    });

    logServerAudit("Course Created", `New course ${course.code} added.`, userRole, userName);
    return course;
  }

  static async updateCourse(id: string, updates: any, userRole: string, userName: string) {
    const course = await prisma.course.update({
      where: { id },
      data: updates
    });

    logServerAudit("Course Updated", `Course ${course.code} modified.`, userRole, userName);
    return course;
  }

  static async deleteCourse(id: string, userRole: string, userName: string) {
    const course = await prisma.course.delete({ where: { id } });
    logServerAudit("Course Deleted", `Course ${course.code} removed.`, userRole, userName);
    return course;
  }
}
