import Papa from "papaparse";

export type BatchRow = {
  company_name: string;
  primary_color?: string;
  logo_base64?: string;
};

export function parseCSV(input: string): BatchRow[] {
  const { data, errors } = Papa.parse<BatchRow>(input, { header: true, skipEmptyLines: true });
  if (errors.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}
