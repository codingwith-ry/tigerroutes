from fastapi import FastAPI
from pydantic import BaseModel
import json

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
class StudentData(BaseModel):
    riasec: dict
    bigfive: dict


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

    # --- Static Academic Data ---
    static_grades = {
        "math_performance": 90,
        "science_performance": 94,
        "english_performance": 95,
        "overall_gen_ave": 94,
    }

    acad_score, acad_max = 0.0, 0.0
    for subject, req in program_data.get("academic_requirements", {}).items():
        acad_max += req["weight"]
        student_val = static_grades.get(subject, 0)
        if student_val >= req["minimum"]:
            acad_score += req["weight"]
    acad_final = (acad_score / acad_max) * 100 if acad_max > 0 else 0

    # --- Static Strand ---
    strand = "STEM"
    track_pref = program_data.get("track_preferences", {}).get(strand, 0)
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
        "riasec": student.riasec,
        "bigfive": student.bigfive,
    }

    for program, profile in program_profiles.items():
        total, breakdown = calculate_alignment(student_data, profile)
        results[program] = {"score": total, "breakdown": breakdown}

    # Separate track-aligned vs cross-track
    strand = "STEM"  # static for now
    track_aligned = {
        p: d
        for p, d in results.items()
        if strand in program_profiles[p]["track_preferences"]
        and program_profiles[p]["track_preferences"][strand] >= 80
    }
    cross_track = {p: d for p, d in results.items() if p not in track_aligned}

    # Top 5 each
    track_sorted = sorted(track_aligned.items(), key=lambda x: x[1]["score"], reverse=True)[:5]
    cross_sorted = sorted(cross_track.items(), key=lambda x: x[1]["score"], reverse=True)[:5]

    return {
        "track_aligned": track_sorted,
        "cross_track": cross_sorted,
    }
# To run: uvicorn scoringengine:app --reload