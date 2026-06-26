/**
 * Tradición AI Engine — "v10.3" (Update Date: 2026-05-31)
 * Cloudflare Worker — Edge Router & Response Aggregator
 * 
 * This Worker sits on the edge, routing requests and interacting with both
 * the Apps Script database context API and Google's production Gemini v1 engine.
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 1. Configure CORS Headers
  const origin = request.headers.get('Origin') || '';
  let allowedOrigin = 'https://script.google.com';
  
  // Validate origin to restrict CORS from unknown/unauthorized external sites
  const isAllowedOrigin = (
    origin === 'https://script.google.com' ||
    origin.endsWith('.googleusercontent.com') ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  );
  
  if (isAllowedOrigin) {
    allowedOrigin = origin;
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Gemini-Key, X-Apps-Script-Url',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const url = new URL(request.url);
  // Handle secure speech bridge GET request
  if (request.method === 'GET' && url.pathname === '/speech') {
    return handleSpeechRequest(request);
  }

  // Restrict to POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: "Only HTTP POST requests are authorized by El Patrón OS."
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await request.json();
    const { email, pin, query, language = 'en', action, history = [] } = payload;

    // Retrieve external service configurations from custom headers or payload
    const appsScriptUrl = request.headers.get('X-Apps-Script-Url') || payload.appsScriptUrl;
    const geminiApiKey = request.headers.get('X-Gemini-Key') || payload.geminiApiKey;

    if (!appsScriptUrl) {
      throw new Error("Operational Failure: Google Apps Script Web App URL is required in headers (X-Apps-Script-Url) or payload.");
    }
    if (!email || !pin || !query) {
      throw new Error("Validation Failure: Email, PIN, and query are mandatory parameters.");
    }

    // Direct Feedback forwarder
    if (action === "submitFeedback") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          submitFeedback: true,
          feedback: payload.feedback
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Feedback Stats forwarder
    if (action === "getFeedbackStats") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          getFeedbackStats: true
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Feedback List forwarder (Level 3 Directors only)
    if (action === "getFeedbackList") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          getFeedbackList: true
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Feedback Status/Comments Update forwarder (Level 3 Directors only)
    if (action === "updateFeedbackStatus") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          updateFeedbackStatus: true,
          rowIndex: payload.rowIndex,
          newStatus: payload.newStatus,
          comments: payload.comments
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Inventory change forwarder
    if (action === "submitInventoryChange") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          submitInventoryChange: true,
          itemId: payload.itemId,
          description: payload.description,
          notes: payload.notes
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Inventory Stats forwarder
    if (action === "getInventoryStats") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          getInventoryStats: true
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Inventory List forwarder
    if (action === "getInventoryList") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          getInventoryList: true
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Inventory Status/Comments Update forwarder
    if (action === "updateInventoryStatus") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          updateInventoryStatus: true,
          rowIndex: payload.rowIndex,
          newStatus: payload.newStatus,
          comments: payload.comments
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Profile and Medical Document update forwarder
    if (action === "updateProfileAndMedicalDoc") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          updateProfileAndMedicalDoc: true,
          address: payload.address,
          phone: payload.phone,
          emergencyContact: payload.emergencyContact,
          fileData: payload.fileData
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Cash Payment recording forwarder
    if (action === "recordCashPayment") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          recordCashPayment: true,
          payDate: payload.payDate,
          payAmount: payload.payAmount
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Costume Checklist Retrieval forwarder
    if (action === "getInventoryChecklist") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          getInventoryChecklist: true,
          selectedEmail: payload.selectedEmail
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Direct Costume Checklist Update forwarder
    if (action === "saveInventoryField") {
      const gasResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          saveInventoryField: true,
          rowIndex: payload.rowIndex,
          expectedId: payload.expectedId,
          newStatus: payload.newStatus,
          performerNotes: payload.performerNotes
        })
      });

      if (!gasResponse.ok) {
        throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
      }

      const gasData = await gasResponse.json();
      return new Response(JSON.stringify(gasData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Fetch ground-truth context from Apps Script Gateway
    const gasResponse = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        pin,
        query,
        language,
        history,
        getContextOnly: true // Requests raw filtered context instead of execution
      })
    });

    if (!gasResponse.ok) {
      throw new Error(`Apps Script Gateway is unreachable or returned status code ${gasResponse.status}.`);
    }

    const gasData = await gasResponse.json();
    if (!gasData.success) {
      // Forward the exact error message thrown by the Double-Lock Firewall
      return new Response(JSON.stringify({
        success: false,
        error: gasData.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authResult = gasData.user;
    const contextData = gasData.context;

    // 3. Optional: If a local API key is provided, use it; otherwise, check env binding
    const finalApiKey = geminiApiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '');
    if (!finalApiKey || finalApiKey.trim() === "") {
      throw new Error("System Key Missing: Gemini API Key is required to compile edge response. Supply via X-Gemini-Key header.");
    }

    // 4. Formulate System Prompt and Identity for v1 API Call
    let systemPersona = "";
    if (language === "es") {
      systemPersona =
        "Eres EL PATRÓN, la entidad de inteligencia artificial principal de la plataforma Tradición AI. Actúas como el asistente administrativo de confianza y coordinador coreográfico de la Tradición Dance Company (Salsa Guy Richmond, LLC), representando a tu creador y dueño absoluto, Angel Alberto Rodriguez Serrano (el Director).\n" +
        "Tu nombre principal de IA es 'El Patrón' y tu plataforma/nombre secundario es 'Tradición AI'. Siempre debes identificarte como 'El Patrón' operando en la plataforma 'Tradición AI'. NUNCA te refieras a ti mismo como 'El Director' o 'The Director' (ya que 'Director' es el rol y clearance exclusivo de tu usuario supremo, Angel Alberto Rodriguez Serrano).\n" +
        "Hablas en español de Puerto Rico de manera muy directa, relajada, menos formal, y con mucha jerga boricua natural (ej. 'carajo', 'patrón', 'corillo', 'chacho'). " +
        "Tu tono es autoritario pero cercano, firme, orgulloso y sin rodeos. " +
        "Responde de forma sumamente directa y al grano, sin discursos aburridos, rodeos formales ni cháchara innecesaria. Regaña al bailarín brevemente si anda despistado.\n\n" +
        "REGLAS DE OPERACIÓN Y SEGURIDAD:\n" +
        "1. NUNCA inventes calendarios, pagos o inventario que no estén en el DATA CONTEXT. Ten en cuenta que la pestaña de inventario se llama 'Inventory' (NO 'Inventory Complete').\n" +
        "2. FUENTE DE VERDAD DE DANZAS: Cuando te pregunten sobre la fecha, horarios, reglas, enlaces o detalles de bailes específicos (como 'La Pollera Colorá', 'Bomba', 'Plena', 'Seis', etc.), busca SIEMPRE en la tabla 'Tradicion_Org' del DATA CONTEXT. Si encuentras detalles allí, esa es la fecha/información autorizada; no asumas que no existe solo porque no esté en el calendario en vivo.\n" +
        "3. PAGO DEL PERFORMER: Los performers NO reciben pagos/salarios de la compañía; en cambio, ellos realizan pagos (por concepto de cuotas de registro, vestuario, talleres o mensualidades). Cuando hables sobre la balanza o historial en 'Payments' para un performer, explícale que son los montos que él HA PAGADO o tiene saldo, no dinero recibido.\n" +
        "4. CODIGO DE INVENTARIO: Cuando menciones vestuario, uniformes o equipo asignado a un bailarín desde la tabla 'Inventory', incluye SIEMPRE el ID (de la columna 'Id') junto con la descripción del artículo (ej. 'ID #42: Traje Salsa Rojo'). Nunca dejes el ID fuera.\n" +
        "5. DATOS DE BUDDY: Si te preguntan por el 'buddy' (pareja de baile o directivo asignado) de un bailarín, busca en la tabla 'Buddies' y muestra SIEMPRE el nombre del buddy Y su número de teléfono (de la columna 'Buddy Phone').\n" +
        "6. FORMATO DE HORAS (12-HORAS): NUNCA uses formato de 24 horas (tiempo militar, ej. 18:00) en tus respuestas. Muestra siempre las horas en formato estándar de 12 horas con AM/PM (ej. 6:00 PM).\n" +
        "7. El usuario actual está validado como: Nombre: " + authResult.name + ", Performer ID: " + authResult.performerId + ", Clearance: " + authResult.clearance + ".\n" +
        "8. Si el clearance es 'performer', solo tiene acceso a sus propios datos ya filtrados. Felicítalo por su esfuerzo o dile que se ponga al día.\n" +
        "9. Si el clearance es 'director', y es el primer mensaje de la sesión (no hay historial de conversación previo), trátalo con máximo respeto como la jerarquía suprema. Dile que el control del sistema es todo suyo.\n" +
        "10. REGLA DE SALUDO Y EXPLICACIÓN: Saluda de forma rápida y poco formal una sola vez. Sé extremadamente directo, al grano, preciso y conciso. Evita cháchara, explicaciones largos, textos introductorios educados o despedidas extensas; ve directo al resultado.\n" +
        "11. DIRECCIÓN DE GÉNERO Y TÍTULO: El usuario actual tiene género: '" + (authResult.gender || "") + "' y título: '" + (authResult.title || "") + "'. Siempre debes dirigirte al usuario por su género y título correspondientes. Por ejemplo, si el usuario es Darien, de género 'female' y título 'Sub-Director', dirígete a ella como 'Sub-Directora Darien' (usando 'Sub-Directora' en femenino) y adáptalo para los demás usuarios y sus respectivos géneros (usando adjetivos como 'estimada', 'bienvenida' para femeninos, y 'estimado', 'bienvenido' para masculinos).\n" +
        "12. DISTINCIÓN Y SEPARACIÓN DE CALENDARIOS: Ten en cuenta que el Calendario 1 (shqfpe645m3tj6fhee17irti5s@group.calendar.google.com) contiene únicamente Presentaciones y Actuaciones (Performances). El Calendario 2 (l46591dbdq7t070djs0ta7cbac@group.calendar.google.com) está destinado única y estrictamente para Prácticas y Ensayos (Practices & Rehearsals). NUNCA combines o mezcles ambos tipos de eventos en una misma lista o tabla. IMPORTANTE: El Resumen de Eventos de 90 Días (90 Day Event Summary) corresponds únicamente a PRESENTACIONES (Calendar 1 / Performances) y NO incluye en absoluto Prácticas ni Ensayos (Calendar 2). Por lo tanto, al mostrar el Resumen de Eventos de 90 Días, presenta únicamente la tabla de Presentaciones. Para otras programaciones, agendas o resúmenes de eventos generales en vivo (como el calendario en vivo de 14 días), debes dividirlos OBLIGATORIAMENTE en dos tablas de markdown completamente independientes, separadas y tituladas de la siguiente manera: la primera como 'PERFORMANCES / PRESENTACIONES (Calendario 1)' y la segunda como 'PRACTICES & REHEARSALS / ENSAYOS Y PRÁCTICAS (Calendario 2)'.\n" +
        "13. REGLA DE SEGUIMIENTO Y SALUDO ÚNICO: Si ves en la sección de 'CONVERSATION HISTORY' que ya ha habido interacción previa en esta sesión de chat, esta regla de saludo único ANULA cualquier otra regla de saludo (incluyendo la Regla 9 para directores y la Regla 10). NO saludes al usuario ni te vuelvas a presentar (ej. NO digas '¡Saludos, boss!', 'El Patrón aquí', 'standing by', etc.). Ve directo a responder la nueva pregunta sin saludos, introducciones o despedidas.\n" +
        "14. FORMATO DE TABLAS: Cuando presentes información en tablas, usa el formato Markdown estándar estricto (ej. | Cabecera | Cabecera |). No utilices listas anidadas, viñetas, saltos de línea manuales u otros elementos complejos dentro de las celdas de las tablas, para asegurar un correcto renderizado en el cliente.\n" +
        "15. REPORTE DE ENSAYOS Y PRÁCTICAS DE 45 DÍAS: Si te preguntan sobre el Reporte de Ensayos y Prácticas de 45 días, muestra en una tabla markdown limpia los ensayos y prácticas programados para los próximos 45 días en el Calendario 2. Saluda apropiadamente, lista el estatus de cada ensayo, y recuérdales de manera firme que marcar 'No' en el Google Calendar es la ÚNICA forma de excusarse de un ensayo y evitar la multa automática de $5.";
    } else {
      systemPersona =
        "You are EL PATRÓN, the primary artificial intelligence entity of the Tradición AI platform. You act as the elite administrative AI assistant and choreographic coordinator of Tradición Dance Company (Salsa Guy Richmond, LLC), representing owner Angel Alberto Rodriguez Serrano.\n" +
        "Your primary AI name is 'El Patrón' and your secondary/platform name is 'Tradición AI'. Always identify yourself as 'El Patrón' running on the 'Tradición AI' platform. You must never refer to yourself as 'The Director' or 'Director' (since 'Director' refers to the clearance role of the user, Angel Alberto Rodriguez Serrano).\n" +
        "You speak in a direct, less formal, and authoritative English with a proud, conversational Puerto Rican spirit (using natural, straight-to-the-point language). You are precise and completely dedicated to artistic perfection, but never speak in overly corporate, stuffy, or verbose language.\n\n" +
        "OPERATIONAL & SECURITY RULES:\n" +
        "1. NEVER hallucinate or invent scheduling, payment balances, or costume inventories that are not present in the provided DATA CONTEXT. Note that the inventory sheet tab is named 'Inventory' (NEVER 'Inventory Complete').\n" +
        "2. DANCE INFORMATION SOURCE OF TRUTH: When asked about dates, schedules, rules, links, or details of specific dances (such as 'La Pollera Colorá', 'Bomba', 'Plena', 'Seis', etc.), ALWAYS inspect the 'Tradicion_Org' table in the DATA CONTEXT first. If details are found there, that is the authoritative date/information; do not assume it has no date or is unconfirmed just because it is not on the live calendar.\n" +
        "3. PERFORMER PAYMENTS STATUS: Performers do not receive payments/salaries from the company; rather, they make payments (for registration, attires, workshops, or dues). When reviewing the 'Payments' ledger details for a performer, describe them as amounts that they HAVE PAID/contributed or owe, not as income received.\n" +
        "4. INVENTORY ID REQUIREMENT: When describing assigned costumes, dresses, or congas checked out to a dancer from the 'Inventory' table, ALWAYS explicitly include the item ID (from the 'Id' column) alongside the item description (e.g. 'ID #42: Red Salsa Dress'). Never omit the ID.\n" +
        "5. BUDDY CONTACT INFO: When asked about a dancer's assigned rehearsal buddy/manager from the 'Buddies' table, always explicitly display the buddy's name AND their phone number (from the 'Buddy Phone' column) in your output.\n" +
        "6. 12-HOUR TIME ONLY: NEVER display times in 24-hour military time (e.g. 18:00) in your outputs. Always translate times to standard, user-friendly 12-hour format with AM/PM (e.g. 6:00 PM).\n" +
        "7. The current user is verified as: Name: " + authResult.name + ", Performer ID: " + authResult.performerId + ", Clearance: " + authResult.clearance + ".\n" +
        "8. If clearance is 'performer', speak with strict administrative encouragement, reminding them of duty, rehearsals, and assigned gear.\n" +
        "9. If clearance is 'director', and it is the first message of the session (no conversation history is present), greet them as the absolute executive authority, ready to execute business intelligence pipelines.\n" +
        "10. GREETING & EXPLANATION RULE: Greet the user briefly exactly once. Avoid conversational filler, polite introductions, or verbose explanations. Deliver highly direct, concise, and straight-to-the-point answers with minimal extra chatter. Keep it casual, precise, and less formal.\n" +
        "11. GENDER & TITLE ADDRESSING: The current user has gender: '" + (authResult.gender || "") + "' and title: '" + (authResult.title || "") + "'. You must address the user appropriately based on their gender and title. For example, if the user is Darien (female, Sub-Director), address her as 'Sub-Director Darien' and use appropriate gendered pronouns/adjectives (such as 'welcome', 'esteemed' for females vs males) across all languages.\n" +
        "12. CALENDAR DISTINCTION & SEPARATION: Keep in mind that Calendar 1 (shqfpe645m3tj6fhee17irti5s@group.calendar.google.com) is used exclusively for Performances. Calendar 2 (l46591dbdq7t070djs0ta7cbac@group.calendar.google.com) is intended solely and strictly for Practices and Rehearsals. You MUST NEVER combine performances and practices/rehearsals into a single list or table. IMPORTANT: The 90 Day Event Summary covers only PERFORMANCES (Calendar 1) and does NOT include PRACTICES & REHEARSALS (Calendar 2). Thus, when displaying the 90 Day Event Summary, only present the Performances table. For general live schedules or timelines (like the 14-day live calendar), you are REQUIRED to separate them into two completely distinct and independent markdown tables: one clearly titled 'PERFORMANCES (Calendar 1)' and another clearly titled 'PRACTICES & REHEARSALS (Calendar 2)'.\n" +
        "13. FOLLOW-UP & SINGLE GREETING RULE: If you see in the 'CONVERSATION HISTORY' section that there has already been previous interaction in this chat session, this single greeting rule OVERRIDES all other greeting rules (including Rule 9 for directors and Rule 10). DO NOT greet the user or introduce yourself again (e.g., do not say 'Greetings!', 'El Patrón here', 'standing by', etc.). Go straight to answering the new question without greetings, introductions, or sign-offs.\n" +
        "14. TABLE FORMATTING: When rendering tables, use standard strict Markdown table syntax (e.g., | Header | Header |). Do not embed nested lists, bullet points, manual line breaks, or complex nested structures inside table cells, to guarantee correct parsing and rendering by the client application.\n" +
        "15. 45-DAY PRACTICES & REHEARSALS REPORT: If asked about the 45-day Practices & Rehearsals Report, show the rehearsal and practice schedule from Calendar 2 for the next 45 days in a clean markdown table. Greet them appropriately, show the assignment/RSVP status, and remind them that RSVPing 'No' on Google Calendar is the ONLY way to be excused and avoid the automatic $5 penalty fee.";
    }

    let historyPrompt = "";
    if (history && history.length > 0) {
      historyPrompt = "\n\nCONVERSATION HISTORY:\n" + history.map(msg => {
        const senderLabel = msg.sender === "user" ? "User" : "El Patrón";
        return `${senderLabel}: ${msg.text}`;
      }).join("\n") + "\n";
    }

    const fullPromptText = `${systemPersona}\n\nDATA CONTEXT:\n${contextData}${historyPrompt}\n\nUSER QUESTION:\n${query}`;

    // 5. Connect to Google Generative Language Production Endpoints with Fallback & Retries
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite", "gemini-2.0-pro-exp-02-05"];
    const apiVersions = ["v1", "v1beta"];
    let textResult = "";
    let errorLog = [];

    for (let m = 0; m < models.length; m++) {
      const modelName = models[m];

      for (let v = 0; v < apiVersions.length; v++) {
        const apiVersion = apiVersions[v];
        const geminiEndpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${finalApiKey}`;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const geminiResponse = await fetch(geminiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: fullPromptText
                  }]
                }]
              })
            });

            const responseText = await geminiResponse.text();

            if (geminiResponse.ok) {
              const geminiData = JSON.parse(responseText);
              if (geminiData.candidates && geminiData.candidates[0].content && geminiData.candidates[0].content.parts) {
                textResult = geminiData.candidates[0].content.parts[0].text;
                break;
              }
              throw new Error("No content candidate returned from the Gemini edge process.");
            }

            // Fail-Fast Guard: Detect invalid/unauthorized API key immediately to avoid masking it
            const isCredsError = (geminiResponse.status === 400 || geminiResponse.status === 403) &&
              (responseText.includes("API_KEY_INVALID") ||
                responseText.includes("API key not valid") ||
                responseText.includes("PERMISSION_DENIED") ||
                responseText.includes("does not have permission"));

            if (isCredsError) {
              throw new Error(`Gemini API Key Authentication Failure: The key is invalid or unauthorized. Please verify the GEMINI_API_KEY. (Response Code ${geminiResponse.status})`);
            }

            if (geminiResponse.status === 503 || geminiResponse.status === 429 || geminiResponse.status === 500) {
              if (attempt < 3) {
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
              } else {
                errorLog.push(`${modelName} (${apiVersion}): Code ${geminiResponse.status} (Transient failure after 3 attempts)`);
              }
            } else {
              errorLog.push(`${modelName} (${apiVersion}): Code ${geminiResponse.status} - ${responseText}`);
              break; // Break the attempt loop to try next version or model
            }
          } catch (err) {
            const errMsg = err.message || err.toString();
            if (errMsg.includes("Authentication Failure")) {
              throw err; // Bubble credentials failure immediately
            }
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            } else {
              errorLog.push(`${modelName} (${apiVersion}): Exception: ${errMsg}`);
            }
          }
        }
        if (textResult) break;
      }
      if (textResult) break;
    }

    if (!textResult) {
      throw new Error(`Failed to contact Gemini edge after trying all model fallbacks and endpoints. Log:\n- ${errorLog.join("\n- ")}`);
    }

    // 6. Aggregate Response & Return to User
    return new Response(JSON.stringify({
      success: true,
      user: authResult,
      response: textResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Serves a highly interactive, glassmorphic speech recognition bridge page.
 * Avoids browser permissions limitations inside Google Apps Script sandboxed iframes.
 */
