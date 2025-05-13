import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

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
  const [chartType, setChartType] = useState('pie');
  const getCategoryData = () => {
    if (!expenses || expenses.length === 0) return { data: [], total: 0 };

    let totalExpenses = 0;
    const expenseCategories = {};
    
    expenses.forEach(expense => {
      if (!expense.isIncome) {
        expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.amount;
        totalExpenses += expense.amount;
      }
    });

    const expenseData = Object.entries(expenseCategories).map(([name, value]) => ({
      name: `${name}`,
      value: parseFloat(value.toFixed(2)),
      isIncome: false
    }));
    
    return { data: expenseData, total: parseFloat(totalExpenses.toFixed(2)) };
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
      <div className="chart-type-selector">
        <button 
          className={chartType === 'pie' ? 'active' : ''}
          onClick={() => setChartType('pie')}
        >
          Pie
        </button>
        <button 
          className={chartType === 'bar' ? 'active' : ''}
          onClick={() => setChartType('bar')}
        >
          Bar
        </button>
        <button 
          className={chartType === 'line' ? 'active' : ''}
          onClick={() => setChartType('line')}
        >
          Line
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'pie' && (
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
      )}
      
      {chartType === 'bar' && (
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#8884d8">
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      )}
      
      {chartType === 'line' && (
        <LineChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      )}
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