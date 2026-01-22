import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;
  if (!message) return res.status(400).end();

  const chatId = message.chat.id;
  const firstName = message.from.first_name || '';
  const lastName = message.from.last_name || '';
  const username = message.from.username || '';
  const photo = `https://t.me/i/userpic/320/${chatId}.jpg`; // Optional placeholder

  // 1️⃣ Save to Firebase
  const firebase = await import('./saveUser.js'); // We'll implement next
  await firebase.saveUser({
    telegramId: chatId,
    firstName,
    lastName,
    username,
    photo
  });

  // 2️⃣ Send login link
  const loginLink = `https://authbot-eta.vercel.app/login.html?id=${chatId}`;

  await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ Login ready! Click here: ${loginLink}`
    })
  });

  res.status(200).json({ success: true });
  }
