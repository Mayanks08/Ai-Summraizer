import React, { useState } from 'react';
import { Upload, Send, Loader2 } from 'lucide-react';

interface SummaryData {
  transcript: string;
  prompt: string;
  summary: string;
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize the key points and action items from this meeting');
  const [summary, setSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [message, setMessage] = useState('');

  // Debug: Check environment variables on component load
  React.useEffect(() => {
    console.log('Environment Variables Check:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setMessage('⚠️ Environment variables missing! Check your .env file.');
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim()) {
      setMessage('Please enter a transcript first.');
      return;
    }

    // Check environment variables before making request
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setMessage(' VITE_SUPABASE_URL is not set in environment variables');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setMessage(' VITE_SUPABASE_ANON_KEY is not set in environment variables');
      return;
    }

    setIsGenerating(true);
    setMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize`;
      console.log('🚀 Making request to:', apiUrl);
      
      const payload = {
        transcript: transcript.trim(),
        prompt: customPrompt.trim() || 'Summarize the key points and action items from this meeting'
      };
      console.log('📤 Request payload:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(' Response data:', data);
      
      if (!data.summary) {
        throw new Error('No summary returned from server');
      }

      setSummary(data.summary);
      setEditedSummary(data.summary);
      setMessage(' Summary generated successfully!');
    } catch (error) {
      console.error(' Full error object:', error);
      
      let errorMessage = 'Error generating summary. ';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += 'Network error - check your Supabase URL and internet connection.';
      } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        errorMessage += 'Cannot resolve Supabase URL - check your VITE_SUPABASE_URL environment variable.';
      } else {
        errorMessage += `Details: ${error.message}`;
      }
      
      setMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!editedSummary.trim()) {
      setMessage('Please generate a summary first.');
      return;
    }

    if (!emailAddresses.trim()) {
      setMessage('Please enter at least one email address.');
      return;
    }

    setIsSending(true);
    setMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      console.log('📧 Sending email to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddresses.split(',').map(email => email.trim()),
          subject: emailSubject,
          summary: editedSummary
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
      }

      setMessage('📧 Email sent successfully!');
      setEmailAddresses('');
    } catch (error) {
      console.error(' Email error:', error);
      setMessage(`Error sending email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">AI Meeting Notes Summarizer</h1>
        
    
        
        {/* Transcript Input Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">1. Upload or Paste Meeting Transcript</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload Text File:</label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or Paste Transcript:</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md resize-vertical"
            />
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">2. Custom Instructions (Optional)</h2>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
            className="w-full h-20 p-3 border border-gray-300 rounded-md resize-vertical"
          />
          
          <button
            onClick={generateSummary}
            disabled={isGenerating || !transcript.trim()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>

        {/* Summary Result Section */}
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">3. Generated Summary (Editable)</h2>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full h-60 p-3 border border-gray-300 rounded-md resize-vertical"
            />
          </div>
        )}

        
        {summary && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">4. Share via Email</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email Addresses (comma-separated):</label>
              <input
                type="text"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email Subject:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={sendEmail}
              disabled={isSending || !editedSummary.trim() || !emailAddresses.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('Error') || message.includes('') || message.includes('⚠️')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
