import { Hono } from "hono";
import {
  getUovadipasquaAssetPath,
  matchSearchQueryEggs,
} from "../extensions/uovadipasqua/registry";

const router = new Hono();

router.get("/api/uovadipasqua/match", (c) => {
  const query = c.req.query("q") ?? "";
  const matches = matchSearchQueryEggs(query);
  return c.json({ matches });
});

router.get("/uovadipasqua/:id/:asset", async (c) => {
  const id = c.req.param("id");
  const asset = c.req.param("asset");
  if (asset !== "script.js" && asset !== "style.css") return c.notFound();
  const filePath = getUovadipasquaAssetPath(id, asset);
  if (!filePath) return c.notFound();
  const file = Bun.file(filePath);
  if (!(await file.exists())) return c.notFound();
  c.header(
    "Content-Type",
    asset === "script.js" ? "application/javascript" : "text/css",
  );
  c.header("Cache-Control", "no-cache");
  return c.body(await file.arrayBuffer());
});

export default router;
