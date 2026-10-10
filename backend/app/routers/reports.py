from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import InspectionReport

router = APIRouter()


@router.get("", response_model=list[InspectionReport])
def list_reports(
    session: Annotated[Session, Depends(get_session)],
) -> list[InspectionReport]:
    return list(session.exec(select(InspectionReport).order_by(InspectionReport.id.desc())))
