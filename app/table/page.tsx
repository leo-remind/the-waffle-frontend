import TableRenderer from "@/components/ui/table-renderer";

export default function Table() {
  const jsonData = [
    {
      meta: {
        table_header: "Table 1",
        pdf_url: "https://example.com/table1.pdf",
        page_number: 1,
      },
      data: {
        col1: ["row1", "row2", "row3"],
        col2: ["row1", "row2", "row3"],
      },
    },
    {
      meta: {
        table_header: "Table 2",
        pdf_url: "https://example.com/table1.pdf",
        page_number: 1,
      },
      data: {
        col1: ["row1", "row2", "row3"],
        col2: ["row1", "row2", "row3"],
      },
    },
  ];

  return <TableRenderer jsonData={jsonData} />;
}
