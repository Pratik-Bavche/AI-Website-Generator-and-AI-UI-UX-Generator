import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt, designType } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Determine strict JSON structure for visual rendering
        const systemPrompt = `
You are a UI/UX Generation Engine. Your goal is to output a STRICT JSON object representing valid UI Mockups.
Do NOT output markdown. Do NOT output conversational text. ONLY output valid JSON.

The user wants to design: "${designType === 'app' ? 'Mobile App' : 'Website'}"
Prompt: "${prompt}"

Target Audience: Develop a complete setup of screens for this use case.

structure your JSON response exactly like this:
{
  "projectTitle": "string",
  "theme": {
    "primary": "string (hex code)",
    "secondary": "string (hex code)",
    "background": "string (hex code)",
    "surface": "string (hex code for cards/modals)",
    "text": "string (hex code)",
    "muted": "string (hex code for secondary text)",
    "border": "string (hex code)",
    "success": "string (hex code)",
    "warning": "string (hex code)",
    "error": "string (hex code)"
  },
  "screens": [
    {
      "id": "string",
      "name": "string (e.g. Login, Dashboard)",
      "type": "mobile" | "desktop" (matches user selection),
      "backgroundColor": "string (optional hex override)",
      "components": [
        {
          "id": "string",
          "type": "Navbar" | "Hero" | "Form" | "Card" | "List" | "Chart" | "Button" | "Input" | "Text" | "ImagePlaceholder" | "Sidebar" | "Footer" | "Icon",
          "props": {
             "label": "string",
             "placeholder": "string (for inputs)",
             "title": "string",
             "subtitle": "string",
             "variant": "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link",
             "size": "sm" | "md" | "lg" | "icon",
             "columns": [ "string" ] (for tables/lists),
             "dataPoints": [ 10, 40, 30 ] (for charts),
             "src": "string (placeholder url optional)",
             "icon": "string (lucide icon name e.g. User, Settings, Home, Plus, Trash, Edit, Check, AlertCircle)",
             "action": "string (e.g. 'nav:Login', 'nav:Dashboard', 'modal:AddExpense')"
          },
          "style": {
             "flex": "1" | "none",
             "width": "string",
             "height": "string",
             "padding": "string",
             "margin": "string",
             "color": "string (optional hex)",
             "backgroundColor": "string (optional hex)",
             "borderRadius": "string"
          }
        }
      ]
    }
  ]
}

Generate thorough details.
For "App UI", generate vertical screens (width ~375px concept).
For "Website UI", generate desktop screens (width ~1200px concept).
Include at least 4-5 distinct screens (e.g. Auth, Home, Details, Settings, etc.).
Ensure components are diverse and use the "action" prop for interactive elements (e.g. Buttons).
Use the theme colors consistently. Icons should be frequent and appropriate.
`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate visual UI structure for: ${prompt}` }
        ];

        const apiKey = process.env.OPENAI_API_KEY;
        const baseUrl = process.env.OPENAI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
        const model = process.env.OPENAI_MODEL || "gemini-2.5-flash"; // Keep using the one user had or fallback

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages,
                response_format: { type: "json_object" }, // Attempt to force JSON mode if supported by the provider, else rely on prompt
                stream: false, // Turn off streaming for easier JSON parsing
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("AI API Error:", errText);
            return NextResponse.json(
                { error: `API request failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean up if the model wraps JSON in markdown code blocks
        if (content.startsWith("```json")) {
            content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (content.startsWith("```")) {
            content = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return NextResponse.json(
                { error: "Failed to parse AI response as JSON" },
                { status: 500 }
            );
        }

        return NextResponse.json(jsonResponse);

    } catch (error) {
        console.error("Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
