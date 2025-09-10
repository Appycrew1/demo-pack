import ColorThief from "color-thief-node";

export async function extractPrimaryColor(imageBuffer: Buffer): Promise<string> {
  const dominant = await ColorThief.getColor(imageBuffer);
  const toHex = (v:number) => v.toString(16).padStart(2,"0");
  return `#${toHex(dominant[0])}${toHex(dominant[1])}${toHex(dominant[2])}`;
}

export function ensureContrast(bgHex: string): { textOnPrimary: "#000000"|"#FFFFFF" } {
  const hex = bgHex.replace("#","");
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  const L = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
  return { textOnPrimary: L > 0.6 ? "#000000" : "#FFFFFF" };
}
