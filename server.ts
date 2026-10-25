import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const LOCAL_DB_FILE = path.resolve(__dirname, 'local-db.json');

function readDiskDb() {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return {
    domain: process.env.VITE_APP_DOMAIN || 'https://www.catalystpositive.com',
    dataMode: process.env.VITE_DATA_MODE || 'local',
    inquiries: [],
    chatMessages: [],
  };
}

function writeDiskDb(data: unknown) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore read-only fs errors
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Local Database Sync Endpoint
  app.get('/api/local-db', (_req, res) => {
    res.json(readDiskDb());
  });

  app.post('/api/local-db', (req, res) => {
    writeDiskDb(req.body);
    res.json({ status: 'ok', savedTo: 'local-db.json' });
  });

  // Optional Inquiry API Endpoint (when VITE_DATA_MODE="api")
  app.post('/api/inquiries', (req, res) => {
    const db = readDiskDb();
    if (req.body?.inquiry) {
      db.inquiries = [req.body.inquiry, ...(db.inquiries || [])];
      writeDiskDb(db);
    }
    res.json({ status: 'ok', inquiry: req.body?.inquiry });
  });

  // Open-Ended Chat API Endpoint (when VITE_DATA_MODE="api")
  app.post('/api/chat', async (req, res) => {
    const userMessage = String(req.body?.message || '');
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    // If GEMINI_API_KEY is configured in .env / environment when using API mode, generate an open-ended response
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const conversationTranscript = history
          .slice(-8)
          .map((m: { role?: string; text?: string }) =>
            `${m.role === 'user' ? 'User' : 'Catalyst Positive'}: ${m.text || ''}`
          )
          .join('\n');

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Conversation so far:\n${conversationTranscript}\n\nUser: ${userMessage}`,
          config: {
            systemInstruction:
              'You are a warm, open-ended, conversational talent advisor at Catalyst Positive (https://www.catalystpositive.com), an India-based executive search and strategic talent acquisition firm operating pan-India and internationally. Respond naturally and conversationally to whatever the user says without dumping rigid bulleted menus. Ask thoughtful, natural open-ended follow-up questions.',
          },
        });

        if (response.text) {
          res.json({
            reply: response.text,
            mode: 'api',
          });
          return;
        }
      } catch {
        // Fall through to local open-ended response if API key is invalid or unreachable
      }
    }

    res.json({
      reply: '',
      mode: process.env.VITE_DATA_MODE || 'local',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Catalyst Positive server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
