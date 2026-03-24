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
  resolveGoogleCustomDateTbs,
  resolveGoogleHref,
} from "../../utils/google-utils";

const _ytThumbnail = (href: string): string => {
  const match = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg` : "";
};

export class GoogleVideosEngine implements SearchEngine {
  name = "Google Videos";

  async executeSearch(
    query: string,
    page: number = 1,
    timeFilter?: TimeFilter,
    context?: EngineContext,
  ): Promise<SearchResult[]> {
    const start = (page - 1) * 20;

    const lang = context?.lang || "en";
    const params = new URLSearchParams({
      q: query,
      udm: "7",
      hl: lang,
      ie: "utf8",
      oe: "utf8",
      start: String(start),
      filter: "0",
    });

    const tbs = timeFilter === "custom"
      ? resolveGoogleCustomDateTbs(context?.dateFrom, context?.dateTo)
      : resolveGoogleTbs(timeFilter);
    if (tbs) params.set("tbs", tbs);

    const doFetch = context?.fetch ?? fetch;
    const response = await doFetch(
      `https://www.google.com/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": getRandomGsaAgent(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": context?.buildAcceptLanguage?.() ?? "en-US,en;q=0.9",
          Cookie: "CONSENT=YES+",
        },
        redirect: "follow",
      },
    );

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    $(".vG22wb").each((_, el) => {
      const titleEl = $(el).find(".ObbMBf a").first();
      const durationEl = $(el).find(".ieBN4d").first();

      const title = titleEl.text().trim();
      const href = resolveGoogleHref(titleEl.attr("href") || "");

      if (!title || !href || !href.startsWith("http") || seen.has(href)) return;
      seen.add(href);

      results.push({
        title,
        url: href,
        snippet: "",
        source: this.name,
        thumbnail: _ytThumbnail(href),
        duration: durationEl.text().trim(),
      });
    });

    if (results.length === 0) {
      $(".MjjYud").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href]").first();
        const descEl = $(el).find(".ITZIwc, [data-sncf]").first();
        const durationEl = $(el).find(".k1U36b").first();

        const title = titleEl.text().trim();
        const href = resolveGoogleHref(linkEl.attr("href") || "");

        if (
          !title ||
          !href ||
          !href.startsWith("http") ||
          href.includes("google.com/search")
        )
          return;

        results.push({
          title,
          url: href,
          snippet: descEl.text().trim(),
          source: this.name,
          thumbnail: _ytThumbnail(href),
          duration: durationEl.text().trim(),
        });
      });
    }

    return results;
  }
}
