import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import pkg from "../../package.json";
import { initPlugins } from "./extensions/commands/registry";
import {
  getOutgoingAllowlist,
  initEngines,
} from "./extensions/engines/registry";
import { initMiddlewareRegistry } from "./extensions/middleware/registry";
import { initPluginRoutes } from "./extensions/plugin-routes/registry";
import { initSearchBarActions } from "./extensions/search-bar/registry";
import { initSearchResultTabs } from "./extensions/search-result-tabs/registry";
import { initSlotPlugins } from "./extensions/slots/registry";
import { initThemes } from "./extensions/themes/registry";
import { initTransports } from "./extensions/transports/registry";
import commandsRouter from "./routes/commands";
import extensionsRouter from "./routes/extensions";
import pagesRouter from "./routes/pages";
import pluginAssetsRouter from "./routes/plugin-assets";
import pluginRoutesRouter from "./routes/plugin-routes";
import proxyRouter from "./routes/proxy";
import rateLimitRouter from "./routes/rate-limit";
import searchRouter from "./routes/search";
import searchBarRouter from "./routes/search-bar";
import settingsAuthRouter from "./routes/settings-auth";
import storeRouter from "./routes/store";
import suggestRouter from "./routes/suggest";
import swRouter from "./routes/sw";
import themesRouter from "./routes/themes";
import { setOutgoingAllowlist } from "./utils/outgoing";

const app = new Hono();

app.use("*", async (c, next) => {
  await next();
  c.res.headers.set("Referrer-Policy", "no-referrer");
  c.res.headers.set("X-Content-Type-Options", "nosniff");
});

app.use("/public/*.js", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "no-cache");
});
app.use("/public/*", serveStatic({ root: "src/" }));
app.route("/", pagesRouter);
app.route("/", searchRouter);
app.route("/", commandsRouter);
app.route("/", suggestRouter);
app.route("/", extensionsRouter);
app.route("/", settingsAuthRouter);
app.route("/", proxyRouter);
app.route("/", rateLimitRouter);
app.route("/", themesRouter);
app.route("/", pluginAssetsRouter);
app.route("/", storeRouter);
app.route("/", swRouter);
app.route("/", searchBarRouter);
app.route("/", pluginRoutesRouter);

const port = Number(process.env.DEGOOG_PORT) || 4444;

console.log(`\x1b[0m ____
/\\  _\`\\
\\ \\ \\/\\ \\     __     __     ___     ___      __
 \\ \\ \\ \\ \\  /'__\`\\ /'_ \`\\  / __\`\\  / __\`\\  /'_ \`\\
  \\ \\ \\_\\ \\/\\  __//\\ \\L\\ \\/\\ \\L\\ \\/\\ \\L\\ \\/\\ \\L\\ \\
   \\ \\____/\\ \\____\\ \\____ \\ \\____/\\ \\____/\\ \\____ \\
    \\/___/  \\/____/\\/___L\\ \\/___/  \\/___/  \\/___L\\ \\
                     /\\____/                 /\\____/
                     \\_/__/                  \\_/__/
`);
console.log("====================================================\n");

Promise.all([
  initTransports(),
  initEngines(),
  initPlugins(),
  initSlotPlugins(),
  initSearchResultTabs(),
  initSearchBarActions(),
  initPluginRoutes(),
  initMiddlewareRegistry(),
  initThemes(),
]).then(() => {
  setOutgoingAllowlist(getOutgoingAllowlist());
  Bun.serve({ port, fetch: app.fetch, idleTimeout: 120 });

  console.log(`\x1b[90mdegoog v${pkg.version}\x1b[0m`);
  console.log(`Running on http://localhost:${port}`);
});
