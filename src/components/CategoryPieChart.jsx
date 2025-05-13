import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define neon colors for chart segments, can be expanded or customized
const NEON_COLORS = [
  '#9D00FF', // Primary Neon Purple
  '#FF00C1', // Secondary Neon Pink/Magenta
  '#00FFFF', // Accent Neon Cyan
  '#FFAB00', // Neon Orange (example)
  '#39FF14', // Neon Green (example)
  '#FF1D58', // Neon Red (example)
  '#F7B32B', // Another Neon Yellow/Orange
  '#A200FF', // Another Neon Purple
];

const CategoryPieChart = ({ expenses }) => {
  const getCategoryData = () => {
    if (!expenses || expenses.length === 0) return { data: [], total: 0 };

    let totalExpenses = 0;
    let totalIncome = 0;
    const expenseCategories = {};
    const incomeCategories = {};
    
    expenses.forEach(expense => {
      if (expense.isIncome) {
        incomeCategories[expense.category] = (incomeCategories[expense.category] || 0) + expense.amount;
        totalIncome += expense.amount;
      } else {
        expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.amount;
        totalExpenses += expense.amount;
      }
    });

    const expenseData = Object.entries(expenseCategories).map(([name, value]) => ({
      name: `${name} (Expense)`,
      value: parseFloat(value.toFixed(2)),
      isIncome: false
    }));
    
    const incomeData = Object.entries(incomeCategories).map(([name, value]) => ({
      name: `${name} (Income)`,
      value: parseFloat(value.toFixed(2)),
      isIncome: true
    }));
    
    const data = [...expenseData, ...incomeData];
    return { data, total: parseFloat((totalIncome - totalExpenses).toFixed(2)) };
  };

  const { data: categoryData, total: totalAmountSpent } = getCategoryData();

  if (categoryData.length === 0) {
    return <p className="no-data-message">No expense data available for this month to display the chart.</p>;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalAmountSpent > 0 ? ((data.value / totalAmountSpent) * 100).toFixed(1) : 0;
      return (
        <div className="custom-tooltip-content">
          <p className="tooltip-label">{`${data.name} : ₹${data.value.toFixed(2)}`}</p>
          <p className="tooltip-percentage">{`(${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="category-pie-chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120} // Adjusted outerRadius
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }} 
            formatter={(value, entry) => <span style={{ color: 'var(--text-color)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {categoryData.length > 0 && (
        <div className="total-expenses-display">
          <h4>Net Balance This Month:</h4>
          <p style={{color: totalAmountSpent >= 0 ? '#4CAF50' : '#f44336'}}>
            ₹{Math.abs(totalAmountSpent).toFixed(2)} {totalAmountSpent >= 0 ? '(Surplus)' : '(Deficit)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;