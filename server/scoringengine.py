from fastapi import FastAPI
from pydantic import BaseModel
import json
from typing import Dict, Any

app = FastAPI()

# -------------------------------
# Load Program Profiles
# -------------------------------

def load_program_profiles():
    try:
        with open("ProgramProfiles.json", "r") as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading program profiles: {e}")
        return {}

program_profiles = load_program_profiles()

# -------------------------------
# Request Schema
# -------------------------------
class StudentGrades(BaseModel):
    mathGrade: float
    scienceGrade: float
    englishGrade: float
    genAverageGrade: float

class StudentData(BaseModel):
    studentGrades: StudentGrades
    strand: str
    riasec: Dict[str, float]
    bigfive: Dict[str, float]


# -------------------------------
# Scoring Function
# -------------------------------
def calculate_alignment(student_data, program_data):
    # --- RIASEC ---
    riasec_score, riasec_max = 0.0, 0.0
    for trait, req in program_data.get("riasec_requirements", {}).items():
        riasec_max += req["weight"]
        student_val = student_data["riasec"].get(trait, 0)
        min_val, max_val = req["ideal_range"]
        if min_val <= student_val <= max_val:
            riasec_score += req["weight"]
    riasec_final = (riasec_score / riasec_max) * 100 if riasec_max > 0 else 0

    # --- Big Five ---
    bigfive_score, bigfive_max = 0.0, 0.0
    for trait, req in program_data.get("bigfive_requirements", {}).items():
        bigfive_max += req["weight"]
        student_val = student_data["bigfive"].get(trait, 0)
        min_val, max_val = req["ideal_range"]
        if min_val <= student_val <= max_val:
            bigfive_score += req["weight"]
    bigfive_final = (bigfive_score / bigfive_max) * 100 if bigfive_max > 0 else 0

    # --- Academic Grades ---
    # Use actual student grades instead of static data
    student_grades = student_data["studentGrades"]
    academic_performance = {
        "math_performance": student_grades["mathGrade"],
        "science_performance": student_grades["scienceGrade"],
        "english_performance": student_grades["englishGrade"],
        "overall_gen_ave": student_grades["genAverageGrade"],
    }

    acad_score, acad_max = 0.0, 0.0
    for subject, req in program_data.get("academic_requirements", {}).items():
        acad_max += req["weight"]
        student_val = academic_performance.get(subject, 0)
        if student_val >= req["minimum"]:
            acad_score += req["weight"]
    acad_final = (acad_score / acad_max) * 100 if acad_max > 0 else 0

    # --- Strand Alignment ---
    # Use actual student strand instead of static value
    student_strand = student_data["strand"]
    track_pref = program_data.get("track_preferences", {}).get(student_strand, 0)
    track_final = track_pref  # already in 0–100 range

    # --- Weighted Total ---
    total_score = (
        (riasec_final * 0.40)
        + (bigfive_final * 0.30)
        + (acad_final * 0.20)
        + (track_final * 0.10)
    )

    return round(total_score, 2), {
        "RIASEC": round(riasec_final, 2),
        "BigFive": round(bigfive_final, 2),
        "Academic": round(acad_final, 2),
        "Track": round(track_final, 2),
    }


# -------------------------------
# API Endpoint
# -------------------------------
@app.post("/score")
def score_student(student: StudentData):
    results = {}

    # Convert BaseModel to dictionary
    student_data = {
        "studentGrades": student.studentGrades.dict(),
        "strand": student.strand,
        "riasec": student.riasec,
        "bigfive": student.bigfive,
    }

    for program, profile in program_profiles.items():
        total, breakdown = calculate_alignment(student_data, profile)
        results[program] = {"score": total, "breakdown": breakdown}

    # Separate track-aligned vs cross-track using actual student strand
    student_strand = student_data["strand"]
    track_aligned = {
        p: d
        for p, d in results.items()
        if student_strand in program_profiles[p]["track_preferences"]
        and program_profiles[p]["track_preferences"][student_strand] >= 80
    }
    cross_track = {p: d for p, d in results.items() if p not in track_aligned}

    # Top 5 each
    track_sorted = sorted(track_aligned.items(), key=lambda x: x[1]["score"], reverse=True)[:5]
    cross_sorted = sorted(cross_track.items(), key=lambda x: x[1]["score"], reverse=True)[:5]

    print("Track-Aligned Recommendations:", track_sorted)
    print("Cross-Track Recommendations:", cross_sorted)
    
    return {
        "track_aligned": track_sorted,
        "cross_track": cross_sorted,
    }

# To run: uvicorn scoringengine:app --reload