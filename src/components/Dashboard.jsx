import React, { useState, useEffect, useCallback } from 'react';
import MonthSelector from './MonthSelector';
import ExpenseTable from './ExpenseTable';
import CategoryPieChart from './CategoryPieChart';
import AddExpenseForm from './AddExpenseForm';
import EditExpenseModal from './EditExpenseModal';
import CreditCardSpends from './CreditCardSpends';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore'; // Removed 'where' as it's not used directly here
import confetti from 'canvas-confetti';
import '../styles/Dashboard.css';
import '../styles/Footer.css';
import ProfileManager from './ProfileManager'; // Import ProfileManager
import FilterModal from './FilterModal';

const Dashboard = ({ 
  currentUser, 
  onLogout, 
  userProfiles, 
  activeProfile, 
  setActiveProfile, 
  onAddProfile 
}) => {
  const exportToCSV = (expenses) => {
    if (!expenses || expenses.length === 0) {
      alert('No expenses to export');
      return;
    }
    
    const headers = ['"Name"', '"Amount"', '"Date"', '"Category"', '"Type"', '"Comments"'];
    const totalIncome = expenses.reduce((sum, exp) => exp.isIncome ? sum + exp.amount : sum, 0);
    const totalExpense = expenses.reduce((sum, exp) => !exp.isIncome ? sum + exp.amount : sum, 0);
    const netBalance = totalIncome - totalExpense;
    
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        `"${expense.name}"`,
        expense.isIncome ? `"${expense.amount}"` : `"${expense.amount}"`,
        expense.date,
        `"${expense.category}"`,
        expense.isIncome ? 'Income' : 'Expense',
        expense.comments ? `"${expense.comments}"` : ''
      ].join(',')),
      '"","","","","",""',
      '"Total Income","' + totalIncome.toFixed(2) + '","","","",""',
      '"Total Expense","' + totalExpense.toFixed(2) + '","","","",""',
      '"Net Balance","' + netBalance.toFixed(2) + '","","","",""'
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const allCategories = [...new Set(expenses.map(e => e.category))];

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
    if (!currentUser || !activeProfile || !activeProfile.collectionName) {
      setExpenses([]); // Clear expenses if no active profile or user
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const expensesPath = `users/${currentUser.uid}/${activeProfile.collectionName}`;
      const expensesCollectionRef = collection(db, expensesPath);
      const q = query(expensesCollectionRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setExpenses(expensesData);
    } catch (err) {
      console.error(`Error fetching expenses from ${activeProfile.collectionName}: `, err);
      setError(`Failed to fetch expenses for ${activeProfile.profileName}. Please try again.`);
      setExpenses([]); // Clear expenses on error
    }
    setLoading(false);
  }, [currentUser, activeProfile]); // Depend on activeProfile

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]); // fetchExpenses itself depends on activeProfile, so this is fine

  useEffect(() => {
    let filtered = expenses;

    // Filter by month and year first
    if (expenses.length > 0) {
      filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === selectedYear && (expenseDate.getMonth() + 1) === selectedMonth;
      });
    }

    // Then, filter by search term
    if (searchTerm) {
      filtered = filtered.filter(expense => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (expense.name && expense.name.toLowerCase().includes(searchTermLower)) ||
          (expense.category && expense.category.toLowerCase().includes(searchTermLower)) ||
          (expense.comments && expense.comments.toLowerCase().includes(searchTermLower))
        );
      });
    }

    // Filter by category
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(expense => selectedCategories.includes(expense.category));
    }

    // Filter by date range
    if (startDate && endDate) {
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
    }

    setFilteredExpenses(filtered);
  }, [expenses, selectedMonth, selectedYear, searchTerm, selectedCategories, startDate, endDate]);

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

  const handleOpenFilterModal = () => setIsFilterModalOpen(true);
  const handleCloseFilterModal = () => setIsFilterModalOpen(false);

  const handleApplyFilters = () => {
      handleCloseFilterModal();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setStartDate('');
    setEndDate('');
    handleCloseFilterModal();
  };

  return (
    <div className="dashboard-container">
     
      <header className="dashboard-header">
        <div className="header-left">
          <h1><span style={{color: '#ffce52'}}>Spend</span><span style={{color: '#78b300'}}>Wise</span></h1>
          {currentUser && <p className="welcome-message">Welcome, {currentUser.displayName || currentUser.email}!</p>}
        </div>
        <div className="header-right">
          {currentUser && activeProfile && userProfiles && userProfiles.length > 0 && (
            <ProfileManager 
              userProfiles={userProfiles}
              activeProfile={activeProfile}
              setActiveProfile={setActiveProfile}
              onAddProfile={onAddProfile}
            />
          )}
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
          {/* Pass activeProfile to AddExpenseForm for correct collection path */}
          <AddExpenseForm 
            onExpenseAdded={handleExpenseAdded} 
            userId={currentUser?.uid} 
            activeProfileCollectionName={activeProfile?.collectionName} 
          />
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
            <div className="transactions-header">
                <h2>Transactions (Month: {selectedMonth}/{selectedYear})</h2>
                <div className="transactions-controls">
                    <input 
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="filter-button" onClick={handleOpenFilterModal}>Filter</button>
                </div>
            </div>
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
      <CreditCardSpends currentUser={currentUser} />
      {isEditModalOpen && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={handleCloseEditModal}
          onSave={handleExpenseUpdated}
          onDelete={handleExpenseDeleted}
          userId={currentUser?.uid}
          activeProfileCollectionName={activeProfile?.collectionName} // Pass for correct collection path
        />
      )}
      {isFilterModalOpen && (
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={handleCloseFilterModal}
            categories={allCategories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
        />
      )}
      <div className="footer">
        Made with 💖 by <a href="https://www.linkedin.com/in/hariharen9/" target="_blank" rel="noopener noreferrer">Hariharen</a> © 2025
      </div>
    </div>
  );
};

export default Dashboard;