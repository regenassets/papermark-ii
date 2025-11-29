import { NextApiRequest, NextApiResponse } from "next";

import publishFAQRoute from "@/lib/ee-stubs/conversations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await publishFAQRoute(req, res);
}
