# 🚍 Smart University Shuttle System - Admin Dashboard

**A comprehensive Next.js web application for shuttle fleet management.**  
Administrators get powerful tools for fleet management, real-time monitoring, user management, and AI-powered analytics through a modern web dashboard.

This is a [Next.js](https://nextjs.org) project built with TypeScript and modern web technologies.

---

## 🧭 Project Overview

The Smart University Shuttle System Admin Dashboard is the administrative interface for a comprehensive transportation management solution. It provides fleet managers with powerful tools to monitor shuttle operations, manage users, analyze performance data, and leverage AI for demand prediction and schedule optimization.

### System Architecture

- **Web Dashboard**: Next.js 15 with TypeScript (this repository)
- **Mobile App**: React Native with Expo for students and drivers
- **Backend**: Firebase services (Firestore, Realtime Database, Authentication)
- **AI Integration**: Google Gemini AI for demand prediction and analytics

---

## 🎯 Dashboard Features

### For Administrators

- **Fleet Management Dashboard**: Comprehensive shuttle and driver management
- **Real-time Monitoring**: Live shuttle tracking with status updates
- **User Management**: Create, update, and manage student/driver accounts
- **Advanced Analytics**: AI-powered insights and demand predictions
- **Route Management**: Create and manage shuttle routes
- **Analytics Dashboard**: View system performance and usage statistics

---

## 👥 User Roles

| Role      | Capabilities                                           |
| --------- | ------------------------------------------------------ |
| **Admin** | Fleet management, user management, analytics, AI tools |

---

## 📊 Key Features

### 🔐 Authentication

- Firebase Authentication integration
- Role-based access control
- Secure admin login system

### 🗺️ Real-time Monitoring

- Live shuttle locations on interactive maps
- Real-time driver status updates
- Fleet performance tracking

### 👥 User Management

- Student and driver account management
- Role assignment and permissions
- User activity monitoring

### 📈 Analytics & AI

- AI-powered demand prediction
- Schedule optimization recommendations
- Performance metrics and reporting
- Natural language analytics chat

### 🚌 Fleet Management

- Shuttle registration and management
- Route creation and optimization
- Driver-shuttle assignments
- Maintenance tracking

---

## ⚙️ Tech Stack

| Category         | Technology                   | Version  |
| ---------------- | ---------------------------- | -------- |
| Framework        | Next.js                      | v15.2.3  |
| Language         | TypeScript                   | v5.8.2   |
| UI Framework     | React                        | v19.0.0  |
| Styling          | Tailwind CSS                 | v4.0.15  |
| UI Components    | shadcn/ui, Radix UI          | Latest   |
| State Management | TanStack Query (React Query) | v5.84.2  |
| Authentication   | Firebase Auth                | v12.1.0  |
| Database         | Firebase Firestore           | v12.1.0  |
| Real-time Data   | Firebase Realtime Database   | v12.1.0  |
| AI Integration   | Google Gemini AI             | v0.24.1  |
| Maps             | Google Maps API              | v2.20.7  |
| Icons            | Lucide React                 | v0.539.0 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase project with Firestore and Realtime Database enabled
- Google Maps API key
- Google Gemini AI API key

### Quick Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp env.example .env.local
   # Fill in your Firebase, Google Maps, and Gemini AI credentials
   ```

3. **Firebase Setup**
   - Create Firebase project and enable Firestore and Realtime Database
   - Set up Firebase Authentication
   - Configure database rules

4. **Google Services Setup**
   - Enable Google Maps API
   - Enable Google Gemini AI API
   - Create API keys and add to `.env.local`

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Learn More

- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about Next.js features and API
- **[Firebase Documentation](https://firebase.google.com/docs)** - Firebase services documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components built with Radix UI and Tailwind CSS

---

## 🌐 Community

- **[Next.js GitHub](https://github.com/vercel/next.js)** - Next.js framework
- **[Firebase Community](https://firebase.google.com/community)** - Firebase community resources
- **[Vercel Discord](https://discord.gg/nextjs)** - Next.js community discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
