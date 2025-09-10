export const metadata = { title: "Branded Package Generator (MVP)", description: "Generate branded booklets and forms as PDFs" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body style={{fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial", background:"#f5f7fb", margin:0}}>{children}</body></html>);
}
