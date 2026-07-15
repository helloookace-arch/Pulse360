import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { dbMock } from './services/mongoMock';
import { redisCache } from './services/cache';
import { processAIChat } from './services/ai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper to calculate distance in km using Haversine formula
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km
}

// 1. Session Auth (POST /auth/session)
app.post('/auth/session', async (req, res) => {
  try {
    const { district } = req.body;
    const sessionToken = `token-${Math.random().toString(36).substring(2, 15)}`;
    
    const session = await prisma.session.create({
      data: {
        sessionToken,
        district: district || 'Kigali'
      }
    });

    res.json({
      success: true,
      sessionToken: session.sessionToken,
      sessionId: session.id,
      district: session.district
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Send Chat Message (POST /chat/message)
app.post('/chat/message', async (req, res) => {
  try {
    const { sessionToken, message, isAskForFriend } = req.body;
    if (!sessionToken || !message) {
      return res.status(400).json({ success: false, error: 'Session token and message content required.' });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    // Save User message
    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message
      }
    });

    // Process with AI service
    const currentHour = new Date().getHours();
    const aiResult = await processAIChat(message, !!isAskForFriend, session.id, currentHour);

    // Save AI message
    const botMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiResult.content,
        emotionLabel: aiResult.emotionLabel
      }
    });

    // If crisis was triggered, record it
    if (aiResult.crisisTriggered) {
      await prisma.crisisEvent.create({
        data: {
          sessionId: session.id,
          triggerType: aiResult.crisisType || 'general_crisis',
          escalated: false
        }
      });
      // Cache the crisis flag for frontend dashboard alerting
      await redisCache.set(`crisis:${session.id}`, 'true', 3600);
    }

    // Update last active
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    });

    res.json({
      success: true,
      response: aiResult.content,
      emotionLabel: aiResult.emotionLabel,
      crisisTriggered: aiResult.crisisTriggered,
      messageId: botMessage.id
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get Chat History (GET /chat/history/:sessionToken)
app.get('/chat/history/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({
      success: true,
      messages: session.messages
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Articles (GET /articles)
app.get('/articles', (req, res) => {
  const { category, search, language } = req.query;
  let articles = dbMock.getArticles();

  if (category && category !== 'All') {
    articles = articles.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (language) {
    articles = articles.filter(a => a.language.toLowerCase() === (language as string).toLowerCase());
  }

  if (search) {
    const query = (search as string).toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(query) || 
      a.body.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  res.json({ success: true, articles });
});

// 5. Article Detail (GET /articles/:id)
app.get('/articles/:id', (req, res) => {
  const article = dbMock.getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }
  res.json({ success: true, article });
});

// 6. Community Stories (GET /stories)
app.get('/stories', (req, res) => {
  const stories = dbMock.getStories();
  res.json({ success: true, stories });
});

// 7. Submit Community Story (POST /stories)
app.post('/stories', (req, res) => {
  const { content, category, district } = req.body;
  if (!content || !category) {
    return res.status(400).json({ success: false, error: 'Content and category are required' });
  }

  const story = dbMock.addStory(content, category, district || 'Kigali');
  if (story.status === 'rejected') {
    return res.json({ success: false, error: 'Story content did not pass moderation guidelines.' });
  }

  res.json({ success: true, story });
});

// 8. Like Story (POST /stories/like/:id)
app.post('/stories/like/:id', (req, res) => {
  const story = dbMock.likeStory(req.params.id);
  if (!story) {
    return res.status(404).json({ success: false, error: 'Story not found' });
  }
  res.json({ success: true, likes: story.likes });
});

// 9. Nearby Clinics (GET /clinics/nearby)
app.get('/clinics/nearby', (req, res) => {
  const { lat, lng } = req.query;
  const clinics = dbMock.getClinics();

  if (lat && lng) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    const sortedClinics = clinics.map(c => {
      const distance = getHaversineDistance(userLat, userLng, c.lat, c.lng);
      return { ...c, distance };
    }).sort((a, b) => a.distance - b.distance);

    return res.json({ success: true, clinics: sortedClinics });
  }

  res.json({ success: true, clinics: clinics.map(c => ({ ...c, distance: null })) });
});

// 10. Book Consultation (POST /consultation/book)
app.post('/consultation/book', async (req, res) => {
  try {
    const { sessionToken, counselorId, slotTime } = req.body;
    if (!sessionToken) {
      return res.status(400).json({ success: false, error: 'Session token required' });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const consultation = await prisma.consultation.create({
      data: {
        sessionId: session.id,
        counselorId: counselorId || 'dr-mugisha',
        slotTime: slotTime ? new Date(slotTime) : new Date(Date.now() + 86400000), // Default tomorrow
        status: 'pending'
      }
    });

    res.json({ success: true, consultation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Mock Payment (POST /payment/initiate)
app.post('/payment/initiate', async (req, res) => {
  try {
    const { consultationId, amount, phone, provider } = req.body;
    if (!consultationId || !phone || !provider) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation) {
      return res.status(404).json({ success: false, error: 'Consultation not found' });
    }

    // Simulate MTN/Airtel Money transaction reference
    const paymentRef = `tx-${provider}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Update Consultation to confirmed
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'confirmed',
        paymentRef
      }
    });

    res.json({
      success: true,
      message: 'Payment completed successfully (Simulated)',
      consultation: updatedConsultation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Anonymous Dashboard Metrics (GET /dashboard/metrics/:sessionToken)
app.get('/dashboard/metrics/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        messages: true,
        consultations: true,
        crisisEvents: true
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const questionsAsked = session.messages.filter(m => m.role === 'user').length;
    const consultationsCount = session.consultations.length;
    const savedArticlesCount = 3; // Mocked saved count
    const storiesLikedCount = 5; // Mocked stories liked

    // Simple wellbeing score simulation
    const wellbeingScores = [
      { week: 1, score: 7.2 },
      { week: 2, score: 6.8 },
      { week: 3, score: 7.5 },
      { week: 4, score: 8.0 }
    ];

    res.json({
      success: true,
      metrics: {
        questionsAsked,
        consultationsCount,
        savedArticlesCount,
        storiesLikedCount
      },
      wellbeingScores,
      crisisRecorded: session.crisisEvents.length > 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io Real-time connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_session', (sessionToken) => {
    socket.join(sessionToken);
    console.log(`Socket ${socket.id} joined session room: ${sessionToken}`);
  });

  socket.on('send_chat', async (data) => {
    const { sessionToken, message, isAskForFriend } = data;
    try {
      const session = await prisma.session.findUnique({ where: { sessionToken } });
      if (!session) return;

      // Broadcast user message back to ensure real-time client state sync
      io.to(sessionToken).emit('chat_message', {
        role: 'user',
        content: message,
        createdAt: new Date().toISOString()
      });

      // Process AI Response
      const currentHour = new Date().getHours();
      const aiResult = await processAIChat(message, !!isAskForFriend, session.id, currentHour);

      // Save messages asynchronously
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: message
        }
      });

      const botMessage = await prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: aiResult.content,
          emotionLabel: aiResult.emotionLabel
        }
      });

      // Broadcast AI response
      io.to(sessionToken).emit('chat_message', {
        id: botMessage.id,
        role: 'assistant',
        content: aiResult.content,
        emotionLabel: aiResult.emotionLabel,
        crisisTriggered: aiResult.crisisTriggered,
        createdAt: botMessage.createdAt.toISOString()
      });
    } catch (e) {
      console.error('Error handling socket chat message', e);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Pulse360 Backend running on port ${PORT}`);
});
