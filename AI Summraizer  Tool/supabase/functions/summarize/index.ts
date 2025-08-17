

import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const { transcript, prompt } = await req.json();
    console.log('Received Payload:', { transcript: transcript?.length, prompt });

    if (!transcript?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Making OpenAI request...');
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that summarizes meeting transcripts based on user instructions.' 
          },
          { 
            role: 'user', 
            content: `${prompt || 'Summarize this meeting transcript:'}\n\n${transcript}` 
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    const data = await completion.json();
    console.log('OpenAI Response Status:', completion.status);

    if (!completion.ok) {
      console.error('OpenAI API Error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate summary', 
          details: data.error?.message || 'Unknown OpenAI error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const summary = data.choices?.[0]?.message?.content;
    if (!summary) {
      return new Response(
        JSON.stringify({ error: 'No summary generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ summary }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Summarize function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});