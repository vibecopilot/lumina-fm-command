import * as XLSX from 'xlsx';

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export full drill/panel data as a ZIP of JSON + CSVs per section */
export function exportFullData(payload: {
  summary: Record<string, unknown>;
  sections: { name: string; data: unknown }[];
  filename: string;
}) {
  const { summary, sections, filename } = payload;
  const base = `${filename}_${new Date().toISOString().slice(0, 10)}`;
  const all: Record<string, unknown> = { summary, exported_at: new Date().toISOString() };
  sections.forEach(({ name, data }) => {
    all[name] = data;
  });
  exportToJSON(all, base);
}

export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export full drill/panel data as XLSX with multiple sheets: summary, blocks, tickets, assets, ppm, workforce, vendors, graph_data */
export function exportToXLSX(payload: {
  summary: Record<string, unknown>;
  sheets: { name: string; data: Record<string, unknown>[] }[];
  filename: string;
}) {
  const { summary, sheets, filename } = payload;
  const wb = XLSX.utils.book_new();
  const base = `${filename}_${new Date().toISOString().slice(0, 10)}`;

  const summaryData = [['Metric', 'Value'], ...Object.entries(summary).map(([k, v]) => [k, v])];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  sheets.forEach(({ name, data }) => {
    if (data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    }
  });

  XLSX.writeFile(wb, `${base}.xlsx`);
}
