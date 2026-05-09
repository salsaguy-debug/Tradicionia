export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Toggle debug mode (true = verbose errors)
    const DEBUG = true;

    // Helper: safe JSON response
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj, null, DEBUG ? 2 : 0), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    // Helper: debug log wrapper
    const debugLog = (label, data) => {
      if (DEBUG) {
        console.log(`\n===== ${label} =====\n`, data);
      }
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
    // GET /hello (health check)
    // ============================
    if (url.pathname === "/hello") {
      return json({ message: "Hello Angel — Gemini Worker is alive." });
    }

    // ============================
    // GET /debug (full system test)
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
    // GET /api (fixes Unexpected '<')
    // ============================
    if (url.pathname === "/api" && request.method === "GET") {
      return json({ status: "ok", message: "API is alive" });
    }

    // ============================
    // POST /api (main AI endpoint)
    // ============================
    if (url.pathname === "/api" && request.method === "POST") {
      try {
        const bodyText = await request.text();
        debugLog("RAW REQUEST BODY", bodyText);

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

        // 1. Fetch org data from Apps Script
        const APPS_SCRIPT_URL =
          "https://script.google.com/macros/s/AKfycbzwtet2i0JuownRO1Ksiyx111WnNqOBTeKznEa2q_KdfNY6oMq3GHPSrWPnoccVnme9/exec";

        const dataRes = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ query: "__GET_DATA__", email, pin, lang })
        });

        const dataJson = await dataRes.json();
        debugLog("APPS SCRIPT RESPONSE", dataJson);

        if (dataJson.status !== "success") {
          return json({
            status: "error",
            data: dataJson.data,
            debug: DEBUG ? dataJson : undefined
          });
        }

        const orgData = dataJson.data;

        // 2. Persona prompt
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

        // 3. Call Gemini
        const geminiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
            env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: personaPrompt }] }]
            })
          }
        );

        const geminiJson = await geminiRes.json();
        debugLog("GEMINI RAW RESPONSE", geminiJson);

        const aiText =
          geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
          "⚠️ The AI returned no text.";

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
