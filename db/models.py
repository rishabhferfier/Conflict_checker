from sqlalchemy import Column, Integer, String, Text

from db.database import Base

# ----------------------------------------
# Existing JIRA Tickets
# ----------------------------------------

class JiraTicket(Base):
    __tablename__ = "jira_tickets"
    id = Column(Integer, primary_key=True, index=True)
    ticket_key = Column(String, unique=True)
    title = Column(String)
    description = Column(Text)
    priority=Column(String)
    module=Column(String)
    status=Column(String)
    created_at=Column(String)
    
class AnalysisReport(Base):

    __tablename__ = "analysis_reports"
    id = Column(Integer, primary_key=True, index=True)
    requirement = Column(Text)
    analysis = Column(Text)