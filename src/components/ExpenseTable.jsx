import React from 'react';
// import '../styles/ExpenseTable.css'; // Styles will be in Dashboard.css for now

const ExpenseTable = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return <p>No expenses to display.</p>;
  }

  return (
    <div className="expense-table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.name}</td>
              <td>₹{expense.amount.toFixed(2)}</td>
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