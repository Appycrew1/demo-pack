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
  const logoBase64 = (form.get("logo_base64") as string) || "";

  if (!companyName) {
    return NextResponse.json({ error: "company_name is required" }, { status: 400 });
  }

  let logoBuf: Buffer | null = null;
  let logoMime = "image/png";

  if (logoFile) {
    const ab = await logoFile.arrayBuffer();
    logoBuf = Buffer.from(ab);
    logoMime = logoFile.type || "image/png";
  } else if (logoBase64) {
    if (logoBase64.startsWith("data:")) {
      const [meta, b64] = logoBase64.split(",", 2);
      const start = meta.indexOf(":")+1;
      const end = meta.indexOf(";");
      logoMime = meta.slice(start, end > start ? end : undefined) || "image/png";
      logoBuf = Buffer.from(b64, "base64");
    } else {
      logoBuf = Buffer.from(logoBase64, "base64");
    }
  }

  if (!logoBuf) {
    return NextResponse.json({ error: "logo required (upload a file or use auto-detect to set logo_base64)" }, { status: 400 });
  }

  const primaryColor = primaryColorInput || await extractPrimaryColor(logoBuf);
  const { textOnPrimary } = ensureContrast(primaryColor);

  const templateData = {
    COMPANY_NAME: companyName,
    BRAND: { primary: primaryColor, textOnPrimary },
    LOGO_DATAURL: `data:${logoMime};base64,${logoBuf.toString("base64")}`
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
