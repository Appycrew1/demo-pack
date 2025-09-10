"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState<"single"|"batch">("single");
  return (
    <main style={{maxWidth: 860, margin: "40px auto", padding: 16, background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      <h1>Branded Package Generator (MVP)</h1>
      <p>Upload a logo and company name (and optional brand color) to generate a booklet + sample forms as PDFs.</p>
      <nav style={{display:"flex", gap:12, margin:"16px 0"}}>
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
    </main>
  );
}

function SingleForm() {
  const [downloading, setDownloading] = useState(false);
  return (
    <form onSubmit={async (e)=>{
      e.preventDefault();
      setDownloading(true);
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      if (!res.ok) { alert("Error generating package"); setDownloading(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Package.zip"; a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }}>
      <label>Company Name<br/><input name="company_name" required/></label><br/><br/>
      <label>Logo (PNG/SVG recommended)<br/><input type="file" name="logo" accept="image/*" required/></label><br/><br/>
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
