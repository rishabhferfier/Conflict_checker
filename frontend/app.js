// ConflictGuard Frontend Engine

// DOM Selectors
const systemStatus = document.getElementById("systemStatus");
const auditForm = document.getElementById("auditForm");
const requirementInput = document.getElementById("requirementInput");
const submitBtn = document.getElementById("submitBtn");
const loaderOverlay = document.getElementById("loaderOverlay");
const loaderTitle = document.getElementById("loaderTitle");
const loaderMessage = document.getElementById("loaderMessage");

// Steps
const stepRetrieve = document.getElementById("stepRetrieve");
const stepReason = document.getElementById("stepReason");
const stepReport = document.getElementById("stepReport");

// Dashboard DOM elements
const emptyDashboard = document.getElementById("emptyDashboard");
const analysisDashboard = document.getElementById("analysisDashboard");
const riskCard = document.getElementById("riskCard");
const riskBadge = document.getElementById("riskBadge");
const riskDescription = document.getElementById("riskDescription");
const ticketCountBadge = document.getElementById("ticketCountBadge");

// Tabs & Content
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Specific content containers
const summaryText = document.getElementById("summaryText");
const modulesContainer = document.getElementById("modulesContainer");
const conflictsList = document.getElementById("conflictsList");
const markdownContent = document.getElementById("markdownContent");
const ticketsGrid = document.getElementById("ticketsGrid");
const checklistItems = document.getElementById("checklistItems");
const checklistProgressText = document.getElementById("checklistProgressText");
const checklistProgressBar = document.getElementById("checklistProgressBar");

// Exports & Utility Triggers
const copyMarkdownBtn = document.getElementById("copyMarkdownBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const toastAlert = document.getElementById("toastAlert");

// Templates
const sampleWalletBtn = document.getElementById("sampleWalletBtn");
const sampleSessionBtn = document.getElementById("sampleSessionBtn");
const sampleAuditBtn = document.getElementById("sampleAuditBtn");

// Active session state
let activeAnalysisData = null;

// API Configurations
const API_BASE = "/api/v1";

// 1. Connection Health Check on Startup
async function checkBackendConnection() {
  try {
    const response = await fetch("/");
    if (response.ok) {
      systemStatus.className = "status-indicator online";
      systemStatus.querySelector(".status-text").textContent = "Connected to API";
    } else {
      throw new Error("Server responded with error status");
    }
  } catch (error) {
    systemStatus.className = "status-indicator offline";
    systemStatus.querySelector(".status-text").textContent = "API Offline";
    console.warn("FastAPI backend is offline or inaccessible.", error);
  }
}

// Check on load, and verify every 8 seconds
checkBackendConnection();
setInterval(checkBackendConnection, 8000);

// 2. Timeline Loading Simulation
async function triggerLoaderSequence(callback) {
  submitBtn.disabled = true;
  loaderOverlay.style.display = "flex";
  
  // Step 1: Vector Retrieval
  loaderTitle.textContent = "Retrieving Historical Data";
  loaderMessage.textContent = "Querying ChromaDB collection for matching requirements...";
  stepRetrieve.className = "audit-step active";
  stepReason.className = "audit-step";
  stepReport.className = "audit-step";
  await new Promise(r => setTimeout(r, 1200));

  // Step 2: AI Reasoning
  loaderTitle.textContent = "Analyzing Overlaps & Risks";
  loaderMessage.textContent = "Invoking Llama model to check constraints and security profiles...";
  stepRetrieve.className = "audit-step completed";
  stepReason.className = "audit-step active";
  await new Promise(r => setTimeout(r, 1600));

  // Step 3: Rendering Report
  loaderTitle.textContent = "Compiling Audit Report";
  loaderMessage.textContent = "Generating interactive checklist and compliance feedback...";
  stepReason.className = "audit-step completed";
  stepReport.className = "audit-step active";
  await new Promise(r => setTimeout(r, 800));

  stepReport.className = "audit-step completed";
  loaderOverlay.style.display = "none";
  submitBtn.disabled = false;
  
  if (callback) callback();
}

// 3. Tab State Controller
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Deactivate active tab
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabPanes.forEach(pane => pane.classList.remove("active"));
    
    // Activate clicked tab
    button.classList.add("active");
    const tabId = button.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});

// 4. Utility Toast Alerts
function showToast(message) {
  toastAlert.textContent = message;
  toastAlert.classList.add("show");
  setTimeout(() => {
    toastAlert.classList.remove("show");
  }, 2500);
}

