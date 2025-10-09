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
    const { entropy, length, hasUppercase, hasLowercase, hasNumbers, hasSymbols, crackTime } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating password strength advice...');

    const passwordProfile = `
      Length: ${length} characters
      Uppercase: ${hasUppercase ? 'Yes' : 'No'}
      Lowercase: ${hasLowercase ? 'Yes' : 'No'}
      Numbers: ${hasNumbers ? 'Yes' : 'No'}
      Symbols: ${hasSymbols ? 'Yes' : 'No'}
      Entropy: ${entropy.toFixed(1)} bits
      Est. crack time (GPU cluster): ${crackTime}
    `;

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
            content: 'You are a password security expert. Analyze the password characteristics and provide 2-3 specific, actionable suggestions to improve its strength. Be encouraging but honest. Keep response under 100 words.'
          },
          {
            role: 'user',
            content: `Analyze this password profile and suggest improvements:\n${passwordProfile}`
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
    const advice = data.choices?.[0]?.message?.content || 'Increase length to 16+ characters and include uppercase, lowercase, numbers, and symbols.';

    console.log('Password advice generated successfully');

    return new Response(
      JSON.stringify({ advice, generated_by: 'AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-password-advice:', error);
    
    return new Response(
      JSON.stringify({ 
        advice: 'Aim for 16+ characters with a mix of uppercase, lowercase, numbers, and symbols. Consider using a passphrase.',
        generated_by: 'fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
