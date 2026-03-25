import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const client = new GoogleGenAI({ 
    apiKey: process.env.VITE_GEMINI_API_KEY
});

async function main() {
  try {
     const list: any = await client.models.list();
     if(list && list.models) {
        list.models.forEach((m:any) => console.log(m.name || m.modelId));
     } else {
        console.log('LIST:', JSON.stringify(list, null, 2));
     }
  } catch (e: any) {
    console.log('ERROR:', e.message || e);
  }
}
main();
