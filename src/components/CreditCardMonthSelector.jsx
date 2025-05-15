import React from 'react';

const CreditCardMonthSelector = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2
  ];

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };
  
  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  return (
    <div className="month-selector-container credit-card-month-selector">
      <div>
        <label htmlFor="cc-month-select">Month: </label>
        <select id="cc-month-select" value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="cc-year-select">Year: </label>
        <select id="cc-year-select" value={selectedYear} onChange={handleYearChange}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CreditCardMonthSelector;