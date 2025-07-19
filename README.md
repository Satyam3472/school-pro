# 🏫 Kids Life School Management System

A modern, comprehensive school management system built with Next.js, TypeScript, and Tailwind CSS. Designed to streamline administrative tasks, track student progress, and manage school finances efficiently.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-New%20York-000000?style=for-the-badge)

## ✨ Features

### 📊 **Dashboard & Analytics**
- **Real-time Dashboard**: Comprehensive overview with key metrics
- **Interactive Charts**: Financial trends, attendance tracking, and expense breakdown
- **Performance Metrics**: Student growth, revenue analysis, and attendance rates
- **Visual Data**: Beautiful charts using Recharts and shadcn/ui components

### 👥 **Student Management**
- **Student Directory**: Complete student information management
- **Admission System**: Streamlined admission process with forms
- **Attendance Tracking**: Daily and weekly attendance monitoring
- **Student Profiles**: Detailed student records and progress tracking

### 💰 **Financial Management**
- **Fee Management**: Comprehensive fee collection and tracking system
- **Expense Tracking**: Categorized expense management with status tracking
- **Financial Reports**: Monthly income vs expenses analysis
- **Payment Status**: Real-time payment status monitoring

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Beautiful dark and light theme switching
- **Professional Layout**: Clean, modern interface with proper spacing
- **Interactive Components**: Hover effects, animations, and smooth transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyam3472/school-pro.git
   cd school-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
school-pro/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── admissions/     # Admission management
│   │   │   ├── expenses/       # Expense tracking
│   │   │   ├── fee-management/ # Fee management
│   │   │   └── students/       # Student management
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── AppSidebar.tsx      # Main sidebar navigation
│   │   ├── NavBar.tsx          # Top navigation
│   │   └── ...                 # Other components
│   ├── data/
│   │   └── data.js             # Static data and constants
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile detection hook
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
├── components.json             # Shadcn/ui configuration
└── package.json               # Dependencies and scripts
```

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **React 19**: Latest React features and performance

### **Styling & UI**
- **Tailwind CSS 4**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful, accessible component library
- **Lucide React**: Modern icon library
- **Framer Motion**: Smooth animations and transitions

### **Charts & Data Visualization**
- **Recharts**: Composable charting library
- **Shadcn Chart**: Pre-configured chart components

### **Development Tools**
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **TypeScript**: Static type checking

## 🎯 Key Features in Detail

### **📊 Dashboard Analytics**
The dashboard provides a comprehensive overview of school operations:

- **Financial Performance**: Monthly income vs expenses trends
- **Student Metrics**: Total enrollment, attendance rates, and growth
- **Fee Collection**: Payment status breakdown with visual charts
- **Expense Analysis**: Categorized expense tracking and reporting

### **👥 Student Management System**
Complete student lifecycle management:

- **Student Directory**: Search, filter, and manage student records
- **Admission Process**: Streamlined admission forms and workflow
- **Attendance Tracking**: Daily attendance monitoring with reports
- **Student Profiles**: Comprehensive student information management

### **💰 Financial Management**
Robust financial tracking and reporting:

- **Fee Management**: Multiple fee types, payment schedules, and status tracking
- **Expense Tracking**: Categorized expenses with approval workflows
- **Financial Reports**: Monthly, quarterly, and yearly financial analysis
- **Payment Processing**: Payment status monitoring and reminders

## 🎨 Design System

### **Color Palette**
- **Primary**: Modern blue tones for trust and professionalism
- **Success**: Green shades for positive metrics and growth
- **Warning**: Orange tones for pending items and alerts
- **Error**: Red shades for overdue payments and issues

### **Typography**
- **Font Family**: Geist Sans for clean, modern readability
- **Hierarchy**: Clear typography scale for information hierarchy
- **Accessibility**: High contrast ratios and readable font sizes

### **Components**
- **Cards**: Consistent card design for content organization
- **Charts**: Interactive charts with proper tooltips and legends
- **Forms**: Accessible form components with validation
- **Navigation**: Intuitive sidebar and breadcrumb navigation

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full-featured dashboard with side-by-side layouts
- **Tablet**: Adapted layouts for medium screens
- **Mobile**: Touch-friendly interface with mobile-optimized navigation

## 🌙 Dark Mode Support

Complete dark mode implementation with:

- **Automatic Theme Detection**: Respects system preferences
- **Manual Toggle**: User-controlled theme switching
- **Consistent Styling**: All components support both themes
- **Smooth Transitions**: Elegant theme switching animations

## 🚀 Deployment

### **Static Export**
This project is configured for static export:

```bash
npm run build
npm run export
```

### **Deployment Platforms**
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting for open source projects

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design compatibility
- Test in both light and dark modes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui**: For the beautiful component library
- **Lucide**: For the modern icon set
- **Recharts**: For the charting capabilities
- **Tailwind CSS**: For the utility-first styling approach

## 📞 Support

For support and questions:

- **Email**: kumarsatyam8298380149@gmail.com
- **Documentation**: [docs.kidslife.edu.in](https://docs.kidslife.edu.in)
- **Issues**: [GitHub Issues](https://github.com/satyam3472/school-pro/issues)

---

<div align="center">

**Made with ❤️ for better education management**

[![GitHub stars](https://img.shields.io/github/stars/satyam3472/school-pro?style=social)](https://github.com/satyam3472/school-pro/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/satyam3472/school-pro?style=social)](https://github.com/satyam3472/school-pro/network)
[![GitHub issues](https://img.shields.io/github/issues/satyam3472/school-pro)](https://github.com/satyam3472/school-pro/issues)

</div>
