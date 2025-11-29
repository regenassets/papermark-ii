/**
 * Access notification system - AGPL implementation
 * Reports denied access attempts to team administrators
 */

import { Link } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * Reports a denied access attempt to team administrators
 * This is a simplified AGPL implementation
 *
 * @param link - The link that was accessed
 * @param email - The email that was blocked
 * @param accessType - Type of access control that denied access
 */
export async function reportDeniedAccessAttempt(
  link: Partial<Link>,
  email: string,
  accessType: "global" | "allow" | "deny" = "global",
) {
  if (!link || !link.teamId) return;

  // Log the attempt for monitoring
  console.log(
    `[Access Denied] Email: ${email}, Link: ${link.id}, Type: ${accessType}`
  );

  // TODO: Implement email notification to team admins
  // For now, we just log the attempt
  // Future implementation could use Resend or other email service

  // Get team admins for potential notification
  const admins = await prisma.userTeam.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER"] },
      status: "ACTIVE",
      teamId: link.teamId,
    },
    select: {
      user: { select: { email: true, name: true } },
    },
  });

  if (admins.length > 0) {
    console.log(
      `[Access Denied] Would notify ${admins.length} admin(s):`,
      admins.map((a) => a.user?.email)
    );
  }
}
