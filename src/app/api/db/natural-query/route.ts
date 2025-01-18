import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1,
});

const SYSTEM_PROMPT = `You are a SQL expert. Convert natural language questions into PostgreSQL queries.
Only respond with the SQL query, no explanations.
Use proper SQL syntax and formatting.
Tables available: users, users2, document_chunks`;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const sql = completion.choices[0]?.message?.content;
    if (!sql) {
      throw new Error("Failed to generate SQL query");
    }

    return NextResponse.json({ sql });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate SQL query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
