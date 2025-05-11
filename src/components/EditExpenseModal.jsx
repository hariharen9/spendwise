import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const EditExpenseModal = ({ expense, onClose, onSave, onDelete, userId }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const categories = ['Food', 'Home', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Fuel', 'Investments', 'EMI', 'Others'];

  useEffect(() => {
    if (expense) {
      setName(expense.name || '');
      setAmount(expense.amount ? expense.amount.toString() : '');
      setDate(expense.date || '');
      setCategory(expense.category || 'Food');
      setComments(expense.comments || '');
      setError('');
    } else {
      // Reset form if no expense is provided (e.g., modal closed and reopened)
      setName('');
      setAmount('');
      setDate('');
      setCategory('Food');
      setComments('');
      setError('');
    }
  }, [expense]);

  if (!expense) return null; // Don't render if no expense is selected

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    if (!expense || !expense.id) {
        setError('Expense data is missing. Cannot save.');
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
      const expenseRef = doc(db, 'users', userId, 'expenses', expense.id);
      await updateDoc(expenseRef, {
        name,
        amount: expenseAmount,
        date,
        category,
        comments,
      });
      onSave(); // Callback to refresh data and close modal
    } catch (err) {
      console.error('Error updating document: ', err);
      setError('Failed to update expense. Please try again.');
    }
  };

  const handleDelete = async () => {
    setError('');
    if (!userId) {
        setError('User not authenticated. Please log in again.');
        return;
    }
    if (!expense || !expense.id) {
      setError('Expense data is missing. Cannot delete.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const expenseRef = doc(db, 'users', userId, 'expenses', expense.id);
        await deleteDoc(expenseRef);
        onDelete(); // Callback to refresh data and close modal
      } catch (err) {
        console.error('Error deleting document: ', err);
        setError('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-expense-modal">
        <h3>Edit Expense</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSave}>
          <div>
            <label htmlFor="edit-name">Name:</label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-amount">Amount:</label>
            <input
              type="number"
              id="edit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="edit-date">Date:</label>
            <input
              type="date"
              id="edit-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-category">Category:</label>
            <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-comments">Comments (Optional):</label>
            <textarea
              id="edit-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" onClick={handleDelete} className="delete-button">Delete</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;