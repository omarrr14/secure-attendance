# Secure Attendance Client

The official React frontend for the Secure Biometric Attendance System. This application provides interfaces for Students, Professors (Doctors), and Administrators to interact with the attendance system.

## Features

- **Role-Based Dashboards**:
  - **Student**: View enrolled courses, scan dynamic QR codes for attendance, viewing attendance history.
  - **Professor**: specific class management, generate secure dynamic QR codes, view live attendance stats.
  - **Admin**: System-wide management (users, courses, semesters).
- **Secure Authentication**: Integration with the backend JWT and FIDO2/WebAuthn flows.
- **Dynamic QR Scanning**: Built-in QR code scanner for validating attendance tokens.
- **Modern UI**: Built with React, Tailwind CSS, and Lucide Icons for a clean, responsive experience.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1.  **Navigate to the client directory**:
    ```bash
    cd SecureAttendance.Client
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

2.  **Access the application**:
    Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Configuration

The application expects the backend API to be running. By default, it may look for the API at `https://localhost:5001`.
Ensure your `vite.config.ts` or API service configuration matches your backend URL.

## Build for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` folder.

## Project Structure

- `src/components`: Reusable UI components (Buttons, Inputs, etc.)
- `src/pages`: Main application pages (Login, Dashboards)
- `src/services`: API communication logic (axios setup)
- `src/types`: TypeScript interfaces for data models
