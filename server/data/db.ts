import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  INITIAL_STUDENTS,
  INITIAL_APPLICATIONS,
  INITIAL_COURSES,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STAFF,
  INITIAL_BOOKS,
  INITIAL_LOANS
} from "../../src/data/mockData.js";
import { Application, AuditLog, FeeInvoice, Student } from "../../src/types/index.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DBData {
  students: Student[];
  applications: Application[];
  courses: any[];
  invoices: FeeInvoice[];
  auditLogs: AuditLog[];
  staff: any[];
  books: any[];
  loans: any[];
}

export function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error loading db.json, reinitializing default data:", err);
  }
  const initialData: DBData = {
    students: INITIAL_STUDENTS,
    applications: INITIAL_APPLICATIONS,
    courses: INITIAL_COURSES,
    invoices: INITIAL_INVOICES,
    auditLogs: INITIAL_AUDIT_LOGS,
    staff: INITIAL_STAFF,
    books: INITIAL_BOOKS,
    loans: INITIAL_LOANS
  };
  saveDB(initialData);
  return initialData;
}

let saveTimeout: NodeJS.Timeout | null = null;
let isWriting = false;
let pendingWrite = false;

async function writeDBAsync(data: DBData) {
  if (isWriting) {
    pendingWrite = true;
    return;
  }
  isWriting = true;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    const jsonString = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tempFile, jsonString, "utf-8");
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error("Failed to save db.json asynchronously:", err);
  } finally {
    isWriting = false;
    if (pendingWrite) {
      pendingWrite = false;
      writeDBAsync(db);
    }
  }
}

export function saveDB(data: DBData) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    writeDBAsync(data);
  }, 100);
}

export let db = loadDB();

export function logServerAudit(action: string, details: string, role: string = "System", performedBy: string = "Server API") {
  const randomSuffix = crypto.randomInt(100, 999);
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${randomSuffix}`,
    timestamp: new Date().toISOString(),
    performedBy,
    role,
    action,
    details,
    ipAddress: "127.0.0.1",
    severity: "Info"
  };
  db.auditLogs.unshift(newLog);
  saveDB(db);
  return newLog;
}
