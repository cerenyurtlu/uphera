# Next.js Chatbot with Google Generative AI

A minimal Next.js chatbot application using TypeScript and Google's Generative AI (Gemini 2.5 Flash Lite).

## Features

- Real-time chat interface
- Google Gemini 2.5 Flash Lite integration
- TypeScript support
- Minimal, clean UI
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Key

The application uses the provided Gemini API key. The API route is located at `/api/chat` and uses the `gemini-2.5-flash-lite` model.

## Project Structure

```
nextjs-chatbot/
├── app/
│   ├── api/chat/route.ts    # API route for chat
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main chat interface
├── package.json
├── next.config.js
└── tsconfig.json
```

## Usage

1. Type your message in the input field
2. Press Enter or click the Send button
3. The bot will respond using Google's Gemini AI

## Technologies Used

- Next.js 14
- TypeScript
- Google Generative AI (@google/generative-ai)
- React 18
