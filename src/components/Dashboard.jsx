import React, { useState, useEffect, useCallback } from 'react';
import MonthSelector from './MonthSelector';
import ExpenseTable from './ExpenseTable';
import CategoryPieChart from './CategoryPieChart';
import AddExpenseForm from './AddExpenseForm';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where, doc, setDoc } from 'firebase/firestore'; // Added doc, setDoc
import '../styles/Dashboard.css';

import '../styles/Footer.css';

const Dashboard = ({ currentUser, onLogout }) => { // Added currentUser and onLogout props
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const currentYear = new Date().getFullYear();

  // Function to save/update user profile in Firestore (optional)
  const updateUserProfile = useCallback(async (user) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      }, { merge: true }); // merge: true to update existing fields or create if not exists
      console.log('User profile updated/created in Firestore');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      updateUserProfile(currentUser);
    }
  }, [currentUser, updateUserProfile]);

  const fetchExpenses = useCallback(async () => {
    if (!currentUser) return; // Don't fetch if no user

    setLoading(true);
    setError('');
    try {
      // User-specific expenses path: users/{userId}/expenses
      const expensesCollection = collection(db, 'users', currentUser.uid, 'expenses');
      const q = query(expensesCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setExpenses(expensesData);
    } catch (err) {
      console.error("Error fetching expenses: ", err);
      setError('Failed to fetch expenses. Please try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    // Filter expenses based on selectedMonth and currentYear
    if (expenses.length > 0) {
      const monthStr = selectedMonth.toString().padStart(2, '0'); // e.g., 7 -> "07"
      const yearStr = currentYear.toString();

      const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear && (expenseDate.getMonth() + 1) === selectedMonth;
      });
      setFilteredExpenses(filtered);
    }
  }, [expenses, selectedMonth, currentYear]);

  const handleExpenseAdded = () => {
    fetchExpenses(); // Re-fetch expenses when a new one is added
  };

  return (
    <div className="dashboard-container">
     
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Expense Tracker</h1>
          {currentUser && <p className="welcome-message">Welcome, {currentUser.displayName || currentUser.email}!</p>}
        </div>
        <div className="header-right">
          <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          {currentUser && <button onClick={onLogout} className="logout-button">Logout</button>}
        </div>
      </header>
      <main className="dashboard-main">
        <div className="add-expense-section">
          <AddExpenseForm onExpenseAdded={handleExpenseAdded} userId={currentUser?.uid} /> {/* Pass userId to form */}
        </div>
        <div className="content-area"> {/* New wrapper for table and chart */}
          <div className="expenses-section">
            <h2>Transactions (Month: {selectedMonth}/{currentYear})</h2>
            {loading && <div className="loading-placeholder"><p>Loading Expenses...</p></div>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && <ExpenseTable expenses={filteredExpenses} />}
          </div>
          <div className="chart-section">
            <h2>Spending by Category (Month: {selectedMonth}/{currentYear})</h2>
            {loading && <div className="loading-placeholder"><p>Loading Chart Data...</p></div>} {/* Optional: separate loading for chart */}
            {error && <p className="error-message">{error}</p>} {/* You might want a specific chart error message */}
            {!loading && !error && <CategoryPieChart expenses={filteredExpenses} />}
          </div>
        </div>
        
      </main>
      <div className="footer">
        Made with 💖 by <a href="https://www.linkedin.com/in/hariharen9/" target="_blank" rel="noopener noreferrer">Hariharen</a> © 2025
      </div>
    </div>
  );
};

export default Dashboard;