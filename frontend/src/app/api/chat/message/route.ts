import { NextResponse } from 'next/server';

export const runtime = 'edge';

const CRISIS_KEYWORDS_EN = [
  'suicide', 'kill myself', 'end my life', 'harm myself', 'self-harm', 
  'cutting myself', 'hanging myself', 'want to die', 'better off dead'
];

const CRISIS_KEYWORDS_RW = [
  'kwiyahura', 'kwiyica', 'gupfa', 'ndarambiwe', 'kwitsinda', 
  'gusenya ubuzima', 'nshaka gupfa'
];

function processAIChat(
  message: string,
  isAskForFriend: boolean,
  currentHour: number = new Date().getHours()
) {
  const contentLower = message.toLowerCase();
  
  // 1. Detect Crisis Keywords
  const hasCrisisEn = CRISIS_KEYWORDS_EN.some(kw => contentLower.includes(kw));
  const hasCrisisRw = CRISIS_KEYWORDS_RW.some(kw => contentLower.includes(kw));
  const crisisTriggered = hasCrisisEn || hasCrisisRw;
  const crisisType = crisisTriggered ? 'suicide_self_harm' : null;

  // 2. Detect Language
  const isKinyarwanda = /[aeiou]y[aeiou]|waza|amakuru|inshuti|gufasha|neza|yego|oya|uraho|muraho|mwaramutse|mwiriwe|umutima|umutwe|sida|kwiyahura/i.test(message) || hasCrisisRw;
  const lang = isKinyarwanda ? 'rw' : 'en';

  // 3. Detect Emotion
  let emotionLabel = 'normal';
  if (/[sad|depress|lone|hurt|cry|weep|pain|grief|imihangayiko|umubabaro|agahinda]/i.test(contentLower)) {
    emotionLabel = 'sad';
  } else if (/[anx|stress|panic|fear|scare|worry|akoba|ubwoba|guteza]/i.test(contentLower)) {
    emotionLabel = 'anxious';
  } else if (/[happy|great|good|fine|excit|joy|neza|shimye|ishimwe]/i.test(contentLower)) {
    emotionLabel = 'happy';
  }

  // 4. Handle 2AM Crisis Mode (Between 10 PM and 5 AM)
  const isNightCrisisMode = currentHour >= 22 || currentHour < 5;

  let responseText = '';

  if (lang === 'rw') {
    if (crisisTriggered) {
      responseText = 'Mwanya urakomeye cyane kandi ndumva akababaro kawe. Nyamuneka menya ko utari wenyine. Dufite abajyanama biteguye kugufasha uwo ari we wese, kandi bafasha mu buryo bwizewe kandi buhishwe. Nyamuneka hamagara umurongo w’ubutabazi utishyurwa kuri 114 cyangwa 112 vuba bishoboka. Pulse360 iragukunda kandi turashaka kugufasha.';
    } else {
      if (isAskForFriend) {
        responseText = 'Ni byiza cyane ko ushaka gufasha inshuti yawe. Ubuzima bw’imyororokere n’ubwo mu mutwe ni ibintu bikomeye. ';
        if (contentLower.includes('sida') || contentLower.includes('hiv') || contentLower.includes('prep') || contentLower.includes('pep')) {
          responseText += 'Inshuti yawe ikwiye kumenya ko PEP (Post-Exposure Prophylaxis) ifatwa mu masaha 72 nyuma yo guhura n’ibyago byo kwandura. Niba akeneye kwipimisha, ashobora kureba ivuriro rimwegereye ahabonetse kuri map yacu mu gice cya "Find a Clinic".';
        } else if (contentLower.includes('agahinda') || contentLower.includes('stress') || contentLower.includes('umutwe')) {
          responseText += 'Ku bijyanye n’agahinda n’umuhangayiko, inshuti yawe ishobora kubona ubufasha bw’abajyanama bacu mu buryo buhishwe. Shishikariza inshuti yawe gutangira ikiganiro cyangwa uze gufata gahunda yo kubonana n’umuganga (Virtual Consultation) kuri iyi porogaramu.';
        } else {
          responseText += 'Nyamuneka ubabwire ko dushobora kubafasha mu buryo buhishwe kuri Pulse360. Ese ni ibiki bikeneye ibisobanuro kurushaho kugira ngo tugufashe kumufasha?';
        }
      } else {
        if (isNightCrisisMode) {
          responseText = '[2AM Crisis Mode] Mwaramutse/Mwiriwe, uraho muri iri joro. Umutekano wawe n’ubuzima bwawe nicyo gishyizwe imbere. ';
        } else {
          responseText = 'Muraho! Ndagusuhuje kuri Pulse360. Umutekano n’ubuzima bwawe nibyo bya mbere kuri twe. ';
        }

        if (contentLower.includes('sida') || contentLower.includes('hiv') || contentLower.includes('prep') || contentLower.includes('pep')) {
          responseText += 'Kwirinda Sida ni ingenzi. PrEP ni umuti ufata buri munsi utarayandura kugira ngo utazayandura, naho PEP yo yihutirwa ikanyobwa mu gihe kitarenze amasaha 72 uhuye n’ibyago byo kwandura. Urashaka amakuru y’aho wabona uyu muti cyangwa ibyerekeye uburyo bwo kwipimisha muri Kigali cyangwa ahandi?';
        } else if (contentLower.includes('agahinda') || contentLower.includes('stress') || contentLower.includes('umutwe') || contentLower.includes('anxiety')) {
          responseText += 'Umuhangayiko n’agahinda gakabije bishobora guhungabanya ubuzima. Gerageza guhumeka gahoro (humera winjiza umwuka inshuro 4, uwugumemo inshuro 4, hanyuma uwusohore inshuro 4). Niba wumva bikomeye, dushobora kuguhuza n’umujyanama mu buryo bw’amashusho (Virtual Consultation) cyangwa ukagana ahavurirwa hafi yawe.';
        } else if (contentLower.includes('kurongora') || contentLower.includes('igitsina') || contentLower.includes('gusama') || contentLower.includes('inda')) {
          responseText += 'Ubuzima bw’imyororokere n’uburenganzira bwawe. Kwirinda gusama biterwa n’uburyo bwiza bwo kuboneza urubyaro. Dufite ibinini by’inyongera by’ihutirwa (Emergency Contraceptive) bigomba gufatwa mbere y’amasaha 120 (iminsi 5), ariko icyiza ni mu masaha 72 ya mbere.';
        } else {
          responseText += 'Niteguye kugufasha no kuguhana amakuru yose ujyanye n’ubuzima bwo mu mutwe, imyororokere, cyangwa uburyo bwo kwirinda indwara. Ese ufite ikihe kibazo wifuza ko tuganiraho?';
        }
      }
    }
  } else {
    if (crisisTriggered) {
      responseText = 'I hear how much pain you are in right now, and I want you to know you do not have to carry this alone. Please connect with someone who can support you. You can call the Rwanda national emergency hotlines at 114 or 112 immediately. They are free, confidential, and active 24/7. Pulse360 cares about your safety and well-being.';
    } else {
      if (isAskForFriend) {
        responseText = 'It is very supportive of you to reach out on behalf of your friend. ';
        if (contentLower.includes('hiv') || contentLower.includes('aids') || contentLower.includes('prep') || contentLower.includes('pep')) {
          responseText += 'For HIV prevention, tell your friend that PEP (Post-Exposure Prophylaxis) must be started within 72 hours of potential exposure. PrEP is a daily preventative pill. They can find nearby youth-friendly health centers using our "Find a Clinic" tab.';
        } else if (contentLower.includes('depress') || contentLower.includes('anx') || contentLower.includes('stress') || contentLower.includes('sad')) {
          responseText += 'Regarding their mental health, encourage them that seeking support is a sign of strength. They can book a private virtual consultation with a qualified youth counselor directly in our "Virtual Consultation" section.';
        } else {
          responseText += 'Please let them know that we offer 100% confidential and anonymous help. What specific symptoms or questions does your friend have?';
        }
      } else {
        if (isNightCrisisMode) {
          responseText = '[2AM Crisis Mode] Hi, I see you are online late tonight. Your safety and well-being are my absolute priority. ';
        } else {
          responseText = 'Hello! Welcome to Pulse360, your safe space. How can I help you today? ';
        }

        if (contentLower.includes('hiv') || contentLower.includes('aids') || contentLower.includes('prep') || contentLower.includes('pep')) {
          responseText += 'Regarding HIV prevention: PrEP is a pre-exposure daily pill to prevent infection. PEP is post-exposure emergency medicine that must be taken within 72 hours. You can search our clinic directory for locations offering free testing, counseling, and medications.';
        } else if (contentLower.includes('depress') || contentLower.includes('anx') || contentLower.includes('stress') || contentLower.includes('sad') || contentLower.includes('lonely')) {
          responseText += 'It sounds like you are going through a heavy time. Try a simple grounding exercise: name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. If you feel you need professional support, you can book a free first video consultation session.';
        } else if (contentLower.includes('pregnant') || contentLower.includes('contracept') || contentLower.includes('sex') || contentLower.includes('condom')) {
          responseText += 'Your reproductive health choices are personal and important. Emergency contraceptive pills work best if taken within 72 hours of unprotected sex, though some work up to 120 hours. Condoms protect against both pregnancy and STIs.';
        } else {
          responseText += 'I can provide anonymous guidance on mental health, sexual health, HIV prevention, or clinics in Rwanda. What is on your mind?';
        }
      }
    }
  }

  return {
    content: responseText,
    emotionLabel,
    crisisTriggered,
    crisisType
  };
}

