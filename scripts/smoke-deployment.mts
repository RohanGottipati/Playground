import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { chromium, type Page } from "playwright";
import {
  campaignGameId,
} from "../game/templates/campaignSeed";
import { TEMPLATE_IDS, TEMPLATES } from "../game/templates";
import type { GameSpec } from "../game/types";

const MEDIA_PATTERN = /\.(?:gif|jpe?g|mp4|png|svg|webp)$/i;
const REPORT_PATH = join(process.cwd(), "test-results", "deployment-smoke.json");

type GameSummary = {
  id: string;
  slug: string;
  title: string;
  mode: string;
  difficulty: number;
  sourceImageUrl: string;
};

type GameDetail = {
  id: string;
  slug: string;
  sourceImageUrl: string;
  gameSpec: GameSpec;
};

type SmokeReport = {
  baseUrl: string;
  startedAt: string;
  finishedAt?: string;
  campaignGames: number;
  mediaAssets: number;
  httpUrls: number;
  browserGames: number;
  failures: string[];
};

function argumentValue(name: string): string | undefined {
  const exact = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalizedBaseUrl(): string {
  const raw = argumentValue("--base-url") ?? process.env.PLAYGROUND_BASE_URL;
  if (!raw) {
    throw new Error(
      "Pass --base-url <url> or set PLAYGROUND_BASE_URL for the deployment smoke test.",
    );
  }
  const url = new URL(raw);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

async function publicMediaPaths(): Promise<string[]> {
  const root = join(process.cwd(), "public");
  const files: string[] = [];

  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && MEDIA_PATTERN.test(entry.name)) files.push(path);
    }
  }

  await walk(root);
  return files
    .map((file) => `/${relative(root, file).split(sep).join("/")}`)
    .sort();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "user-agent": "playground-deployment-smoke/1.0" },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return (await response.json()) as T;
}

async function campaignSummaries(baseUrl: string): Promise<GameSummary[]> {
  const games: GameSummary[] = [];
  const pageSize = 48;
  for (let offset = 0; offset < 1_000; offset += pageSize) {
    const body = await fetchJson<{ games: GameSummary[] }>(
      `${baseUrl}/api/games?sort=campaign&limit=${pageSize}&offset=${offset}`,
    );
    games.push(...body.games);
    if (body.games.length < pageSize) return games;
  }
  throw new Error("Campaign listing exceeded the 1,000-game smoke-test limit.");
}

function referencedComponentIds(spec: GameSpec): Set<string> {
  const ids = new Set<string>();
  for (const entity of spec.entities) {
    if (entity.visual?.componentId) ids.add(entity.visual.componentId);
  }
  if (spec.projectile?.componentId) ids.add(spec.projectile.componentId);
  for (const id of spec.skyfall?.componentIds ?? []) ids.add(id);
  for (const id of spec.gauntlet?.ammoComponentIds ?? []) ids.add(id);
  return ids;
}

async function checkHttpUrls(urls: readonly string[], failures: string[]) {
  const queue = [...urls];
  const workers = Array.from({ length: 12 }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) return;
      try {
        const response = await fetch(url, {
          headers: { "user-agent": "playground-deployment-smoke/1.0" },
        });
        if (!response.ok) failures.push(`HTTP ${response.status}: ${url}`);
      } catch (error) {
        failures.push(
          `HTTP request failed: ${url}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  });
  await Promise.all(workers);
}

function trackBrowserFailures(page: Page, baseUrl: string, failures: string[]) {
  const current: string[] = [];
  page.on("pageerror", (error) => current.push(`page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") current.push(`console error: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(baseUrl)) {
      current.push(
        `request failed: ${request.url()}: ${request.failure()?.errorText ?? "unknown"}`,
      );
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      current.push(`response ${response.status()}: ${response.url()}`);
    }
  });
  return () => failures.push(...current);
}

