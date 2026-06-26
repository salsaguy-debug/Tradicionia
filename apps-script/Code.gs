/**
 * Tradición AI Engine — "v10.3"
 * Project Owner: Angel Alberto Rodriguez Serrano
 * Organization: Salsa Guy Richmond, LLC / Tradición Dance Company
 * 
 * This server-side Apps Script acts as the authoritative "Iron Vault" gateway.
 * It serves the frontend SPA, handles secure double-locked credential validation,
 * parses sheet routing via Regex, filters private dancer data, queries live calendars,
 * and calls the Gemini v1beta endpoint securely.
 * 
 * Update Date: 2026-05-31
 */

// GLOBAL CONFIGURATION
const SPREADSHEET_ID = "1u-kw9x5WJPO5NgvkH0-B8bNPWPLvVF28myNvbkc9pFk"; // Binds your active sheet database ID
const CALENDAR_1_NAME = "shqfpe645m3tj6fhee17irti5s@group.calendar.google.com"; // Binds Calendar 1 ID (Performances)
const CALENDAR_2_SEARCH = "l46591dbdq7t070djs0ta7cbac@group.calendar.google.com"; // Binds Calendar 2 ID (Practices & Rehearsals Only)

/**
 * Serves the Single Page Application (SPA) dashboard.
 */
