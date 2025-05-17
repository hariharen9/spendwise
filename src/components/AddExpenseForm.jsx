import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddExpenseForm = ({ onExpenseAdded, userId, activeProfileCollectionName }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [category, setCategory] = useState('Food'); // Default category
  const [isIncome, setIsIncome] = useState(false); // false for expense, true for income
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New useEffect to hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 2000); // Hide after 2 seconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount or if success changes
    }
  }, [success]);

  const [categories, setCategories] = useState(['Food', 'Home', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping','Fuel', 'Investments', 'EMI', 'Others']);
  
  useEffect(() => {
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      const defaultCategories = ['Food', 'Home', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping','Fuel', 'Investments', 'EMI', 'Others'];
      setCategories([...defaultCategories, ...JSON.parse(savedCategories)]);
    }
  }, []);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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

    if (!activeProfileCollectionName) {
      setError('No active account selected. Cannot add expense.');
      return;
    }
    try {
      const collectionPath = `users/${userId}/${activeProfileCollectionName}`;
      const expensesCollectionRef = collection(db, collectionPath);
      await addDoc(expensesCollectionRef, {
        name,
        amount: expenseAmount,
        date,
        category: showCustomInput ? customCategory : category,
        isCustom: showCustomInput,
        isIncome,
        comments,
        createdAt: serverTimestamp() // Optional: for sorting by creation time
      });
      setSuccess('Expense added successfully!');
      // Save custom category if it's new
      if (showCustomInput && !categories.includes(customCategory)) {
        const updatedCategories = [...categories, customCategory];
        setCategories(updatedCategories);
        localStorage.setItem('customCategories', JSON.stringify(updatedCategories.filter(cat => !['Food', 'Home', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping','Fuel', 'Investments', 'EMI', 'Others'].includes(cat))));
      }
      // Clear form
      setName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Food');
      setComments('');
      setShowCustomInput(false);
      setCustomCategory('');
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
      <h3>Add Transaction</h3>
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
          {showCustomInput ? (
            <input
              type="text"
              id="custom-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              placeholder="Enter custom category"
            />
          ) : (
            <select id="category" value={category} onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value === 'Others') {
                setShowCustomInput(true);
              }
            }} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="comments">Comments (Optional):</label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
          </div>
        <div style={{display: 'flex', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--input-border)'}}>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '10px',
              background: !isIncome ? 'var(--primary-color)' : 'var(--input-bg)',
              color: !isIncome ? 'white' : 'var(--text-color)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={() => setIsIncome(false)}
          >
            Expense
          </button>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '10px',
              background: isIncome ? 'var(--primary-color)' : 'var(--input-bg)',
              color: isIncome ? 'white' : 'var(--text-color)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={() => setIsIncome(true)}
          >
            Income
          </button>
        </div>
        <button type="submit">Add {isIncome ? 'Income' : 'Expense'}</button>
      </form>
    </div>
  );
};

export default AddExpenseForm;