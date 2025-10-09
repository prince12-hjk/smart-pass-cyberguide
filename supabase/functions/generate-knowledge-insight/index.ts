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
    const { topic, type = 'insight' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating AI ${type} for topic:`, topic);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'surprise') {
      systemPrompt = 'You are a cybersecurity educator. Share one fascinating, lesser-known cybersecurity fact in 2-3 sentences. Make it engaging and educational.';
      userPrompt = 'Give me a surprising cybersecurity fact that most people don\'t know.';
    } else {
      systemPrompt = 'You are a cybersecurity expert. Provide 2-3 additional insights, tips, or prevention strategies related to the topic. Keep it under 200 words. Be practical and actionable.';
      userPrompt = `Provide extra insights and prevention tips about: ${topic}`;
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
    const insight = data.choices?.[0]?.message?.content || 'Always verify the authenticity of emails and links before clicking.';

    console.log('AI insight generated successfully');

    return new Response(
      JSON.stringify({ insight, generated_by: 'AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-knowledge-insight:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        insight: 'Unable to generate AI insights at this time. Please try again later.',
        generated_by: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