export async function POST(request: Request) {
  try {
    const { sessionToken, message, isAskForFriend } = await request.json();

    if (!sessionToken || !message) {
      return NextResponse.json(
        { success: false, error: 'Session token and message content required.' },
        { status: 400 }
      );
    }

    const currentHour = new Date().getHours();
    const aiResult = processAIChat(message, !!isAskForFriend, currentHour);
    const messageId = `msg-${crypto.randomUUID()}`;

    // Cloudflare D1 integration if available
    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    if (db) {
      // Find session ID
      const sessionResult = await db.prepare('SELECT id FROM Session WHERE sessionToken = ?').bind(sessionToken).first();
      const sessionId = sessionResult?.id || sessionToken;

      // Insert User message
      await db.prepare(
        'INSERT INTO Message (id, sessionId, role, content) VALUES (?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), sessionId, 'user', message).run();

      // Insert Bot message
      await db.prepare(
        'INSERT INTO Message (id, sessionId, role, content, emotionLabel, crisisTriggered) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(messageId, sessionId, 'assistant', aiResult.content, aiResult.emotionLabel, aiResult.crisisTriggered ? 1 : 0).run();

      if (aiResult.crisisTriggered) {
        await db.prepare(
          'INSERT INTO CrisisEvent (id, sessionId, triggerType) VALUES (?, ?, ?)'
        ).bind(crypto.randomUUID(), sessionId, aiResult.crisisType || 'general_crisis').run();
        
        // Cache crisis status in Cloudflare KV for fast dashboard alert lookups
        const kv = (globalThis as unknown as { PULSE360_KV?: unknown }).PULSE360_KV || process.env.PULSE360_KV;
        if (kv && kv.put) {
          await kv.put(`crisis:${sessionId}`, 'true', { expirationTtl: 3600 }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: aiResult.content,
      emotionLabel: aiResult.emotionLabel,
      crisisTriggered: aiResult.crisisTriggered,
      messageId
    });
  } catch {
    return NextResponse.json(
      { success: false, error: error.message || 'Chat processing failed' },
      { status: 500 }
    );
  }
}
