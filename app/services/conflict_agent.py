import os

from groq import Groq

from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_conflicts(

    requirement,

    retrieved_tickets
):

    """
    AI-based enterprise
    conflict analysis
    """

    prompt = f"""

You are an advanced Enterprise Requirement Conflict Detection AI.

Your role is to analyze a NEW business or engineering requirement
against an existing enterprise backlog and identify potential risks,
conflicts, overlaps, architectural impacts, and hidden dependencies
before implementation begins.

You are acting like a senior:
- Enterprise Architect
- Product Governance Expert
- Solution Analyst
- Technical Program Reviewer

==================================================
NEW REQUIREMENT
==================================================

{requirement}

==================================================
EXISTING HISTORICAL BACKLOG / JIRA TICKETS
==================================================

{retrieved_tickets}

==================================================
ANALYSIS OBJECTIVES
==================================================

Carefully analyze the NEW requirement against the
historical backlog and provide deep enterprise insights.

Your analysis MUST include:

1. REQUIREMENT SUMMARY
- Explain what the new requirement is trying to achieve
- Describe the likely business intent

2. DUPLICATE FEATURE DETECTION
- Detect if similar functionality already exists
- Mention overlapping tickets/features
- Explain similarity reasoning

3. CONTRADICTION ANALYSIS
- Detect conflicting logic, workflows, or business rules
- Explain what existing functionality may break
- Mention governance or compliance risks if any

4. HIDDEN DEPENDENCIES
- Identify implicit dependencies on:
  - APIs
  - databases
  - workflows
  - services
  - authentication
  - integrations
  - external systems
- Mention missing technical assumptions

5. IMPACTED MODULES
- Predict which enterprise modules/systems may be impacted
- Example:
  - Billing
  - Authentication
  - Reporting
  - Audit
  - Notifications
  - Analytics
  - Jira workflows

6. IMPLEMENTATION RISKS
- Mention:
  - scalability risks
  - migration risks
  - security concerns
  - workflow disruption
  - backward compatibility issues

7. RISK LEVEL
Assign one:
- Low
- Medium
- High
- Critical

Also explain WHY the risk level was assigned.

8. RECOMMENDED ACTIONS
Provide actionable next steps for engineering/product teams.

Examples:
- review architecture
- consult compliance team
- merge duplicate stories
- create dependency tickets
- validate workflow impacts
- clarify business rules

==================================================
IMPORTANT INSTRUCTIONS
==================================================

- Be precise and enterprise-focused
- Avoid generic answers
- Explain reasoning clearly
- Use professional architecture language
- Mention ticket references wherever possible
- If no major conflict exists, explicitly say so
- Focus on practical implementation concerns

==================================================
OUTPUT FORMAT
==================================================

Return the response in clean structured markdown with headings.

"""

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.2
    )

    ai_text = response.choices[0].message.content

    # Derive a simple conflict severity from the returned retrieval distances.
    # Lower distance => more similar. We define tiered thresholds so that
    # very close matches are treated as Major conflicts, moderately close
    # as Minor, otherwise No Conflict.
    try:
        distances = [float(t.get("distance", 1.0)) for t in retrieved_tickets]
        best = min(distances) if distances else 1.0
    except Exception:
        best = 1.0

    # Thresholds (tune as needed):
    # best <= 0.20 -> Requirement present
    # best <= 0.50 -> Overlap
    # otherwise -> New requirement
    if best <= 0.20:
        conflict_level = "Requirement Present"
    elif best <= 0.50:
        conflict_level = "Overlap"
    else:
        conflict_level = "New Requirement"

    return {
        "conflict_level": conflict_level,
        "best_distance": round(best, 3),
        "ai_analysis": ai_text
    }