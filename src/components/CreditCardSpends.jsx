import React, { useState, useEffect, useCallback } from 'react';
import CreditCardMonthSelector from './CreditCardMonthSelector';
import CreditCardExpenseTable from './CreditCardExpenseTable';
import CreditCardCategoryPieChart from './CreditCardCategoryPieChart';
import AddCreditCardSpendForm from './AddCreditCardSpendForm';
import EditCreditCardSpendModal from './EditCreditCardSpendModal';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti'; // Optional: if you want confetti here too
import '../styles/Dashboard.css'; // Main dashboard styles will be reused

const CreditCardSpends = ({ currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [spends, setSpends] = useState([]);
  const [filteredSpends, setFilteredSpends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const today = new Date();
  const initialMonth = today.getMonth() + 1; // Current month
  const initialYear = today.getFullYear(); // Current year

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [userCreditCards, setUserCreditCards] = useState([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSpend, setSelectedSpend] = useState(null);

  const fetchSpends = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      // Fetch user's credit cards
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().creditCards) {
        setUserCreditCards(userDocSnap.data().creditCards);
      } else {
        setUserCreditCards([]); // Initialize if not present
      }
      
      // Fetch credit card spends
      const spendsCollection = collection(db, 'users', currentUser.uid, 'creditCardSpends');
      const q = query(spendsCollection, orderBy('transactionDate', 'desc')); // Order by transactionDate
      const querySnapshot = await getDocs(q);
      const rawSpendsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure amount is a number
        if (data.amount && typeof data.amount === 'string') {
          data.amount = parseFloat(data.amount);
        }
        return { ...data, id: doc.id };
      });
      
      console.log('Fetched spends:', rawSpendsData.length);
      setSpends(rawSpendsData);

      // Directly filter after fetching
      if (rawSpendsData.length > 0) {
        // First, log all spends to help with debugging
        console.log('All spends:', rawSpendsData.map(s => ({
          id: s.id,
          name: s.name,
          amount: s.amount,
          transactionDate: s.transactionDate,
          card: s.card
        })));
        
        const filtered = rawSpendsData.filter(spend => {
          if (!spend.transactionDate) {
            console.log('Excluding spend due to missing transactionDate:', spend.name);
            return false; // Exclude spends without a transaction date
          }

          let spendDate;
          if (typeof spend.transactionDate === 'string') {
            spendDate = new Date(spend.transactionDate);
          } else if (spend.transactionDate && typeof spend.transactionDate.toDate === 'function') {
            spendDate = spend.transactionDate.toDate(); // Firestore Timestamp
          } else {
            console.warn('Invalid or missing transactionDate for spend:', spend.id, spend.transactionDate);
            return false; // Exclude if transactionDate is invalid or missing
          }

          if (isNaN(spendDate.getTime())) {
            console.warn('Invalid date parsed for spend:', spend.id, spend.transactionDate);
            return false; // Exclude if date is invalid after parsing
          }

          const spendMonth = spendDate.getMonth() + 1;
          const spendYear = spendDate.getFullYear();

          return spendMonth === selectedMonth && spendYear === selectedYear;
        });
        
        console.log('Filtered spends:', filtered.length);
        setFilteredSpends(filtered);
      } else {
        console.log('No spends found');
        setFilteredSpends([]);
      }
    } catch (err) {
      console.error("Error fetching or filtering credit card spends: ", err);
      setError('Failed to fetch or filter credit card spends. Please try again.');
      setSpends([]); // Clear spends on error
      setFilteredSpends([]); // Clear filtered spends on error
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedMonth, selectedYear]);

