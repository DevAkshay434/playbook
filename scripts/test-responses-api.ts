
import OpenAI from "openai";

async function run() {
  const openai = new OpenAI();
  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      store: false,
      instructions: "Return exactly { \"hello\": \"world\" }",
      input: "test",
      text: {
        format: {
          type: "json_schema",
          name: "test",
          strict: true,
          schema: {
            type: "object",
            properties: { hello: { type: "string" } },
            required: ["hello"],
            additionalProperties: false
          }
        }
      }
    });
    console.log(JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
run();
