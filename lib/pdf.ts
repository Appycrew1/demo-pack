import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function launchChromium() {
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  });
  return browser;
}

export async function htmlToPdf(html: string, opts?: { format?: "A4"|"Letter", printBackground?: boolean }) {
  const browser = await launchChromium();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: opts?.format ?? "A4",
      printBackground: opts?.printBackground ?? true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
