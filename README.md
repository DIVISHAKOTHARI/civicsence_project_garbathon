# CivicSense | AI-Powered Smart Municipal Agent 🏙️

CivicSense is a modern, intelligent municipal complaint management system designed to bridge the gap between citizens and local government. Leveraging **Gemini AI**, CivicSense simplifies the reporting process by automatically identifying civic issues from photos, mapping them to the correct administrative wards, and filing reports in real-time.

![CivicSense Dashboard](https://raw.githubusercontent.com/yourusername/civicsense/main/public/assets/aistudio/image_cd52d759.png)

## ✨ Key Features

-   **🤖 AI-Powered Analysis**: Automatically identify issue types (potholes, garbage, water logging, etc.) and generate professional descriptions using multi-modal AI.
-   **📍 Automated Routing**: Intelligently maps reports to specific municipal wards and departments based on location hints or user input.
-   **🎙️ Voice-to-Text Reporting**: Integrated **Web Speech API** allows users to describe issues via microphone input for faster, hands-free reporting.
-   **🌍 Multi-lingual Support**: Full support for **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)** to ensure accessibility for all citizens.
-   **🌓 Dynamic Theme Engine**: Seamlessly switch between a crisp Light Mode and a sophisticated Dark Mode.
-   **📱 Innovative UI**: A ChatGPT-style conversational interface built with a minimalist, high-fidelity design inspired by modern architectural aesthetics.
-   **🗄️ Local Persistence**: Robust mock municipal system using LocalStorage for private, immediate data management.
-   **🌓 Sliding Sidebar**: Collapsible navigation for a focused reporting experience and quick access to complaint history.

## 🚀 Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide Icons.
-   **Backend**: Node.js, Express.
-   **AI Intelligence**: @google/genai (Gemini 3.8 Flash).
-   **Browser APIs**: Web Speech API (SpeechRecognition).
-   **Design Language**: Minimalist Architectural / Neo-Grotesque.

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/civicsense.git
    cd civicsense
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root and add your Gemini API key:
    ```env
    GEMINI_API_KEY="your_api_key_here"
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for production**:
    ```bash
    npm run build
    npm start
    ```

## 📖 Usage Guide

1.  **Login**: Use the "Continue as Guest" option to enter the dashboard instantly using local storage.
2.  **File a Report**:
    -   Click the **Camera icon** to upload a photo of the civic issue.
    -   Optionally, click the **Microphone icon** to describe the issue using your voice.
    -   The AI Agent will analyze the input, identify the ward/department, and provide a tracking ID.
3.  **Check Status**: Simply ask "What is the status of my complaint?" or navigate to "My Complaints" in the sidebar.
4.  **Settings**: Toggle between Light/Dark mode or change the application language via the top control bar.

## 📜 License

This project is licensed under the Apache-2.0 License.

---
Built with ❤️ for Smarter Cities.