async function checkGameInBrowser(
  baseUrl: string,
  game: GameSummary,
  failures: string[],
) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    // Starting a game must not create sessions or events in production.
    await context.route("**/api/events**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body:
          pathname === "/api/events/session"
            ? JSON.stringify({ sessionId: "deployment-smoke" })
            : JSON.stringify({ recorded: true }),
      });
    });

    const page = await context.newPage();
    const browserFailures: string[] = [];
    const flushFailures = trackBrowserFailures(page, baseUrl, browserFailures);
    try {
      const response = await page.goto(`${baseUrl}/game/${game.slug}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      if (!response?.ok()) {
        throw new Error(`navigation returned ${response?.status() ?? "no response"}`);
      }
      await page
        .locator(`[aria-label="Playable level: ${game.title}"] canvas`)
        .waitFor({ state: "visible", timeout: 20_000 });
      const play = page.getByRole("button", { name: "Insert coin · Play" });
      await play.waitFor({ state: "visible", timeout: 20_000 });
      await play.click({ timeout: 10_000 });
      await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10_000 });
      await page.waitForFunction(
        () => {
          const gauge = document.querySelector('[aria-label="elapsed time"]');
          return Boolean(gauge && !gauge.textContent?.includes("0.00s"));
        },
        undefined,
        { timeout: 10_000 },
      );
      await page.waitForTimeout(250);
    } catch (error) {
      browserFailures.push(
        `browser check failed: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      flushFailures();
      for (const failure of browserFailures) {
        failures.push(`${game.slug}: ${failure}`);
      }
      await page.close();
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function writeReport(report: SmokeReport) {
  await mkdir(join(process.cwd(), "test-results"), { recursive: true });
  report.finishedAt = new Date().toISOString();
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const baseUrl = normalizedBaseUrl();
  const report: SmokeReport = {
    baseUrl,
    startedAt: new Date().toISOString(),
    campaignGames: 0,
    mediaAssets: 0,
    httpUrls: 0,
    browserGames: 0,
    failures: [],
  };

  try {
    const [allSummaries, mediaPaths] = await Promise.all([
      campaignSummaries(baseUrl),
      publicMediaPaths(),
    ]);
    report.mediaAssets = mediaPaths.length;
    const summaryById = new Map(allSummaries.map((game) => [game.id, game]));
    const campaign = TEMPLATE_IDS.map((template) => {
      const game = summaryById.get(campaignGameId(template));
      if (!game) throw new Error(`Campaign game missing from API: ${template}`);
      if (
        game.mode !== TEMPLATES[template].mode ||
        game.difficulty !== TEMPLATES[template].difficulty
      ) {
        throw new Error(
          `${template} metadata mismatch: ${game.mode}/${game.difficulty}`,
        );
      }
      return game;
    });
    report.campaignGames = campaign.length;

    const details = await Promise.all(
      campaign.map(async (summary) => {
        const body = await fetchJson<{ game: GameDetail }>(
          `${baseUrl}/api/games/${summary.id}`,
        );
        return body.game;
      }),
    );
    const mediaSet = new Set(mediaPaths);
    for (const detail of details) {
      if (!mediaSet.has(detail.sourceImageUrl)) {
        report.failures.push(
          `${detail.slug}: source image is absent from committed public media: ${detail.sourceImageUrl}`,
        );
      }
      for (const componentId of referencedComponentIds(detail.gameSpec)) {
        const path = `/sprites/${componentId}.svg`;
        if (!mediaSet.has(path)) {
          report.failures.push(`${detail.slug}: referenced sprite is absent: ${path}`);
        }
      }
    }

    const httpPaths = new Set<string>([
      "/",
      "/playground",
      "/create",
      "/stats",
      ...campaign.map((game) => `/game/${game.slug}`),
      ...mediaPaths,
    ]);
    report.httpUrls = httpPaths.size;
    await checkHttpUrls(
      [...httpPaths].map((path) => `${baseUrl}${path}`),
      report.failures,
    );

    for (const [index, game] of campaign.entries()) {
      process.stdout.write(
        `[${String(index + 1).padStart(2, "0")}/${campaign.length}] ${game.slug}\n`,
      );
      await checkGameInBrowser(baseUrl, game, report.failures);
      report.browserGames += 1;
    }
  } catch (error) {
    report.failures.push(error instanceof Error ? error.message : String(error));
  } finally {
    await writeReport(report);
  }

  if (report.failures.length > 0) {
    for (const failure of report.failures) console.error(`- ${failure}`);
    throw new Error(
      `Deployment smoke failed with ${report.failures.length} error(s). Report: ${REPORT_PATH}`,
    );
  }

  console.log(
    `Deployment smoke passed: ${report.campaignGames} games started, ${report.httpUrls} URLs checked, ${report.mediaAssets} media assets loaded.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
