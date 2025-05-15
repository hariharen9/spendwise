import React from 'react';

const CreditCardExpenseTable = ({ expenses, onRowClick }) => {
  if (!expenses || expenses.length === 0) {
    return <p>No credit card spends to display for the selected period.</p>;
  }

  return (
    <div className="expense-table-container credit-card-table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Transaction Date</th>
            <th>Category</th>
            <th>Card</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} onClick={() => onRowClick(expense)} style={{ cursor: 'pointer' }}>
              <td>{expense.name}</td>
              <td style={{color: '#f44336'}}>₹{expense.amount.toFixed(2)}</td>
              <td>{expense.transactionDate ? (typeof expense.transactionDate === 'string' ? expense.transactionDate : expense.transactionDate.toDate().toLocaleDateString()) : 'N/A'}</td>
              <td>{expense.category}</td>
              <td>{expense.card}</td>
              <td>{expense.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreditCardExpenseTable;