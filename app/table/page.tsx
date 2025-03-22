import TableRenderer from "@/components/ui/table-renderer";

export default function Table() {
  const jsonData = [
    {
      meta: {
        table_heading: "Table 1",
        supabase_table_name: "sometable",
        pdf_url: "https://example.com/table1.pdf",
        page_number: 1,
      },
      data: {
        col1: { "0": "row1", "1": "row2", "2": "row3" },
        col2: { "0": "row1", "1": "row2", "2": "row3" },
      },
    },
    {
      meta: {
        table_heading: "Table 2",
        supabase_table_name: "someota",
        pdf_url: "https://example.com/table1.pdf",
        page_number: 1,
      },
      data: {
        col1: { "0": "row1", "1": "row2", "2": "row3" },
        col2: { "0": "row1", "1": "row2", "2": "row3" },
      },
    },
  ];

  return <TableRenderer jsonData={jsonData} />;
}
