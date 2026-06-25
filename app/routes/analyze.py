from fastapi import APIRouter
import io
from fastapi.responses import StreamingResponse, JSONResponse

from pydantic import BaseModel

from app.services.vector_store import (
    retrieve_similar_tickets
)

from app.services.conflict_agent import (
    analyze_conflicts
)

router = APIRouter()


class AnalyzeRequest(BaseModel):

    requirement: str


@router.post("/analyze")
def analyze_requirement(

    request: AnalyzeRequest
):

    requirement = request.requirement

    # Semantic retrieval
    similar_tickets = (
        retrieve_similar_tickets(
            requirement
        )
    )

    # No overlap found
    if not similar_tickets:

        return {

            "requirement": requirement,

            "conflict_detected": False,

            "message": "No relevant historical conflicts found.",

            "risk_level": "Low",

            "conflict_level": "New Requirement",

            "best_distance": None
        }

    # AI reasoning (returns structured result with conflict level)
    analysis_result = analyze_conflicts(

        requirement,

        similar_tickets
    )

    # analysis_result is a dict: {conflict_level, conflict_message, best_distance, ai_analysis}
    return {

        "requirement": requirement,

        "retrieved_tickets": similar_tickets,

        "conflict_level": analysis_result.get("conflict_level"),

        "conflict_message": analysis_result.get("conflict_message"),

        "best_distance": analysis_result.get("best_distance"),

        "ai_analysis": analysis_result.get("ai_analysis")
    }


@router.post("/analyze/pdf")
def analyze_requirement_pdf(

        request: AnalyzeRequest
    ):

        requirement = request.requirement

        # Semantic retrieval
        similar_tickets = (
            retrieve_similar_tickets(
                requirement
            )
        )

        # AI reasoning (only if there are similar tickets)
        if similar_tickets:

            analysis_result = analyze_conflicts(

                requirement,

                similar_tickets
            )

            ai_analysis = analysis_result.get("ai_analysis") if isinstance(analysis_result, dict) else analysis_result

        else:

            ai_analysis = "No relevant historical conflicts found."

        # If reportlab isn't available, return a helpful error (503)
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
        except Exception:
            return JSONResponse({"error": "PDF generation not available. Install reportlab package to enable PDF downloads."}, status_code=503)

        # Build PDF in-memory
        buffer = io.BytesIO()

        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        y = height - 40
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(40, y, "Requirement Analysis Report")

        y -= 30
        pdf.setFont("Helvetica", 11)
        pdf.drawString(40, y, "Requirement:")
        y -= 18

        # Wrap requirement text
        for line in str(requirement).split("\n"):
            pdf.drawString(50, y, line)
            y -= 14
            if y < 80:
                pdf.showPage()
                y = height - 40

        y -= 8
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Retrieved Tickets:")
        y -= 18
        pdf.setFont("Helvetica", 10)

        if similar_tickets:
            for t in similar_tickets:
                text = f"{t.get('ticket_key')} - {t.get('title')} (module: {t.get('module')}, distance: {t.get('distance')})"
                pdf.drawString(50, y, text)
                y -= 12
                if y < 80:
                    pdf.showPage()
                    y = height - 40
        else:
            pdf.drawString(50, y, "No similar tickets retrieved.")
            y -= 14

        y -= 8
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "AI Analysis:")
        y -= 18
        pdf.setFont("Helvetica", 10)

        # Convert ai_analysis to string and split into lines
        for line in str(ai_analysis).split("\n"):
            pdf.drawString(50, y, line)
            y -= 12
            if y < 80:
                pdf.showPage()
                y = height - 40

        pdf.showPage()
        pdf.save()

        buffer.seek(0)

        filename = "analysis_report.pdf"

        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename={filename}"
        })