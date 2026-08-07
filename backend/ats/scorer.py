from typing import Dict, Any

def derive_status(overall_score: int) -> str:
    """
    Derive qualitative status string from numerical score.
    """
    if overall_score >= 85:
        return "Excellent"
    elif overall_score >= 70:
        return "Good"
    elif overall_score >= 50:
        return "Needs Improvement"
    else:
        return "Poor"

def format_ats_result(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize and clamp score values in ATS data dictionary.
    """
    overall_score = data.get("overall_score", 75)
    try:
        overall_score = max(0, min(100, int(overall_score)))
    except (ValueError, TypeError):
        overall_score = 75

    status = data.get("status")
    if not status or status not in ["Excellent", "Good", "Needs Improvement", "Poor"]:
        status = derive_status(overall_score)

    categories = data.get("categories", {})
    if not isinstance(categories, dict):
        categories = {}

    expected_cats = ["keywords", "skills", "experience", "grammar", "formatting"]
    normalized_cats = {}
    for cat in expected_cats:
        val = categories.get(cat, overall_score)
        try:
            val = max(0, min(100, int(val)))
        except (ValueError, TypeError):
            val = overall_score
        normalized_cats[cat] = val

    missing_keywords = data.get("missing_keywords", [])
    if not isinstance(missing_keywords, list):
        missing_keywords = []

    suggestions = data.get("suggestions", [])
    if not isinstance(suggestions, list):
        suggestions = []

    return {
        "overall_score": overall_score,
        "status": status,
        "categories": normalized_cats,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions
    }