useEffect(() => {
  if (!isCollapsed && currentUser) { // Only fetch if the component is expanded and user is available
      fetchSpends();
  }
  // If collapsed, clear spends to avoid showing stale data if month/year changes while collapsed
  // Or, keep them if you want to preserve the last viewed state.
  // For now, let's not clear them to avoid re-fetch unless necessary.
  // if (isCollapsed) {
  //   setFilteredSpends([]); 
  // }
}, [fetchSpends, isCollapsed, currentUser, selectedMonth, selectedYear]); // Added currentUser, selectedMonth, selectedYear to ensure fetchSpends is called if these change while expanded

  const handleAddCreditCard = async (newCardName) => {
    if (!currentUser || !newCardName.trim()) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        creditCards: arrayUnion(newCardName.trim())
      });
      setUserCreditCards(prev => [...prev, newCardName.trim()]);
      // Optionally, re-fetch spends or user profile if needed, but arrayUnion should be fine for local state update
    } catch (error) {
      console.error("Error adding new credit card: ", error);
      setError('Failed to add new credit card.');
    }
  };

  const handleSpendAdded = () => {
    fetchSpends();
  };

  const handleOpenEditModal = (spend) => {
    setSelectedSpend(spend);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedSpend(null);
    setIsEditModalOpen(false);
  };

  const handleSpendUpdated = () => {
    fetchSpends();
    handleCloseEditModal();
  };

  const handleSpendDeleted = () => {
    fetchSpends();
    handleCloseEditModal();
  };
  
  const exportCreditCardSpendsToCSV = (spendsToExport) => {
    if (!spendsToExport || spendsToExport.length === 0) {
      alert('No credit card spends to export');
      return;
    }
    
    const headers = ['"Name"', '"Amount"', '"Transaction Date"', '"Category"', '"Card"', '"Comments"'];
    const totalSpendsAmount = spendsToExport.reduce((sum, spend) => sum + spend.amount, 0);
        
    const csvContent = [
      headers.join(','),
      ...spendsToExport.map(spend => [
        `"${spend.name}"`,        
        `"${spend.amount.toFixed(2)}"`,
        `"${spend.transactionDate ? (typeof spend.transactionDate === 'string' ? spend.transactionDate : spend.transactionDate.toDate().toISOString().split('T')[0]) : ''}"`, // Add Transaction Date to CSV
        `"${spend.category}"`,
        `"${spend.card}"`,
        spend.comments ? `"${spend.comments}"` : ''
      ].join(',')), 
      '"","","","",""', // Empty line for separation, adjusted columns
      '"Total Credit Card Spends","' + totalSpendsAmount.toFixed(2) + '","","",""' // Adjusted for added column
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SpendWise_CreditCardSpends_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="credit-card-spends-container">
      <div 
        className="credit-card-spends-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3>Credit Card Spends ({selectedMonth}/{selectedYear})</h3>
        <span>{isCollapsed ? '+' : '-'}</span>
      </div>
      {!isCollapsed && (
        <div className="credit-card-spends-content">
          <header className="dashboard-header cc-header-override">
            <div className="header-left">
              {/* Optional: Title or welcome message specific to CC spends */}
            </div>
            <div className="header-right">
              <CreditCardMonthSelector 
                selectedMonth={selectedMonth} 
                setSelectedMonth={setSelectedMonth} 
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
              {currentUser && <button className="export-button" onClick={() => exportCreditCardSpendsToCSV(filteredSpends)}>
                Export CC Spends
              </button>}
            </div>
          </header>
          <main className="dashboard-main">
            <div className="add-expense-section">
              <AddCreditCardSpendForm 
                onSpendAdded={handleSpendAdded} 
                userId={currentUser?.uid} 
                userCreditCards={userCreditCards} 
                onAddCreditCard={handleAddCreditCard} 
              />
              <div className="summary-card" onClick={() => {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }}>
                <h3>Credit Card Spends Summary</h3>
                <div className="summary-item">
                  <span>Total Spends:</span>
                  <span className="expense-amount">
                    ₹{filteredSpends.reduce((sum, spend) => sum + spend.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="content-area">
              <div className="expenses-section">
                <h2>All Credit Card Spends</h2>
                {loading && <div className="loading-placeholder"><p>Loading Spends...</p></div>}
                {error && <p className="error-message">{error}</p>}
                <CreditCardExpenseTable expenses={filteredSpends} onRowClick={handleOpenEditModal} />
              </div>
              <div className="chart-section">
                <h2>Spends by Category ({selectedMonth}/{selectedYear})</h2>
                {loading && <div className="loading-placeholder"><p>Loading Chart...</p></div>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && <CreditCardCategoryPieChart expenses={filteredSpends} />}
              </div>
            </div>
          </main>
          {isEditModalOpen && selectedSpend && (
            <EditCreditCardSpendModal
              spend={selectedSpend}
              onClose={handleCloseEditModal}
              onSave={handleSpendUpdated}
              onDelete={handleSpendDeleted}
              userId={currentUser?.uid}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreditCardSpends;