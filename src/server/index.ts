import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import pkg from "../../package.json";
import { initPlugins } from "./extensions/commands/registry";
import { initUovadipasquas } from "./extensions/uovadipasqua/registry";
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
import globalRouter from "./routes";
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
app.route("/", globalRouter);

const port = Number(process.env.DEGOOG_PORT) || 4444;

const ANSI_BLUE = "\x1b[38;2;66;133;244m";
const ANSI_RED = "\x1b[38;2;234;67;53m";
const ANSI_YELLOW = "\x1b[38;2;251;188;5m";
const ANSI_GREEN = "\x1b[38;2;52;168;83m";
const ANSI_RESET = "\x1b[0m";
const ANSI_GRAY = "\x1b[90m";

console.log(
  `
   ${ANSI_BLUE}    ░██ ${ANSI_RESET} degoog ${ANSI_GRAY}${pkg.version}
  ${ANSI_BLUE}     ░██ ${ANSI_RESET} Running on ${ANSI_GRAY}http://localhost:${port} ${ANSI_RESET}${"           ".repeat(5)}\n` +
  `${ANSI_BLUE}       ░██ ${ANSI_RESET}${"           ".repeat(5)}\n` +
  `${ANSI_BLUE} ░████████ ${ANSI_RED} ░███████  ${ANSI_YELLOW} ░████████ ${ANSI_BLUE} ░███████  ${ANSI_GREEN} ░███████  ${ANSI_RED} ░████████ ${ANSI_RESET}\n` +
  `${ANSI_BLUE}░██    ░██ ${ANSI_RED}░██    ░██ ${ANSI_YELLOW}░██    ░██ ${ANSI_BLUE}░██    ░██ ${ANSI_GREEN}░██    ░██ ${ANSI_RED}░██    ░██ ${ANSI_RESET}\n` +
  `${ANSI_BLUE}░██    ░██ ${ANSI_RED}░█████████ ${ANSI_YELLOW}░██    ░██ ${ANSI_BLUE}░██    ░██ ${ANSI_GREEN}░██    ░██ ${ANSI_RED}░██    ░██ ${ANSI_RESET}\n` +
  `${ANSI_BLUE}░██    ░██ ${ANSI_RED}░██        ${ANSI_YELLOW}░██    ░██ ${ANSI_BLUE}░██    ░██ ${ANSI_GREEN}░██    ░██ ${ANSI_RED}░██    ░██ ${ANSI_RESET}\n` +
  `${ANSI_BLUE} ░████████ ${ANSI_RED} ░███████  ${ANSI_YELLOW} ░████████ ${ANSI_BLUE} ░███████  ${ANSI_GREEN} ░███████  ${ANSI_RED} ░████████ ${ANSI_RESET}\n` +
  `${"           ".repeat(2)}${ANSI_YELLOW}       ░██ ${ANSI_RESET}${"           ".repeat(2)}${ANSI_RED}       ░██ ${ANSI_RESET}\n` +
  `${"           ".repeat(2)}${ANSI_YELLOW} ░███████  ${ANSI_RESET}${"           ".repeat(2)}${ANSI_RED} ░███████  ${ANSI_RESET}

${ANSI_GRAY}█████████████████████████████████████████████████████████████████${ANSI_RESET}
 `,
);

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
  initUovadipasquas(),
]).then(() => {
  setOutgoingAllowlist(getOutgoingAllowlist());
  Bun.serve({ port, fetch: app.fetch, idleTimeout: 120 });
});
