// components/TableRenderer.js
import React from 'react';

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
            <p><strong>Title:</strong> {tableObj.title}</p>
            <p><strong>PDF URL:</strong> <a href={tableObj.pdf_url} target="_blank" rel="noopener noreferrer">{tableObj.pdf_url}</a></p>
            <p><strong>Page Number:</strong> {tableObj.page_no}</p>
            <p><strong>Table Number:</strong> {tableObj.table_no}</p>
          </div>

          {tableObj.data && tableObj.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <tbody>
                  {tableObj.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                          {cell}
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