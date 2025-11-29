import { NextApiRequest, NextApiResponse } from "next";

import toggleConversationsRoute from "@/lib/ee-stubs/conversations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return toggleConversationsRoute(req, res);
}
