import React from 'react';
// import '../styles/MonthSelector.css'; // Styles will be in Dashboard.css for now

const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  return (
    <div className="month-selector-container">
      <label htmlFor="month-select">Select Month: </label>
      <select id="month-select" value={selectedMonth} onChange={handleChange}>
        {months.map((month, index) => (
          <option key={index} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;