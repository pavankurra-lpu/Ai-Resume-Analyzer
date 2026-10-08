import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rateLimit";

interface ImproveResponse {
  versions: string[];
  metricAdvice: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 15, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait before improving more bullets." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const bullet = (body.bullet as string) || "";
    const role = (body.role as string) || "Software Engineer";

    const cleanInput = bullet.trim();

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (apiKey) {
      const model = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";
      const anthropic = new Anthropic({ apiKey });

      const prompt = `
You are an expert resume editor and technical recruiter for the Indian tech market.
Improve or draft the following resume bullet point using this strict formula:
[Strong Action Verb] + [What You Did / Technical Complexity] + [Tool / Method / Stack] + [Measurable Result / Impact].

Input Bullet: "${cleanInput || "None provided yet. Draft a strong bullet point."}"
Target Role: "${role}"

Rules:
1. Provide exactly 3 distinctly styled stronger versions (one focused on speed/performance, one on business/user scale, one on engineering quality/architecture).
2. Do not invent fake numbers or use bracket placeholders like [X%] or [25%]. Use natural phrasing like "improving system responsiveness" or "scaling to handle multi-user traffic".
3. Return ONLY valid JSON adhering strictly to:
{
  "versions": ["string", "string", "string"],
  "metricAdvice": "string"
}
`;

      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        });

        const block = response.content[0];
        if (block.type === "text") {
          let text = block.text.trim();
          if (text.startsWith("```json")) {
            text = text.replace(/^```json/, "").replace(/```$/, "").trim();
          } else if (text.startsWith("```")) {
            text = text.replace(/^```/, "").replace(/```$/, "").trim();
          }
          const parsed = JSON.parse(text) as ImproveResponse;
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.warn("Anthropic API failed in /api/improve, using fallback generator:", err);
      }
    }

    // High quality built-in fallback / demo mode generator
    const cleanBullet = cleanInput ? cleanInput.replace(/^[-•*–—]\s*/, "") : "core application features";
    const roleContext = role ? `for ${role}` : "in production";
    const featureName = cleanBullet.toLowerCase().replace(/^(worked on|responsible for|helped in|assisted with)\s*/i, "");

    const v1 = `Architected and deployed ${featureName} using modern design patterns, boosting processing efficiency ${roleContext}.`;
    const v2 = `Engineered end-to-end workflow to execute ${featureName}, streamlining manual turnaround time across cross-functional teams.`;
    const v3 = `Spearheaded refactoring and automated testing for ${featureName}, maintaining high system uptime and accelerating feature release cycles.`;

    const metricAdvice =
      "Measure realistic indicators from your actual project: page load speed, number of team members unblocked, query speed improvements, number of API endpoints built, or user satisfaction.";

    return NextResponse.json({
      versions: [v1, v2, v3],
      metricAdvice,
    });
  } catch (error: unknown) {
    console.error("Improve bullet error:", error);
    const message = error instanceof Error ? error.message : "Failed to improve bullet";
    return NextResponse.json(
      { error: message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
