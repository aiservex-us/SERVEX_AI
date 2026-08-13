import re

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CSV_Final_Results_WBO.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Change component name
content = content.replace("WBODataMatrix", "CSVFinalResultsWBO")
content = content.replace("export default WBODataMatrix;", "export default CSVFinalResultsWBO;")

# 2. Change data fetching from XM_CET_import to CSV_final
content = content.replace(".select('XM_CET_import')", ".select('CSV_final')")
content = content.replace("data?.XM_CET_import", "data?.CSV_final")

# 3. Replace XML parsing logic with direct CSV_final assignment
process_xml_body_pattern = r"const processXML = async \(\) => \{.*?finally \{\s*setLoading\(false\);\s*\}\s*\};"
new_process_xml_body = """const processXML = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('CSV_final')
        .eq('company_name', 'WBO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data?.CSV_final) {
        setProducts([]);
        setOptionHeaders([]);
        return;
      }

      let parsed = data.CSV_final;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch(e) {
          throw new Error("Error parsing CSV_final JSON structure");
        }
      }

      if (!Array.isArray(parsed)) {
        parsed = [];
      }

      setProducts(parsed);
      if (parsed.length > 0) {
        setOptionHeaders(Object.keys(parsed[0]).filter(k => k !== '_orphaned_fields' && k !== 'sku' && k !== 'description'));
      } else {
        setOptionHeaders([]);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error("Error processing CSV Final data:", err);
      setError(err.message || "Error processing CSV Final information WBO.");
    } finally {
      setLoading(false);
    }
  };"""

content = re.sub(process_xml_body_pattern, new_process_xml_body, content, flags=re.DOTALL)

# 4. Remove baseHeaders definition
content = re.sub(r"const baseHeaders = \[.*?\];", "", content, flags=re.DOTALL)

# 5. Fix table header rendering
thead_pattern = r"<thead.*?</thead>"
new_thead = """<thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#7f1d1d] bg-white/80 backdrop-blur-md sticky left-0 z-30 border-r border-b border-slate-100 select-none">
                      Index
                    </th>
                    {optionHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-slate-800 bg-white/80 backdrop-blur-md border-r border-b border-slate-100 min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#7f1d1d] opacity-40" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>"""
content = re.sub(thead_pattern, new_thead, content, flags=re.DOTALL)

# 6. Fix table body row rendering
td_map_pattern = r"\{baseHeaders\.map\(\(header\) => \{.*?\}\)\}\s*\{optionHeaders\.map\(\(header\) => \(.*?\)\)\}"
new_td_map = """{optionHeaders.map((header) => {
                            let value = p[header];
                            if (value === null || value === undefined) value = '-';
                            return (
                              <td
                                key={header}
                                className="px-3 py-1.5 text-[11px] font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap truncate border-b border-slate-50"
                                title={String(value)}
                              >
                                {value}
                              </td>
                            );
                          })}"""
content = re.sub(td_map_pattern, new_td_map, content, flags=re.DOTALL)

# 7. Search field logic: in CSV we might not have `sku` or `description`, so search through all values
search_pattern = r"const filtered = useMemo\(\(\) => \{.*?\}, \[products, searchTerm\]\);"
new_search = """const filtered = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return products;
    return products.filter(p => {
      return Object.values(p).some(val => 
        val && String(val).toLowerCase().includes(cleanSearch)
      );
    });
  }, [products, searchTerm]);"""
content = re.sub(search_pattern, new_search, content, flags=re.DOTALL)

# 8. Export to CSV logic fix
export_pattern = r"const exportToCSV = \(\) => \{.*?const csvData = new Blob.*?\}\);"
new_export = """const exportToCSV = () => {
    if (!filtered || filtered.length === 0) return;
    const csvString = Papa.unparse(filtered);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WBO_CSV_Final_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };"""
content = re.sub(export_pattern, new_export, content, flags=re.DOTALL)

# Also fix the text "Product Database - WBO" and stats
content = content.replace("Product Database - WBO", "CSV Final Database - WBO")
content = content.replace("Total variants Extracted:", "Total rows:")
content = content.replace("{stats.avgPrice.toLocaleString()}", "")
content = content.replace("Average Base Price:", "")
content = content.replace("We couldn't find", "We could not find")

with open(file_path, "w") as f:
    f.write(content)

print("Script completed")
