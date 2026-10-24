import express from 'express';
import { ai } from './src/lib/gemini';
import { GenerateContentResponse, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

// Mock data
const MOCK_WARDS = [
  { id: 'ward-1', name: 'Ward 1: North Zone', areas: ['Ghatlodia', 'Chandlodia', 'Ranip'] },
  { id: 'ward-2', name: 'Ward 2: West Zone', areas: ['Navrangpura', 'Naranpura', 'Paldi'] },
  { id: 'ward-3', name: 'Ward 3: East Zone', areas: ['Bapunagar', 'Naroda', 'Nikol'] },
  { id: 'ward-4', name: 'Ward 4: Central Zone', areas: ['Shahpur', 'Dariapur', 'Kalupur'] },
];

const MOCK_DEPARTMENTS = [
  { id: 'dept-roads', name: 'Roads & Buildings', issueTypes: ['Pothole', 'Broken Road', 'Footpath Damage'] },
  { id: 'dept-swm', name: 'Solid Waste Management', issueTypes: ['Garbage Pile', 'Dead Animal', 'Clogged Dustbin'] },
  { id: 'dept-light', name: 'Street Light', issueTypes: ['Broken Streetlight', 'Faulty Wiring', 'Dim Light'] },
  { id: 'dept-water', name: 'Water & Sewage', issueTypes: ['Water Leakage', 'Water Logging', 'Sewage Overflow'] },
];

app.post('/api/process-issue', async (req, res) => {
  const { image, locationName } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { 
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: image } },
          { text: `Identify the civic issue in this image. Location hint: ${locationName || 'unknown'}. 
                   Determine the responsible ward and department. 
                   Wards available: ${MOCK_WARDS.map(w => w.name).join(', ')}.
                   Departments available: ${MOCK_DEPARTMENTS.map(d => d.name).join(', ')}.
                   Return a JSON response with issueType, description, ward, department, and confidence.` }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING },
            description: { type: Type.STRING },
            ward: { type: Type.STRING },
            department: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["issueType", "description", "ward", "department"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error) {
    console.error('Error processing issue:', error);
    res.status(500).json({ error: 'Failed to process issue' });
  }
});

app.get('/api/mock-data', (req, res) => {
  res.json({ wards: MOCK_WARDS, departments: MOCK_DEPARTMENTS });
});

// For local development, mount Vite middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await (await import('fs')).readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
