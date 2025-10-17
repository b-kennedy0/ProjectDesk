import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function requireRole(req: any, res: any, roles: string[]) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return { authorized: false, reason: "not_logged_in" };

  const userRole = session.user?.role;
  if (!roles.includes(userRole)) {
    return { authorized: false, reason: "unauthorized" };
  }

  return { authorized: true, session };
}