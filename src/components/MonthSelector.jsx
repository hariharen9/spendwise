import React from 'react';
// import '../styles/MonthSelector.css'; // Styles will be in Dashboard.css for now

const MonthSelector = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate array of years (current year and 2 years before and after)
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
    <div className="month-selector-container">
      <div>
        <label htmlFor="month-select">Month: </label>
        <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="year-select">Year: </label>
        <select id="year-select" value={selectedYear} onChange={handleYearChange}>
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

export default MonthSelector;