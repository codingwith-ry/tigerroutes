# -------------------------------
# TigerRoutes AI Scoring Engine
# -------------------------------
import json
def calculate_alignment(student_data, program_data):

    # --- 1. RIASEC Subscore (0–100) ---
    riasec_score, riasec_max = 0.0, 0.0
    for trait, req in program_data.get("riasec_requirements", {}).items():
        riasec_max += req["weight"]
        student_val = student_data["riasec"].get(trait, 0)
        min_val, max_val = req["ideal_range"]
        if min_val <= student_val <= max_val:
            riasec_score += req["weight"]
    riasec_final = (riasec_score / riasec_max) * 100 if riasec_max > 0 else 0

    # --- 2. Big Five Subscore (0–100) ---
    bigfive_score, bigfive_max = 0.0, 0.0
    for trait, req in program_data.get("bigfive_requirements", {}).items():
        bigfive_max += req["weight"]
        student_val = student_data["bigfive"].get(trait, 0)
        min_val, max_val = req["ideal_range"]
        if min_val <= student_val <= max_val:
            bigfive_score += req["weight"]
    bigfive_final = (bigfive_score / bigfive_max) * 100 if bigfive_max > 0 else 0

    # --- 3. Academic Subscore (0–100) ---
    acad_score, acad_max = 0.0, 0.0
    for subject, req in program_data.get("academic_requirements", {}).items():
        acad_max += req["weight"]
        student_val = student_data["grades"].get(subject, 0)
        if student_val >= req["minimum"]:
            acad_score += req["weight"]
    acad_final = (acad_score / acad_max) * 100 if acad_max > 0 else 0

    # --- 4. Track Subscore (0–100) ---
    strand = student_data["strand"]
    track_pref = program_data.get("track_preferences", {}).get(strand, 0)
    track_final = track_pref  # already 0–100

    # --- Weighted Total Score ---
    total_score = (riasec_final * 0.40) + (bigfive_final * 0.30) + (acad_final * 0.20) + (track_final * 0.10)

    return round(total_score, 2), {
        "RIASEC": round(riasec_final, 2),
        "BigFive": round(bigfive_final, 2),
        "Academic": round(acad_final, 2),
        "Track": round(track_final, 2)
    }


# --- Example Student Input ---
student_example = {
    "riasec": {"Investigative": 67, "Realistic": 57, "Conventional": 75,
               "Artistic": 29, "Social": 71, "Enterprising": 57},
    "bigfive": {"Openness": 80, "Conscientiousness": 85, "Extraversion": 60,
                "Agreeableness": 70, "Neuroticism": 30},
    "grades": {"math_performance": 89, "science_performance": 89,
               "english_performance": 88, "overall_gen_ave": 94},
    "strand": "STEM"
}

def load_program_profiles():
    try:
        with open('ProgramProfiles.json', 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading program profiles: {e}")
        return {}
# --- Example Program Profiles (shortened, add more from your JSON) ---
program_profiles = load_program_profiles()

# --- Run Recommendation ---
results = {}
for program, profile in program_profiles.items():
    total, breakdown = calculate_alignment(student_example, profile)
    results[program] = {"score": total, "breakdown": breakdown}

# Separate track-aligned vs cross-track
track_aligned = {p: d for p, d in results.items()
                 if student_example["strand"] in program_profiles[p]["track_preferences"]
                 and program_profiles[p]["track_preferences"][student_example["strand"]] >= 80}

cross_track = {p: d for p, d in results.items() if p not in track_aligned}

# Sort and get top 5 from each
track_sorted = sorted(track_aligned.items(), key=lambda x: x[1]["score"], reverse=True)[:5]
cross_sorted = sorted(cross_track.items(), key=lambda x: x[1]["score"], reverse=True)[:5]

print("Top 5 Track-Aligned Programs:")
for prog, data in track_sorted:
    print(f"{prog}: {data['score']}% → Breakdown: {data['breakdown']}")

print("\nTop 5 Cross-Track Programs:")
for prog, data in cross_sorted:
    print(f"{prog}: {data['score']}% → Breakdown: {data['breakdown']}")