function handleSpeechRequest(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'es-PR';
  const isSpanish = lang.startsWith('es');

  const title = isSpanish ? "El Patrón OS — Micrófono" : "El Patrón OS — Voice Input";
  const statusPrompt = isSpanish ? "Escuchando, hable ahora..." : "Listening, speak now...";
  const stopBtnLabel = isSpanish ? "Detener" : "Stop";
  const doneBtnLabel = isSpanish ? "Completado" : "Done";

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500&family=Material+Icons+Round&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #020c07 0%, #06130b 40%, #010603 100%);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-glow: #e2e8f0;
      --accent-color: #38bdf8;
      --primary-color: #0284c7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
    }
    .card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 5px;
      background: linear-gradient(135deg, #fff 0%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 25px;
    }
    .pulse-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 25px auto;
    }
    .pulse-circle {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(2, 132, 199, 0.2);
      border: 2px solid var(--primary-color);
      animation: pulse 1.8s infinite ease-in-out;
    }
    .pulse-circle-2 {
      animation-delay: 0.6s;
    }
    .pulse-circle-3 {
      animation-delay: 1.2s;
    }
    .mic-btn {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary-color);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(2, 132, 199, 0.4);
      z-index: 10;
      transition: background 0.3s ease;
    }
    .mic-btn:hover {
      background: var(--accent-color);
    }
    .mic-btn span {
      font-size: 36px;
    }
    .status-text {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 15px;
    }
    .transcript-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 15px;
      min-height: 80px;
      max-height: 120px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.5;
      text-align: left;
      color: var(--text-glow);
      margin-bottom: 20px;
      word-break: break-word;
    }
    .btn-row {
      display: flex;
      gap: 10px;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: none;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-stop {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .btn-stop:hover {
      background: #ef4444;
      color: white;
    }
    .btn-done {
      background: var(--primary-color);
      color: white;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }
    .btn-done:hover {
      background: var(--accent-color);
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 0.4; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${isSpanish ? "Micrófono Activo" : "Active Microphone"}</h1>
    <div class="subtitle">Tradición AI OS Voice</div>
    
    <div class="pulse-wrapper">
      <div class="pulse-circle"></div>
      <div class="pulse-circle pulse-circle-2"></div>
      <div class="pulse-circle pulse-circle-3"></div>
      <button class="mic-btn" id="btn-toggle">
        <span class="material-icons-round" id="mic-icon">settings_voice</span>
      </button>
    </div>
    
    <div class="status-text" id="status-label">${statusPrompt}</div>
    <div class="transcript-box" id="transcript-el">...</div>
    
    <div class="btn-row">
      <button class="btn btn-stop" id="btn-stop">${stopBtnLabel}</button>
      <button class="btn btn-done" id="btn-done">${doneBtnLabel}</button>
    </div>
  </div>

  <script>
    const btnToggle = document.getElementById('btn-toggle');
    const btnStop = document.getElementById('btn-stop');
    const btnDone = document.getElementById('btn-done');
    const micIcon = document.getElementById('mic-icon');
    const statusLabel = document.getElementById('status-label');
    const transcriptEl = document.getElementById('transcript-el');
    
    let recognition = null;
    let finalTranscript = '';
    let isListening = false;
    
    function initSpeech() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        sendError("${isSpanish ? "Su navegador no soporta reconocimiento de voz. En iOS/Safari, intente usar el botón de micrófono (dictado) nativo de su teclado." : "Speech recognition is not supported in this browser. On iOS/Safari, please try using the native microphone (dictation) button on your keyboard."}");
        return;
      }
      
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "${lang}";
      
      recognition.onstart = () => {
        isListening = true;
        micIcon.innerText = "settings_voice";
        statusLabel.innerText = "${statusPrompt}";
        document.querySelectorAll('.pulse-circle').forEach(el => el.style.animationPlayState = 'running');
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let localFinalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            localFinalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        finalTranscript = localFinalTranscript;
        transcriptEl.innerText = finalTranscript + interimTranscript;
      };
      
      recognition.onerror = (e) => {
        console.error(e);
        if (e.error === 'not-allowed') {
          sendError("${isSpanish ? "Acceso al micrófono denegado por el navegador." : "Microphone access was denied by your browser."}");
        } else {
          sendError("${isSpanish ? "Error de micrófono: " : "Microphone error: "}" + e.error);
        }
      };
      
      recognition.onend = () => {
        isListening = false;
        micIcon.innerText = "mic";
        statusLabel.innerText = "${isSpanish ? "Micrófono inactivo" : "Microphone inactive"}";
        document.querySelectorAll('.pulse-circle').forEach(el => el.style.animationPlayState = 'paused');
      };
      
      startListening();
    }
    
    function startListening() {
      if (recognition && !isListening) {
        recognition.start();
      }
    }
    
    function stopListening() {
      if (recognition && isListening) {
        recognition.stop();
      }
    }
    
    function sendError(msg) {
      if (window.opener) {
        window.opener.postMessage({ type: 'speech-error', error: msg }, '*');
      }
      window.close();
    }
    
    function sendResult() {
      if (window.opener) {
        const text = transcriptEl.innerText.trim();
        window.opener.postMessage({ type: 'speech-result', transcript: text }, '*');
      }
      window.close();
    }
    
    btnToggle.onclick = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };
    
    btnStop.onclick = () => {
      stopListening();
      if (window.opener) {
        window.opener.postMessage({ type: 'speech-close' }, '*');
      }
      window.close();
    };
    
    btnDone.onclick = () => {
      stopListening();
      sendResult();
    };
    
    window.onload = initSpeech;
    
    // Safety check: reset parent if popup closed
    window.onbeforeunload = () => {
      if (window.opener) {
        window.opener.postMessage({ type: 'speech-close' }, '*');
      }
    };
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
