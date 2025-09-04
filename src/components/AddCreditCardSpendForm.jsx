import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const AddCreditCardSpendForm = ({ onSpendAdded, userId, userCreditCards = [], onAddCreditCard }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [category, setCategory] = useState('Bills'); // Default category
  const [card, setCard] = useState(''); // Credit card used
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const [categories, setCategories] = useState(['Bills', 'EMI', 'Shopping', 'Travel', 'Food', 'Entertainment', 'Health', 'Others']);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // userCreditCards are passed as a prop now
  const [newCardName, setNewCardName] = useState(''); // For adding a new card
  const [showNewCardInput, setShowNewCardInput] = useState(false); // To show input for new card name

  useEffect(() => {
    const savedCategories = localStorage.getItem('customCreditCardCategories');
    if (savedCategories) {
      const defaultCategories = ['Bills', 'EMI', 'Shopping', 'Travel', 'Food', 'Entertainment', 'Health', 'Others'];
      setCategories([...defaultCategories, ...JSON.parse(savedCategories)]);
    }
  }, []);

  const handleAddNewCard = async () => {
    if (newCardName.trim() && onAddCreditCard) {
      await onAddCreditCard(newCardName.trim());
      setCard(newCardName.trim()); // Select the newly added card
      setNewCardName('');
      setShowNewCardInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    if (!name || !amount || !transactionDate || !category || !card) {
      setError('Please fill in all required fields (Name, Amount, Transaction Date, Category, Card).');
      return;
    }

    const spendAmount = parseFloat(amount);
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    try {
      const spendsCollectionRef = collection(db, 'users', userId, 'creditCardSpends');
      await addDoc(spendsCollectionRef, {
        name,
        amount: spendAmount,
        transactionDate: transactionDate, // Use the new transaction date
        category: showCustomInput ? customCategory : category,
        isCustomCategory: showCustomInput,
        card,
        comments,
        createdAt: serverTimestamp()
      });
      toast.success('Credit card spend added successfully!');
      
      if (showCustomInput && !categories.includes(customCategory)) {
        const updatedCategories = [...categories, customCategory];
        setCategories(updatedCategories);
        localStorage.setItem('customCreditCardCategories', JSON.stringify(updatedCategories.filter(cat => !['Bills', 'EMI', 'Shopping', 'Travel', 'Food', 'Entertainment', 'Health', 'Others'].includes(cat))));
      }
      // Custom card adding is now handled by handleAddNewCard and parent component

      setName('');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setCategory('Bills');
      setCard('');
      setComments('');
      setShowCustomInput(false);
      setCustomCategory('');
      if (onSpendAdded) {
        onSpendAdded();
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      setError('Failed to add credit card spend. Please try again.');
      toast.error('Failed to add credit card spend. Please try again.');
    }
  };

  return (
    <div className="add-expense-form-container credit-card-form-container">
      <h4>Add Credit Card Spend</h4>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cc-name">Name / Description:</label>
          <input
            type="text"
            id="cc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cc-amount">Amount:</label>
          <input
            type="number"
            id="cc-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="cc-transaction-date">Transaction Date:</label>
          <input
            type="date"
            id="cc-transaction-date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cc-category">Category:</label>
          {showCustomInput ? (
            <input
              type="text"
              id="cc-custom-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              placeholder="Enter custom category"
            />
          ) : (
            <select id="cc-category" value={category} onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value === 'Others') {
                setShowCustomInput(true);
              } else {
                setShowCustomInput(false);
              }
            }} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="cc-card">Credit Card:</label>
          <select 
            id="cc-card" 
            value={card} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'add_new_card_option') {
                setShowNewCardInput(true);
                setCard(''); // Clear selection if 'add new' is chosen
              } else {
                setShowNewCardInput(false);
                setCard(val);
              }
            }}
            required
          >
            <option value="" disabled>Select Card</option>
            {userCreditCards.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="add_new_card_option">+ Add New Card</option>
          </select>
          {showNewCardInput && (
            <div className="custom-input-container new-card-input-container">
              <input 
                type="text" 
                placeholder="Enter new card name" 
                value={newCardName} 
                onChange={(e) => setNewCardName(e.target.value)} 
              />
              <button type="button" onClick={handleAddNewCard} className="add-custom-btn">Add Card</button>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="cc-comments">Comments (Optional, or New Card Name if 'Other' selected):</label>
          <textarea
            id="cc-comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
          </div>
        <button type="submit">Add CC Spend</button>
      </form>
    </div>
  );
};

export default AddCreditCardSpendForm;