# AI Meeting Notes Summarizer

A full-stack application that uses AI to summarize meeting transcripts and share them via email.

## Features

- Upload text files or paste meeting transcripts
- Custom AI prompts for different summarization styles
- AI-powered summarization using OpenAI GPT
- Editable summary results
- Email sharing functionality

## Setup Instructions

### 1. API Keys Required

You'll need to obtain API keys for:

**OpenAI API** (for AI summarization):
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Add credits to your account for API usage

**Resend API** (for email functionality):
1. Go to [Resend](https://resend.com/)
2. Sign up and get your API key
3. Verify a domain or use their test domain

### 2. Environment Variables

Create a `.env` file in your project root with:

```env
OPENAI_API_KEY=your_openai_api_key_here
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Local Development

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The app will be available at `http://localhost:5173`

### 4. Using the Application

1. **Upload/Paste Transcript**: Either upload a .txt file or paste your meeting transcript
2. **Set Custom Instructions**: Modify the prompt to get different types of summaries
3. **Generate Summary**: Click to process with AI
4. **Edit Summary**: Modify the generated summary as needed
5. **Send Email**: Enter email addresses and send the summary

## Technical Details

- Frontend: React with TypeScript and Tailwind CSS
- Backend: Supabase Edge Functions
- AI: OpenAI GPT-4o-mini
- Email: Resend API

## Cost Considerations

- OpenAI API charges per token (approximately $0.002 per 1K tokens)
- Resend offers 3,000 free emails per month
- Both services have pay-as-you-go pricing

## Troubleshooting

- Make sure API keys are properly set in environment variables
- Check the browser console for any error messages
- Verify that your OpenAI account has available credits
- Ensure your Resend domain is verified for email sending