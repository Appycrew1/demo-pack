import { NextRequest, NextResponse } from "next/server";
import { renderTemplate } from "@/lib/templates";
import { htmlToPdf } from "@/lib/pdf";
import { extractPrimaryColor, ensureContrast } from "@/lib/color";
import { zipFiles } from "@/lib/zip";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const companyName = String(form.get("company_name") || "").trim();
  const primaryColorInput = (form.get("primary_color") as string) || "";
  const logoFile = form.get("logo") as File | null;

  if (!companyName || !logoFile) {
    return NextResponse.json({ error: "company_name and logo are required" }, { status: 400 });
  }

  const logoArrayBuf = await logoFile.arrayBuffer();
  const logoBuf = Buffer.from(logoArrayBuf);

  const primaryColor = primaryColorInput || await extractPrimaryColor(logoBuf);
  const { textOnPrimary } = ensureContrast(primaryColor);

  const templateData = {
    COMPANY_NAME: companyName,
    BRAND: { primary: primaryColor, textOnPrimary },
    LOGO_DATAURL: `data:${logoFile.type};base64,${logoBuf.toString("base64")}`
  };

  const bookletHtml = await renderTemplate("booklet", templateData);
  const formsHtml   = await renderTemplate("forms", templateData);

  const bookletPdf = await htmlToPdf(bookletHtml, { format: "A4" });
  const formsPdf   = await htmlToPdf(formsHtml, { format: "A4" });

  const zip = await zipFiles([
    { name: `${companyName}_Booklet.pdf`, content: Buffer.from(bookletPdf) },
    { name: `${companyName}_Forms.pdf`,   content: Buffer.from(formsPdf) }
  ]);

  return new NextResponse(zip, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${companyName.replace(/\s+/g,"_")}_Package.zip"`
    }
  });
}
