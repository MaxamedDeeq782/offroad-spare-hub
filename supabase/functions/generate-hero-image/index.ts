
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const prompt = `Professional hero banner image for OffroadSpareHub automotive parts company. 
    Scene: Dramatic desert landscape at golden hour with rugged mountains in background. 
    Main elements: Multiple off-road vehicles including Toyota Hilux, Land Cruiser, and Nissan Patrol positioned dynamically on rocky terrain, kicking up dust. 
    Foreground: High-quality automotive spare parts (gearboxes, radiators, exhaust systems) arranged professionally.
    Style: Cinematic, high contrast, premium automotive photography aesthetic. 
    Colors: Deep oranges, reds, and metallic tones that complement a dark theme. 
    Lighting: Dramatic golden hour lighting with strong shadows and highlights. 
    Composition: Wide format suitable for website hero banner, with space for text overlay on left side.
    Quality: Ultra-high resolution, commercial photography style, sharp details.`

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1792x1024',
        quality: 'high',
        output_format: 'webp',
        output_compression: 85,
        n: 1
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Image generation successful')

    return new Response(
      JSON.stringify({ 
        success: true,
        image: data.data[0].b64_json,
        message: 'Hero banner image generated successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating hero image:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate hero image', 
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
