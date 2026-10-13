import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Summarize attendance for a class or school day
app.post('/api/gemini/summarize-attendance', async (req, res) => {
  try {
    const { date, className, stats, students } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Smart offline fallback if API key is pending
      const rate = Math.round((stats.present / (stats.total || 1)) * 100);
      return res.json({
        summary: `### Attendance Overview for ${className} (${date})\n\n` +
          `- **Overall Turnout**: **${rate}%** (${stats.present} of ${stats.total} present).\n` +
          `- **Unexcused Absences**: ${stats.absent} student(s) absent today.\n` +
          `- **Tardiness**: ${stats.late} student(s) arrived late.\n` +
          `- **Action Item**: Verify parent excuses for ${stats.absent > 0 ? 'absent students' : 'all recorded absences'} and follow up on consecutive missed days.`,
        keyTakeaway: `${rate}% attendance rate today. Follow up on ${stats.absent} unexcused absence(s).`,
      });
    }

    const absentList = (students || [])
      .filter((s: { status: string; name: string }) => s.status === 'absent')
      .map((s: { name: string; notes?: string }) => `${s.name}${s.notes ? ` (Note: ${s.notes})` : ''}`)
      .join(', ');

    const lateList = (students || [])
      .filter((s: { status: string; name: string }) => s.status === 'late')
      .map((s: { name: string; notes?: string }) => `${s.name}${s.notes ? ` (${s.notes})` : ''}`)
      .join(', ');

    const prompt = `
You are an expert school administrative assistant and educational data analyst.
Analyze the following student attendance data for class "${className}" on date ${date}:

- Total Enrolled: ${stats.total}
- Present: ${stats.present}
- Absent: ${stats.absent} (${absentList || 'None'})
- Late: ${stats.late} (${lateList || 'None'})
- Excused: ${stats.excused || 0}
- Attendance Rate: ${Math.round((stats.present / (stats.total || 1)) * 100)}%

Provide a clear, professional, teacher-friendly summary structured as:
1. **Executive Attendance Pulse**: Quick 2-sentence summary of turnout.
2. **Key Patterns & Observations**: Note any anomalies or concerning patterns (e.g., punctuality issues, student absences).
3. **Recommended Immediate Action Items**: 2-3 specific, practical steps the teacher or school attendance clerk should take today (e.g. parent call triggers, health clinic heads up if sickness, attendance coordinator log).
Keep tone encouraging, objective, and actionable. Use concise Markdown bullet points.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summaryText = response.text || 'Attendance summary generated.';
    res.json({
      summary: summaryText,
      keyTakeaway: `Attendance rate: ${Math.round((stats.present / (stats.total || 1)) * 100)}% on ${date}.`,
    });
  } catch (error: unknown) {
    console.error('Error generating attendance summary:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to generate attendance summary', details: errMessage });
  }
});

// 2. Generate personalized parent alert message
app.post('/api/gemini/generate-parent-alert', async (req, res) => {
  try {
    const { studentName, parentName, date, status, reason, consecutiveDays, tone, schoolName } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      const subject = `Notice: Attendance update for ${studentName} - ${schoolName || 'Oakridge Academy'}`;
      const body = `Dear ${parentName || 'Parent/Guardian'},\n\n` +
        `This is a message from ${schoolName || 'Oakridge Academy'} to inform you that ${studentName} was marked ${status.toUpperCase()} today (${date}).\n\n` +
        (consecutiveDays > 1 ? `Please note that this is the ${consecutiveDays}th consecutive day of absence recorded.\n\n` : '') +
        `Regular school attendance is vital for academic progress. If this absence was planned or due to illness, please reply to this notice or call the front office to provide an excuse note.\n\n` +
        `Thank you for your support,\n${schoolName || 'Oakridge Academy'} Attendance Office`;
      return res.json({ subject, body });
    }

    const prompt = `
You are a compassionate, professional school administrator drafting an attendance notification to a parent/guardian.
Details:
- Student Name: ${studentName}
- Parent/Guardian Name: ${parentName || 'Parent/Guardian'}
- School: ${schoolName || 'Oakridge Academy'}
- Date of Incident: ${date}
- Recorded Status: ${status} (e.g., absent, late)
- Notes / Reason provided: ${reason || 'No prior notice received'}
- Number of consecutive days absent/late: ${consecutiveDays || 1}
- Tone requested: ${tone || 'caring and supportive'} (Options could be: 'gentle & friendly', 'formal & informative', or 'urgent administrative warning')

Please generate a JSON object with two fields:
"subject": A concise, clear email subject line.
"body": The email message body. Ensure it includes:
  - Warm greeting to the parent.
  - Clear statement of the attendance record today.
  - Invitation to confirm if the student is sick or safe.
  - Clear instruction on how to submit a doctor's note or excuse.
  - Warm closing and teacher/school contact placeholder.
Do NOT use placeholder brackets like [Parent Name] if the information was supplied. Return plain JSON only.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      subject: parsed.subject || `Attendance Notice for ${studentName} (${date})`,
      body: parsed.body || `Dear ${parentName},\n\n${studentName} was marked ${status} today.`,
    });
  } catch (error: unknown) {
    console.error('Error generating parent alert:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to generate parent alert', details: errMessage });
  }
});

// 3. Attendance AI Assistant for teachers (Q&A / advice)
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        answer: 'Gemini AI Assistant is ready. To enhance student attendance, consistent communication with parents and early intervention when a student misses 2+ days are proven best practices.',
      });
    }

    const prompt = `
You are a senior educational consultant and student attendance specialist helping a K-12 teacher.
Context of the classroom: ${context || 'Grade 5 Elementary Classroom'}
Question: ${question}

Provide practical, pedagogical, and empathetic guidance in 2-3 concise paragraphs.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: unknown) {
    console.error('Error in assistant query:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Assistant query failed', details: errMessage });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

setupServer();
