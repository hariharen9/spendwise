import React, { useState, useMemo } from 'react';
// import '../styles/ExpenseTable.css'; // Styles will be in Dashboard.css for now

const ExpenseTable = ({ expenses, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  const sortedExpenses = useMemo(() => {
    let sortableItems = [...expenses];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        // For date sorting, if dates are equal, sort by insertion order (or keep original)
        if (sortConfig.key === 'date') return 0; 
        // Fallback for other equal values, could be name or other secondary sort key
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    }
    return sortableItems;
  }, [expenses, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      // Optional: third click resets to default or removes sort for this column
      // For now, it will toggle back to ascending
      direction = 'ascending'; 
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };
  if (!sortedExpenses || sortedExpenses.length === 0) {
    return <p>No expenses to display.</p>;
  }

  return (
    <div className="expense-table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Name{getSortIndicator('name')}</th>
            <th onClick={() => requestSort('isIncome')} style={{ cursor: 'pointer' }}>Type{getSortIndicator('isIncome')}</th>
            <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }}>Amount{getSortIndicator('amount')}</th>
            <th onClick={() => requestSort('date')} style={{ cursor: 'pointer' }}>Date{getSortIndicator('date')}</th>
            <th onClick={() => requestSort('category')} style={{ cursor: 'pointer' }}>Category{getSortIndicator('category')}</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr key={expense.id} onClick={() => onRowClick(expense)} style={{ cursor: 'pointer' }}>
              <td>{expense.name}</td>
              <td>{expense.isIncome ? 'Income' : 'Expense'}</td>
              <td style={{color: expense.isIncome ? '#4CAF50' : '#f44336'}}>₹{expense.amount.toFixed(2)}</td>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>{expense.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;