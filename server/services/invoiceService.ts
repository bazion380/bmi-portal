import { prisma } from "../data/prisma.js";
import { logServerAudit } from "../data/db.js";
import crypto from "crypto";

export class InvoiceService {
  static async getAllInvoices() {
    return prisma.feeInvoice.findMany({ include: { student: true } });
  }

  static async createInvoice(data: any, userRole: string, userName: string) {
    const invRandom = crypto.randomInt(100, 999);
    const invoice = await prisma.feeInvoice.create({
      data: {
        invoiceNumber: `INV-${new Date().getFullYear()}-${invRandom}`,
        studentId: data.studentId,
        term: data.term || "Fall 2026",
        dueDate: new Date(data.dueDate),
        totalAmount: data.totalAmount,
        amountPaid: data.amountPaid || 0,
        scholarshipDiscount: data.scholarshipDiscount || 0,
        status: data.status || "Unpaid",
        items: data.items || []
      }
    });

    logServerAudit("Invoice Generated", `New invoice ${invoice.invoiceNumber} created for student ${data.studentId}.`, userRole, userName);
    return invoice;
  }

  static async processPayment(id: string, amount: number, userRole: string, userName: string) {
    const invoice = await prisma.feeInvoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");

    const newPaid = invoice.amountPaid + amount;
    const netDue = invoice.totalAmount - invoice.scholarshipDiscount;
    let status = invoice.status;
    
    if (newPaid >= netDue) status = "Paid";
    else if (newPaid > 0) status = "Partial";

    const updated = await prisma.feeInvoice.update({
      where: { id },
      data: { amountPaid: newPaid, status }
    });

    logServerAudit("Payment Processed", `Payment of $${amount} applied to invoice ${updated.invoiceNumber}.`, userRole, userName);
    return updated;
  }
}
