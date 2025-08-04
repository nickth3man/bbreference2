import React from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import './StatsTable.css';

const StatsTable = ({
  data = [],
  columns = [],
  sortConfig = {},
  requestSort,
  exportable = true,
  exportFilename = 'stats',
  className = '',
  caption,
  responsive = true,
  mobileColumns = []
}) => {
  // Format numeric values based on column specs
  const formatValue = (value, column) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (column.formatter) {
      return column.formatter(value);
    }

    if (column.type === 'numeric') {
      const num = parseFloat(value);
      if (isNaN(num)) return '-';
      
      if (column.decimals !== undefined) {
        return num.toFixed(column.decimals);
      }
      return num.toString();
    }

    return value;
  };

  // Generate CSV export
  const handleExport = () => {
    const exportData = data.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        exportRow[col.label] = formatValue(row[col.key], col);
      });
      return exportRow;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFilename}_${date}.csv`;
    link.click();
  };

  // Determine which columns to show on mobile
  const visibleColumns = responsive && mobileColumns.length > 0
    ? columns.filter(col => !col.mobileHide || mobileColumns.includes(col.key))
    : columns;

  // Render sort arrow
  const renderSortArrow = (column) => {
    if (!column.sortable || !requestSort) return null;
    
    const isSorted = sortConfig.key === column.key;
    const isAscending = sortConfig.direction === 'asc';
    
    return (
      <span className="sort-arrow">
        {isSorted ? (isAscending ? '▲' : '▼') : ''}
      </span>
    );
  };

  // Handle header click for sorting
  const handleHeaderClick = (column) => {
    if (column.sortable && requestSort) {
      requestSort(column.key);
    }
  };

  // Render cell content
  const renderCell = (row, column) => {
    const value = formatValue(row[column.key], column);
    
    if (column.type === 'link' && column.linkPath) {
      const path = column.linkPath(row[column.key], row);
      return <Link to={path}>{value}</Link>;
    }
    
    return value;
  };

  return (
    <div className={`stats-table-container ${className}`}>
      {exportable && (
        <div className="stats-table-actions">
          <button 
            className="export-btn"
            onClick={handleExport}
            type="button"
          >
            Export to CSV
          </button>
        </div>
      )}
      
      <table className="stats-table">
        {caption && <caption>{caption}</caption>}
        
        <thead>
          <tr>
            {visibleColumns.map(column => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => handleHeaderClick(column)}
              >
                {column.label}
                {renderSortArrow(column)}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="empty-message">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {visibleColumns.map(column => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className={column.type === 'numeric' ? 'numeric' : 'text'}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;