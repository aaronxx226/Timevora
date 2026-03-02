import { createApp } from "./_app.js";

export default async (req: any, res: any) => {
  const app = await createApp();
  return app(req, res);
};