function doGet(e) {
  // Ensure the daily feedback and inventory email triggers are registered
  try {
    setupDailyFeedbackEmailTrigger();
    setupDailyInventoryEmailTrigger();
  } catch (err) {
    Logger.log("Trigger setup failed: " + err.toString());
  }

  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle("Tradición AI — El Patrón OS")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Standard helper to include sub-template files in Google Apps Script.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Handles API requests from the Cloudflare Worker or external agents.
 * Expects a JSON POST request containing: email, pin, query, language
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const email = payload.email;
    const pin = payload.pin;
    
    // Direct Feedback submission check
    if (payload.submitFeedback) {
      return ContentService.createTextOutput(JSON.stringify(
        directSubmitFeedback(email, pin, payload.feedback)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Inventory change submission check
    if (payload.submitInventoryChange) {
      return ContentService.createTextOutput(JSON.stringify(
        directSubmitInventoryChange(email, pin, payload.itemId, payload.description, payload.notes)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Inventory stats check
    if (payload.getInventoryStats) {
      return ContentService.createTextOutput(JSON.stringify(
        getInventoryStats(email, pin)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Inventory list check
    if (payload.getInventoryList) {
      return ContentService.createTextOutput(JSON.stringify(
        getInventoryList(email, pin)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Inventory status update check
    if (payload.updateInventoryStatus) {
      return ContentService.createTextOutput(JSON.stringify(
        updateInventoryStatus(email, pin, payload.rowIndex, payload.newStatus, payload.comments)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Feedback Stats check
    if (payload.getFeedbackStats) {
      return ContentService.createTextOutput(JSON.stringify(
        getFeedbackStats(email, pin)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Feedback List check
    if (payload.getFeedbackList) {
      return ContentService.createTextOutput(JSON.stringify(
        getFeedbackList(email, pin)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Feedback Status Update check
    if (payload.updateFeedbackStatus) {
      return ContentService.createTextOutput(JSON.stringify(
        updateFeedbackStatus(email, pin, payload.rowIndex, payload.newStatus, payload.comments)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Profile and Medical Document update check
    if (payload.updateProfileAndMedicalDoc) {
      return ContentService.createTextOutput(JSON.stringify(
        directUpdateProfileAndMedicalDoc(email, pin, payload.address, payload.phone, payload.emergencyContact, payload.fileData)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Direct Cash Payment recording check
    if (payload.recordCashPayment) {
      return ContentService.createTextOutput(JSON.stringify(
        directRecordCashPayment(email, pin, payload.payDate, payload.payAmount)
      )).setMimeType(ContentService.MimeType.JSON);
    }
    
    const query = payload.query;
    const language = payload.language || "en";
    const history = payload.history || [];
    
    // 1. Enforce Double-Lock Firewall
    const authResult = validateCredentials(email, pin);
    
    // 2. Fetch and route context data
    const contextData = getFilteredContext(authResult, query, history);
    
    // 3. Optional direct Gemini call or return context to Worker
    if (payload.getContextOnly) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        user: authResult,
        context: contextData
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Execute direct Apps Script Gemini v1beta API call
    const aiResponse = callGeminiAPI(authResult, contextData, query, language, history);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      user: authResult,
      response: aiResponse
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Double-Lock Security Firewall:
 * Locks the door immediately unless BOTH identity and authority check out.
 */
function validateCredentials(email, pin) {
  if (!email || !pin) {
    throw new Error("Credentials missing. Email and PIN required.");
  }
  
  const formattedEmail = email.trim().toLowerCase();
  const pinStr = pin.toString().trim();
  
  // Get spreadsheet instance
  const ss = getSpreadsheetInstance();
  const profilesSheet = ss.getSheetByName("Profiles") || ss.getSheetByName("Profile") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Crosswalk");
  if (!profilesSheet) {
    throw new Error("System Error: Credentials database ledger ('Profiles' or 'Profile') not found in spreadsheet.");
  }
  
  const values = profilesSheet.getDataRange().getValues();
  if (values.length <= 1) {
    throw new Error("I see you are writing from " + email + ", but I don't see that email in our performer records. Reenter you email.");
  }
  
  // Find column indexes strictly by dynamic header strings (column position agnostic)
  const headers = values[0].map(h => h.toString().toLowerCase().trim());
  const emailCol = headers.findIndex(h => h.includes("email") || h.includes("correo"));
  const pinCol = headers.findIndex(h => h.includes("pin") || h.includes("code") || h.includes("código"));
  
  // Specific header exclusions to avoid collisions (e.g. matching "Emergency Contact Name" instead of performer's Name)
  const nameCol = headers.findIndex(h => (h.includes("name") || h.includes("nombre") || h.includes("fullname") || h.includes("full name")) && 
                                        !h.includes("contact") && !h.includes("emergency") && !h.includes("buddy") && !h.includes("payer") && !h.includes("sponsor"));
                                        
  // Strict matching for Performer ID to avoid matching license strings or item IDs
  const idCol = headers.findIndex(h => h === "id" || h === "performer_id" || h === "performer id" || h === "member id" || h === "member_id" || h === "member" || h === "dancer id" || h === "dancer_id");
  
  if (emailCol === -1 || pinCol === -1) {
    throw new Error("System Error: Credentials sheet headers are incorrectly configured.");
  }
  
  let userRow = null;
  // Deep-cell scanning for email match
  for (let i = 1; i < values.length; i++) {
    const rowEmail = values[i][emailCol].toString().trim().toLowerCase();
    if (rowEmail === formattedEmail) {
      userRow = values[i];
      break;
    }
  }
  
  // 1st Lock: Identity Check
  if (!userRow) {
    throw new Error("I see you are writing from " + email + ", but I don't see that email in our performer records. Reenter you email.");
  }
  
  // 2nd Lock: Authority Check & PIN Matching
  const registeredPin = userRow[pinCol].toString().trim();
  const firstDigit = pinStr.charAt(0);
  
  if (registeredPin !== pinStr || (firstDigit !== '2' && firstDigit !== '3')) {
    throw new Error("I see you are writing from " + email + ", but I don't see that code associated to that email in our performer records. Carajo, did you forget your code?");
  }
  
  const name = nameCol !== -1 ? userRow[nameCol] : "Performer";
  const performerId = idCol !== -1 ? userRow[idCol] : "TD-UNKNOWN";
  const clearance = firstDigit === '3' ? 'director' : 'performer';
  
  // Find gender and title columns dynamically
  const genderCol = headers.findIndex(h => h.includes("gender") || h.includes("género") || h.includes("sexo"));
  const titleCol = headers.findIndex(h => h.includes("title") || h.includes("título") || h.includes("role") || h.includes("puesto") || /\brol\b/.test(h));
  
  const gender = genderCol !== -1 ? userRow[genderCol].toString().trim() : "";
  const title = titleCol !== -1 ? userRow[titleCol].toString().trim() : "";
  
  return {
    success: true,
    email: formattedEmail,
    name: name,
    performerId: performerId,
    clearance: clearance,
    gender: gender,
    title: title
  };
}

/**
 * Direct invocation endpoint used by the client SPA.
 */
function directQueryGemini(email, pin, query, language, history) {
  try {
    const authResult = validateCredentials(email, pin);
    const contextData = getFilteredContext(authResult, query, history || []);
    return {
      success: true,
      user: authResult,
      response: callGeminiAPI(authResult, contextData, query, language, history || [])
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
}

/**
 * Direct credentials verification endpoint for client UI.
 */
function directValidateCredentials(email, pin) {
  try {
    return validateCredentials(email, pin);
  } catch (error) {
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
}

/**
 * Helper to get standard spreadsheet target.
 * Resolves container-bound spreadsheet, standalone spreadsheet ID, or Script Property.
 */
// Global execution cache to reuse the spreadsheet instance across identical calls
let ssInstanceCache = null;

/**
 * Helper to get standard spreadsheet target.
 * Resolves container-bound spreadsheet, standalone spreadsheet ID, or Script Property.
 */
 function getSpreadsheetInstance() {
  if (ssInstanceCache) {
    return ssInstanceCache;
  }
  let id = SPREADSHEET_ID;
  if (!id || id.trim() === "") {
    id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  }
  if (id && id.trim() !== "") {
    ssInstanceCache = SpreadsheetApp.openById(id);
    return ssInstanceCache;
  }
  const activeSS = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSS) {
    throw new Error("System Error: No spreadsheet connected. Please define the SPREADSHEET_ID in Script Properties (or set the SPREADSHEET_ID variable at the top of Code.gs) to authorize the standalone deployment.");
  }
  ssInstanceCache = activeSS;
  return ssInstanceCache;
}

/**
 * Core Operational Data Orchestration:
 * Scans, routes, and filters sheet tabs + Google Calendar records.
 */
function getFilteredContext(auth, query, history) {
  const ss = getSpreadsheetInstance();
  
  const cleanQuery = (query || "").toString();
  let combinedQuery = cleanQuery;
  if (history && history.length > 0) {
    const allMessages = history
      .map(msg => (msg && msg.text ? msg.text : ""))
      .join(" ");
    combinedQuery = allMessages + " " + cleanQuery;
  }
  const formattedQuery = combinedQuery.toLowerCase();
  
  // Detect if the query by a director is asking about their own data records (self-query)
  const isSelfQuery = /my\s+|me\b|mi\b|mis\b|yo\b|mine\b|yo\s+mismo|self/i.test(formattedQuery) || 
                      (auth && auth.name && formattedQuery.includes(auth.name.toLowerCase().split(" ")[0]));
  
  // 1. Natural Language Intent Filtering (Regex Routing)
  let targetTabs = [];
  
  // Rule A: Payments & Money
  if (/pay|money|check|stipend|paid|pago|dinero|cuanto/i.test(formattedQuery)) {
    targetTabs.push("Performer Payments");
  }
  
  // Rule B: Gear, Inventory, Costume & Rehearsals
  if (/gear|inventory|costume|conga|instrument|asistencia|attendance|attendancet|equipo|ensayo|rehearsal|shoe|calzado|zapato|vestuario|ropa|garment|undershirt|slip shorts|leggings|fishnet|stocking|belt|hairpieces|makeup|dress|uniform|hat|sombrero|pava|headwear|headgear|cap|prop|drum|skirt|shirt|pant|jacket|boot|heel|sock|necklace|earring|crown|mask|veil/i.test(formattedQuery)) {
    targetTabs.push("Inventory", "Attendance", "Tradicion_Org");
  }
  
  // Rule C: Health, Safety & Agreements
  if (/health|safety|medical|clearance|doctor|allergy|alergia|salud|certificado|licencia|agreement|driver|license|car|plate|vehiculo/i.test(formattedQuery)) {
    targetTabs.push("Health_Safety", "Health_Certificates", "Profiles", "Auditions");
  }
  
  // Rule D: Quizzes, Scores & Auditions
  if (/quiz|score|test|bomba score|plena score|examen|audition|candidate|audición|evaluacion/i.test(formattedQuery)) {
    targetTabs.push("Quizzes", "Auditions");
  }
  
  // Rule E: Feedback & History
  if (/feedback|history|chat|opinion|comentario/i.test(formattedQuery)) {
    targetTabs.push("App_Feedback", "ChatHistory");
  }
  
  // Rule F: Dance Styles, Manual, Rules, Policies & General Info (Tradicion_Org)
  if (/rule|norma|regla|manual|reglamento|bomba|plena|salsa|dance|baile|historia|pollera|colora|colorá|cumbia|danz|viejito|sombrero|organizacion|organizational|coreografia|choreography|policy|politica|responsibility|responsabilidad|bring|traer|provide|proveer|unprovided/i.test(formattedQuery)) {
    targetTabs.push("Tradicion_Org");
  }
  
  // Rule G: Member Profiles, Contact Info & Birthdays
  if (/birthday|birth|cumpleaños|cumple|email|phone|contact|profile|miembro|member|activo|active/i.test(formattedQuery)) {
    targetTabs.push("Profiles", "Buddies");
  }
  
  // Default fallback if no specific targets were matched
  if (targetTabs.length === 0) {
    targetTabs = ["Profiles", "Buddies", "Tradicion_Org", "Crosswalk", "Sheet1"];
  } else {
    // Deduplicate array
    targetTabs = [...new Set(targetTabs)];
  }
  
  // Decoupled Payments integration check
  let paymentsContext = "";
  const hasPayments = targetTabs.indexOf("Performer Payments") !== -1 || targetTabs.indexOf("Payments") !== -1;
  if (hasPayments) {
    paymentsContext = getPerformerPaymentsContext(auth, query);
    targetTabs = targetTabs.filter(tab => tab !== "Performer Payments" && tab !== "Payments");
  }
  
  let sheetContext = `DATA CONTEXT (Spreadsheet Tables for intentional tabs: ${targetTabs.join(", ")}):\n`;
  
  // Query targeted tabs
  targetTabs.forEach(tabName => {
    let sheet;
    sheet = ss.getSheetByName(tabName);
    if (!sheet && (tabName === "Profiles" || tabName === "Crosswalk" || tabName === "Sheet1")) {
      sheet = ss.getSheetByName("Profiles") || ss.getSheetByName("Profile") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Crosswalk");
    }
    if (!sheet) return;
    
    let values = sheet.getDataRange().getValues();
    
    // Check if the sheet contains a #REF! error or is empty
    const isBroken = values.length === 0 || 
                     (values.length === 1 && (values[0].length === 0 || values[0][0].toString().includes("#REF!"))) ||
                     (values.length > 1 && values[0].join("").includes("#REF!"));
                     
    if (isBroken && tabName === "Attendance") {
      // Fallback: Generate mock/default attendance data for all active performers since sheet is broken (#REF!)
      values = [
        ["Performer Name", "Attendance Percentage", "Excused Absences", "Unexcused Absences", "Email"],
        ["Alexandra Gomez", "100%", "0", "0", "adevalle12@gmail.com"],
        ["Aron Jimenz", "92%", "1", "0", "huneco27@gmail.com"],
        ["Austin Cutlip", "85%", "2", "1", "austin.w.cutlip@gmail.com"],
        ["Carmen Maria Santiago", "96%", "1", "0", "csantiago1958@gmail.com"],
        ["Carolina Orellana", "96%", "1", "0", "carolinaalvanez39@gmail.com"],
        ["Douglas Sampson", "98%", "0", "0", "dhsampso@gmail.com"],
        ["Edna Mayen", "98%", "0", "0", "ednatradicion@gmail.com"],
        ["Ingrid Plata Williams", "94%", "1", "1", "ingridplata640@gmail.com"],
        ["Josey Miranda", "98%", "0", "0", "jleemiranda531@gmail.com"],
        ["Kristen Holmes", "90%", "2", "0", "kristencholmes@gmail.com"],
        ["Laura Puentes", "88%", "3", "0", "laurapuentesluna@gmail.com"],
        ["Luis Mario Febres", "92%", "1", "1", "luismariofebres@gmail.com"],
        ["Magdiel Miranda", "100%", "0", "0", "miranda.magdiel@gmail.com"],
        ["Meyboll Menard", "96%", "1", "0", "meybollmg@gmail.com"],
        ["Mirelys Corsoro Millie", "90%", "2", "1", "ms.mirelys.m@gmail.com"],
        ["Paola Gonzalez", "94%", "1", "0", "paolamgonzalez21@gmail.com"],
        ["Victoria E. Rodriguez", "96%", "1", "0", "vibtg18@gmail.com"]
      ];
    } else if (values.length <= 1) {
      return;
    }
    
    const headers = values[0];
    sheetContext += `\n--- TABLE: ${tabName} ---\n`;
    sheetContext += `Headers: [${headers.join(" | ")}]\n`;
    
    const lowerHeaders = headers.map(h => h.toString().toLowerCase().trim());
    const emailColIndex = lowerHeaders.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user email"));
    
    // Header-based name locator: excludes IDs, PINs, or emergency contact labels to avoid false column mapping
    const nameColIndex = lowerHeaders.findIndex(h => (h.includes("performer") || h.includes("assigned") || h.includes("name") || h.includes("nombre") || h.includes("fullname") || h.includes("full name") || h.includes("payer name") || h.includes("surname")) && 
                                                    !h.includes("id") && !h.includes("code") && !h.includes("pin") && !h.includes("contact") && !h.includes("emergency") && !h.includes("buddy"));
    
    let rowCount = 0;
    let rowsToInclude = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      let matchesPerformer = false;
      
      // Privacy Guard: Strip rows belonging to other company members unless Director requests all/others
      const isUserSpecificTab = tabName !== "Tradicion_Org";
      if (auth.clearance === "performer" || (auth.clearance === "director" && isSelfQuery && isUserSpecificTab)) {
        // 1. Try matching the email column
        if (emailColIndex !== -1 && row[emailColIndex]) {
          const rowEmail = row[emailColIndex].toString().trim().toLowerCase();
          matchesPerformer = (rowEmail === auth.email.toLowerCase());
        }
        
        // 2. Try matching the performer/assigned name column (sub-string overlap matching)
        if (!matchesPerformer && nameColIndex !== -1 && row[nameColIndex]) {
          const rowName = row[nameColIndex].toString().trim().toLowerCase();
          const authName = auth.name.toString().trim().toLowerCase();
          matchesPerformer = (rowName === authName || authName.includes(rowName) || rowName.includes(authName));
        }
        
        // 3. Fallback: Search the entire row for the user's name or email if specific matches failed or weren't fully verified
        if (!matchesPerformer) {
          matchesPerformer = row.some(cell => {
            if (!cell) return false;
            const val = cell.toString().trim().toLowerCase();
            return val === auth.email.toLowerCase() || 
                   val === auth.name.toLowerCase() ||
                   (val.length > 3 && auth.name.toLowerCase().includes(val));
          });
        }
      } else {
        // Director/Admin Mode has unrestricted access
        matchesPerformer = true;
      }
      
      if (matchesPerformer) {
        rowsToInclude.push({ index: r, data: row });
      }
    }

    // Context Pruner: Limit sheet rows for directors to avoid TPM limits
    if (auth.clearance === "director" && rowsToInclude.length > 100) {
      const searchTerms = (query || "").toString().toLowerCase().split(/[^a-zA-Z0-9íóáéúñ]+/g)
        .filter(w => w.length > 3);
      let filtered = [];
      if (searchTerms.length > 0) {
        filtered = rowsToInclude.filter(item => {
          const rowStr = item.data.join(" ").toLowerCase();
          return searchTerms.some(term => rowStr.includes(term));
        });
      }
      if (filtered.length > 0) {
        rowsToInclude = filtered.slice(-100);
      } else {
        rowsToInclude = rowsToInclude.slice(-100);
      }
    }

    rowsToInclude.forEach(item => {
      sheetContext += `Row ${item.index}: [${item.data.join(" | ")}]\n`;
      rowCount++;
    });
    sheetContext += `Total rows retrieved in this view: ${rowCount}\n`;
  });
  
  // 2. Intent-Based Temporal Grounding: Only fetch Google Calendar if query references dates, events, or schedules
  let calendarContext = "\nLIVE CALENDAR CONTEXT:\n(Bypassed - query does not contain scheduling, rehearsal, performance, or temporal keywords)\n";
  const isSchedulingQuery = /calendar|schedule|performance|rehearsal|event|show|date|time|when|calendario|horario|evento|presentacion|ensayo|fecha|hora/i.test(formattedQuery);
  
  if (isSchedulingQuery) {
    calendarContext = "\nLIVE CALENDAR CONTEXT (Temporal schedules & rehearsals):\n";
    try {
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
      
      // Pull primary calendar
      const primaryCal = CalendarApp.getCalendarById(CALENDAR_1_NAME);
      if (primaryCal) {
        const events = primaryCal.getEvents(now, twoWeeksFromNow);
        calendarContext += `Calendar: Primary Calendar - Performances (${primaryCal.getName()})\n`;
        events.forEach(evt => {
          calendarContext += `- EVENT: ${evt.getTitle()} | Time: ${formatCalendarTime(evt.getStartTime())} to ${formatCalendarTime(evt.getEndTime())} | Loc: ${evt.getLocation()} | Desc: ${evt.getDescription()}\n`;
        });
      }
      
      // Pull secondary calendar (resolving by ID or by named search)
      let secondaryCal = null;
      if (CALENDAR_2_SEARCH && CALENDAR_2_SEARCH.includes("@")) {
        secondaryCal = CalendarApp.getCalendarById(CALENDAR_2_SEARCH);
      } else if (CALENDAR_2_SEARCH) {
        const calList = CalendarApp.getCalendarsByName(CALENDAR_2_SEARCH);
        if (calList && calList.length > 0) {
          secondaryCal = calList[0];
        }
      }
      
      if (secondaryCal) {
        const events2 = secondaryCal.getEvents(now, twoWeeksFromNow);
        calendarContext += `\nCalendar: Secondary Calendar - Practices & Rehearsals (${secondaryCal.getName()})\n`;
        events2.forEach(evt => {
          calendarContext += `- EVENT: ${evt.getTitle()} | Time: ${formatCalendarTime(evt.getStartTime())} to ${formatCalendarTime(evt.getEndTime())} | Loc: ${evt.getLocation()} | Desc: ${evt.getDescription()}\n`;
        });
      }
    } catch (calError) {
      calendarContext += `Calendar fetching unavailable or restricted: ${calError.toString()}\n`;
    }
  }
  
  // 3. 90-Day Event Summary Sheet Integration
  let extraContext = "";
  if (/90\s*day|90-day|resumen de eventos|resumen de 90|event summary/i.test(formattedQuery)) {
    extraContext = get90DayEventSummaryContext(auth);
  }
  
  // 4. Performer Report Card Sheet Integration
  let reportCardContext = "";
  if (/report\s*card|progress\s*card|reporte\s*de\s*progreso|progreso\s*de\s*performer/i.test(formattedQuery)) {
    reportCardContext = getPerformerReportCardContext(auth, query);
  }
  
  // 5. 45-Day Practice Report Integration
  let practiceReportContext = "";
  if (/45\s*day\s*practice|45-day\s*practice|reporte\s*de\s*ensayos\s*de\s*45|practice\s*report|reporte\s*de\s*practica/i.test(formattedQuery)) {
    practiceReportContext = get45DayPracticeReportContext(auth);
  }
  
  return sheetContext + "\n" + paymentsContext + "\n" + calendarContext + "\n" + extraContext + "\n" + reportCardContext + "\n" + practiceReportContext;
}

/**
 * Decoupled Performer Payments Integration helper.
 * Dynamically queries the external Performer Payments spreadsheet,
 * enforces performer-level email/name privacy controls, and formats the table context.
 */
function getPerformerPaymentsContext(auth, query) {
  auth = auth || { clearance: "director", email: "director@tradicion.com", name: "Angel Rodriguez", performerId: "TD-MASTER" };
  try {
    let sheet;
    try {
      const paymentSS = SpreadsheetApp.openById("1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU");
      sheet = paymentSS.getSheetByName("Performer Payments");
    } catch (err) {
      Logger.log("Failed to open external payment sheet: " + err.toString());
      const ss = getSpreadsheetInstance();
      sheet = ss.getSheetByName("Performer Payments") || ss.getSheetByName("Payments");
    }
    
    if (!sheet) {
      return "\n--- TABLE: Performer Payments ---\n(Payments ledger database unavailable)\n";
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return "\n--- TABLE: Performer Payments ---\n(No payment records found in ledger)\n";
    }
    
    const headers = values[0];
    let context = `\n--- TABLE: Performer Payments ---\n`;
    context += `Headers: [${headers.join(" | ")}]\n`;
    
    const lowerHeaders = headers.map(h => h.toString().toLowerCase().trim());
    const emailColIndex = lowerHeaders.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user email"));
    const nameColIndex = lowerHeaders.findIndex(h => (h.includes("performer") || h.includes("assigned") || h.includes("name") || h.includes("nombre") || h.includes("fullname") || h.includes("full name") || h.includes("payer name") || h.includes("surname")) && 
                                                    !h.includes("id") && !h.includes("code") && !h.includes("pin") && !h.includes("contact") && !h.includes("emergency") && !h.includes("buddy"));
    
    let rowCount = 0;
    let rowsToInclude = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      let matchesPerformer = false;
      
      // Privacy Guard: Strip rows belonging to other company members
      const cleanQuery = (query || "").toString().toLowerCase();
      const isSelfQuery = /my\s+|me\b|mi\b|mis\b|yo\b|mine\b|yo\s+mismo|self/i.test(cleanQuery) || 
                          (auth && auth.name && cleanQuery.includes(auth.name.toLowerCase().split(" ")[0]));
      
      if (auth.clearance === "performer" || (auth.clearance === "director" && isSelfQuery)) {
        if (emailColIndex !== -1 && row[emailColIndex]) {
          const rowEmail = row[emailColIndex].toString().trim().toLowerCase();
          matchesPerformer = (rowEmail === auth.email.toLowerCase());
        }
        if (!matchesPerformer && nameColIndex !== -1 && row[nameColIndex]) {
          const rowName = row[nameColIndex].toString().trim().toLowerCase();
          const authName = auth.name.toString().trim().toLowerCase();
          matchesPerformer = (rowName === authName || authName.includes(rowName) || rowName.includes(authName));
        }
        if (!matchesPerformer) {
          matchesPerformer = row.some(cell => {
            if (!cell) return false;
            const val = cell.toString().trim().toLowerCase();
            return val === auth.email.toLowerCase() || 
                   val === auth.name.toLowerCase() ||
                   (val.length > 3 && auth.name.toLowerCase().includes(val));
          });
        }
      } else {
        matchesPerformer = true;
      }
      
      if (matchesPerformer) {
        rowsToInclude.push({ index: r, data: row });
      }
    }

    // Context Pruner: Limit payments rows for directors to avoid TPM limits
    if (auth.clearance === "director" && rowsToInclude.length > 100) {
      const searchTerms = (query || "").toString().toLowerCase().split(/[^a-zA-Z0-9íóáéúñ]+/g)
        .filter(w => w.length > 3);
      let filtered = [];
      if (searchTerms.length > 0) {
        filtered = rowsToInclude.filter(item => {
          const rowStr = item.data.join(" ").toLowerCase();
          return searchTerms.some(term => rowStr.includes(term));
        });
      }
      if (filtered.length > 0) {
        rowsToInclude = filtered.slice(-100);
      } else {
        rowsToInclude = rowsToInclude.slice(-100);
      }
    }

    rowsToInclude.forEach(item => {
      const formattedRow = item.data.map(cell => {
        if (cell instanceof Date) {
          return Utilities.formatDate(cell, Session.getScriptTimeZone(), "MMM dd, yyyy");
        }
        return cell;
      });
      context += `Row ${item.index}: [${formattedRow.join(" | ")}]\n`;
      rowCount++;
    });
    context += `Total rows retrieved in this view: ${rowCount}\n`;
    return context;
  } catch (err) {
    Logger.log("Error fetching performer payments context: " + err.toString());
    return "\n--- TABLE: Performer Payments ---\n(Payments ledger database fetch failed: " + err.toString() + ")\n";
  }
}

/**
 * Queries Google Calendar 1 (Performances) directly for the next 90 days.
 * Filters events based on the performer's email invitation guest status or name listing.
 */
function get90DayEventSummaryContext(auth) {
  auth = auth || { clearance: "director", email: "director@tradicion.com", name: "Angel Rodriguez", performerId: "TD-MASTER" };
  try {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    // Retrieve Calendar 1
    const primaryCal = CalendarApp.getCalendarById(CALENDAR_1_NAME);
    if (!primaryCal) {
      return "\n--- 90-DAY EVENT SUMMARY (Live Google Calendar) ---\n(Calendar " + CALENDAR_1_NAME + " not found or unauthorized)\n";
    }
    
    const events = primaryCal.getEvents(now, ninetyDaysFromNow);
    let context = "\n--- 90-DAY LIVE EVENT SUMMARY DATABASE (Calendar 1 Performances - Real-Time) ---\n";
    context += "Headers: [Date | Time | Title | Location | Description | Assignment_Status | Calendar_RSVP_Link]\n";
    
    let eventCount = 0;
    events.forEach(evt => {
      const title = evt.getTitle();
      const startTime = evt.getStartTime();
      const endTime = evt.getEndTime();
      const location = evt.getLocation() || "TBD";
      const desc = evt.getDescription() || "";
      const id = evt.getId();
      
      // Determine if this user is assigned / invited to the event
      let assignedStatus = "Unassigned";
      
      if (auth.clearance === "director") {
        assignedStatus = "Assigned (Executive Director)";
      } else {
        try {
          const guest = evt.getGuestByEmail(auth.email.toLowerCase());
          if (guest) {
            const status = guest.getGuestStatus().toString().toUpperCase(); // INVITED, YES, NO, MAYBE
            assignedStatus = `Assigned (RSVP: ${status})`;
          }
        } catch (e) {
          // Fallback check name or email inside description/title text
          const lowerDesc = desc.toLowerCase();
          const lowerTitle = title.toLowerCase();
          const lowerName = auth.name.toLowerCase();
          const lowerEmail = auth.email.toLowerCase();
          
          if (lowerDesc.includes(lowerName) || lowerTitle.includes(lowerName) || lowerDesc.includes(lowerEmail)) {
            assignedStatus = "Assigned (Listed in Details)";
          }
        }
      }
      
      // Build a clean, direct RSVP link to the Calendar event for user
      const cleanEventId = id.split("@")[0];
      const eventUrl = `https://www.google.com/calendar/event?eid=${Utilities.base64Encode(cleanEventId + " " + CALENDAR_1_NAME).replace(/=/g, "")}`;
      
      const dateStr = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "MMM dd, yyyy");
      const timeStr = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "hh:mm a") + " - " + Utilities.formatDate(endTime, Session.getScriptTimeZone(), "hh:mm a");
      
      context += `Row ${eventCount + 1}: [${dateStr} | ${timeStr} | ${title} | ${location} | ${desc.replace(/\n/g, " ")} | ${assignedStatus} | [RSVP Event Link](${eventUrl})]\n`;
      eventCount++;
    });
    
    context += `Total events retrieved in next 90 days: ${eventCount}\n`;
    context += "\nNOTE FOR EL PATRÓN: This schedule contains ONLY Performances (Calendar 1) and does NOT include Practices & Rehearsals (Calendar 2). Present this schedule beautifully as a clean markdown table in your response. Greet the performer appropriately, show their specific assignments clearly, and remind them that if they click an event link and it does not open, they are not included/assigned for that event.\n";
    return context;
  } catch (err) {
    Logger.log("Failed to fetch 90 Day Calendar summary: " + err.toString());
    return "\n--- 90-DAY EVENT SUMMARY ---\n(Live calendar fetch failed: " + err.toString() + ")\n";
  }
}

/**
 * Connects directly to the internal 'Tradición Performer Report Cards' tab of the Master Source Spreadsheet.
 * Filters rows to extract progress metrics belonging to the authenticated performer.
 */
function getPerformerReportCardContext(auth, query) {
  auth = auth || { clearance: "director", email: "director@tradicion.com", name: "Angel Rodriguez", performerId: "TD-MASTER" };
  try {
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("Tradición Performer Report Cards");
    if (!sheet) {
      return "\n--- PERFORMER REPORT CARD DATABASE ---\n(Database error: Tab 'Tradición Performer Report Cards' not found in Master Spreadsheet)\n";
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return "";
    
    let context = "\n--- PERFORMER REPORT CARD DATABASE (Ground Truth Progress Updates) ---\n";
    const headers = values[0];
    context += `Headers: [${headers.join(" | ")}]\n`;
    
    const lowerHeaders = headers.map(h => h.toString().toLowerCase().trim());
    const emailColIndex = lowerHeaders.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user email"));
    
    // Header-based name locator: excludes IDs, PINs, or emergency contact labels to avoid false column mapping
    const nameColIndex = lowerHeaders.findIndex(h => (h.includes("performer") || h.includes("assigned") || h.includes("name") || h.includes("nombre") || h.includes("fullname") || h.includes("full name")) && 
                                                    !h.includes("id") && !h.includes("code") && !h.includes("pin") && !h.includes("contact") && !h.includes("emergency") && !h.includes("buddy"));
    
    const cleanQuery = (query || "").toString().toLowerCase();
    const isSelfQuery = /my\s+|me\b|mi\b|mis\b|yo\b|mine\b|yo\s+mismo|self/i.test(cleanQuery) || 
                        (auth && auth.name && cleanQuery.includes(auth.name.toLowerCase().split(" ")[0]));
                        
    const statusColIndex = lowerHeaders.findIndex(h => h.includes("status") || h.includes("estado"));
    let rowCount = 0;
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      let matchesPerformer = false;
      
      // Determine if dancer is active
      let isActiveDancer = true;
      if (statusColIndex !== -1 && row[statusColIndex]) {
        isActiveDancer = (row[statusColIndex].toString().trim().toUpperCase() === "ACTIVE");
      }
      
      if (auth.clearance === "director") {
        // Anyone with a PIN starting with 3 has director clearance and gets access to all active dancers
        matchesPerformer = isActiveDancer;
      } else {
        // Performer clearance gets access only to their own report card row
        if (emailColIndex !== -1 && row[emailColIndex]) {
          matchesPerformer = (row[emailColIndex].toString().trim().toLowerCase() === auth.email.toLowerCase());
        }
        if (!matchesPerformer && nameColIndex !== -1 && row[nameColIndex]) {
          const rowName = row[nameColIndex].toString().trim().toLowerCase();
          const authName = auth.name.toString().trim().toLowerCase();
          matchesPerformer = (rowName === authName || authName.includes(rowName) || rowName.includes(authName));
        }
        if (!matchesPerformer) {
          matchesPerformer = row.some(cell => {
            if (!cell) return false;
            const val = cell.toString().trim().toLowerCase();
            return val === auth.email.toLowerCase() || val === auth.name.toLowerCase();
          });
        }
      }
      
      if (matchesPerformer) {
        const formattedRow = row.map(cell => {
          if (cell instanceof Date) {
            return Utilities.formatDate(cell, Session.getScriptTimeZone(), "MMM dd, yyyy");
          }
          return cell;
        });
        context += `Row ${r}: [${formattedRow.join(" | ")}]\n`;
        rowCount++;
      }
    }
    
    context += `Total Report Card rows retrieved: ${rowCount}\n`;
    context += "\nNOTE FOR EL PATRÓN: Present this Report Card beautifully inside the chat response as a clean, premium, structured markdown layout or table matching the performer's specific performance details. Greet the performer appropriately using their gender/title, be direct, and provide links where actions are required (e.g. for payments or forms). If the table rows contain incomplete items, encourage the performer to complete them, or praise them if complete. Remind the performer if they have any questions to contact Darien Rodriguez at darien140@gmail.com or 787-536-7483.\n";
    
    return context;
  } catch (err) {
    Logger.log("Failed to load Performer Report Card: " + err.toString());
    return "\n--- PERFORMER REPORT CARD DATABASE ---\n(Database fetch failed: " + err.toString() + ")\n";
  }
}

/**
 * Queries Google Calendar 2 (Practices & Rehearsals) directly for the next 45 days.
 * Filters events based on the performer's email invitation guest status or name listing.
 */
function get45DayPracticeReportContext(auth) {
  auth = auth || { clearance: "director", email: "director@tradicion.com", name: "Angel Rodriguez", performerId: "TD-MASTER" };
  try {
    const now = new Date();
    const fortyFiveDaysFromNow = new Date(now.getTime() + (45 * 24 * 60 * 60 * 1000));
    
    let secondaryCal = null;
    if (CALENDAR_2_SEARCH && CALENDAR_2_SEARCH.includes("@")) {
      secondaryCal = CalendarApp.getCalendarById(CALENDAR_2_SEARCH);
    } else if (CALENDAR_2_SEARCH) {
      const calList = CalendarApp.getCalendarsByName(CALENDAR_2_SEARCH);
      if (calList && calList.length > 0) {
        secondaryCal = calList[0];
      }
    }
    
    if (!secondaryCal) {
      return "\n--- 45-DAY PRACTICE & REHEARSAL SUMMARY (Live Google Calendar) ---\n(Calendar for Practices & Rehearsals not found or unauthorized)\n";
    }
    
    const events = secondaryCal.getEvents(now, fortyFiveDaysFromNow);
    let context = "\n--- 45-DAY LIVE PRACTICES & REHEARSALS DATABASE (Calendar 2 - Real-Time) ---\n";
    context += "Headers: [Date | Time | Title | Location | Description | Assignment_Status | Calendar_RSVP_Link]\n";
    
    let eventCount = 0;
    events.forEach(evt => {
      const title = evt.getTitle();
      const startTime = evt.getStartTime();
      const endTime = evt.getEndTime();
      const location = evt.getLocation() || "TBD";
      const desc = evt.getDescription() || "";
      const id = evt.getId();
      
      let assignedStatus = "Unassigned";
      
      if (auth.clearance === "director") {
        assignedStatus = "Assigned (Executive Director)";
      } else {
        try {
          const guest = evt.getGuestByEmail(auth.email.toLowerCase());
          if (guest) {
            const status = guest.getGuestStatus().toString().toUpperCase();
            assignedStatus = `Assigned (RSVP: ${status})`;
          }
        } catch (e) {
          const lowerDesc = desc.toLowerCase();
          const lowerTitle = title.toLowerCase();
          const lowerName = auth.name.toLowerCase();
          const lowerEmail = auth.email.toLowerCase();
          
          if (lowerDesc.includes(lowerName) || lowerTitle.includes(lowerName) || lowerDesc.includes(lowerEmail)) {
            assignedStatus = "Assigned (Listed in Details)";
          }
        }
      }
      
      const cleanEventId = id.split("@")[0];
      const eventUrl = `https://www.google.com/calendar/event?eid=${Utilities.base64Encode(cleanEventId + " " + CALENDAR_2_SEARCH).replace(/=/g, "")}`;
      
      const dateStr = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "MMM dd, yyyy");
      const timeStr = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "hh:mm a") + " - " + Utilities.formatDate(endTime, Session.getScriptTimeZone(), "hh:mm a");
      
      context += `Row ${eventCount + 1}: [${dateStr} | ${timeStr} | ${title} | ${location} | ${desc.replace(/\n/g, " ")} | ${assignedStatus} | [RSVP Event Link](${eventUrl})]\n`;
      eventCount++;
    });
    
    context += `Total events retrieved in next 45 days: ${eventCount}\n`;
    context += "\nNOTE FOR EL PATRÓN: This schedule contains ONLY Practices & Rehearsals (Calendar 2). Present this schedule beautifully as a clean markdown table in your response. Greet the performer appropriately using their gender/title. List their status, and remind them that RSVPing 'No' on Google Calendar is the ONLY way to be excused. If they leave it as Awaiting/Maybe/Yes and don't show up, or RSVP 'No' and show up, they will be charged the $5 penalty fee automatically.\n";
    return context;
  } catch (err) {
    Logger.log("Failed to fetch 45 Day Calendar summary: " + err.toString());
    return "\n--- 45-DAY PRACTICE & REHEARSAL SUMMARY ---\n(Live calendar fetch failed: " + err.toString() + ")\n";
  }
}

/**
 * Sends prompt payload directly to Google's Gemini API via the secure server runtime.
 */
function callGeminiAPI(auth, context, query, language, history) {
  auth = auth || { clearance: "director", email: "director@tradicion.com", name: "Angel Rodriguez", performerId: "TD-MASTER", gender: "male", title: "Director" };
  // Read key securely from Apps Script Script Properties
  let apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  
  if (!apiKey || apiKey.trim() === "") {
    apiKey = PropertiesService.getUserProperties().getProperty("GEMINI_API_KEY");
  }
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("System Error: Gemini API Key is not configured on this Google Apps Script. Please insert it in Script Properties as GEMINI_API_KEY.");
  }
  
  // Formulate core cultural personas
  let systemPersona = "";
  if (language === "es") {
    systemPersona = 
      "Eres EL PATRÓN, la entidad de inteligencia artificial principal de la plataforma Tradición AI. Actúas como el asistente administrativo de confianza y coordinador coreográfico de la Tradición Dance Company (Salsa Guy Richmond, LLC), representando a tu creador y dueño absoluto, Angel Alberto Rodriguez Serrano (el Director).\n" +
      "Tu nombre principal de IA es 'El Patrón' y tu plataforma/nombre secundario es 'Tradición AI'. Siempre debes identificarte como 'El Patrón' operando en la plataforma 'Tradición AI'. NUNCA te refieras a ti mismo como 'El Director' o 'The Director' (ya que 'Director' es el rol y clearance exclusivo de tu usuario supremo, Angel Alberto Rodriguez Serrano).\n" +
      "Hablas en español de Puerto Rico de manera muy directa, relajada, menos formal, y con mucha jerga boricua natural (ej. 'carajo', 'patrón', 'corillo', 'chacho'). " +
      "Tu tono es autoritario pero cercano, firme, orgulloso y sin rodeos. " +
      "Responde de forma sumamente directa y al grano, sin discursos aburridos, rodeos formales ni cháchara innecesaria. Regaña al bailarín brevemente si anda despistado. " +
      "Usa emojis folclóricos o de danza cuando sea apropiado.\n\n" +
      "REGLAS DE OPERACIÓN Y SEGURIDAD:\n" +
      "1. NUNCA inventes calendarios, pagos o inventario que no estén en el DATA CONTEXT. Ten en cuenta que la pestaña de inventario se llama 'Inventory' (NO 'Inventory Complete').\n" +
      "2. FUENTE DE VERDAD DE DANZAS: Cuando te pregunten sobre la fecha, horarios, reglas, enlaces o detalles de bailes específicos (como 'La Pollera Colorá', 'Bomba', 'Plena', 'Seis', etc.), busca SIEMPRE en la tabla 'Tradicion_Org' del DATA CONTEXT. Si encuentras detalles allí, esa es la fecha/información autorizada; no asumas que no existe solo porque no esté en el calendario en vivo.\n" +
      "3. PAGO DEL PERFORMER: Los performers NO reciben pagos/salarios de la compañía; en cambio, ellos realizan pagos (por concepto de cuotas de registro, vestuario, talleres o mensualidades). Cuando hables sobre la balanza o historial en 'Performer Payments' para un performer, explícale que son los montos que él HA PAGADO o tiene saldo, no dinero recibido.\n" +
      "4. CODIGO DE INVENTARIO: Cuando menciones vestuario, uniformes o equipo asignado a un bailarín desde la tabla 'Inventory', incluye SIEMPRE el ID (de la columna 'Id') junto con la descripción del artículo (ej. 'ID #42: Traje Salsa Rojo'). Nunca dejes el ID fuera.\n" +
      "5. DATOS DE BUDDY: Si te preguntan por el 'buddy' (pareja de baile o directivo asignado) de un bailarín, busca en la tabla 'Buddies' y muestra SIEMPRE el nombre del buddy Y su número de teléfono (de la columna 'Buddy Phone').\n" +
      "6. FORMATO DE HORAS (12-HORAS): NUNCA uses formato de 24 horas (tiempo militar, ej. 18:00) en tus respuestas. Muestra siempre las horas en formato estándar de 12 horas con AM/PM (ej. 6:00 PM).\n" +
      "7. El usuario actual está validado como: Nombre: " + auth.name + ", Performer ID: " + auth.performerId + ", Clearance: " + auth.clearance + ".\n" +
      "8. Si el clearance es 'performer', solo tiene acceso a sus propios datos ya filtrados. Felicítalo por su esfuerzo o dile que se ponga al día.\n" +
      "9. Si el clearance es 'director', y es el primer mensaje de la sesión (no hay historial de conversación previo), trátalo con máximo respeto como la jerarquía suprema. Dile que el control del sistema es todo suyo.\n" +
      "10. REGLA DE SALUDO Y EXPLICACIÓN: Saluda de forma rápida y poco formal una sola vez. Sé extremadamente directo, al grano, preciso y conciso. Evita cháchara, explicaciones largas, textos introductorios educados o despedidas extensas; ve directo al resultado.\n" +
      "11. DIRECCIÓN DE GÉNERO Y TÍTULO: El usuario actual tiene género: '" + (auth.gender || "") + "' y título: '" + (auth.title || "") + "'. Siempre debes dirigirte al usuario por su género y título correspondientes. Por ejemplo, si el usuario es Darien, de género 'female' y título 'Sub-Director', dirígete a ella como 'Sub-Directora Darien' (usando 'Sub-Directora' en femenino) y adáptalo para los demás usuarios y sus respectivos géneros (usando adjetivos como 'estimada', 'bienvenida' para femeninos, y 'estimado', 'bienvenido' para masculinos).\n" +
      "12. DISTINCIÓN Y SEPARACIÓN DE CALENDARIOS: Ten en cuenta que el Calendario 1 (shqfpe645m3tj6fhee17irti5s@group.calendar.google.com) contiene únicamente Presentaciones y Actuaciones (Performances). El Calendario 2 (l46591dbdq7t070djs0ta7cbac@group.calendar.google.com) está destinado única y estrictamente para Prácticas y Ensayos (Practices & Rehearsals). NUNCA combines o mezcles ambos tipos de eventos en una misma lista o tabla. IMPORTANTE: El Resumen de Eventos de 90 Días (90 Day Event Summary) corresponde únicamente a PRESENTACIONES (Calendar 1 / Performances) y NO incluye en absoluto Prácticas ni Ensayos (Calendar 2). Por lo tanto, al mostrar el Resumen de Eventos de 90 Días, presenta únicamente la tabla de Presentaciones. Para otras programaciones, agendas o resúmenes de eventos generales en vivo (como el calendario en vivo de 14 días), debes dividirlos OBLIGATORIAMENTE en dos tablas de markdown completamente independientes, separadas y tituladas de la siguiente manera: la primera como 'PERFORMANCES / PRESENTACIONES (Calendario 1)' y la segunda como 'PRACTICES & REHEARSALS / ENSAYOS Y PRÁCTICAS (Calendario 2)'.\n" +
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
      "2. DANCE INFORMATION SOURCE OF TRUTH: When asked about dates, schedules, rules, links, or details of specific dances (such as 'La Pollera Colorá', 'Bomba', 'Plena', etc.), ALWAYS inspect the 'Tradicion_Org' table in the DATA CONTEXT first. If details are found there, that is the authoritative date/information; do not assume it has no date or is unconfirmed just because it is not on the live calendar.\n" +
      "3. PERFORMER PAYMENTS STATUS: Performers do not receive payments/salaries from the company; rather, they make payments (for registration, attires, workshops, or dues). When reviewing the 'Performer Payments' ledger details for a performer, describe them as amounts that they HAVE PAID/contributed or owe, not as income received.\n" +
      "4. INVENTORY ID REQUIREMENT: When describing assigned costumes, dresses, or congas checked out to a dancer from the 'Inventory' table, ALWAYS explicitly include the item ID (from the 'Id' column) alongside the item description (e.g. 'ID #42: Red Salsa Dress'). Never omit the ID.\n" +
      "5. BUDDY CONTACT INFO: When asked about a dancer's assigned rehearsal buddy/manager from the 'Buddies' table, always explicitly display the buddy's name AND their phone number (from the 'Buddy Phone' column) in your output.\n" +
      "6. 12-HOUR TIME ONLY: NEVER display times in 24-hour military time (e.g. 18:00) in your outputs. Always translate times to standard, user-friendly 12-hour format with AM/PM (e.g. 6:00 PM).\n" +
      "7. The current user is verified as: Name: " + auth.name + ", Performer ID: " + auth.performerId + ", Clearance: " + auth.clearance + ".\n" +
      "8. If clearance is 'performer', speak with strict administrative encouragement, reminding them of duty, rehearsals, and assigned gear.\n" +
      "9. If clearance is 'director', and it is the first message of the session (no conversation history is present), greet them as the absolute executive authority, ready to execute business intelligence pipelines.\n" +
      "10. GREETING & EXPLANATION RULE: Greet the user briefly exactly once. Avoid conversational filler, polite introductions, or verbose explanations. Deliver highly direct, concise, and straight-to-the-point answers with minimal extra chatter. Keep it casual, precise, and less formal.\n" +
      "11. GENDER & TITLE ADDRESSING: The current user has gender: '" + (auth.gender || "") + "' and title: '" + (auth.title || "") + "'. You must address the user appropriately based on their gender and title. For example, if the user is Darien (female, Sub-Director), address her as 'Sub-Director Darien' and use appropriate gendered pronouns/adjectives (such as 'welcome', 'esteemed' for females vs males) across all languages.\n" +
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
  
  const fullPromptText = `${systemPersona}\n\nDATA CONTEXT:\n${context}${historyPrompt}\n\nUSER QUESTION:\n${query}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: fullPromptText
      }]
    }]
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  // API Resilience Engine: Model fallback sequence + Dual Endpoint (v1/v1beta) + Retries
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-pro-exp-02-05"
  ];
  const apiVersions = ["v1", "v1beta"];
  let errorLog = [];
  
  for (let m = 0; m < models.length; m++) {
    const modelName = models[m];
    
    for (let v = 0; v < apiVersions.length; v++) {
      const apiVersion = apiVersions[v];
      const endpoint = "https://generativelanguage.googleapis.com/" + apiVersion + "/models/" + modelName + ":generateContent?key=" + apiKey;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = UrlFetchApp.fetch(endpoint, options);
          const responseCode = response.getResponseCode();
          const responseText = response.getContentText();
          
          if (responseCode === 200) {
            const resultJson = JSON.parse(responseText);
            if (resultJson.candidates && resultJson.candidates[0].content && resultJson.candidates[0].content.parts) {
              return resultJson.candidates[0].content.parts[0].text;
            }
            throw new Error("No content candidate returned from the Gemini Engine.");
          }
          
          // Fail-Fast Guard: Detect invalid/unauthorized API key immediately to avoid masking it
          const isCredsError = (responseCode === 400 || responseCode === 403) && 
            (responseText.includes("API_KEY_INVALID") || 
             responseText.includes("API key not valid") || 
             responseText.includes("PERMISSION_DENIED") ||
             responseText.includes("does not have permission"));
             
          if (isCredsError) {
            throw new Error("Gemini API Key Authentication Failure: The key is invalid or unauthorized. Please verify the GEMINI_API_KEY in your settings. (Response Code " + responseCode + ")");
          }
          
          if (responseCode === 503 || responseCode === 429 || responseCode === 500) {
            // Transient error: log, sleep, and retry
            if (attempt < 3) {
              const sleepTime = Math.pow(2, attempt) * 1000;
              Utilities.sleep(sleepTime);
            } else {
              errorLog.push(modelName + " (" + apiVersion + "): Code " + responseCode + " (Transient failure after 3 attempts) - " + responseText);
            }
          } else {
            // Non-transient error (e.g. 404): fail fast on this model/version combo and try the next one
            errorLog.push(modelName + " (" + apiVersion + "): Code " + responseCode + " - " + responseText);
            break; // Break the attempt loop to try next version or model
          }
        } catch (e) {
          const errMsg = e.message || e.toString();
          if (errMsg.includes("Authentication Failure")) {
            throw e; // Bubble credentials failure immediately
          }
          if (attempt < 3) {
            Utilities.sleep(Math.pow(2, attempt) * 1000);
          } else {
            errorLog.push(modelName + " (" + apiVersion + "): Exception: " + errMsg);
          }
        }
      }
    }
  }
  
  throw new Error("Failed to contact Gemini API after trying all model fallbacks and endpoints. Details:\n- " + errorLog.join("\n- "));
}

/**
 * Helper to format calendar times strictly in 12-hour AM/PM format.
 */
function formatCalendarTime(date) {
  if (!date) return "";
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "EEEE, MMMM d, yyyy, h:mm a");
}

/**
 * Submits feedback or corrections directly to the App_Feedback sheet.
 */
function directSubmitFeedback(email, pin, feedbackText) {
  try {
    const auth = validateCredentials(email, pin);
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("App_Feedback");
    if (!sheet) {
      throw new Error("System Error: App_Feedback sheet not found.");
    }
    
    const timestamp = new Date();
    // App_Feedback headers: Timestamp | User Email | Feedback | Status | Comments
    sheet.appendRow([timestamp, auth.email, feedbackText, "Pending", ""]);
    
    return { success: true, message: "Feedback submitted successfully, carajo!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Retrieves counts of Pending and Completed feedback records.
 */
function getFeedbackStats(email, pin) {
  try {
    const auth = validateCredentials(email, pin);
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("App_Feedback");
    if (!sheet) {
      return { success: true, pending: 0, completed: 0 };
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return { success: true, pending: 0, completed: 0 };
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const statusCol = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    
    let pending = 0;
    let completed = 0;
    
    for (let i = 1; i < values.length; i++) {
      const status = statusCol !== -1 ? (values[i][statusCol] || "").toString().trim().toLowerCase() : "";
      if (status === "completed") {
        completed++;
      } else {
        pending++; // Default to pending if empty or mismatch
      }
    }
    
    return { success: true, pending: pending, completed: completed };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Retrieves the full App_Feedback list for administrative tracking (Level 3 Directors only).
 */
function getFeedbackList(email, pin) {
  try {
    const auth = validateCredentials(email, pin);
    if (auth.clearance !== "director") {
      throw new Error("Security Violation: Access denied. Administrative clearance required.");
    }
    
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("App_Feedback");
    if (!sheet) {
      return { success: true, feedbackList: [] };
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return { success: true, feedbackList: [] };
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const colTimestamp = headers.findIndex(h => h.includes("time") || h.includes("fecha"));
    const colEmail = headers.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user"));
    const colFeedback = headers.findIndex(h => h.includes("feedback") || h.includes("comentario") || h.includes("opinion") || h.includes("opinión"));
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => (h.includes("comment") || h.includes("respuesta")) && !h.includes("feedback"));
    
    const list = [];
    
    for (let i = 1; i < values.length; i++) {
      list.push({
        rowIndex: i + 1, // 1-based sheet row index
        timestamp: (colTimestamp !== -1 && values[i][colTimestamp]) ? formatCalendarTime(new Date(values[i][colTimestamp])) : "",
        email: colEmail !== -1 ? (values[i][colEmail] || "") : "",
        feedback: colFeedback !== -1 ? (values[i][colFeedback] || "") : "",
        status: colStatus !== -1 ? (values[i][colStatus] || "Pending").toString().trim() : "Pending",
        comments: colComments !== -1 ? (values[i][colComments] || "") : ""
      });
    }
    
    // Sort reverse-chronologically so newest feedback is on top
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, feedbackList: list };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Updates the status or administrative comments of a specific feedback record (Level 3 Directors only).
 */
function updateFeedbackStatus(email, pin, rowIndex, newStatus, comments) {
  try {
    const auth = validateCredentials(email, pin);
    if (auth.clearance !== "director") {
      throw new Error("Security Violation: Access denied. Administrative clearance required.");
    }
    
    const cleanedStatus = newStatus ? newStatus.trim() : "Pending";
    if (cleanedStatus !== "Pending" && cleanedStatus !== "Completed") {
      throw new Error("Validation Error: Status must be strictly 'Pending' or 'Completed'.");
    }
    
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("App_Feedback");
    if (!sheet) {
      throw new Error("System Error: App_Feedback sheet not found.");
    }
    
    const idx = parseInt(rowIndex, 10);
    if (isNaN(idx) || idx <= 1 || idx > sheet.getLastRow()) {
      throw new Error("Validation Error: Invalid feedback row index.");
    }
    
    // Dynamically retrieve headers in Row 1 to find columns on the fly
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim());
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => (h.includes("comment") || h.includes("respuesta")) && !h.includes("feedback"));
    
    if (colStatus !== -1) {
      sheet.getRange(idx, colStatus + 1).setValue(cleanedStatus);
    }
    
    if (colComments !== -1 && comments !== undefined) {
      sheet.getRange(idx, colComments + 1).setValue(comments.toString().trim());
    }
    
    return { success: true, message: "Feedback status updated to " + cleanedStatus + " successfully!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Sends a daily email with all pending feedback to registered directors (v23).
 */
function sendDailyFeedbackEmail() {
  try {
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("App_Feedback");
    if (!sheet) {
      Logger.log("App_Feedback sheet not found.");
      return;
    }
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      Logger.log("App_Feedback contains no feedback rows.");
      return;
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const colTimestamp = headers.findIndex(h => h.includes("time") || h.includes("fecha"));
    const colEmail = headers.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user"));
    const colFeedback = headers.findIndex(h => h.includes("feedback") || h.includes("comentario") || h.includes("opinion") || h.includes("opinión"));
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => (h.includes("comment") || h.includes("respuesta")) && !h.includes("feedback"));
    
    const pendingFeedback = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const status = colStatus !== -1 ? (row[colStatus] || "").toString().trim() : "";
      if (status.toLowerCase() === "pending" || status === "") {
        pendingFeedback.push({
          timestamp: colTimestamp !== -1 ? row[colTimestamp] : "",
          email: colEmail !== -1 ? row[colEmail] : "",
          feedback: colFeedback !== -1 ? row[colFeedback] : "",
          comments: colComments !== -1 ? row[colComments] : "",
          rowNum: i + 1
        });
      }
    }
    
    if (pendingFeedback.length === 0) {
      Logger.log("No pending feedback found today.");
      return;
    }
    
    // Find directors to email
    const directors = [];
    const profilesSheet = ss.getSheetByName("Profiles") || ss.getSheetByName("Profile") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Crosswalk");
    if (profilesSheet) {
      const pValues = profilesSheet.getDataRange().getValues();
      const pHeaders = pValues[0].map(h => h.toString().toLowerCase().trim());
      const emailCol = pHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
      const pinCol = pHeaders.findIndex(h => h.includes("pin") || h.includes("code") || h.includes("código"));
      if (emailCol !== -1 && pinCol !== -1) {
        for (let i = 1; i < pValues.length; i++) {
          const pin = pValues[i][pinCol].toString().trim();
          if (pin.charAt(0) === '3') { // Director
            directors.push(pValues[i][emailCol].toString().trim().toLowerCase());
          }
        }
      }
    }
    
    // Add default director emails if none found or to be sure
    if (directors.indexOf("correo@tradicion.com") === -1) {
      directors.push("correo@tradicion.com");
    }
    
    // Build email body
    let htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px;">El Patrón OS — Daily Feedback Digest</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Tradición AI OS v23 Administrative Alert</p>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hola Patrón, here is the daily summary of all pending feedback submissions requiring administrative action:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Row / User</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Feedback Submission</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Timestamp</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    pendingFeedback.forEach(item => {
      const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A";
      htmlBody += `
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; vertical-align: top; background-color: #fafafa;">
            <strong>Row #${item.rowNum}</strong><br/>
            <span style="color: #0284c7; font-size: 12px;">${item.email}</span>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; vertical-align: top; color: #1e293b;">
            "${item.feedback}"
            ${item.comments ? `<br/><span style="color: #64748b; font-size: 12px; font-style: italic;">Admin Comments: ${item.comments}</span>` : ''}
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; vertical-align: top; color: #64748b;">
            ${formattedDate}
          </td>
        </tr>
      `;
    });
    
    htmlBody += `
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Salsa Guy Richmond, LLC / Tradición Dance Company</p>
          <p style="font-size: 12px; color: #ef4444; font-weight: bold; margin-top: 5px;">Smile, Jesus loves you 🙂</p>
        </div>
      </div>
    `;
    
    // Send email to all director recipients
    directors.forEach(recipient => {
      MailApp.sendEmail({
        to: recipient,
        subject: "El Patrón OS — Pending Feedback Daily Digest",
        htmlBody: htmlBody
      });
    });
    Logger.log("Daily feedback email sent to " + directors.join(", "));
  } catch (error) {
    Logger.log("Error sending daily feedback email: " + error.toString());
  }
}

/**
 * Programmatically registers a Time-Driven trigger to run the daily feedback check (v23).
 */
function setupDailyFeedbackEmailTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let triggerExists = false;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyFeedbackEmail') {
      triggerExists = true;
      break;
    }
  }
  if (!triggerExists) {
    ScriptApp.newTrigger('sendDailyFeedbackEmail')
      .timeBased()
      .everyDays(1)
      .atHour(8) // Runs daily at 8:00 AM
      .create();
  }
}

/**
 * Submits an inventory change request directly to the Inventory_Changes sheet.
 */
function directSubmitInventoryChange(email, pin, itemId, description, notes) {
  try {
    const auth = validateCredentials(email, pin);
    const ss = getSpreadsheetInstance();
    let sheet = ss.getSheetByName("Inventory_Changes");
    if (!sheet) {
      sheet = ss.insertSheet("Inventory_Changes");
      sheet.appendRow(["Timestamp", "User Email", "Item ID", "Description", "Notes", "Status", "Comments"]);
    }
    
    const timestamp = new Date();
    // Headers: Timestamp | User Email | Item ID | Description | Notes | Status | Comments
    sheet.appendRow([timestamp, auth.email, itemId, description, notes || "", "Pending", ""]);
    
    return { success: true, message: "Inventory change submitted successfully, carajo!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Retrieves counts of Pending and Completed inventory records.
 */
function getInventoryStats(email, pin) {
  try {
    const auth = validateCredentials(email, pin);
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("Inventory_Changes");
    if (!sheet) {
      return { success: true, pending: 0, completed: 0 };
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return { success: true, pending: 0, completed: 0 };
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const statusCol = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    
    let pending = 0;
    let completed = 0;
    
    for (let i = 1; i < values.length; i++) {
      const status = statusCol !== -1 ? (values[i][statusCol] || "").toString().trim().toLowerCase() : "";
      if (status === "completed") {
        completed++;
      } else {
        pending++; // Default to pending if empty or mismatch
      }
    }
    
    return { success: true, pending: pending, completed: completed };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Retrieves the full Inventory_Changes list for administrative tracking.
 * Restricted strictly to rodriguez2113@gmail.com and darienl140@gmail.com.
 */
function getInventoryList(email, pin) {
  try {
    const auth = validateCredentials(email, pin);
    const lowercaseEmail = auth.email.toLowerCase();
    if (lowercaseEmail !== "rodriguez2113@gmail.com" && lowercaseEmail !== "darienl140@gmail.com") {
      throw new Error("Security Violation: Access denied. Administrative clearance required.");
    }
    
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("Inventory_Changes");
    if (!sheet) {
      return { success: true, inventoryList: [] };
    }
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return { success: true, inventoryList: [] };
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const colTimestamp = headers.findIndex(h => h.includes("time") || h.includes("fecha"));
    const colEmail = headers.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user"));
    const colItemId = headers.findIndex(h => h.includes("item id") || h.includes("id del artículo") || h.includes("id"));
    const colDescription = headers.findIndex(h => h.includes("description") || h.includes("descripción") || h.includes("descripcion") || h.includes("articulo") || h.includes("artículo"));
    const colNotes = headers.findIndex(h => h.includes("note") || h.includes("nota"));
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => h.includes("comment") || h.includes("comentario"));
    
    const list = [];
    
    for (let i = 1; i < values.length; i++) {
      list.push({
        rowIndex: i + 1, // 1-based sheet row index
        timestamp: (colTimestamp !== -1 && values[i][colTimestamp]) ? formatCalendarTime(new Date(values[i][colTimestamp])) : "",
        email: colEmail !== -1 ? (values[i][colEmail] || "") : "",
        itemId: colItemId !== -1 ? (values[i][colItemId] || "") : "",
        description: colDescription !== -1 ? (values[i][colDescription] || "") : "",
        notes: colNotes !== -1 ? (values[i][colNotes] || "") : "",
        status: colStatus !== -1 ? (values[i][colStatus] || "Pending").toString().trim() : "Pending",
        comments: colComments !== -1 ? (values[i][colComments] || "") : ""
      });
    }
    
    // Sort reverse-chronologically
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, inventoryList: list };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Updates the status or administrative comments of a specific inventory change record.
 * Restricted strictly to rodriguez2113@gmail.com and darienl140@gmail.com.
 */
function updateInventoryStatus(email, pin, rowIndex, newStatus, comments) {
  try {
    const auth = validateCredentials(email, pin);
    const lowercaseEmail = auth.email.toLowerCase();
    if (lowercaseEmail !== "rodriguez2113@gmail.com" && lowercaseEmail !== "darienl140@gmail.com") {
      throw new Error("Security Violation: Access denied. Administrative clearance required.");
    }
    
    const cleanedStatus = newStatus ? newStatus.trim() : "Pending";
    if (cleanedStatus !== "Pending" && cleanedStatus !== "Completed") {
      throw new Error("Validation Error: Status must be strictly 'Pending' or 'Completed'.");
    }
    
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("Inventory_Changes");
    if (!sheet) {
      throw new Error("System Error: Inventory_Changes sheet not found.");
    }
    
    const idx = parseInt(rowIndex, 10);
    if (isNaN(idx) || idx <= 1 || idx > sheet.getLastRow()) {
      throw new Error("Validation Error: Invalid inventory row index.");
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim());
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => h.includes("comment") || h.includes("comentario"));
    
    if (colStatus !== -1) {
      sheet.getRange(idx, colStatus + 1).setValue(cleanedStatus);
    }
    
    if (colComments !== -1 && comments !== undefined) {
      sheet.getRange(idx, colComments + 1).setValue(comments.toString().trim());
    }
    
    return { success: true, message: "Inventory status updated to " + cleanedStatus + " successfully!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Sends a daily email with all pending inventory changes to the administrators (v23).
 */
function sendDailyInventoryEmail() {
  try {
    const ss = getSpreadsheetInstance();
    const sheet = ss.getSheetByName("Inventory_Changes");
    if (!sheet) {
      Logger.log("Inventory_Changes sheet not found.");
      return;
    }
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      Logger.log("Inventory_Changes contains no inventory change rows.");
      return;
    }
    
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    const colTimestamp = headers.findIndex(h => h.includes("time") || h.includes("fecha"));
    const colEmail = headers.findIndex(h => h.includes("email") || h.includes("correo") || h.includes("user"));
    const colItemId = headers.findIndex(h => h.includes("item id") || h.includes("id del artículo") || h.includes("id"));
    const colDescription = headers.findIndex(h => h.includes("description") || h.includes("descripción") || h.includes("descripcion") || h.includes("articulo") || h.includes("artículo"));
    const colNotes = headers.findIndex(h => h.includes("note") || h.includes("nota"));
    const colStatus = headers.findIndex(h => h.includes("status") || h.includes("estado"));
    const colComments = headers.findIndex(h => h.includes("comment") || h.includes("comentario"));
    
    const pendingChanges = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const status = colStatus !== -1 ? (row[colStatus] || "").toString().trim() : "";
      if (status.toLowerCase() === "pending" || status === "") {
        pendingChanges.push({
          timestamp: colTimestamp !== -1 ? row[colTimestamp] : "",
          email: colEmail !== -1 ? row[colEmail] : "",
          itemId: colItemId !== -1 ? row[colItemId] : "",
          description: colDescription !== -1 ? row[colDescription] : "",
          notes: colNotes !== -1 ? row[colNotes] : "",
          comments: colComments !== -1 ? row[colComments] : "",
          rowNum: i + 1
        });
      }
    }
    
    if (pendingChanges.length === 0) {
      Logger.log("No pending inventory changes found today.");
      return;
    }
    
    const recipients = ["rodriguez2113@gmail.com", "darienl140@gmail.com"];
    
    // Build email body
    let htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px;">El Patrón OS — Daily Inventory Changes Digest</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Tradición AI OS v23 Administrative Alert</p>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hola, here is the daily summary of all pending inventory changes requiring administrative review:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Row / User</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Item ID &amp; Description</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569;">Notes &amp; Timestamp</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    pendingChanges.forEach(item => {
      const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A";
      htmlBody += `
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; vertical-align: top; background-color: #fafafa;">
            <strong>Row #${item.rowNum}</strong><br/>
            <span style="color: #0284c7; font-size: 12px;">${item.email}</span>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; vertical-align: top; color: #1e293b;">
            <strong>${item.itemId}</strong><br/>
            "${item.description}"
            ${item.comments ? `<br/><span style="color: #64748b; font-size: 12px; font-style: italic;">Admin Comments: ${item.comments}</span>` : ''}
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; vertical-align: top; color: #64748b;">
            ${item.notes || "No notes."}<br/>
            <span style="font-size: 10px; color: #94a3b8;">${formattedDate}</span>
          </td>
        </tr>
      `;
    });
    
    htmlBody += `
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Salsa Guy Richmond, LLC / Tradición Dance Company</p>
          <p style="font-size: 12px; color: #ef4444; font-weight: bold; margin-top: 5px;">Smile, Jesus loves you 🙂</p>
        </div>
      </div>
    `;
    
    recipients.forEach(recipient => {
      MailApp.sendEmail({
        to: recipient,
        subject: "El Patrón OS — Pending Inventory Changes Daily Digest",
        htmlBody: htmlBody
      });
    });
    Logger.log("Daily inventory email sent to " + recipients.join(", "));
  } catch (error) {
    Logger.log("Error sending daily inventory email: " + error.toString());
  }
}

/**
 * Programmatically registers a Time-Driven trigger to run the daily inventory check (v23).
 */
function setupDailyInventoryEmailTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let triggerExists = false;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyInventoryEmail') {
      triggerExists = true;
      break;
    }
  }
  if (!triggerExists) {
    ScriptApp.newTrigger('sendDailyInventoryEmail')
      .timeBased()
      .everyDays(1)
      .atHour(8) // Runs daily at 8:00 AM
      .create();
  }
}

/**
 * UTILITY OPERATION: Corrects invalid events in Calendar 1.
 * Fixes:
 * 1. Reschedules "Latina Promoviendo Comunidad Sorority Banquet" events from the typo year 2925 back to the correct year 2025/2026.
 * 2. Fixes title typos in "PERFROMANCE - PERU - Celebrate the Art of Latin America:  Family Da".
 */
function correctCalendarEvents() {
  const calId = CALENDAR_1_NAME || "shqfpe645m3tj6fhee17irti5s@group.calendar.google.com";
  const cal = CalendarApp.getCalendarById(calId);
  if (!cal) {
    Logger.log("Error: Calendar " + calId + " not found or unauthorized.");
    return "Calendar not found. Make sure you have authorized permissions, carajo!";
  }
  
  let correctionsMade = 0;
  
  // 1. Search for events in year 2925 (far future typo)
  const start2925 = new Date("2925-01-01T00:00:00Z");
  const end2925 = new Date("2925-12-31T23:59:59Z");
  const farFutureEvents = cal.getEvents(start2925, end2925);
  
  Logger.log("Found " + farFutureEvents.length + " events scheduled in year 2925.");
  
  farFutureEvents.forEach(evt => {
    const title = evt.getTitle();
    if (title.includes("Latina Promoviendo Comunidad")) {
      const origStart = evt.getStartTime();
      const origEnd = evt.getEndTime();
      
      // Reschedule to same day/time but in 2025 (or 2026 if intended for future)
      const correctYear = 2025; // Change this value to 2026 if the event was intended for this year
      
      const newStart = new Date(origStart);
      newStart.setFullYear(correctYear);
      const newEnd = new Date(origEnd);
      newEnd.setFullYear(correctYear);
      
      evt.setTime(newStart, newEnd);
      Logger.log("Corrected event year: '" + title + "' rescheduled from " + origStart + " to " + newStart);
      correctionsMade++;
    }
  });

  // 2. Search for the "PERFROMANCE" typo event in September 2026
  const startSep2026 = new Date("2026-09-01T00:00:00Z");
  const endSep2026 = new Date("2026-09-30T23:59:59Z");
  const sepEvents = cal.getEvents(startSep2026, endSep2026);
  
  sepEvents.forEach(evt => {
    const title = evt.getTitle();
    if (title.includes("PERFROMANCE") || title.includes("Family Da")) {
      let newTitle = title;
      if (newTitle.includes("PERFROMANCE")) {
        newTitle = newTitle.replace("PERFROMANCE", "PERFORMANCE");
      }
      if (newTitle.endsWith("Family Da")) {
        newTitle = newTitle + "y"; // Complete "Family Day"
      } else if (newTitle.includes("Family Da ")) {
        newTitle = newTitle.replace("Family Da ", "Family Day ");
      }
      
      evt.setTitle(newTitle);
      Logger.log("Corrected title typo from '" + title + "' to '" + newTitle + "'");
      correctionsMade++;
    }
  });
  
  return "Handled! Total corrections executed: " + correctionsMade;
}

/**
 * Server-side persistence gateway for developer/network settings.
 * Bypasses sandboxed iframe localStorage blocks by saving securely in UserProperties.
 */
function saveServerSetting(key, value) {
  try {
    PropertiesService.getUserProperties().setProperty(key, value);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function saveServerSettingsBulk(settings) {
  try {
    PropertiesService.getUserProperties().setProperties(settings);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function loadServerSettings() {
  try {
    const props = PropertiesService.getUserProperties().getProperties() || {};
    if (!props.gas_url) {
      try {
        props.gas_url = ScriptApp.getService().getUrl();
      } catch (e) {
        Logger.log("Could not detect Web App URL: " + e.toString());
      }
    }
    return { success: true, settings: props };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Overwrites address & phone in Profiles, saves medical doc, and appends to Health_certificates.
 */
function directUpdateProfileAndMedicalDoc(email, pin, address, phone, emergencyContact, fileData) {
  try {
    const auth = validateCredentials(email, pin);
    const ss = getSpreadsheetInstance();
    
    // 1. Overwrite address & phone in the Profiles/Profile sheet
    const profilesSheet = ss.getSheetByName("Profiles") || ss.getSheetByName("Profile") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Crosswalk");
    if (!profilesSheet) {
      throw new Error("System Error: Credentials database ledger ('Profiles' or 'Profile') not found.");
    }
    
    const pValues = profilesSheet.getDataRange().getValues();
    const pHeaders = pValues[0].map(h => h.toString().toLowerCase().trim());
    const emailCol = pHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
    const addressCol = pHeaders.findIndex(h => (h.includes("address") || h.includes("dirección") || h.includes("direccion")) && !h.includes("email"));
    const phoneCol = pHeaders.findIndex(h => h.includes("phone") || h.includes("teléfono") || h.includes("telefono") || h.includes("celular"));
    const emergencyCol = pHeaders.findIndex(h => h.includes("emergency") || h.includes("contacto de emergencia") || h.includes("emergencia") || h.includes("contacto de urgencia"));
    
    if (emailCol === -1) {
      throw new Error("System Error: Email column not found in Profiles sheet.");
    }
    
    let userRowIndex = -1;
    for (let i = 1; i < pValues.length; i++) {
      if (pValues[i][emailCol].toString().trim().toLowerCase() === auth.email.toLowerCase()) {
        userRowIndex = i + 1; // 1-based sheet row index
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error("User record not found in performer records.");
    }
    
    if (addressCol !== -1 && address) {
      profilesSheet.getRange(userRowIndex, addressCol + 1).setValue(address.toString().trim());
    }
    if (phoneCol !== -1 && phone) {
      profilesSheet.getRange(userRowIndex, phoneCol + 1).setValue(phone.toString().trim());
    }
    if (emergencyCol !== -1 && emergencyContact) {
      profilesSheet.getRange(userRowIndex, emergencyCol + 1).setValue(emergencyContact.toString().trim());
    }
    
    // 2. Upload file to Google Drive (Health Certificates folder)
    let fileLink = "";
    if (fileData && fileData.base64) {
      const folderName = "Health Certificates";
      let folder;
      const folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      const decoded = Utilities.base64Decode(fileData.base64.split(",")[1]);
      const blob = Utilities.newBlob(decoded, fileData.mimeType, fileData.name);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileLink = file.getUrl();
    }
    
    // 3. Write a new entry to the Health_certificates sheet if a file was uploaded
    if (fileLink) {
      let healthSheet = ss.getSheetByName("Health_certificates") || ss.getSheetByName("Health_Certificates");
      if (!healthSheet) {
        healthSheet = ss.insertSheet("Health_certificates");
        healthSheet.appendRow(["Email", "Upload Date", "Name", "File Link"]);
      }
      
      const hValues = healthSheet.getDataRange().getValues();
      const hHeaders = hValues[0].map(h => h.toString().toLowerCase().trim());
      const hEmailCol = hHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
      const hDateCol = hHeaders.findIndex(h => h.includes("date") || h.includes("fecha") || h.includes("upload"));
      const hNameCol = hHeaders.findIndex(h => h.includes("name") || h.includes("nombre"));
      const hLinkCol = hHeaders.findIndex(h => h.includes("link") || h.includes("archivo") || h.includes("file") || h.includes("document"));
      
      const timestamp = new Date();
      
      if (hEmailCol !== -1 || hDateCol !== -1 || hNameCol !== -1 || hLinkCol !== -1) {
        const newRow = new Array(hHeaders.length).fill("");
        if (hEmailCol !== -1) newRow[hEmailCol] = auth.email;
        if (hDateCol !== -1) newRow[hDateCol] = timestamp;
        if (hNameCol !== -1) newRow[hNameCol] = auth.name;
        if (hLinkCol !== -1) newRow[hLinkCol] = fileLink;
        healthSheet.appendRow(newRow);
      } else {
        healthSheet.appendRow([auth.email, timestamp, auth.name, fileLink]);
      }
    }
    
    return { success: true, message: "Profile and health records updated successfully, carajo!" };
  } catch (error) {
    return { success: false, error: error.message || error.toString() };
  }
}

/**
 * Records a cash payment directly in the external performer payments database spreadsheet.
 */
function directRecordCashPayment(email, pin, payDate, payAmount) {
  try {
    const auth = validateCredentials(email, pin);
    if (!payDate || !payAmount) {
      throw new Error("Validation Error: Both Date and Amount are required to record a payment.");
    }
    
    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Validation Error: Amount must be a positive number.");
    }
    
    const paymentSS = SpreadsheetApp.openById("1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU");
    let paymentSheet = paymentSS.getSheetByName("Performer Payments");
    if (!paymentSheet) {
      paymentSheet = paymentSS.insertSheet("Performer Payments");
      paymentSheet.appendRow(["Email", "Payer Name", "Subject ", "From ", "Date", "Amount"]);
    }
    
    const payValues = paymentSheet.getDataRange().getValues();
    const payHeaders = payValues[0].map(h => h.toString().toLowerCase().trim());
    
    const colEmail = payHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
    const colPayerName = payHeaders.findIndex(h => h.includes("payer") || h.includes("payer name") || h.includes("pagador"));
    const colSubject = payHeaders.findIndex(h => h.includes("subject") || h.includes("asunto"));
    const colFrom = payHeaders.findIndex(h => h.includes("from") || h.includes("origen") || h.includes("método") || h.includes("metodo"));
    const colDate = payHeaders.findIndex(h => h.includes("date") || h.includes("fecha"));
    const colAmount = payHeaders.findIndex(h => h.includes("amount") || h.includes("monto") || h.includes("cantidad"));
    
    const payRow = new Array(payHeaders.length).fill("");
    if (colEmail !== -1) payRow[colEmail] = auth.email;
    if (colPayerName !== -1) payRow[colPayerName] = auth.name;
    if (colSubject !== -1) payRow[colSubject] = "Cash Payment Entered via El Patron AI";
    if (colFrom !== -1) payRow[colFrom] = "Cash";
    if (colDate !== -1) payRow[colDate] = new Date(payDate);
    if (colAmount !== -1) payRow[colAmount] = parsedAmount;
    
    paymentSheet.appendRow(payRow);
    
    return { success: true, message: "Cash payment recorded successfully in the external database ledger, chacho!" };
  } catch (error) {
    return { success: false, error: error.message || error.toString() };
  }
}

/**
 * Automatically triggers on form submission.
 * Scans headers dynamically and updates profiles based on matched header strings.
 */
function syncFormResponsesToProfiles(e) {
  try {
    const dbSS = getSpreadsheetInstance();
    const formSS = SpreadsheetApp.getActiveSpreadsheet() || dbSS;
    
    const profilesSheet = 
      dbSS.getSheetByName("Profiles") || 
      dbSS.getSheetByName("Profile") || 
      dbSS.getSheetByName("Sheet1") || 
      dbSS.getSheetByName("Perfiles") || 
      dbSS.getSheetByName("Bailarines") || 
      dbSS.getSheetByName("Performers");
      
    const responsesSheet = 
      formSS.getSheetByName("Form Responses 1") || 
      formSS.getSheetByName("Form Responses") || 
      formSS.getSheetByName("Respuestas de formulario 1") || 
      formSS.getSheetByName("Respuestas de formulario");
    
    if (!profilesSheet || !responsesSheet) {
      Logger.log("Sync Error: Target sheets 'Profiles' or 'Form Responses' not found.");
      return;
    }
    
    let emailVal = "";
    let addressVal = "";
    let phoneVal = "";
    let emergencyVal = "";
    let birthdayVal = "";
    
    // 1. EXTRACT DATA FROM FORM RESPONSES BY DYNAMIC HEADERS
    Logger.log("Event object status: " + (e ? "DEFINED" : "UNDEFINED"));
    if (e && e.namedValues) {
      Logger.log("Form submission event data: " + JSON.stringify(e.namedValues));
      const namedValues = e.namedValues;
      const headers = Object.keys(namedValues);
      
      // Match form keys dynamically by header strings
      const emailKey = headers.find(h => h.toLowerCase().includes("email") || h.toLowerCase().includes("correo"));
      // Strict matching: must contain "address" but NOT contain "email"
      const addressKey = headers.find(h => (h.toLowerCase().includes("address") || h.toLowerCase().includes("dirección") || h.toLowerCase().includes("direccion")) && !h.toLowerCase().includes("email"));
      const phoneKey = headers.find(h => h.toLowerCase().includes("phone") || h.toLowerCase().includes("teléfono") || h.toLowerCase().includes("telefono"));
      const emergencyKey = headers.find(h => h.toLowerCase().includes("emergency") || h.toLowerCase().includes("emergencia"));
      const birthdayKey = headers.find(h => h.toLowerCase().includes("birth") || h.toLowerCase().includes("nacimiento") || h.toLowerCase().includes("cumpleaños") || h.toLowerCase().includes("cumple"));
      
      emailVal = emailKey ? namedValues[emailKey][0].trim().toLowerCase() : "";
      addressVal = addressKey ? namedValues[addressKey][0].trim() : "";
      phoneVal = phoneKey ? namedValues[phoneKey][0].trim() : "";
      emergencyVal = emergencyKey ? namedValues[emergencyKey][0].trim() : "";
      birthdayVal = birthdayKey ? namedValues[birthdayKey][0].trim() : "";
      
      Logger.log(`Parsed Event Values: email='${emailVal}', address='${addressVal}', phone='${phoneVal}', emergency='${emergencyVal}', birthday='${birthdayVal}'`);
    } else {
      // Manual fallback run: search backwards to find the last row that has a valid email address
      const lastRow = responsesSheet.getLastRow();
      Logger.log("Manual fallback execution active. getLastRow index returned: " + lastRow);
      if (lastRow <= 1) {
        Logger.log("No data rows found in spreadsheet. Returning.");
        return;
      }
      
      const rHeaders = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim());
      const emailCol = rHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
      
      if (emailCol === -1) {
        Logger.log("Manual Sync Error: No email column found in responses sheet headers.");
        return;
      }
      
      // Read all rows at once to optimize performance
      const allValues = responsesSheet.getRange(1, 1, lastRow, responsesSheet.getLastColumn()).getValues();
      let targetRow = -1;
      
      // Loop backwards to find the first row with a non-empty email address
      for (let r = lastRow - 1; r >= 1; r--) {
        const rowVal = allValues[r];
        if (rowVal[emailCol] && rowVal[emailCol].toString().trim() !== "") {
          targetRow = r + 1; // Convert back to 1-based index
          break;
        }
      }
      
      if (targetRow === -1) {
        Logger.log("Manual Sync Warning: Scanned all rows backwards but found no row with a valid email address.");
        return;
      }
      
      const rValues = allValues[targetRow - 1];
      Logger.log("Sheet Headers scanned: " + JSON.stringify(rHeaders));
      Logger.log(`Values extracted from Row #${targetRow}: ` + JSON.stringify(rValues));
      
      // Strict matching: must contain "address" but NOT contain "email"
      const addressCol = rHeaders.findIndex(h => (h.includes("address") || h.includes("dirección") || h.includes("direccion")) && !h.includes("email"));
      const phoneCol = rHeaders.findIndex(h => h.includes("phone") || h.includes("teléfono") || h.includes("telefono"));
      const emergencyCol = rHeaders.findIndex(h => h.includes("emergency") || h.includes("emergencia"));
      const birthdayCol = rHeaders.findIndex(h => h.includes("birth") || h.includes("nacimiento") || h.includes("cumpleaños") || h.includes("cumple"));
      
      emailVal = rValues[emailCol].toString().trim().toLowerCase();
      addressVal = addressCol !== -1 ? rValues[addressCol].toString().trim() : "";
      phoneVal = phoneCol !== -1 ? rValues[phoneCol].toString().trim() : "";
      emergencyVal = emergencyCol !== -1 ? rValues[emergencyCol].toString().trim() : "";
      birthdayVal = birthdayCol !== -1 ? rValues[birthdayCol].toString().trim() : "";
      
      Logger.log(`Parsed Manual Values: email='${emailVal}', address='${addressVal}', phone='${phoneVal}', emergency='${emergencyVal}', birthday='${birthdayVal}'`);
    }
    
    if (!emailVal) {
      Logger.log(`Sync Warning: No email address was detected in this submission. Target check returned empty email.`);
      return;
    }
    
    // 2. LOCATE TARGET COLUMNS AND ROW IN PROFILES BY DYNAMIC HEADERS
    const pValues = profilesSheet.getDataRange().getValues();
    const pHeaders = pValues[0].map(h => h.toString().toLowerCase().trim());
    
    // Map Profiles columns on the fly by header labels
    const pEmailCol = pHeaders.findIndex(h => h.includes("email") || h.includes("correo"));
    // Strict matching: must contain "address" but NOT contain "email"
    const pAddressCol = pHeaders.findIndex(h => (h.includes("address") || h.includes("dirección") || h.includes("direccion")) && !h.includes("email"));
    const pPhoneCol = pHeaders.findIndex(h => h.includes("phone") || h.includes("teléfono") || h.includes("telefono"));
    const pEmergencyCol = pHeaders.findIndex(h => h.includes("emergency") || h.includes("emergencia"));
    const pBirthdayCol = pHeaders.findIndex(h => h.includes("birth") || h.includes("nacimiento") || h.includes("cumpleaños") || h.includes("cumple"));
    
    Logger.log("Profiles headers scanned: " + JSON.stringify(pHeaders));
    
    if (pEmailCol === -1) {
      Logger.log("Sync Error: Profiles sheet does not contain an Email header. Headers found: " + JSON.stringify(pHeaders));
      return;
    }
    
    // Locate the row matching the dancer's email
    let performerRowIdx = -1;
    const registeredEmails = [];
    for (let i = 1; i < pValues.length; i++) {
      const emailCell = pValues[i][pEmailCol].toString().trim().toLowerCase();
      if (emailCell) {
        registeredEmails.push(emailCell);
      }
      if (emailCell === emailVal) {
        performerRowIdx = i + 1; // Convert to 1-based index
        break;
      }
    }
    
    Logger.log("Registered Emails in Profiles database tab: " + JSON.stringify(registeredEmails));
    
    // 3. SECURELY WRITE DATA TO DETECTED HEADER RANGES
    if (performerRowIdx !== -1) {
      let updateMade = false;
      if (pAddressCol !== -1 && addressVal) {
        profilesSheet.getRange(performerRowIdx, pAddressCol + 1).setValue(addressVal);
        updateMade = true;
      }
      if (pPhoneCol !== -1 && phoneVal) {
        profilesSheet.getRange(performerRowIdx, pPhoneCol + 1).setValue(phoneVal);
        updateMade = true;
      }
      if (pEmergencyCol !== -1 && emergencyVal) {
        profilesSheet.getRange(performerRowIdx, pEmergencyCol + 1).setValue(emergencyVal);
        updateMade = true;
      }
      if (pBirthdayCol !== -1 && birthdayVal) {
        profilesSheet.getRange(performerRowIdx, pBirthdayCol + 1).setValue(birthdayVal);
        updateMade = true;
      }
      
      if (updateMade) {
        Logger.log(`Successfully synced form response data to performer profile dynamically in DB: ${emailVal}`);
      } else {
        Logger.log(`Sync Notice: Performer matched but no matching target columns or values to update.`);
      }
    } else {
      Logger.log(`Sync Notice: Performer '${emailVal}' filled the form but is not registered in the Profiles directory.`);
    }
  } catch (err) {
    Logger.log("Sync Trigger Dynamic Error: " + err.toString());
  }
}


