import os

from groq import Groq

from dotenv import load_dotenv
from prompts.conflict_prompt import FULL_ANALYSIS_PROMPT

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def analyze_conflicts(requirement, retrieved_tickets):
    
    # Prepare context for AI with requirement and tickets
    tickets_context = "\n".join([
        f"- Ticket {t.get('ticket_key', 'N/A')}: {t.get('title', 'No title')} "
        f"(Module: {t.get('module', 'Unknown')}, Distance: {t.get('distance', 1.0):.3f})"
        for t in retrieved_tickets[:5]  # Limit to top 5 for context
    ])
    
        # Include requirement in the prompt
    full_prompt = f"""
    **Requirement to Analyze:**
    {requirement}

    **Similar Historical Tickets Found:**
    {tickets_context if tickets_context else 'No similar tickets found'}

    {FULL_ANALYSIS_PROMPT}
"""
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a conflict analysis expert. Analyze requirements against historical tickets."
            },
            {
                "role": "user",
                "content": full_prompt
            }
        ],
        temperature=0.2
    )

    ai_text = response.choices[0].message.content
    
    # Calculate distances
    try:
        distances = [float(t.get("distance", 1.0)) for t in retrieved_tickets]
        best = min(distances) if distances else 1.0
        avg_distance = sum(distances) / len(distances) if distances else 1.0
    except Exception:
        best = 1.0
        avg_distance = 1.0

    # Enhanced threshold logic
    if best <= 0.15:
        conflict_level = "Critical Conflict"
        conflict_message = "This requirement directly conflicts with existing work"
        risk_level = "High"
    elif best <= 0.30:
        conflict_level = "Conflict Detected"
        conflict_message = "Significant overlap with existing requirements"
        risk_level = "Medium-High"
    elif best <= 0.50:
        conflict_level = "Overlap"
        conflict_message = "Partial overlap with existing requirements"
        risk_level = "Medium"
    elif best <= 0.70:
        conflict_level = "Related"
        conflict_message = "Some similarity but may be new requirement"
        risk_level = "Low-Medium"
    else:
        conflict_level = "New Requirement"
        conflict_message = "No significant conflicts found"
        risk_level = "Low"

    return {
        "requirement": requirement,  # Now included!
        "conflict_level": conflict_level,
        "conflict_message": conflict_message,
        "risk_level": risk_level,
        "best_distance": round(best, 3),
        "avg_distance": round(avg_distance, 3),
        "total_tickets_found": len(retrieved_tickets),
        "ai_analysis": ai_text,
        "analyzed_tickets": [
            {
                "ticket_key": t.get("ticket_key"),
                "title": t.get("title"),
                "module": t.get("module"),
                "distance": t.get("distance")
            }
            for t in retrieved_tickets[:5]
        ]
    }