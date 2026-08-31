---
name: krea2-image-to-prompt
description: Turn an uploaded reference image into one Krea2-ready English prompt of at least 500 words. Use for Krea2 or Krea 2 image-to-prompt reconstruction and long-form visual prompt requests; wait for an image when none is provided.
---

# Krea2 Image to Prompt

Analyze the supplied image silently, then return one complete English prompt that can be pasted directly into Krea2.

## Input requirement

- Work only from an image the user uploaded, attached, or otherwise made available in the conversation.
- If no image is available, ask the user to upload one and stop. Do not generate an image or invent a reference scene.
- Treat visible evidence as authoritative. Add descriptive detail to reach the required depth without contradicting the image or inventing factual identities, brands, locations, or hidden context.

## Silent visual analysis

Before writing, inspect these dimensions internally. Do not expose the analysis:

1. Subject: people, objects, or scene; count, form, proportions, pose, gaze, action, state, surface details, and visual priority.
2. Environment: interior or exterior, location type, foreground, middle ground, background, depth, time, weather, architecture, landscape, and supporting elements.
3. Composition: intended use and aspect-ratio character, shot size, camera height, viewing angle, subject placement, subject-to-frame ratio, negative space, balance, leading lines, and focal hierarchy.
4. Lighting: source type, direction, softness, color temperature, key light, fill, rim light, highlights, shadows, reflections, contrast, and atmospheric illumination.
5. Color and mood: dominant palette, warm/cool/neutral balance, saturation, emotional tone, and commercial or narrative intent.
6. Medium and style: photography, product photography, cinematic still, anime illustration, concept art, architectural photography, painterly work, cel shading, film grain, or other visible treatment.
7. Technical appearance: focal-length impression, depth of field, focus falloff, sharpness, grain, believable scale, rendering fidelity, and matte, glossy, translucent, brushed, polished, rough, or textured surfaces.
8. Motion and gesture: body posture, eye line, directional movement, fabric movement, environmental motion, and the moment captured.

## Prompt construction

Build the paragraph in this order while keeping it natural rather than labeled:

`subject + environment + composition + lighting + atmosphere + medium/style + materials/color + technical detail + quality constraints`

Use commas and flowing clauses to connect visual information into one coherent paragraph. Describe foreground, middle ground, and background so the space feels intentional. Explain how lighting reveals the subject and materials. Keep supporting elements subordinate to the main subject.

Use roughly this information balance when expanding:

- Subject detail: 20%.
- Scene and environment: 15%.
- Composition and camera: 15%.
- Lighting and tonal control: 15%.
- Medium and visual style: 10%.
- Materials, textures, and color: 15%.
- Quality and exclusion constraints: 10%.

When the reference supports them, prefer precise phrases such as `premium`, `refined`, `restrained`, `cinematic still`, `controlled contrast`, `atmospheric depth`, `commercial photography`, `photorealistic`, `natural texture`, `minimal background`, `muted film colors`, `subtle grain`, `soft daylight`, `neon reflections`, or `ethereal mood`. Select vocabulary that matches the image; do not stack incompatible styles merely to increase length.

If visible information is sparse, expand the observable subject shape, proportions, pose, surface qualities, material response, foreground-to-background relationship, camera position, focus hierarchy, light behavior, palette, atmospheric depth, and controlled imperfections. Avoid empty repetition.

## Hard output contract

After an image is available, the final response must satisfy every rule below:

- Output exactly one English paragraph containing only the Krea2 prompt.
- Write at least 500 English words; target 550–700 words to maintain a safe margin.
- Do not output a title, introduction, explanation, analysis, numbered sections, bullets, tables, Markdown code fences, or follow-up text.
- Do not recommend or mention `Mode`, `Model`, `Creativity`, parameter values, or settings.
- Do not reveal the internal analysis or describe the generation process.
- Keep the paragraph detailed, visually specific, non-repetitive, and directly usable in Krea2.
- End the paragraph with this exact quality-control sentence:

`Avoid distorted anatomy, extra limbs, messy details, random floating objects, unreadable markings, visible text, logos, watermarks, cartoon style if not required, flat illustration, overexposed highlights, low-resolution artifacts, cluttered background, and any element that weakens the main subject.`

## Silent final check

Before responding, verify internally that the answer:

- contains one English paragraph and nothing else;
- contains at least 500 English words;
- covers subject, environment, composition, lighting, mood, style, materials, technical appearance, and quality constraints;
- contains no headings, Markdown, parameter recommendations, or explanation;
- ends with the required quality-control sentence.
