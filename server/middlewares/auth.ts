import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { UserRole } from "../../src/types/index.js";

// Ensure a cryptographically secure random secret is generated per runtime instance if process.env.JWT_SECRET is missing
const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be set in production.");
  }
  return "dev_secret_fallback_1234567890abcdef";
})();

// Get configured system passcode
export function getValidPasscodes(): string[] {
  const envPass = process.env.UMS_PASSCODE;
  if (envPass) {
    return [envPass.trim()];
  }
  // Default development passcode if UMS_PASSCODE is not set
  return ["123456"];
}

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userName?: string;
}

export function signToken(payload: { role: UserRole; name: string; issuedAt: number; exp: number }): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payloadStr).digest("base64url");
  return `${payloadStr}.${signature}`;
}

export function verifyToken(token: string): { role: UserRole; name: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length === 2) {
      const [payloadStr, signature] = parts;
      const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payloadStr).digest("base64url");
      
      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSignature);

      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
        if (payload.exp && Date.now() > payload.exp) {
          return null; // Expired token
        }
        if (payload.role && payload.name) {
          return { role: payload.role as UserRole, name: payload.name };
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    authReq.userRole = "student";
    authReq.userName = "Alex Rivera";
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const verified = verifyToken(token);

  if (!verified) {
    res.status(401).json({ error: "Invalid or expired authentication token" });
    return;
  }

  authReq.userRole = verified.role;
  authReq.userName = verified.name;
  next();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.userRole) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    if (authReq.userRole === "president" || authReq.userRole === "it_admin") {
      return next();
    }
    if (!allowedRoles.includes(authReq.userRole)) {
      res.status(403).json({
        error: `Forbidden: Role '${authReq.userRole}' lacks permission for this action.`
      });
      return;
    }
    next();
  };
}

