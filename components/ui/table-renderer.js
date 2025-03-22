// components/TableRenderer.js
import React from "react";

const TableRenderer = ({ jsonData }) => {
  if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {jsonData.map((tableObj, tableIndex) => (
        <div key={tableIndex} className="table-container mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Table {tableIndex + 1}</h2>
            <p>
              <strong>Title:</strong> {tableObj.meta.table_heading}
            </p>
            <p>
              <strong>PDF URL:</strong>{" "}
              <a
                href={tableObj.meta.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                {tableObj.meta.pdf_url}
              </a>
            </p>
            <p>
              <strong>Page Number:</strong> {tableObj.meta.page_number}
            </p>
          </div>

          {tableObj.data && Object.keys(tableObj.data).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    {Object.keys(tableObj.data).map((colName, colIndex) => (
                      <th
                        key={colIndex}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Get the number of rows by counting keys in the first column */}
                  {Object.keys(Object.values(tableObj.data)[0]).map((rowKey) => (
                    <tr
                      key={rowKey}
                      className={Number(rowKey) % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      {Object.keys(tableObj.data).map((colName, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-gray-300 px-4 py-2"
                        >
                          {tableObj.data[colName][rowKey]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No table data available</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TableRenderer;
