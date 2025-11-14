import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Windows / Mac local fallback
import localPuppeteer from "puppeteer";

export async function generateInvoice(order) {
  const html = (await import("./invoiceHTML")).invoiceHTML(order);

  const isLocal = process.platform === "win32" || process.env.NODE_ENV === "development";

  let browser;

  if (isLocal) {
    // 🟢 Local development (Windows / Mac)
    browser = await localPuppeteer.launch({
      headless: true,
    });
  } else {
    // 🟢 Vercel Serverless (Linux)
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", bottom: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
}
