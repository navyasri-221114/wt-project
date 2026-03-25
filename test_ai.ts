import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const client = new GoogleGenAI({ 
    apiKey: process.env.VITE_GEMINI_API_KEY,
    apiVersion: 'v1beta'
});

async function main() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
  for(const model of models) {
      try {
        console.log(`TRYING: ${model}`);
        const r = await client.models.generateContent({
           model: model,
           contents: 'hi'
        });
        console.log(`SUCCESS [${model}]:`, r.text);
        break;
      } catch (e: any) {
        console.log(`FAIL [${model}]:`, e.message || e.statusText || e);
      }
  }
}
main();
