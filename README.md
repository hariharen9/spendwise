# SpendWise - Expense Tracker done right!
Welcome to SpendWise, a sleek expense tracker built with React.js and Firebase. This app allows you to track your expenses, visualize your spending patterns, and stay on top of your finances across multiple accounts.

<p align="center">
  <img src="./Assets/icon-money.svg" width="300" alt="SpendWise Logo">
</p>

## 🚀 Features

### 📊 Comprehensive Expense Management
- Add, edit, and delete expenses with ease for different financial accounts.
- View all transactions in a clean, sortable table.
- Filter expenses by month and year.
- Export expense data to CSV for analysis.

### 💳 Dedicated Credit Card Tracking
- Manage and track spends for multiple credit cards separately.
- Add, edit, and delete credit card transactions.
- View credit card transactions in their own table, filterable by month and year.
- Export credit card spend data to CSV.

### 💼 Multi-Account/Profile Management
- Create and manage multiple financial profiles (e.g., Personal, Business, Savings).
- Keep expense tracking separate and organized for each profile.
- Switch between profiles seamlessly.

### 📈 Insightful Data Visualization
- Interactive charts (Pie, Bar, Line) showing spending by category, powered by Recharts.
- Monthly spending breakdowns for both general expenses and credit card spends.
- Visual representation of your financial habits.

### 🔐 Secure Authentication
- Google Sign-In integration for easy and secure access.
- User-specific data storage, ensuring your financial information is private.
- Protected expense tracking for all your accounts.

### 🎛️ User-Friendly Dashboard
- Welcome message with personalized greeting.
- Intuitive month/year selector for navigating your financial history.
- Responsive design for a great experience on all devices.
- Dark theme for comfortable viewing.

## 🛠️ Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: CSS (Direct imports and global styles)
- **Charts**: Recharts
- **Backend**: Firebase
  - Firestore Database (for data storage)
  - Authentication (for user management)

## 📸 Screenshots
<div style="display: flex; justify-content: center; gap: 20px;">
  <div>
   <em>Login Page</em>
    <img src="./Assets/ss-0.png" alt="SpendWise Login Page">
  </div>
  <div>
  <em>Add a new Expense</em>
    <img src="./Assets/ss-3.png"  alt="SpendWise Add Expense">
  </div>
</div>

<p align="center">
  <img src="./Assets/ss-1.png" width="900" alt="SpendWise Dashboard">
  <em>Dashboard View</em>
</p>

## ⚡ Getting Started (For Development)

1. Ensure you have access to the repository.
2. Install dependencies: `npm install`
3. Configure Firebase credentials in your local environment (e.g., `.env` file based on `.env.example` if provided).
4. Run the app: `npm run dev`

## 📝 Notes

SpendWise is designed to be your personal, secure daily expense tracker. If you encounter any issues or have suggestions for improvement, please report them through the designated channels.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Created with ❤️ by [Hariharen](https://www.linkedin.com/in/hariharen9/)

© 2024-2025 SpendWise
