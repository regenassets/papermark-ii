import { NextApiRequest, NextApiResponse } from "next";

import { handleRoute } from "@/lib/ee-stubs/conversations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return handleRoute(req, res);
}
