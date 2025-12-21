import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("API route called");
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", messages);
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
    const model = process.env.OPENAI_MODEL || "gemini-2.0-flash";

    // Debug: Log all available env vars that start with OPENAI (without exposing values)
    const envDebug = Object.keys(process.env)
      .filter(key => key.startsWith('OPENAI'))
      .map(key => `${key}=${process.env[key] ? 'SET' : 'NOT SET'}`)
      .join(', ');
    console.log("Environment variables check:", envDebug || "No OPENAI_* variables found");

    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY is not configured in environment variables");
      console.error("Available environment variables starting with OPENAI:", Object.keys(process.env).filter(k => k.startsWith('OPENAI')));
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not configured. Please:\n1. Create/update .env.local file in project root\n2. Add: OPENAI_API_KEY=\"your-key-here\"\n3. Restart your dev server (stop with Ctrl+C, then run npm run dev)",
          debug: {
            envVarsFound: Object.keys(process.env).filter(k => k.startsWith('OPENAI')).length,
            openAIVars: Object.keys(process.env).filter(k => k.startsWith('OPENAI'))
          }
        },
        { status: 500 }
      );
    }

    const trimmedKey = apiKey.trim();

    // Log API key status (without exposing the actual key)
    const maskedKey = trimmedKey.length > 14
      ? `${trimmedKey.substring(0, 10)}...${trimmedKey.substring(trimmedKey.length - 4)}`
      : `${trimmedKey.substring(0, Math.min(10, trimmedKey.length))}...`;
    console.log("✅ API Key found:", maskedKey, `(length: ${trimmedKey.length})`);
    console.log("Making request to Google Generative Language API");
    console.log("Base URL:", baseUrl);
    console.log("Model:", model);

    // Construct the API URL - Google OpenAI-compatible endpoint uses Bearer token auth
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    // Helper: fetch with simple retry/backoff on 429 or transient server errors
    async function fetchWithRetries(url: string, opts: RequestInit, maxRetries = 3) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const res = await fetch(url, opts);
          if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
            // If last attempt, return the response so caller can handle it
            if (attempt === maxRetries - 1) return res;
            const delay = 500 * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms...
            console.warn(`Request returned ${res.status}. Retrying after ${delay}ms (attempt ${attempt + 1})`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          return res;
        } catch (err) {
          // network error - retry unless last attempt
          if (attempt === maxRetries - 1) throw err;
          const delay = 500 * Math.pow(2, attempt);
          console.warn(`Network error during fetch; retrying after ${delay}ms (attempt ${attempt + 1})`, err);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
      // Shouldn't reach here
      throw new Error('Failed to fetch after retries');
    }

    const response = await fetchWithRetries(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${trimmedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages,
        stream: true,
      }),
    }, 3);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("❌ Google Generative Language API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        baseUrl,
        model,
      });

      let errorMessage = `Google API request failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage =
          errorJson.error?.message ||
          errorJson.message ||
          (typeof errorJson.error === "string" ? errorJson.error : errorMessage);

        // Provide helpful error messages
        if (response.status === 401) {
          errorMessage = `Authentication failed: ${errorMessage}. This usually means:
1. Your API key is invalid or expired
2. Your API key doesn't have proper permissions
3. Your API key may be incorrect

Please verify your OPENAI_API_KEY in .env.local file and ensure it's a valid Google API key.`;
        } else if (response.status === 403) {
          errorMessage = `Permission Denied (403): ${errorMessage}.
          
This often happens when:
1. The API key is missing or invalid in your deployment environment (Vercel)
2. You are using a model that your key doesn't have access to
3. You haven't enabled the "Generative Language API" in Google Cloud Console

ACTION REQUIRED:
- If this is on Vercel: Go to Settings > Environment Variables and ensure OPENAI_API_KEY is set to the correct key starting with "AIza".
- If this is local: Check your .env.local file.`;
        } else if (response.status === 429) {
          errorMessage = `Quota Exceeded (429): ${errorMessage}.
           
The API key has exceeded its rate limit or quota.
- If you are on the free tier, you may have made too many requests in a short time.
- If you are paying, check your quota limits in Google Cloud Console.

Suggested Action: Wait a minute and try again.`;
        }
      } catch {
        if (errorText && errorText !== "Unknown error") {
          errorMessage = errorText;
        }
        if (response.status === 401) {
          // ... (existing 401 fallback)
          const keyLength = (trimmedKey || apiKey?.trim() || apiKey)?.length || 0;
          errorMessage = `Authentication failed (401). Key length: ${keyLength}. Check your .env.local or Vercel config.`;
        } else if (response.status === 403) {
          errorMessage = `Permission Denied (403). check your API key and permissions in Google Cloud Console, and ensure the correct OPENAI_API_KEY is set in Vercel.`;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    if (!response.body) {
      console.error("No response body from Google API");
      return NextResponse.json(
        { error: "No response body received from Google Generative Language API" },
        { status: 500 }
      );
    }

    console.log("Response OK, starting stream processing");
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                const trimmedLine = buffer.trim();
                if (trimmedLine.startsWith("data: ")) {
                  try {
                    const jsonStr = trimmedLine.slice(6);
                    const json = JSON.parse(jsonStr);
                    const text = json.choices?.[0]?.delta?.content;
                    if (text) {
                      controller.enqueue(encoder.encode(text));
                    }
                  } catch (e) {
                    console.error("Stream JSON parse error (final):", e);
                  }
                }
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmedLine = line.trim();

              if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
                continue;
              }

              if (trimmedLine.startsWith("data: ")) {
                try {
                  const jsonStr = trimmedLine.slice(6);
                  const json = JSON.parse(jsonStr);
                  const text = json.choices?.[0]?.delta?.content;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  console.error("Stream JSON parse error:", e, "Line:", trimmedLine);
                }
              }
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
