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
    const { caseTitle, caseDetails, type = 'insight' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating AI ${type} for case:`, caseTitle);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'qa') {
      const { question } = await req.json();
      systemPrompt = 'You are a cybersecurity advisor. Answer the user\'s question about cybercrime prevention in 2-3 clear sentences. Be practical and reassuring. Always add: "For official guidance, visit https://cybercrime.gov.in"';
      userPrompt = question;
    } else {
      systemPrompt = 'You are a cybersecurity analyst. Provide 2-3 key insights or global context about this cybercrime case. Keep it under 150 words. Focus on lessons learned and broader implications.';
      userPrompt = `Provide insights about this cybercrime case:\n\nTitle: ${caseTitle}\n\nSummary: ${caseDetails}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || 'Stay vigilant and report suspicious activity to https://cybercrime.gov.in';

    console.log('AI insight generated successfully');

    return new Response(
      JSON.stringify({ insight, generated_by: 'AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-crime-insight:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        insight: 'Unable to generate AI insights. For cybercrime reporting, visit https://cybercrime.gov.in',
        generated_by: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
