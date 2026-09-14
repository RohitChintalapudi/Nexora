import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkModels() {
  try {
    const list = await groq.models.list();
    console.log('Available Groq models:', list.data.map(m => m.id));
  } catch (err) {
    console.error('Groq models error:', err.message);
  }
}

checkModels();
