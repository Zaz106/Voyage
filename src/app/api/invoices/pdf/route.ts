import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  /* Validate id format (UUID only) */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let browser;
  try {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      /* Local dev — use the full puppeteer package with its bundled Chrome */
      const puppeteer = (await import("puppeteer")).default;
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      /* Vercel / production — use puppeteer-core + serverless-optimised Chromium */
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteer = (await import("puppeteer-core")).default;
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();

    /* A4 at 96 dpi: 794 × 1123 px */
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    /* Build internal URL — use the host from the request */
    const origin = request.nextUrl.origin;
    const invoiceUrl = `${origin}/invoices/${id}`;

    await page.goto(invoiceUrl, { waitUntil: "networkidle0", timeout: 15000 });

    /* Render in screen mode (matches what the user sees) — just strip UI chrome */
    await page.addStyleTag({
      content: `
        [data-pdf-hide] { display: none !important; }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
        }
        /* Strip the grey page wrapper — make it white and remove its padding */
        main {
          background: #ffffff !important;
          padding: 0 !important;
          min-height: 0 !important;
          display: block !important;
        }
        /* Remove the sheet's shadow — everything else stays identical to screen */
        main > div:first-child {
          box-shadow: none !important;
        }
      `,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    if (browser) await browser.close();
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
