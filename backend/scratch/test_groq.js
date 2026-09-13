import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  console.log('Testing Groq completion with openai/gpt-oss-120b...');
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are NEXORA Codebase Intelligence Engine. You analyze repository architectures and technical stacks.'
        },
        {
          role: 'user',
          content: 'Briefly say hello and confirm you are ready to analyze code repositories for NEXORA in 2 sentences.'
        }
      ],
      model: 'openai/gpt-oss-120b'
    });

    console.log('\n--- Groq AI Response ---');
    console.log(chatCompletion.choices[0]?.message?.content || '');
    console.log('\n[SUCCESS] Groq API integration verified with openai/gpt-oss-120b!');
  } catch (err) {
    console.error('[ERROR] Groq API call failed:', err);
  }
}

testGroq();
