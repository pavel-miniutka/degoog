import * as cheerio from "cheerio";
import type {
  SearchEngine,
  SearchResult,
  TimeFilter,
  EngineContext,
} from "../../types";
import { getRandomGsaAgent } from "../../utils/user-agents";
import {
  resolveGoogleTbs,
  resolveGoogleHref,
} from "../../utils/google-helpers";

export class GoogleEngine implements SearchEngine {
  name = "Google";
  bangShortcut = "g";

  async executeSearch(
    query: string,
    page: number = 1,
    timeFilter?: TimeFilter,
    context?: EngineContext,
  ): Promise<SearchResult[]> {
    const start = (page - 1) * 10;

    const params = new URLSearchParams({
      q: query,
      hl: "en",
      lr: "lang_en",
      ie: "utf8",
      oe: "utf8",
      start: String(start),
      filter: "0",
    });

    const tbs = resolveGoogleTbs(timeFilter);
    if (tbs) params.set("tbs", tbs);

    const url = `https://www.google.com/search?${params.toString()}`;
    const doFetch = context?.fetch ?? fetch;
    const response = await doFetch(url, {
      headers: {
        "User-Agent": getRandomGsaAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+",
      },
      redirect: "follow",
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $(".MjjYud").each((_, el) => {
      const titleEl = $(el).find("[role='link']").first();
      const linkEl = $(el).find("a[href]").first();
      const snippetEl = $(el).find("[data-sncf]").first();

      const title = titleEl.text().trim() || linkEl.text().trim();
      const href = resolveGoogleHref(linkEl.attr("href") || "");
      const snippet = snippetEl.text().trim();

      if (
        title &&
        href &&
        href.startsWith("http") &&
        !href.includes("google.com/search")
      ) {
        results.push({ title, url: href, snippet, source: this.name });
      }
    });

    if (results.length === 0) {
      $(".g").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href]").first();
        const snippetEl = $(el).find(".VwiC3b, [data-sncf], .IsZvec").first();

        const title = titleEl.text().trim();
        const href = resolveGoogleHref(linkEl.attr("href") || "");
        const snippet = snippetEl.text().trim();

        if (
          title &&
          href &&
          href.startsWith("http") &&
          !href.includes("google.com/search")
        ) {
          results.push({ title, url: href, snippet, source: this.name });
        }
      });
    }

    return results;
  }
}
