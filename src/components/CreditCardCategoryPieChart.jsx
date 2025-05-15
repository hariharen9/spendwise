import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NEON_COLORS = [
  '#9D00FF', 
  '#FF00C1', 
  '#00FFFF', 
  '#FFAB00', 
  '#39FF14', 
  '#FF1D58', 
  '#F7B32B', 
  '#A200FF',
];

const CreditCardCategoryPieChart = ({ expenses }) => {
  const getCategoryData = () => {
    if (!expenses || expenses.length === 0) return { data: [], total: 0 };

    let totalSpends = 0;
    const categories = {};
    
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      totalSpends += expense.amount;
    });

    const chartData = Object.entries(categories).map(([name, value]) => ({
      name: `${name}`,
      value: parseFloat(value.toFixed(2)),
    }));
    
    return { data: chartData, total: parseFloat(totalSpends.toFixed(2)) };
  };

  const { data: categoryData, total: totalAmountSpent } = getCategoryData();

  if (categoryData.length === 0) {
    return <p className="no-data-message">No credit card spend data available for the selected period to display the chart.</p>;
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
    <div className="category-pie-chart-container credit-card-pie-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
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
          <h4>Total CC Spends for Selected Period:</h4>
          <p style={{color: '#f44336'}}>
            ₹{Math.abs(totalAmountSpent).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditCardCategoryPieChart;