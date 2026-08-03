import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper function to read JSON file safely
function readJsonFile(filePath, defaultData = []) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      return defaultData;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper function to write JSON file safely
function writeJsonFile(filePath, data) {
  try {
    const fullPath = path.join(__dirname, filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// API Routes
app.get('/api/projects', (req, { res }) => {
  let projects = readJsonFile('data/projects.json');
  const { category, search } = req.query;

  if (category && category !== 'All') {
    projects = projects.filter(p => 
      p.category === category || 
      (p.tags && p.tags.includes(category))
    );
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  res.json({ success: true, count: projects.length, data: projects });
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJsonFile('data/projects.json');
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

app.get('/api/testimonials', (req, res) => {
  const testimonials = readJsonFile('data/testimonials.json');
  res.json({ success: true, data: testimonials });
});

app.get('/api/skills', (req, res) => {
  const skills = readJsonFile('data/skills.json');
  res.json({ success: true, data: skills });
});

app.get('/api/experience', (req, res) => {
  const experience = readJsonFile('data/experience.json');
  res.json({ success: true, data: experience });
});

// Contact Form Endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and message.'
    });
  }

  const messages = readJsonFile('data/messages.json');
  const newMessage = {
    id: 'msg-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  messages.unshift(newMessage);
  const saved = writeJsonFile('data/messages.json', messages);

  if (saved) {
    res.json({
      success: true,
      message: 'Thank you! Your message has been received.',
      data: {
        id: newMessage.id,
        createdAt: newMessage.createdAt
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to save message. Please try again.'
    });
  }
});

app.get('/api/contact/messages', (req, res) => {
  const messages = readJsonFile('data/messages.json');
  res.json({ success: true, count: messages.length, data: messages });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dynamic server running on port ${PORT}`);
});
