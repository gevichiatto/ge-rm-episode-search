import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { messages } from "../../lib/messages";

const MOCK = `http://localhost:${process.env.MOCK_API_PORT ?? 4010}`;

test.beforeEach(async ({ request }) => {
  await request.get(`${MOCK}/__reset`);
});

async function search(page: Page, value: string) {
  await page.goto("/");
  await page.getByLabel(messages.searchLabel).fill(value);
  await page.getByRole("button", { name: messages.searchButton }).click();
}

test("busca por id lista os personagens em ordem alfabética", async ({ page }) => {
  await search(page, "1");

  await expect(page).toHaveURL("/?q=1");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("S01E01 - Pilot");
  await expect(page.getByText(messages.resultsCount(4))).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveText([
    "Beth Smith",
    "Morty Smith",
    "Rick Sanchez",
    "Summer Smith",
  ]);
});

test("busca por código, sem diferenciar maiúsculas", async ({ page }) => {
  await search(page, "s01e02");

  await expect(page.getByRole("heading", { level: 2 })).toHaveText("S01E02 - Lawnmower Dog");
  await expect(page.getByRole("listitem")).toHaveText(["Rick Sanchez"]);
  await expect(page.getByText(messages.resultsCount(1))).toBeVisible();
});

test("entrada inválida mostra erro de validação, sem retry", async ({ page }) => {
  await search(page, "abc");

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(messages.errors.validation);
  await expect(page.getByRole("link", { name: messages.retry })).toHaveCount(0);
});

test("episódio inexistente mostra não encontrado", async ({ page }) => {
  await search(page, "50");

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    messages.errors["episode-not-found"],
  );
  await expect(page.getByRole("link", { name: messages.retry })).toHaveCount(0);
});

test("falha da API oferece tentar novamente e se recupera", async ({ page }) => {
  await search(page, "20");

  await expect(page.getByRole("main").getByRole("alert")).toContainText(messages.errors.upstream);
  await page.getByRole("link", { name: messages.retry }).click();

  await expect(page.getByRole("heading", { level: 2 })).toHaveText("S02E09 - Intermittent");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

test("a página responde com CSP e sem violações no console", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("Content Security Policy")) violations.push(msg.text());
  });

  const response = await page.goto("/?q=1");
  expect(response?.headers()["content-security-policy"]).toContain("nonce-");
  await expect(page.getByRole("listitem")).toHaveCount(4);
  expect(violations).toEqual([]);
});
