import { pgTable, serial, text, timestamp, date, uuid, decimal, pgEnum } from 'drizzle-orm/pg-core';

export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected']);

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().unique(), // Maps loosely to the Neon Auth user ID from core-db
  department: text('department').notNull(),
  jobTitle: text('job_title').notNull(),
  hireDate: date('hire_date').notNull(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: serial('id').primaryKey(),
  staffId: serial('staff_id').references(() => staff.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  reason: text('reason'),
  status: leaveStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payrollRecords = pgTable('payroll_records', {
  id: serial('id').primaryKey(),
  staffId: serial('staff_id').references(() => staff.id).notNull(),
  payPeriodStart: date('pay_period_start').notNull(),
  payPeriodEnd: date('pay_period_end').notNull(),
  baseSalary: decimal('base_salary', { precision: 10, scale: 2 }).notNull(),
  deductions: decimal('deductions', { precision: 10, scale: 2 }).default('0').notNull(),
  netPay: decimal('net_pay', { precision: 10, scale: 2 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
});
