import React from 'react';
import '../styles/FilterModal.css';

const FilterModal = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  setSelectedCategories,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyFilters,
  onClearFilters, // Added this prop
}) => {
  if (!isOpen) {
    return null;
  }

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content filter-modal">
        <div className="modal-header">
          <h3>Filter Transactions</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="filter-section">
          <h4>Categories</h4>
          <div className="categories-list">
            {categories.map((category) => (
              <div key={category} className={`category-item ${selectedCategories.includes(category) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={category}>{category}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <h4>Date Range</h4>
          <div className="date-range-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClearFilters} className="clear-button">Clear Filters</button>
          <button onClick={onApplyFilters} className="apply-button">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
