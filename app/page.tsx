"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState<"single"|"batch">("single");
  return (
    <main style={{maxWidth: 920, margin: "40px auto", padding: 24}}>
      <div style={{background:"white", borderRadius:12, boxShadow:"0 6px 24px rgba(0,0,0,0.06)"}}>
        <div style={{padding:24, borderBottom:"1px solid #eee"}}>
          <h1 style={{margin:"8px 0"}}>Branded Package Generator (MVP)</h1>
          <p style={{margin:0, color:"#666"}}>Upload a logo and company name (and optional brand color) to generate a booklet + sample forms as PDFs.</p>
        </div>
        <div style={{padding:24}}>
          <nav style={{display:"flex", gap:12, margin:"0 0 16px"}}>
            <button onClick={()=>setTab("single")} disabled={tab==="single"}>Single</button>
            <button onClick={()=>setTab("batch")} disabled={tab==="batch"}>Batch (CSV)</button>
          </nav>
          {tab==="single" ? <SingleForm/> : <BatchForm/>}
          <section style={{marginTop:24}}>
            <h3>CSV format (batch)</h3>
            <pre style={{background:"#f5f5f5", padding:12, overflow:"auto"}}>
{`company_name,primary_color,logo_base64
Acme Movers,#0C5FDB,iVBORw0KGgoAAA... (base64 png)
Bravo Removals,,iVBORw0KGgoAAA... (base64 png)`}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}

function SingleForm() {
  const [downloading, setDownloading] = useState(false);
  const [brandUrl, setBrandUrl] = useState("");
  const [detecting, setDetecting] = useState(false);

  async function autoDetect(e: React.MouseEvent) {
    e.preventDefault();
    if (!brandUrl) return alert("Enter a website URL first");
    try {
      setDetecting(true);
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: brandUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not detect branding");
      (document.querySelector('input[name="primary_color"]') as HTMLInputElement).value = data.primaryColor;
      (document.querySelector('input[name="logo_base64"]') as HTMLInputElement).value = data.logoDataUrl;
      alert("Branding detected! Primary colour prefilled; logo captured.");
    } catch (err:any) {
      alert(err.message || "Failed to detect branding");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <form onSubmit={async (e)=>{
      e.preventDefault();
      setDownloading(true);
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      if (!res.ok) { const msg = await res.text(); alert("Error generating package: " + msg); setDownloading(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Package.zip"; a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }}>
      <label>Company Website (optional for auto-detect)<br/>
        <input value={brandUrl} onChange={e=>setBrandUrl(e.target.value)} placeholder="https://example.com" />
        <button onClick={autoDetect} disabled={detecting} style={{marginLeft:8}}>{detecting ? "Detecting..." : "Auto-detect"}</button>
      </label><br/><br/>

      <label>Company Name<br/><input name="company_name" required/></label><br/><br/>
      <label>Logo (PNG/SVG recommended) — optional if using auto-detect<br/><input type="file" name="logo" accept="image/*"/></label><br/>
      <input type="hidden" name="logo_base64" />
      <br/>
      <label>Primary Color (optional hex)<br/><input name="primary_color" placeholder="#0C5FDB"/></label><br/><br/>
      <button type="submit" disabled={downloading}>{downloading ? "Generating..." : "Generate Package"}</button>
    </form>
  );
}

function BatchForm() {
  const [downloading, setDownloading] = useState(false);
  return (
    <form onSubmit={async (e)=>{
      e.preventDefault();
      setDownloading(true);
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const res = await fetch("/api/batch", { method: "POST", body: fd });
      if (!res.ok) { alert("Error generating batch"); setDownloading(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Batch_Packages.zip"; a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }}>
      <label>CSV File<br/><input type="file" name="csv" accept=".csv" required/></label><br/><br/>
      <button type="submit" disabled={downloading}>{downloading ? "Generating..." : "Generate Batch ZIP"}</button>
    </form>
  );
}
