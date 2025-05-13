import React, { useState, useEffect, useCallback } from 'react';
import MonthSelector from './MonthSelector';
import ExpenseTable from './ExpenseTable';
import CategoryPieChart from './CategoryPieChart';
import AddExpenseForm from './AddExpenseForm';
import EditExpenseModal from './EditExpenseModal'; // Import the modal
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where, doc, setDoc } from 'firebase/firestore'; // Added doc, setDoc
import confetti from 'canvas-confetti';
import '../styles/Dashboard.css';

import '../styles/Footer.css';

const Dashboard = ({ currentUser, onLogout }) => { // Added currentUser and onLogout props
  const exportToCSV = (expenses) => {
    if (!expenses || expenses.length === 0) {
      alert('No expenses to export');
      return;
    }
    
    const headers = ['Name', 'Amount', 'Date', 'Category', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        `"${expense.name}"`,
        expense.amount,
        expense.date,
        `"${expense.category}"`,
        expense.comments ? `"${expense.comments}"` : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SpendWise_Expenses_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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
    // Filter expenses based on selectedMonth and selectedYear
    if (expenses.length > 0) {
      const monthStr = selectedMonth.toString().padStart(2, '0'); // e.g., 7 -> "07"
      const yearStr = selectedYear.toString();

      const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === selectedYear && (expenseDate.getMonth() + 1) === selectedMonth;
      });
      setFilteredExpenses(filtered);
    }
  }, [expenses, selectedMonth, selectedYear]);

  const handleExpenseAdded = () => {
    fetchExpenses(); // Re-fetch expenses when a new one is added
  };

  const handleOpenEditModal = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedExpense(null);
    setIsEditModalOpen(false);
  };

  const handleExpenseUpdated = () => {
    fetchExpenses();
    handleCloseEditModal();
  };

  const handleExpenseDeleted = () => {
    fetchExpenses();
    handleCloseEditModal();
  };

  return (
    <div className="dashboard-container">
     
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SpendWise</h1>
         
          {currentUser && <p className="welcome-message">Welcome, {currentUser.displayName || currentUser.email}!</p>}
        </div>
        <div className="header-right">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            setSelectedMonth={setSelectedMonth} 
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
          {currentUser && <button className="export-button" onClick={() => exportToCSV(filteredExpenses)}>
            Export
          </button>}
          {currentUser && <button onClick={onLogout} className="logout-button">Logout</button>}
        </div>
      </header>
      <main className="dashboard-main">
        <div className="add-expense-section">
          <AddExpenseForm onExpenseAdded={handleExpenseAdded} userId={currentUser?.uid} /> {/* Pass userId to form */}
          <div className="summary-card" onClick={() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }}>
            <h3>Monthly Summary</h3>
            <div className="summary-item">
              <span>Total Income:</span>
              <span className="income-amount">
                ₹{filteredExpenses.reduce((sum, exp) => exp.isIncome ? sum + exp.amount : sum, 0).toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span>Total Expense:</span>
              <span className="expense-amount">
                ₹{filteredExpenses.reduce((sum, exp) => !exp.isIncome ? sum + exp.amount : sum, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="content-area"> {/* New wrapper for table and chart */}
          <div className="expenses-section">
            <h2>Transactions (Month: {selectedMonth}/{selectedYear})</h2>
            {loading && <div className="loading-placeholder"><p>Loading Expenses...</p></div>}
            {error && <p className="error-message">{error}</p>}
           <ExpenseTable expenses={filteredExpenses} onRowClick={handleOpenEditModal} />
          </div>
          <div className="chart-section">
            <h2>Spending by Category (Month: {selectedMonth}/{selectedYear})</h2>
            {loading && <div className="loading-placeholder"><p>Loading Chart Data...</p></div>} {/* Optional: separate loading for chart */}
            {error && <p className="error-message">{error}</p>} {/* You might want a specific chart error message */}
            {!loading && !error && <CategoryPieChart expenses={filteredExpenses} />}
          </div>
        </div>
        
      </main>
      {isEditModalOpen && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={handleCloseEditModal}
          onSave={handleExpenseUpdated}
          onDelete={handleExpenseDeleted}
          userId={currentUser?.uid}
        />
      )}
      <div className="footer">
        Made with 💖 by <a href="https://www.linkedin.com/in/hariharen9/" target="_blank" rel="noopener noreferrer">Hariharen</a> © 2025
      </div>
    </div>
  );
};

export default Dashboard;