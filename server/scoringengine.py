# -------------------------------
# TigerRoutes AI Scoring Engine
# -------------------------------

def calculate_alignment(student_data, program_data):
    """Calculate alignment score for a program based on fixed 40-30-20-10 formula."""

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
    track_final = track_pref  # already scaled 0–100

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
    "riasec": {"Investigative": 85, "Realistic": 70, "Conventional": 60,
               "Artistic": 50, "Social": 65, "Enterprising": 55},
    "bigfive": {"Openness": 80, "Conscientiousness": 85, "Extraversion": 60,
                "Agreeableness": 70, "Neuroticism": 30},
    "grades": {"math_performance": 88, "science_performance": 82,
               "english_performance": 85, "overall_gen_ave": 86},
    "strand": "STEM"
}

# --- Example Program Profile (BS Computer Science only, you can add more) ---
program_profiles = {
    "BS Computer Science": {
        "riasec_requirements": {
            "Investigative": {"weight": 0.4, "ideal_range": [70, 95]},
            "Realistic": {"weight": 0.3, "ideal_range": [60, 90]},
            "Conventional": {"weight": 0.2, "ideal_range": [50, 80]},
            "Artistic": {"weight": 0.1, "ideal_range": [40, 100]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.3, "ideal_range": [60, 95]},
            "Conscientiousness": {"weight": 0.3, "ideal_range": [65, 95]},
            "Extraversion": {"weight": 0.1, "ideal_range": [30, 100]},
            "Agreeableness": {"weight": 0.1, "ideal_range": [40, 100]},
            "Neuroticism": {"weight": 0.2, "ideal_range": [10, 40]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.5, "minimum": 85},
            "science_performance": {"weight": 0.3, "minimum": 80},
            "overall_gen_ave": {"weight": 0.2, "minimum": 82}
        },
        "track_preferences": {"STEM": 100, "ABM": 60, "HUMSS": 40}
    },
    "BS Accountancy": {
        "riasec_requirements": {
            "Conventional": {"weight": 0.5, "ideal_range": [70, 95]},
            "Investigative": {"weight": 0.2, "ideal_range": [60, 85]},
            "Enterprising": {"weight": 0.3, "ideal_range": [65, 90]}
        },
        "bigfive_requirements": {
            "Conscientiousness": {"weight": 0.5, "ideal_range": [70, 95]},
            "Openness": {"weight": 0.2, "ideal_range": [50, 80]},
            "Agreeableness": {"weight": 0.2, "ideal_range": [50, 85]},
            "Neuroticism": {"weight": 0.1, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.4, "minimum": 85},
            "overall_gen_ave": {"weight": 0.6, "minimum": 85}
        },
        "track_preferences": {"ABM": 100, "STEM": 80, "HUMSS": 50}
    },
    "BS Psychology": {
        "riasec_requirements": {
            "Social": {"weight": 0.4, "ideal_range": [70, 95]},
            "Investigative": {"weight": 0.3, "ideal_range": [60, 90]},
            "Artistic": {"weight": 0.3, "ideal_range": [50, 85]}
        },
        "bigfive_requirements": {
            "Agreeableness": {"weight": 0.3, "ideal_range": [65, 95]},
            "Openness": {"weight": 0.3, "ideal_range": [60, 95]},
            "Extraversion": {"weight": 0.2, "ideal_range": [50, 90]},
            "Conscientiousness": {"weight": 0.2, "ideal_range": [55, 85]}
        },
        "academic_requirements": {
            "science_performance": {"weight": 0.5, "minimum": 80},
            "overall_gen_ave": {"weight": 0.5, "minimum": 82}
        },
        "track_preferences": {"HUMSS": 100, "STEM": 70, "ABM": 50}
    },
    "BS Hospitality Management": {
        "riasec_requirements": {
            "Enterprising": {"weight": 0.4, "ideal_range": [65, 95]},
            "Social": {"weight": 0.4, "ideal_range": [70, 95]},
            "Conventional": {"weight": 0.2, "ideal_range": [50, 80]}
        },
        "bigfive_requirements": {
            "Extraversion": {"weight": 0.4, "ideal_range": [70, 100]},
            "Agreeableness": {"weight": 0.3, "ideal_range": [60, 95]},
            "Conscientiousness": {"weight": 0.3, "ideal_range": [55, 85]}
        },
        "academic_requirements": {
            "overall_gen_ave": {"weight": 1.0, "minimum": 80}
        },
        "track_preferences": {"ABM": 100, "HUMSS": 80, "STEM": 60}
    },
    "BS Architecture": {
        "riasec_requirements": {
            "Artistic": {"weight": 0.5, "ideal_range": [70, 100]},
            "Investigative": {"weight": 0.3, "ideal_range": [60, 85]},
            "Realistic": {"weight": 0.2, "ideal_range": [55, 90]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.5, "ideal_range": [70, 100]},
            "Conscientiousness": {"weight": 0.3, "ideal_range": [65, 95]},
            "Extraversion": {"weight": 0.2, "ideal_range": [40, 90]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.4, "minimum": 85},
            "science_performance": {"weight": 0.3, "minimum": 80},
            "overall_gen_ave": {"weight": 0.3, "minimum": 82}
        },
        "track_preferences": {"STEM": 100, "ABM": 70, "HUMSS": 60}
    }
}

# --- Run ---
for program, profile in program_profiles.items():
    total, breakdown = calculate_alignment(student_example, profile)
    print(f"{program}: {total}% match → Breakdown: {breakdown}")
