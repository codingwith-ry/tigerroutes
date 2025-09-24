# -------------------------------
# TigerRoutes AI Scoring Engine
# -------------------------------

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

# --- Example Program Profiles (shortened, add more from your JSON) ---
program_profiles = {
    "BS Computer Science": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.15, "ideal_range": [60, 90]},
            "Investigative": {"weight": 0.30, "ideal_range": [70, 95]},
            "Artistic": {"weight": 0.05, "ideal_range": [40, 80]},
            "Social": {"weight": 0.05, "ideal_range": [40, 70]},
            "Enterprising": {"weight": 0.10, "ideal_range": [50, 80]},
            "Conventional": {"weight": 0.35, "ideal_range": [60, 90]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [65, 95]},
            "Conscientiousness": {"weight": 0.30, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.05, "ideal_range": [30, 70]},
            "Agreeableness": {"weight": 0.10, "ideal_range": [40, 80]},
            "Neuroticism": {"weight": 0.30, "ideal_range": [10, 40]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.40, "minimum": 85},
            "science_performance": {"weight": 0.30, "minimum": 80},
            "english_performance": {"weight": 0.10, "minimum": 75},
            "overall_gen_ave": {"weight": 0.20, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 70, "GAS-HA": 60, "HUMSS": 50, "MAD": 40, "PE/Sports": 30
        }
    },

    "BS Nursing": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.10, "ideal_range": [55, 80]},
            "Investigative": {"weight": 0.20, "ideal_range": [60, 85]},
            "Artistic": {"weight": 0.05, "ideal_range": [40, 75]},
            "Social": {"weight": 0.35, "ideal_range": [70, 95]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 80]},
            "Conventional": {"weight": 0.20, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Conscientiousness": {"weight": 0.30, "ideal_range": [65, 90]},
            "Extraversion": {"weight": 0.15, "ideal_range": [50, 85]},
            "Agreeableness": {"weight": 0.25, "ideal_range": [70, 95]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.20, "minimum": 80},
            "science_performance": {"weight": 0.40, "minimum": 83},
            "english_performance": {"weight": 0.20, "minimum": 80},
            "overall_gen_ave": {"weight": 0.20, "minimum": 83}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 60, "GAS-HA": 80, "HUMSS": 70, "MAD": 40, "PE/Sports": 60
        }
    },

    "BS Psychology": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.10, "ideal_range": [50, 75]},
            "Investigative": {"weight": 0.25, "ideal_range": [65, 90]},
            "Artistic": {"weight": 0.15, "ideal_range": [55, 85]},
            "Social": {"weight": 0.30, "ideal_range": [70, 95]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 80]},
            "Conventional": {"weight": 0.10, "ideal_range": [55, 80]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [65, 90]},
            "Conscientiousness": {"weight": 0.20, "ideal_range": [60, 85]},
            "Extraversion": {"weight": 0.20, "ideal_range": [60, 85]},
            "Agreeableness": {"weight": 0.25, "ideal_range": [70, 95]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.10, "minimum": 75},
            "science_performance": {"weight": 0.30, "minimum": 80},
            "english_performance": {"weight": 0.30, "minimum": 83},
            "overall_gen_ave": {"weight": 0.30, "minimum": 83}
        },
        "track_preferences": {
            "STEM": 70, "ABM": 60, "GAS-HA": 80, "HUMSS": 100, "MAD": 60, "PE/Sports": 50
        }
    },

    "BS Accountancy": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Investigative": {"weight": 0.15, "ideal_range": [60, 85]},
            "Artistic": {"weight": 0.05, "ideal_range": [40, 75]},
            "Social": {"weight": 0.10, "ideal_range": [50, 75]},
            "Enterprising": {"weight": 0.25, "ideal_range": [65, 90]},
            "Conventional": {"weight": 0.35, "ideal_range": [70, 95]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.15, "ideal_range": [55, 80]},
            "Conscientiousness": {"weight": 0.40, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 75]},
            "Agreeableness": {"weight": 0.20, "ideal_range": [60, 85]},
            "Neuroticism": {"weight": 0.15, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.40, "minimum": 85},
            "science_performance": {"weight": 0.10, "minimum": 80},
            "english_performance": {"weight": 0.20, "minimum": 80},
            "overall_gen_ave": {"weight": 0.30, "minimum": 85}
        },
        "track_preferences": {
            "STEM": 80, "ABM": 100, "GAS-HA": 70, "HUMSS": 60, "MAD": 40, "PE/Sports": 50
        }
    },

    "BS Architecture": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.20, "ideal_range": [60, 90]},
            "Investigative": {"weight": 0.20, "ideal_range": [60, 85]},
            "Artistic": {"weight": 0.40, "ideal_range": [70, 100]},
            "Social": {"weight": 0.05, "ideal_range": [40, 75]},
            "Enterprising": {"weight": 0.05, "ideal_range": [50, 75]},
            "Conventional": {"weight": 0.10, "ideal_range": [55, 80]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.40, "ideal_range": [70, 100]},
            "Conscientiousness": {"weight": 0.30, "ideal_range": [65, 90]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 80]},
            "Agreeableness": {"weight": 0.10, "ideal_range": [40, 80]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.30, "minimum": 85},
            "science_performance": {"weight": 0.30, "minimum": 82},
            "english_performance": {"weight": 0.20, "minimum": 80},
            "overall_gen_ave": {"weight": 0.20, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 70, "GAS-HA": 60, "HUMSS": 60, "MAD": 90, "PE/Sports": 40
        }
    },
        "BS Civil Engineering": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.35, "ideal_range": [70, 95]},
            "Investigative": {"weight": 0.25, "ideal_range": [65, 90]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 75]},
            "Social": {"weight": 0.05, "ideal_range": [40, 70]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 85]},
            "Conventional": {"weight": 0.15, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [60, 90]},
            "Conscientiousness": {"weight": 0.35, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 75]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [50, 80]},
            "Neuroticism": {"weight": 0.15, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.40, "minimum": 85},
            "science_performance": {"weight": 0.40, "minimum": 83},
            "english_performance": {"weight": 0.10, "minimum": 75},
            "overall_gen_ave": {"weight": 0.10, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 70, "GAS-HA": 60, "HUMSS": 50, "MAD": 40, "PE/Sports": 50
        }
    },

    "BS Mechanical Engineering": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.40, "ideal_range": [70, 95]},
            "Investigative": {"weight": 0.30, "ideal_range": [65, 90]},
            "Artistic": {"weight": 0.05, "ideal_range": [40, 70]},
            "Social": {"weight": 0.05, "ideal_range": [40, 65]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 80]},
            "Conventional": {"weight": 0.10, "ideal_range": [55, 80]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Conscientiousness": {"weight": 0.35, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 70]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [50, 80]},
            "Neuroticism": {"weight": 0.20, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.50, "minimum": 85},
            "science_performance": {"weight": 0.30, "minimum": 82},
            "english_performance": {"weight": 0.10, "minimum": 75},
            "overall_gen_ave": {"weight": 0.10, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 60, "GAS-HA": 60, "HUMSS": 50, "MAD": 40, "PE/Sports": 40
        }
    },

    "BS Biology": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.15, "ideal_range": [55, 85]},
            "Investigative": {"weight": 0.35, "ideal_range": [70, 95]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Social": {"weight": 0.15, "ideal_range": [55, 85]},
            "Enterprising": {"weight": 0.10, "ideal_range": [50, 80]},
            "Conventional": {"weight": 0.15, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.30, "ideal_range": [65, 95]},
            "Conscientiousness": {"weight": 0.25, "ideal_range": [65, 90]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 70]},
            "Agreeableness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Neuroticism": {"weight": 0.15, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.20, "minimum": 80},
            "science_performance": {"weight": 0.50, "minimum": 85},
            "english_performance": {"weight": 0.10, "minimum": 78},
            "overall_gen_ave": {"weight": 0.20, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 50, "GAS-HA": 80, "HUMSS": 70, "MAD": 40, "PE/Sports": 60
        }
    },

    "BS Pharmacy": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.15, "ideal_range": [60, 85]},
            "Investigative": {"weight": 0.35, "ideal_range": [70, 95]},
            "Artistic": {"weight": 0.05, "ideal_range": [40, 70]},
            "Social": {"weight": 0.15, "ideal_range": [55, 85]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 80]},
            "Conventional": {"weight": 0.20, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.30, "ideal_range": [60, 90]},
            "Conscientiousness": {"weight": 0.35, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 70]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [55, 85]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.25, "minimum": 82},
            "science_performance": {"weight": 0.45, "minimum": 85},
            "english_performance": {"weight": 0.10, "minimum": 78},
            "overall_gen_ave": {"weight": 0.20, "minimum": 83}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 50, "GAS-HA": 60, "HUMSS": 60, "MAD": 40, "PE/Sports": 50
        }
    },

    "BS Education": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.05, "ideal_range": [40, 70]},
            "Investigative": {"weight": 0.10, "ideal_range": [50, 80]},
            "Artistic": {"weight": 0.15, "ideal_range": [55, 85]},
            "Social": {"weight": 0.35, "ideal_range": [70, 95]},
            "Enterprising": {"weight": 0.15, "ideal_range": [60, 85]},
            "Conventional": {"weight": 0.20, "ideal_range": [60, 90]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [60, 90]},
            "Conscientiousness": {"weight": 0.25, "ideal_range": [65, 90]},
            "Extraversion": {"weight": 0.20, "ideal_range": [55, 90]},
            "Agreeableness": {"weight": 0.25, "ideal_range": [70, 95]},
            "Neuroticism": {"weight": 0.05, "ideal_range": [10, 40]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.15, "minimum": 75},
            "science_performance": {"weight": 0.15, "minimum": 75},
            "english_performance": {"weight": 0.40, "minimum": 80},
            "overall_gen_ave": {"weight": 0.30, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 60, "ABM": 70, "GAS-HA": 80, "HUMSS": 100, "MAD": 90, "PE/Sports": 70
        }
    },

    "BS Fine Arts": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.05, "ideal_range": [40, 65]},
            "Investigative": {"weight": 0.10, "ideal_range": [50, 75]},
            "Artistic": {"weight": 0.45, "ideal_range": [70, 100]},
            "Social": {"weight": 0.15, "ideal_range": [55, 85]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 80]},
            "Conventional": {"weight": 0.15, "ideal_range": [55, 80]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.40, "ideal_range": [70, 100]},
            "Conscientiousness": {"weight": 0.15, "ideal_range": [55, 80]},
            "Extraversion": {"weight": 0.20, "ideal_range": [55, 90]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [55, 85]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.10, "minimum": 70},
            "science_performance": {"weight": 0.10, "minimum": 70},
            "english_performance": {"weight": 0.40, "minimum": 80},
            "overall_gen_ave": {"weight": 0.40, "minimum": 80}
        },
        "track_preferences": {
            "STEM": 50, "ABM": 60, "GAS-HA": 70, "HUMSS": 80, "MAD": 100, "PE/Sports": 60
        }
    },
        "BS Political Science": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.05, "ideal_range": [40, 65]},
            "Investigative": {"weight": 0.25, "ideal_range": [65, 90]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Social": {"weight": 0.20, "ideal_range": [60, 90]},
            "Enterprising": {"weight": 0.25, "ideal_range": [65, 95]},
            "Conventional": {"weight": 0.15, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [65, 95]},
            "Conscientiousness": {"weight": 0.20, "ideal_range": [60, 85]},
            "Extraversion": {"weight": 0.25, "ideal_range": [65, 95]},
            "Agreeableness": {"weight": 0.20, "ideal_range": [60, 85]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.10, "minimum": 75},
            "science_performance": {"weight": 0.10, "minimum": 75},
            "english_performance": {"weight": 0.50, "minimum": 85},
            "overall_gen_ave": {"weight": 0.30, "minimum": 83}
        },
        "track_preferences": {
            "STEM": 60, "ABM": 70, "GAS-HA": 80, "HUMSS": 100, "MAD": 60, "PE/Sports": 50
        }
    },

    "BS Tourism Management": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.05, "ideal_range": [40, 70]},
            "Investigative": {"weight": 0.05, "ideal_range": [40, 70]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Social": {"weight": 0.30, "ideal_range": [65, 95]},
            "Enterprising": {"weight": 0.35, "ideal_range": [70, 95]},
            "Conventional": {"weight": 0.15, "ideal_range": [55, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Conscientiousness": {"weight": 0.20, "ideal_range": [60, 85]},
            "Extraversion": {"weight": 0.35, "ideal_range": [70, 100]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [65, 95]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.10, "minimum": 75},
            "science_performance": {"weight": 0.10, "minimum": 75},
            "english_performance": {"weight": 0.30, "minimum": 80},
            "overall_gen_ave": {"weight": 0.50, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 60, "ABM": 100, "GAS-HA": 70, "HUMSS": 80, "MAD": 60, "PE/Sports": 70
        }
    },

    "BS Hospitality Management": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.10, "ideal_range": [50, 75]},
            "Investigative": {"weight": 0.10, "ideal_range": [50, 75]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Social": {"weight": 0.30, "ideal_range": [65, 95]},
            "Enterprising": {"weight": 0.30, "ideal_range": [65, 95]},
            "Conventional": {"weight": 0.10, "ideal_range": [55, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Conscientiousness": {"weight": 0.25, "ideal_range": [60, 85]},
            "Extraversion": {"weight": 0.30, "ideal_range": [70, 100]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [65, 95]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.15, "minimum": 75},
            "science_performance": {"weight": 0.10, "minimum": 75},
            "english_performance": {"weight": 0.35, "minimum": 80},
            "overall_gen_ave": {"weight": 0.40, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 60, "ABM": 100, "GAS-HA": 70, "HUMSS": 80, "MAD": 70, "PE/Sports": 80
        }
    },

    "BS Information Systems": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.15, "ideal_range": [55, 85]},
            "Investigative": {"weight": 0.30, "ideal_range": [65, 90]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 80]},
            "Social": {"weight": 0.10, "ideal_range": [50, 75]},
            "Enterprising": {"weight": 0.20, "ideal_range": [60, 85]},
            "Conventional": {"weight": 0.15, "ideal_range": [60, 85]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.25, "ideal_range": [65, 95]},
            "Conscientiousness": {"weight": 0.30, "ideal_range": [70, 95]},
            "Extraversion": {"weight": 0.10, "ideal_range": [40, 70]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [55, 85]},
            "Neuroticism": {"weight": 0.20, "ideal_range": [10, 45]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.35, "minimum": 83},
            "science_performance": {"weight": 0.25, "minimum": 80},
            "english_performance": {"weight": 0.20, "minimum": 80},
            "overall_gen_ave": {"weight": 0.20, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 100, "ABM": 80, "GAS-HA": 70, "HUMSS": 60, "MAD": 50, "PE/Sports": 40
        }
    },

    "BS Sports Science": {
        "riasec_requirements": {
            "Realistic": {"weight": 0.30, "ideal_range": [65, 95]},
            "Investigative": {"weight": 0.15, "ideal_range": [50, 80]},
            "Artistic": {"weight": 0.10, "ideal_range": [50, 75]},
            "Social": {"weight": 0.20, "ideal_range": [60, 90]},
            "Enterprising": {"weight": 0.10, "ideal_range": [55, 85]},
            "Conventional": {"weight": 0.15, "ideal_range": [55, 80]}
        },
        "bigfive_requirements": {
            "Openness": {"weight": 0.20, "ideal_range": [55, 85]},
            "Conscientiousness": {"weight": 0.25, "ideal_range": [60, 90]},
            "Extraversion": {"weight": 0.30, "ideal_range": [70, 100]},
            "Agreeableness": {"weight": 0.15, "ideal_range": [60, 90]},
            "Neuroticism": {"weight": 0.10, "ideal_range": [10, 50]}
        },
        "academic_requirements": {
            "math_performance": {"weight": 0.20, "minimum": 75},
            "science_performance": {"weight": 0.30, "minimum": 80},
            "english_performance": {"weight": 0.20, "minimum": 80},
            "overall_gen_ave": {"weight": 0.30, "minimum": 82}
        },
        "track_preferences": {
            "STEM": 80, "ABM": 60, "GAS-HA": 70, "HUMSS": 60, "MAD": 80, "PE/Sports": 100
        }
    }
}


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