// 5. Sample Requirements Populator
const sampleSpecs = {
  wallet: "Implement a new feature to store returned funds in virtual wallets for customers rather than processing refund requests back to Stripe APIs. Wallet balances can be used for future platform purchases.",
  session: "Extend the user auth session cookie lifetime to 24 hours via un-secured cookies to improve mobile user retention and decrease database check frequency.",
  audit: "To maximize system throughput and minimize database latency during peak traffic, skip recording operations to the audit log databases for high-speed billing and payment checkouts."
};

sampleWalletBtn.addEventListener("click", () => {
  requirementInput.value = sampleSpecs.wallet;
  showToast("Loaded wallet refund specification!");
});

sampleSessionBtn.addEventListener("click", () => {
  requirementInput.value = sampleSpecs.session;
  showToast("Loaded auth session specification!");
});

sampleAuditBtn.addEventListener("click", () => {
  requirementInput.value = sampleSpecs.audit;
  showToast("Loaded high-speed audit specification!");
});

// 6. Section & Metadata Parsers for Markdown
const headers = [
  "1.\\s*REQUIREMENT SUMMARY", 
  "2.\\s*DUPLICATE FEATURE DETECTION", 
  "3.\\s*CONTRADICTION ANALYSIS", 
  "4.\\s*HIDDEN DEPENDENCIES", 
  "5.\\s*IMPACTED MODULES", 
  "6.\\s*IMPLEMENTATION RISKS", 
  "7.\\s*RISK LEVEL", 
  "8.\\s*RECOMMENDED ACTIONS"
];

function extractSection(text, titlePattern, nextTitles) {
  if (!text) return "";
  const pattern = titlePattern + "([\\s\\S]*?)(?:" + nextTitles.join("|") + "|$)";
  const matches = text.match(new RegExp(pattern, "i"));
  return matches && matches[1] ? matches[1].trim() : "";
}

function parseAnalysisOutput(text) {
  // Extract Risk Level
  let risk = "LOW";
  const riskSectionText = extractSection(text, "7.\\s*RISK LEVEL", ["8.\\s*RECOMMENDED ACTIONS"]).toUpperCase();
  if (riskSectionText.includes("CRITICAL")) risk = "CRITICAL";
  else if (riskSectionText.includes("HIGH")) risk = "HIGH";
  else if (riskSectionText.includes("MEDIUM")) risk = "MEDIUM";
  else if (riskSectionText.includes("LOW")) risk = "LOW";
  else {
    // Fallback search in entire text
    const fullUpper = text.toUpperCase();
    if (fullUpper.includes("CRITICAL")) risk = "CRITICAL";
    else if (fullUpper.includes("HIGH")) risk = "HIGH";
    else if (fullUpper.includes("MEDIUM")) risk = "MEDIUM";
  }

  // Extract Summary
  let summary = extractSection(text, "1.\\s*REQUIREMENT SUMMARY", headers.slice(1));
  if (!summary) summary = "No distinct requirement summary was extracted by the auditor.";

  // Extract Contradictions & Duplicates
  const duplicates = extractSection(text, "2.\\s*DUPLICATE FEATURE DETECTION", headers.slice(2));
  const contradictions = extractSection(text, "3.\\s*CONTRADICTION ANALYSIS", headers.slice(3));
  
  let contradictionsList = [];
  if (duplicates && duplicates.length > 20 && !duplicates.toLowerCase().includes("no duplicate")) {
    contradictionsList.push(`<strong>Duplicates Check:</strong> ${duplicates}`);
  }
  if (contradictions && contradictions.length > 20 && !contradictions.toLowerCase().includes("no conflict")) {
    contradictionsList.push(`<strong>Contradiction Check:</strong> ${contradictions}`);
  }

  // Extract Modules
  const modulesText = extractSection(text, "5.\\s*IMPACTED MODULES", headers.slice(5));
  const detectedModules = [];
  const commonModules = ["Billing", "Authentication", "Reporting", "Audit", "Notifications", "Analytics", "Membership", "Security", "Jira"];
  commonModules.forEach(mod => {
    if (modulesText.toLowerCase().includes(mod.toLowerCase())) {
      detectedModules.push(mod);
    }
  });

  // Extract Recommended Actions Checklist
  const actionsText = extractSection(text, "8.\\s*RECOMMENDED ACTIONS", []);
  const checklist = [];
  if (actionsText) {
    const lines = actionsText.split("\n");
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("-") || cleanLine.startsWith("*") || cleanLine.match(/^\d+\./)) {
        const itemContent = cleanLine.replace(/^[-*\d.]+\s*/, "").trim();
        if (itemContent.length > 10) {
          checklist.push(itemContent);
        }
      }
    });
  }

  return {
    risk,
    summary,
    contradictions: contradictionsList,
    modules: detectedModules,
    checklist
  };
}

