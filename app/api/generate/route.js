export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your-api-key-here") {
    return Response.json(
      { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to your environment variables." },
      { status: 500 }
    );
  }

  try {
    const { system, messages } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      // Try to parse the structured error from Anthropic so we can surface a useful message
      let detail = errText;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) detail = errJson.error.message;
        else if (errJson?.error?.type) detail = errJson.error.type;
      } catch {}
      return Response.json(
        { error: `API ${response.status}: ${detail}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
