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
    const role = (body.role as string) || "";

    if (!bullet.trim() || bullet.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter a resume bullet point of at least 10 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (apiKey) {
      const model = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";
      const anthropic = new Anthropic({ apiKey });

      const prompt = `
You are an expert resume editor and technical recruiter for the Indian tech market.
Improve the following resume bullet point using this strict formula:
[Strong Action Verb] + [What You Did / Technical Complexity] + [Tool / Method / Stack] + [Measurable Result / Impact].

Input Bullet: "${bullet}"
Target Role: "${role || "Software Engineer"}"

Rules:
1. Provide exactly 3 distinctly styled stronger versions (one focused on speed/performance, one on business/user scale, one on engineering quality/architecture).
2. Do not invent fake facts or numbers. Use placeholders like [X%], [Y hours], or [N users] where the user must supply their actual numbers.
3. Suggest where to add realistic metrics and explicitly remind them NOT to invent false numbers.
4. Return ONLY valid JSON adhering strictly to:
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
    const cleanBullet = bullet.trim().replace(/^[-•*–—]\s*/, "");
    const roleContext = role ? `for ${role}` : "in production";

    const v1 = `Architected and deployed ${cleanBullet.toLowerCase().replace(/^(worked on|responsible for|helped in|assisted with)\s*/i, "")} using modern design patterns, boosting processing efficiency by [35%] ${roleContext}.`;
    const v2 = `Engineered end-to-end workflow to execute ${cleanBullet.toLowerCase().replace(/^(worked on|responsible for|helped in|assisted with)\s*/i, "")}, slashing manual turnaround time by [15 hours/week] across [4] cross-functional teams.`;
    const v3 = `Spearheaded refactoring and automated testing for ${cleanBullet.toLowerCase().replace(/^(worked on|responsible for|helped in|assisted with)\s*/i, "")}, maintaining 99.9% uptime and accelerating feature release cycles by [25%].`;

    const metricAdvice =
      "Never invent false metrics or exaggerate numbers. Instead, measure realistic indicators: % latency reduction, number of team members unblocked, query speed improvements, number of API endpoints built, or user satisfaction score.";

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
