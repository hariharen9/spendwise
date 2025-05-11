import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddExpenseForm = ({ onExpenseAdded, userId }) => { // Added userId prop
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [category, setCategory] = useState('Food'); // Default category
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New useEffect to hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount or if success changes
    }
  }, [success]);

  const categories = ['Food', 'Home', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Others'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) { // Check if userId is available
      setError('User not authenticated. Please log in again.');
      return;
    }

    if (!name || !amount || !date || !category) {
      setError('Please fill in all required fields (Name, Amount, Date, Category).');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    try {
      // Store expenses under users/{userId}/expenses
      const expensesCollectionRef = collection(db, 'users', userId, 'expenses');
      await addDoc(expensesCollectionRef, {
        name,
        amount: expenseAmount,
        date,
        category,
        comments,
        createdAt: serverTimestamp() // Optional: for sorting by creation time
      });
      setSuccess('Expense added successfully!');
      // Clear form
      setName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Food');
      setComments('');
      if (onExpenseAdded) {
        onExpenseAdded(); // Callback to refresh expense list in Dashboard
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      setError('Failed to add expense. Please try again.');
    }
  };

  return (
    <div className="add-expense-form-container">
      <h3>Add New Expense</h3>
      {error && <p className="error-message">{error}</p>}
      {success && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <p>{success}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="comments">Comments (Optional):</label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
};

export default AddExpenseForm;