import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const EditCreditCardSpendModal = ({ spend, onClose, onSave, onDelete, userId, userCreditCards = [], onAddCreditCard }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [category, setCategory] = useState('');
  const [card, setCard] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [showNewCardInput, setShowNewCardInput] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const categories = ['Bills', 'EMI', 'Shopping', 'Travel', 'Food', 'Entertainment', 'Health', 'Others'];
  // userCreditCards are passed as a prop

  useEffect(() => {
    if (spend) {
      setName(spend.name || '');
      setAmount(spend.amount ? spend.amount.toString() : '');
      setTransactionDate(spend.transactionDate ? (typeof spend.transactionDate === 'string' ? spend.transactionDate : spend.transactionDate.toDate().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]);
      setCategory(spend.category || 'Bills');
      setCard(spend.card || '');
      setComments(spend.comments || '');
      setError('');
    } else {
      // Resetting fields if no spend is provided (though this modal is usually for editing existing)
      setName('');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setCategory('Bills');
      setCard('');
      setComments('');
      setError('');
    }
  }, [spend]);

  if (!spend) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('User not authenticated.');
      return;
    }
    if (!spend || !spend.id) {
        setError('Spend data is missing.');
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
      const spendRef = doc(db, 'users', userId, 'creditCardSpends', spend.id);
      await updateDoc(spendRef, {
        name,
        amount: spendAmount,
        transactionDate: transactionDate,
        category,
        card,
        comments,
      });
      onSave();
    } catch (err) {
      console.error('Error updating document: ', err);
      setError('Failed to update spend. Please try again.');
    }
  };

  const handleDelete = async () => {
    setError('');
    if (!userId) {
        setError('User not authenticated.');
        return;
    }
    if (!spend || !spend.id) {
      setError('Spend data is missing.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this spend?')) {
      try {
        const spendRef = doc(db, 'users', userId, 'creditCardSpends', spend.id);
        await deleteDoc(spendRef);
        onDelete();
      } catch (err) {
        console.error('Error deleting document: ', err);
        setError('Failed to delete spend. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-expense-modal edit-credit-card-spend-modal">
        <h3>Edit Credit Card Spend</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSave}>
          <div>
            <label htmlFor="edit-cc-name">Name / Description:</label>
            <input
              type="text"
              id="edit-cc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-cc-amount">Amount:</label>
            <input
              type="number"
              id="edit-cc-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
          />
        </div>
        <div>
          <label htmlFor="edit-cc-transaction-date">Transaction Date:</label>
          <input
            type="date"
            id="edit-cc-transaction-date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>
          <div>
            <label htmlFor="edit-cc-category">Category:</label>
            <select id="edit-cc-category" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-cc-card">Credit Card:</label>
            <select 
              id="edit-cc-card" 
              value={card} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'add_new_card_option') {
                  setShowNewCardInput(true);
                  setCard(''); 
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
              {onAddCreditCard && <option value="add_new_card_option">+ Add New Card</option>}
            </select>
            {showNewCardInput && onAddCreditCard && (
              <div className="custom-input-container new-card-input-container">
                <input 
                  type="text" 
                  placeholder="Enter new card name" 
                  value={newCardName} 
                  onChange={(e) => setNewCardName(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={async () => {
                    if (newCardName.trim()) {
                      await onAddCreditCard(newCardName.trim());
                      setCard(newCardName.trim());
                      setNewCardName('');
                      setShowNewCardInput(false);
                    }
                  }}
                  className="add-custom-btn"
                >
                  Add Card
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="edit-cc-comments">Comments (Optional):</label>
            <textarea
              id="edit-cc-comments"
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

export default EditCreditCardSpendModal;