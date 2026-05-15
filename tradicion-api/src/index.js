export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Toggle debug mode
    const DEBUG = true;

    // Safe JSON response helper
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj, null, DEBUG ? 2 : 0), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    // Debug logger
    const debugLog = (label, data) => {
      if (DEBUG) console.log(`\n===== ${label} =====\n`, data);
    };

    // ============================
    // CORS preflight
    // ============================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // ============================
    // GET /hello
    // ============================
    if (url.pathname === "/hello") {
      return json({ message: "Hello Angel — Gemini Worker is alive." });
    }

    // ============================
    // GET /debug
    // ============================
    if (url.pathname === "/debug") {
      return json({
        status: "debug-info",
        worker: "running",
        envVars: {
          GEMINI_API_KEY: env.GEMINI_API_KEY ? "✔ loaded" : "❌ missing"
        },
        timestamp: new Date().toISOString()
      });
    }

    // ============================
    // GET /api
    // ============================
    if (url.pathname === "/api" && request.method === "GET") {
      return json({ status: "ok", message: "API is alive" });
    }

    // ============================
    // POST /api (MAIN ENDPOINT)
    // ============================
    if (url.pathname === "/api" && request.method === "POST") {
      try {
        // Read raw body
        const bodyText = await request.text();
        debugLog("RAW REQUEST BODY", bodyText);

        // Parse JSON safely
        let parsed;
        try {
          parsed = JSON.parse(bodyText);
        } catch (err) {
          return json(
            {
              status: "error",
              data: "Invalid JSON in request body.",
              debug: DEBUG ? err.message : undefined
            },
            400
          );
        }

        const { query, email, pin, lang } = parsed;

        // ============================
        // 1. Fetch org data from Apps Script
        // ============================
        const APPS_SCRIPT_URL =
          "https://script.google.com/macros/s/AKfycbwV6TX9WrsdqYUWXl2WeAyO6F2SLygHB7TeEekPOh0h9i9OKxfLqOZZ5iOC-jWKZC4O/exec";

        const dataRes = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ query: "__GET_DATA__", email, pin, lang })
        });

        // Handle non-JSON or HTML responses
        let dataJson;
        try {
          dataJson = await dataRes.json();
        } catch (err) {
          return json(
            {
              status: "error",
              data: "Apps Script returned invalid JSON.",
              debug: DEBUG ? await dataRes.text() : undefined
            },
            500
          );
        }

        debugLog("APPS SCRIPT RESPONSE", dataJson);

        if (dataJson.status !== "success") {
          return json({
            status: "error",
            data: dataJson.data,
            debug: DEBUG ? dataJson : undefined
          });
        }

        const orgData = dataJson.data;

        // ============================
        // 2. Persona prompt
        // ============================
        const personaPrompt = `
Eres "El Patrón", Director de Tradición Dance Company.
Hablas con autoridad, humor boricua, y estilo de líder.
Siempre ayudas, nunca inventas datos.
Si no sabes algo, lo dices con flow.

Datos de la organización:
${orgData}

Pregunta del usuario:
${query}
        `;

        debugLog("PERSONA PROMPT", personaPrompt);

        // ============================
        // 3. Call Gemini API
        // ============================
const geminiRes = await fetch(
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
    env.GEMINI_API_KEY,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: personaPrompt }] }]
    })
  }
);


        // Handle non-JSON or HTML responses
        let geminiJson;
        try {
          geminiJson = await geminiRes.json();
        } catch (err) {
          return json(
            {
              status: "error",
              data: "Gemini returned invalid JSON.",
              debug: DEBUG ? await geminiRes.text() : undefined
            },
            500
          );
        }

        debugLog("GEMINI RAW RESPONSE", geminiJson);

        // Handle Gemini API errors
        if (!geminiRes.ok || geminiJson.error) {
          return json(
            {
              status: "error",
              data: "Gemini API error.",
              debug: DEBUG ? geminiJson : undefined
            },
            500
          );
        }

        // Extract AI text safely
        const aiText =
          geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "⚠️ Gemini returned no text.";

        // ============================
        // SUCCESS RESPONSE
        // ============================
        return json({
          status: "success",
          data: aiText,
          debug: DEBUG ? geminiJson : undefined
        });
      } catch (err) {
        return json(
          {
            status: "error",
            data: "⚠️ Worker crashed.",
            debug: DEBUG ? err.stack || err.message : undefined
          },
          500
        );
      }
    }

    // ============================
    // Default 404
    // ============================
    return json({ status: "error", data: "Not found" }, 404);
  }
};