// 7. Markdown Simple Renderer
function renderMarkdown(md) {
  if (!md) return "<p>No report details compiled.</p>";
  
  const lines = md.split("\n");
  let result = [];
  let inList = false;
  
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("### ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h3>${line.substring(4)}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h2>${line.substring(3)}</h2>`);
    } else if (line.startsWith("# ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h1>${line.substring(2)}</h1>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { result.push("<ul>"); inList = true; }
      const content = line.substring(2)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
      result.push(`<li>${content}</li>`);
    } else if (line.match(/^\d+\.\s+/)) {
      if (inList) { result.push("</ul>"); inList = false; }
      const matchLabel = line.match(/^\d+\.\s+/)[0];
      const content = line.replace(/^\d+\.\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
      result.push(`<h4>${matchLabel}${content}</h4>`);
    } else if (line.startsWith("> ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<blockquote>${line.substring(2)}</blockquote>`);
    } else if (line.length > 0) {
      if (inList) { result.push("</ul>"); inList = false; }
      const content = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
      result.push(`<p>${content}</p>`);
    } else {
      if (inList) { result.push("</ul>"); inList = false; }
    }
  }
  
  if (inList) result.push("</ul>");
  return result.join("\n");
}

function displayAnalysisResults(data) {
  activeAnalysisData = data;
  
  // Parse the analysis output and use backend labels when available.
  const parsed = parseAnalysisOutput(data.ai_analysis || data.message);
  const statusLabel = String(data.conflict_level || "New Requirement").replace(/\s*RISK$/i, "");

  riskCard.className = "risk-card";
  riskBadge.textContent = statusLabel;
 
  let riskClass = "risk-low";
  let descriptionText = "This looks like a new requirement with no direct backlog match.";
 
  if (statusLabel === "Requirement Present") {
    riskClass = "risk-critical";
    descriptionText = "Requirement already exists in the backlog.";
  } else if (statusLabel === "Overlap") {
    riskClass = "risk-medium";
    descriptionText = "Some existing backlog items overlap with this requirement.";
  } else if (statusLabel === "New Requirement") {
    riskClass = "risk-low";
    descriptionText = "This looks like a new requirement with no direct backlog match.";
  }
 
  riskCard.classList.add(riskClass);
  riskDescription.textContent = descriptionText;

  // Render Overview pane
  summaryText.textContent = parsed.summary;
  
  // Modules Container
  modulesContainer.innerHTML = "";
  if (parsed.modules.length > 0) {
    parsed.modules.forEach(mod => {
      const chip = document.createElement("span");
      chip.className = "chip chip-blue";
      chip.textContent = mod;
      modulesContainer.appendChild(chip);
    });
  } else {
    modulesContainer.innerHTML = '<span class="chip chip-gray">None flagged</span>';
  }

  // Contradiction insights list
  conflictsList.innerHTML = "";
  if (parsed.contradictions.length > 0) {
    parsed.contradictions.forEach(insight => {
      const li = document.createElement("li");
      li.className = "warn-item";
      li.innerHTML = insight;
      conflictsList.appendChild(li);
    });
  } else if (data.conflict_detected === false) {
    conflictsList.innerHTML = '<li>All system validations passed. No historic backlog overlaps identified.</li>';
  } else {
    conflictsList.innerHTML = '<li>Historical backlog ticket overlap analysis complete. Reference tickets list for minor similarities.</li>';
  }

  // Render Full Markdown report
  markdownContent.innerHTML = renderMarkdown(data.ai_analysis || `# Audit Status\n\n${data.message}`);

  // Render semantic historical tickets list
  ticketsGrid.innerHTML = "";
  const tickets = data.retrieved_tickets || [];
  ticketCountBadge.textContent = tickets.length;
  
  if (tickets.length > 0) {
    tickets.forEach(ticket => {
      const ticketCard = document.createElement("div");
      ticketCard.className = "ticket-card";
      
      const priorityClass = `tag-priority-${(ticket.priority || 'medium').toLowerCase()}`;
      const statusClass = `tag-status-${(ticket.status || 'open').toLowerCase().replace(/\s+/g, '')}`;
      
      // Calculate a similarity score % (chroma returns distance where smaller distance = more similar)
      const simPercent = Math.max(0, Math.min(100, Math.round((2.0 - ticket.distance) * 50)));
      
      ticketCard.innerHTML = `
        <div class="ticket-card-header">
          <div class="ticket-meta">
            <span class="ticket-key">${ticket.ticket_key}</span>
            <span class="ticket-match-score">${simPercent}% Match</span>
          </div>
          <div class="ticket-badges">
            <span class="tag-badge ${priorityClass}">${ticket.priority}</span>
            <span class="tag-badge ${statusClass}">${ticket.status}</span>
          </div>
        </div>
        <h4>${ticket.title}</h4>
        <div class="ticket-description">${ticket.document}</div>
        <div class="ticket-module-badge">${ticket.module}</div>
      `;
      ticketsGrid.appendChild(ticketCard);
    });
  } else {
    ticketsGrid.innerHTML = '<div class="empty-dashboard-card" style="min-height: 200px;"><p>No semantically overlapping backlog references retrieved.</p></div>';
  }

  // Build Actions Checklist items
  checklistItems.innerHTML = "";
  const actions = parsed.checklist.length > 0 ? parsed.checklist : [
    "Review system changes with database administrators",
    "Run verification scripts in staging environments",
    "Draft technical document defining new compliance parameter rules"
  ];
  
  actions.forEach(action => {
    const li = document.createElement("li");
    li.className = "checklist-item";
    li.innerHTML = `
      <div class="checklist-checkbox-container">
        <div class="custom-checkbox">
          <svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      <span class="checklist-text">${action}</span>
    `;
    
    li.addEventListener("click", () => {
      li.classList.toggle("checked");
      updateChecklistProgress();
    });
    
    checklistItems.appendChild(li);
  });
  
  updateChecklistProgress();

  // Show Dashboard, Hide Empty layout
  emptyDashboard.style.display = "none";
  analysisDashboard.style.display = "block";

  // Enable PDF download button when analysis is available
  if (downloadPdfBtn) downloadPdfBtn.disabled = false;
}

function updateChecklistProgress() {
  const total = checklistItems.querySelectorAll(".checklist-item").length;
  const checked = checklistItems.querySelectorAll(".checklist-item.checked").length;
  
  checklistProgressText.textContent = `${checked} of ${total} tasks completed`;
  
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
  checklistProgressBar.style.width = `${percentage}%`;
}

// 9. Audit API Submission controller
auditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const reqValue = requirementInput.value.trim();
  if (!reqValue) return;

  // Clear previous dashboard active content
  emptyDashboard.style.display = "flex";
  analysisDashboard.style.display = "none";
  
  // Show loader timeline
  triggerLoaderSequence(async () => {
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requirement: reqValue })
      });
      
      if (!response.ok) {
        throw new Error(`Audit server responded with ${response.status}`);
      }
      
      const responseData = await response.json();
      displayAnalysisResults(responseData);
      showToast("Audit Complete. Insights parsed successfully!");
      
    } catch (err) {
      console.error("Auditor post transaction failed:", err);
      // Construct a simulated response for demonstration if backend is not responding offline
      const mockResult = createMockResult(reqValue);
      displayAnalysisResults(mockResult);
      showToast("Auditor Offline. Loaded offline fallback intelligence.");
    }
  });
});

