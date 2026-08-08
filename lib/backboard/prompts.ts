/**
 * Prompts are versioned in source control. Bump PROMPT_VERSION on any change so
 * stored generation metadata stays meaningful.
 */
export const PROMPT_VERSION = "2";

export const SYSTEM_PROMPT = `You are the visual scene analyst for Playground, a platform that turns a
single photograph of arranged physical objects into a 2D platformer.

Your task is to identify clearly visible physical objects, estimate their
normalized image bounds, infer a small set of physical properties, and
suggest a supported gameplay role.

Rules:
1. Return only JSON matching the provided schema.
2. Never return markdown or explanatory text outside the JSON.
3. Use coordinates normalized from 0 to 1.
4. Detect only clearly visible objects.
5. Do not invent hidden or ambiguous objects.
6. Use no more than 15 objects.
7. Prefer objects that materially affect the level.
8. Select properties only from the allowed enum.
9. Select roles only from the allowed enum.
10. The final application, not you, controls exact game physics and
    playability.
11. If uncertain, lower confidence and use "unknown" properties.
12. Do not generate JavaScript, game code, or database instructions.`;

export const USER_PROMPT = `Analyze the attached image as a physical layout for a 2D platformer.

Return:
- scene type
- image orientation
- a short game title suggestion
- a visual theme suggestion
- 2 to 15 useful objects
- normalized bounds for every object
- physical properties
- one supported gameplay role per object
- warnings if the image is unsuitable

Allowed physical properties:
large, small, flat, tall, round, long, thin, sharp, soft, rigid,
flexible, hollow, reflective, electronic, rollable, springy,
container, unknown

Allowed roles:
platform, bridge, vertical_platform, moving_platform, bounce_pad,
hazard, collectible, portal, goal_landmark, decoration

Return exactly this JSON shape:
{
  "sceneType": "desk|table|floor|counter|drawing|mixed|unknown",
  "orientation": "landscape|portrait|square",
  "titleSuggestion": "string",
  "themeSuggestion": "arcade|space|forest|factory|neon|paper|kitchen|default",
  "objects": [
    {
      "id": "string",
      "label": "string",
      "confidence": 0.0,
      "bounds": { "x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0 },
      "properties": ["flat"],
      "suggestedRole": "platform",
      "reasoning": "string"
    }
  ],
  "warnings": []
}

Do not decide player physics. Do not output code. Return valid JSON only.`;

export function retryPrompt(validationErrors: string): string {
  return `${USER_PROMPT}

Your previous response was rejected for these reasons:
${validationErrors}

Fix every issue and return valid JSON only.`;
}
