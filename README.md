# 🛍️ DesiDeal Hunter : AI-Powered Visual Price Intelligence

[![Deploy with Vercel](https://vercel.com/button)](https://recommender-sys.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

**Live Demo:** (https://recommender-sys.vercel.app/)

## 📋 Executive Summary

**LensLook** (internally `Recommender_Sys`) is a visual intelligence tool designed to solve price fragmentation in the e-commerce market. By leveraging **Computer Vision (Google Lens)** and **Real-time Scraping**, this tool allows users to upload a product image and instantly identify the "Best Value" option across multiple retailers (Amazon, Flipkart, Myntra, etc.).

This project demonstrates the integration of **AI-driven search** with a modern **Full-Stack Web Architecture**, moving beyond simple keyword matching to visual identity matching.

## ✨ Key Features

* **Visual Search Engine:** Upload any product image to find exact matches across the web using Google Lens technology.
* **Smart Price Comparison:** Aggregates real-time pricing from major Indian retailers to find the lowest price.
* **Intelligent Filtering:** Automatically filters for currency (INR) and sorts by "Best Deal."
* **Data Persistence:** Uses Supabase (PostgreSQL) to securely log search sessions and user history.
* **Modern UI:** A responsive, "Glassmorphism" design built with Tailwind CSS.

## 🛠️ Technical Architecture

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router, Server Components).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Icons).
* **AI/Search Engine:** [SerpApi](https://serpapi.com/) (Google Lens API).
* **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth).
* **Deployment:** [Vercel](https://vercel.com/) (CI/CD Pipeline).

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

* Node.js 18+ installed.
* A [SerpApi](https://serpapi.com/) API Key.
* A [Supabase](https://supabase.com/) Project URL and Anon Key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AbhilashBagde/Recommender_Sys.git](https://github.com/AbhilashBagde/Recommender_Sys.git)
    cd Recommender_Sys
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root directory and add your keys:

    ```env
    # Google Lens / Visual Search API
    SERPAPI_KEY=your_serpapi_key_here

    # Supabase Configuration (Database)
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Navigate to `http://localhost:3000` in your browser.

## 📂 Project Structure

```text
Recommender_Sys/
├── app/
│   ├── actions/       # Server Actions (API Logic for SerpApi)
│   ├── page.tsx       # Main UI (Home Page)
│   └── layout.tsx     # Root Layout
├── components/        # Reusable UI Components (Cards, Uploaders)
├── lib/
│   └── supabase/      # Database Client Configuration
├── public/            # Static Assets (Images, Icons)
└── .env.local         # Environment Variables (Not committed)
