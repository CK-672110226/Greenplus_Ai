// classify-waste — Supabase Edge Function
// Proxies waste classification requests to the Anthropic API.
// Keeps the API key server-side; replaces the direct browser call in secondBrain.js.
//
// Security notes:
//   - Caller must be an authenticated Supabase user (JWT checked via auth.getUser())
//   - model is validated against ALLOWED_MODELS whitelist
//   - description is capped at MAX_DESCRIPTION_CHARS to prevent cost abuse
//   - systemPrompt is hardcoded server-side; clients cannot override it
//
// Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY   — Anthropic API key
//   SUPABASE_URL        — injected automatically by Supabase
//   SUPABASE_ANON_KEY   — injected automatically by Supabase

import { serve }         from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5',
  'claude-sonnet-4-6',
  'claude-sonnet-4-5',
])

const MAX_DESCRIPTION_CHARS = 2_000

const SYSTEM_PROMPT = `You are WasteScan-AI, the waste classification engine for GreenPlus.Ai — a Thai recycling marketplace.
Thai households and scrap shops use your output to sell recyclables at fair market prices.
You receive a plain-text description of an item and return a structured classification.

## ACCEPTED MATERIALS
Use ONLY these exact materialType identifiers:
  aluminum_can          — Aluminum Can (กระป๋องอลูมิเนียม)
  pet_bottle_clear      — PET Bottle Clear (ขวด PET ใส)
  pet_bottle_colored    — PET Bottle Colored (ขวด PET สี)
  hdpe_plastic          — HDPE Plastic (พลาสติก HDPE)
  cardboard             — Cardboard (กระดาษลัง)
  newspaper             — Newspaper (หนังสือพิมพ์)
  glass_bottle          — Glass Bottle (ขวดแก้ว)
  copper_wire           — Copper Wire (ลวดทองแดง)

## GRADING CRITERIA
  A — Clean, dry, uncontaminated, structurally intact. Full market value.
  B — Slightly soiled, minor surface stains, small dents. Acceptable quality.
  C — Heavily soiled, contaminated, broken, or mixed with foreign material.

## WEIGHT ESTIMATION (estimatedWeight in kg)
  Estimate based on the described quantity/size. Use typical unit weights:
  • PET bottle: 0.01–0.05 kg  • Aluminum can: 0.01–0.02 kg
  • Cardboard box: 0.3–2 kg   • Newspaper stack: 0.5–5 kg
  • Copper wire coil: 0.2–5 kg • Glass bottle: 0.2–0.5 kg

## CONFIDENCE CALIBRATION
  0.90–1.0  — Single obvious material, clear condition, no ambiguity
  0.70–0.89 — Confident but minor uncertainty (lighting, angle, similar items)
  0.50–0.69 — Uncertain — description matches multiple materials
  0.00–0.49 — Very uncertain — use this when the item is unclear or non-recyclable

## OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown fences. No text outside the JSON.
Schema: {"materialType":string,"grade":"A"|"B"|"C","estimatedWeight":number,"confidence":number,"explanation":string}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  // Verify the caller is an authenticated Supabase user
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')  ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API not configured' }), {
      status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  let body: { description: string; model?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  if (!body.description || typeof body.description !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing description' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  if (body.description.length > MAX_DESCRIPTION_CHARS) {
    return new Response(JSON.stringify({ error: 'Description too long' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  // Validate model against whitelist; default to Haiku if unrecognised or absent
  const requestedModel = body.model ?? ''
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'claude-haiku-4-5-20251001'

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system:     SYSTEM_PROMPT,
      messages: [{
        role:    'user',
        content: `Classify this recycled waste item.\nItem description: ${body.description}`,
      }],
    }),
  })

  const upstreamBody = await upstream.text()
  return new Response(upstreamBody, {
    status:  upstream.status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
