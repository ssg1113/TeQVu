# TeQVu

**Technology Intelligence & Personalized Newsletter Platform**

TeQVu is a technology intelligence and personalized newsletter platform designed to help users discover emerging technology trends, industry news, research, and relevant insights in one place.

The platform collects technology-related content from multiple sources, organizes it into useful categories, and helps users stay informed through personalized content discovery, automated aggregation, and newsletter features.

🌐 **Live Application:** https://teqvu.vercel.app/  
💻 **Repository:** https://github.com/ssg1113/TeQVu

---

## 🚀 About the Project

Keeping up with rapidly changing technology can be difficult because useful information is distributed across news websites, blogs, research sources, and other platforms.

TeQVu aims to simplify this process by providing a centralized platform where users can discover and follow important developments in technology.

The platform focuses on:

- Emerging technology trends
- Technology news and industry updates
- Research and innovation
- Personalized technology content
- Automated content aggregation
- Newsletter-based updates and alerts

---

## ✨ Key Features

### 📰 Technology News Aggregation

Collects technology-related articles and updates from external sources and presents them through a centralized interface.

### 🔍 Technology Trend Discovery

Helps users explore emerging technologies, industry developments, and important technology topics.

### 👤 Personalized Content

Provides content based on user interests and selected technology categories.

### 📧 Personalized Newsletters

Supports newsletter functionality for delivering relevant technology updates and insights to users.

### 🔄 Automated Content Collection

Scheduled backend processes can automatically retrieve and process new content without requiring manual updates.

### 📡 RSS & External Content Integration

Supports integration with RSS feeds and external content sources to collect recently published technology articles and updates.

### 🔐 User Authentication

Provides authentication functionality for managing users and enabling personalized platform experiences.

### 📱 Responsive User Interface

Designed to work across desktop, tablet, and mobile screen sizes.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- Vite

### Backend & APIs

- Node.js
- REST API Integration
- Serverless/API functions

### Database & Authentication

- Supabase
- PostgreSQL
- Supabase Authentication

### Content & Automation

- RSS Feed Integration
- External API Integration
- Automated Content Aggregation
- Scheduled/Cron Jobs

### Deployment & Development Tools

- Vercel
- Git
- GitHub
- npm
- VS Code

---

## ⚙️ How TeQVu Works

A simplified content flow of the platform is:

```text
Technology Sources
        │
        ▼
RSS Feeds / External APIs
        │
        ▼
Content Collection
        │
        ▼
Content Processing
        │
        ▼
Database
        │
        ├──────────────► Web Application
        │
        └──────────────► Personalized Newsletters
```

Scheduled processes can periodically check configured content sources for new technology articles and updates.

The collected information can then be processed, stored, categorized, and presented to users through the TeQVu interface.

---

## 📂 Project Structure

The application source code is located inside the `teqvu` directory.

```text
TeQVu/
│
├── teqvu/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── README.md
├── vercel.json
└── ...
```

The exact structure may evolve as new functionality is added to the platform.

---

## 💻 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ssg1113/TeQVu.git
```

### 2. Navigate to the application

```bash
cd TeQVu/teqvu
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create the required environment configuration for services used by the application, such as Supabase and external APIs.

Do not commit API keys, database credentials, or other secrets to the repository.

### 5. Start the development server

```bash
npm run dev
```

Open the local development URL displayed in the terminal.

---

## 🌐 Deployment

TeQVu is deployed using Vercel.

The production application is available at:

**https://teqvu.vercel.app/**

Vercel is also used for deployment-related serverless functionality and scheduled tasks where applicable.

---

## 🎯 Project Objectives

The main objectives of TeQVu are to:

- Provide a centralized source for technology-related information.
- Help users discover emerging technologies and industry trends.
- Reduce the need to manually search multiple technology websites.
- Provide personalized technology content based on user interests.
- Automate the collection of relevant technology information.
- Deliver useful updates through personalized newsletters.
- Create a scalable platform that can integrate additional technology information sources in the future.

---

## 🔮 Future Improvements

Potential future improvements include:

- AI-powered article summarization
- Advanced technology trend detection
- Improved recommendation algorithms
- Research-paper discovery
- More technology news and RSS sources
- Advanced user preference management
- Newsletter scheduling and customization
- Trending-topic analytics
- Saved articles and reading lists
- Mobile application support
- Smarter notification and alert systems

---

## 🎓 Project Type

**Individual Software Project**

TeQVu was developed as an individual project focused on full-stack web development, API integration, content aggregation, database management, authentication, automation, and modern web deployment.

---

## 👨‍💻 Developer

**Sandeepa Gayashan De Silva**

BSc (Hons) in Information Technology  
University of Moratuwa

GitHub: https://github.com/ssg1113

---

## 📄 License

This project is currently intended for educational and portfolio purposes.

---

⭐ If you find TeQVu interesting, feel free to explore the repository and follow its future development.
