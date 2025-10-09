import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating AI cyber security tip...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Provide one practical, actionable security tip in 2-3 sentences. Focus on real-world protection. Be clear and beginner-friendly.'
          },
          {
            role: 'user',
            content: 'Give me one important cybersecurity tip for today.'
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    const tip = data.choices?.[0]?.message?.content || 'Enable two-factor authentication on all your accounts.';

    console.log('AI tip generated successfully');

    return new Response(
      JSON.stringify({ tip, generated_by: 'AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-cyber-tip:', error);
    
    // Fallback tip
    const fallbackTip = 'Use unique, strong passwords for each account and enable two-factor authentication wherever possible.';
    
    return new Response(
      JSON.stringify({ tip: fallbackTip, generated_by: 'fallback' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
