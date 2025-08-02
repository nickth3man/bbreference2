import React from 'react';
import './StatsTable.css';

const StatsTable = ({ data, columns, caption }) => {
  // Basic sorting state
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'ascending' });

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sort.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <table className="stats-table">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} onClick={() => col.sortable && requestSort(col.key)} className={col.sortable ? 'sortable' : ''}>
              {col.label}
              {sortConfig.key === col.key && (
                <span className="sort-arrow">
                  {sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col.key} className={col.type === 'numeric' ? 'numeric' : 'text'}>
                {col.render ? col.render(row) : (col.decimals ? row[col.key].toFixed(col.decimals) : row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatsTable;