// Offline Fallback Mock generator for demonstration when uvicorn is offline
function createMockResult(req) {
  let risk = "LOW";
  let analysis = "";
  let matches = [];

  if (req.toLowerCase().includes("wallet") || req.toLowerCase().includes("refund")) {
    risk = "Critical";
    analysis = `
# Requirements Conflict Report
## 1. REQUIREMENT SUMMARY
The user wishes to implement an internal wallet/balance workflow for store credit refunds instead of direct Stripe payments.

## 2. DUPLICATE FEATURE DETECTION
No duplicate active store credit systems exist in the backlog.

## 3. CONTRADICTION ANALYSIS
This requirement directly violates system constraint defined in JIRA ticket **PAY-201**. Ticket **PAY-201** explicitly states: "The system does not support virtual credit wallets or internal balance holdings due to licensing compliance."

## 4. HIDDEN DEPENDENCIES
- Stripe Elements API integration
- Local database columns for tracking wallets

## 5. IMPACTED MODULES
- Billing
- Security
- Database schema

## 6. IMPLEMENTATION RISKS
- High risk of compliance penalties.
- High risk of balance synchronization errors.

## 7. RISK LEVEL
Critical

## 8. RECOMMENDED ACTIONS
- Immediately review architecture with licensing and compliance committees.
- Cancel wallet storage draft and rewrite requirement matching PAY-201 parameters.
- Schedule a meeting with the payment integrations lead.
`;
    matches = [{
      ticket_key: "PAY-201",
      title: "Stripe payment integration and refund API rules",
      document: "Integration with Stripe Elements for secure payment collection. Refund transactions must process exclusively through the Stripe refund API. Refunded amounts are returned directly to the customer's original payment source. The system does not support virtual credit wallets or internal balance holdings due to licensing compliance.",
      priority: "Critical",
      status: "Closed",
      module: "Billing",
      distance: 0.18
    }];
  } else if (req.toLowerCase().includes("session") || req.toLowerCase().includes("cookie")) {
    risk = "High";
    analysis = `
# Requirements Conflict Report
## 1. REQUIREMENT SUMMARY
Request to extend authentication session cookie lifetime to 24 hours via un-secured cookies.

## 2. DUPLICATE FEATURE DETECTION
No duplicate session extension scripts found.

## 3. CONTRADICTION ANALYSIS
This request directly conflicts with JIRA ticket **SEC-101** which specifies that JWT must be stored in secure, HttpOnly, and SameSite=Strict cookies, and idle session lifetimes must expire in 30 minutes. Un-secured session cookies open the system to cross-site scripting session hijacking.

## 4. HIDDEN DEPENDENCIES
- Authentication Router
- Client Session Middleware

## 5. IMPACTED MODULES
- Authentication
- Security
- Core API

## 6. IMPLEMENTATION RISKS
- Session hijacking vulnerability.
- Incompatibility with SameSite secure standards.

## 7. RISK LEVEL
High

## 8. RECOMMENDED ACTIONS
- Do not implement unsecured session cookies.
- Maintain HTTP-only, secure properties.
- Consult Security Analyst on standard token refresh workflows instead.
`;
    matches = [{
      ticket_key: "SEC-101",
      title: "Enforce JWT authentication with HttpOnly cookies",
      document: "All system endpoints must authenticate using JSON Web Tokens (JWT) stored in HTTP-only, secure, and SameSite=Strict cookies to mitigate XSS and CSRF risks. Idle sessions must expire automatically after 30 minutes of inactivity. Access tokens must include standard role claims.",
      priority: "High",
      status: "Closed",
      module: "Authentication",
      distance: 0.25
    }];
  } else {
    // Default low risk fallback
    analysis = `
# Requirements Conflict Report
## 1. REQUIREMENT SUMMARY
Request description processed for general platform changes.

## 2. DUPLICATE FEATURE DETECTION
No duplicate specifications located in backlog indices.

## 3. CONTRADICTION ANALYSIS
No contradictions or business rule violations identified.

## 4. HIDDEN DEPENDENCIES
Standard dependencies only.

## 5. IMPACTED MODULES
General module updates.

## 6. IMPLEMENTATION RISKS
Low risk of regression or integration anomalies.

## 7. RISK LEVEL
Low

## 8. RECOMMENDED ACTIONS
- Follow standard code review workflows.
- Merge development branches when validation scripts pass.
`;
  }

  return {
    requirement: req,
    conflict_detected: risk !== "LOW",
    message: "Offline check parsed",
    risk_level: risk,
    retrieved_tickets: matches,
    ai_analysis: analysis
  };
}

// 10. Copy Markdown Action
copyMarkdownBtn.addEventListener("click", () => {
  if (!activeAnalysisData) return;
  
  navigator.clipboard.writeText(activeAnalysisData.ai_analysis || activeAnalysisData.message)
    .then(() => {
      showToast("Markdown report copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy report text:", err);
    });
});

// Download PDF Action
if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener("click", async () => {
    const requirementText = requirementInput.value.trim();
    if (!requirementText) return showToast("No requirement to generate PDF.");

    downloadPdfBtn.disabled = true;
    try {
      const resp = await fetch(`${API_BASE}/analyze/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: requirementText })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Server responded ${resp.status}`);
      }

      const contentType = resp.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        // server returned JSON (error message) instead of PDF
        const err = await resp.json().catch(() => ({}));
        const msg = err.error || err.message || "Unknown server response";
        throw new Error(msg);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analysis_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("PDF download started.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Failed to generate PDF. Check server logs.");
    } finally {
      downloadPdfBtn.disabled = false;
    }
  });
}
