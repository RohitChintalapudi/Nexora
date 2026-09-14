import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testModel() {
  for (const model of ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'groq/compound']) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a JSON assistant. Always return valid JSON.' },
          { role: 'user', content: 'Return a JSON with key "greeting" and value "hello world".' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      console.log(`✅ Success with ${model}:`, response.choices[0]?.message?.content);
      break;
    } catch (err) {
      console.error(`❌ Failed with ${model}:`, err.message);
    }
  }
}

testModel();
