"""
recommendations.py

FastAPI routes for the natural-language preference recommendation feature.

Wire into your existing app in backend/main.py:

    from api.recommendations import router as recommendations_router
    app.include_router(recommendations_router)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from engine.matching_engine import JobMatch, get_ranked_jobs_for_user
from engine.preference_extractor import PreferenceFilters, extract_preferences

# Swap this out for your real Supabase auth dependency, e.g.:
# from auth import get_current_user
# and add `user=Depends(get_current_user)` to the route below instead of
# trusting a client-supplied user_id.

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class PreferenceRequest(BaseModel):
    text: str
    user_id: str


class PreferenceResponse(BaseModel):
    preferences: PreferenceFilters
    jobs: list[JobMatch]


@router.post("/preferences", response_model=PreferenceResponse)
async def parse_preferences_and_rank(payload: PreferenceRequest) -> PreferenceResponse:
    """
    1. Extract structured preferences from the user's free-text input.
    2. Re-rank/filter that user's job matches using those preferences.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Preference text must not be empty.")

    preferences = extract_preferences(payload.text)

    try:
        ranked_jobs = get_ranked_jobs_for_user(user_id=payload.user_id, preferences=preferences)
    except NotImplementedError as exc:
        # Raised by the placeholder fetch_* / calculate_ats_score functions in
        # matching_engine.py until they're wired to your real implementations.
        raise HTTPException(status_code=501, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Matching engine failed: {exc}") from exc

    return PreferenceResponse(preferences=preferences, jobs=ranked_jobs)
