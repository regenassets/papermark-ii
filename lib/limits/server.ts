/**
 * Server-side limits handler - AGPL implementation
 * Returns unlimited limits for all teams
 */

import prisma from "@/lib/prisma";
import { DEFAULT_PLAN_LIMITS } from "./constants";

/**
 * Gets limits for a team
 * In self-hosted version, always returns unlimited limits
 */
export async function getLimits({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
      users: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      plan: true,
      _count: {
        select: {
          documents: true,
          links: true,
          users: true,
          invitations: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const documentCount = team._count.documents;
  const linkCount = team._count.links;
  const userCount = team._count.users + team._count.invitations;

  // Return unlimited limits for self-hosted
  return {
    ...DEFAULT_PLAN_LIMITS,
    usage: { documents: documentCount, links: linkCount, users: userCount },
  };
}
