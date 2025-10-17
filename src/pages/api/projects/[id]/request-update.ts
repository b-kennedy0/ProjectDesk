import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { toast } from "react-hot-toast";

/**
 * Mock email sender.
 * Replace this with Resend, AWS SES, or Nodemailer later.
 */
async function sendEmail(to: string, subject: string, message: string) {
  console.log(`📧 Sending email to ${to}: ${subject}\n${message}`);
  // Real service integration will go here later.
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id } = req.query;
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: { students: true, collaborators: true, supervisor: true },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const recipients = [
      ...project.students.map((s) => s.email),
      ...project.collaborators.map((c) => c.email),
    ];

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No recipients to notify" });
    }

    const subject = `Progress update requested – ${project.title}`;
    const message = `
Hello,

Your supervisor (${project.supervisor?.name}) has requested a progress update 
for the project "${project.title}". 

Please log in to ProjectDesk to provide an update and flag any issues.

- ProjectDesk Team
    `;

    // Send to each recipient (mocked)
    await Promise.all(recipients.map((email) => sendEmail(email, subject, message)));

    return res.status(200).json({ message: "Update requests sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send update requests" });
  }
}