import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";

export function getLocale(
  c: Context<BlankEnv, "/", BlankInput>,
): string | undefined {
  return c.req.header("Accept-Language")?.split(",")[0].trim();
}
