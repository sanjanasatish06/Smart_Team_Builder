"""
SMART TEAM BUILDER
AI / Matching Algorithm Module

Person 3 - AI / Matching Algorithm

Pipeline:
    Student Profiles
        ↓
    Data Normalization
        ↓
    Matching / Scoring Engine
        ↓
    Initial Team Formation
        ↓
    Intelligent Role Assignment
        ↓
    Team Optimization
        ↓
    Explanation Generation
        ↓
    API-Ready JSON Output


SCORING WEIGHTS
----------------
Skill Diversity          : 30%
Role Coverage            : 25%
Experience Balance       : 20%
Interest Compatibility   : 15%
Preference Satisfaction  : 10%

Total                    : 100%
"""


# ============================================================
# 1. DATA NORMALIZATION
# ============================================================

def normalize_text(value):
    """Convert text into a consistent lowercase format."""

    if value is None:
        return ""

    return str(value).strip().lower()


def normalize_list(values):
    """Normalize a list of text values."""

    if not values:
        return []

    return [
        normalize_text(value)
        for value in values
        if value and normalize_text(value)
    ]


def normalize_participant(participant):
    """
    Convert participant data into a standard internal format.
    """

    return {
        "id": participant.get("id"),
        "name": participant.get(
            "name",
            "Unknown"
        ),
        "skills": normalize_list(
            participant.get(
                "skills",
                []
            )
        ),
        "experience": normalize_text(
            participant.get(
                "experience"
            )
        ),
        "interests": normalize_list(
            participant.get(
                "interests",
                []
            )
        ),
        "preferred_role": normalize_text(
            participant.get(
                "preferred_role"
            )
        ),
        "assigned_role": normalize_text(
            participant.get(
                "assigned_role"
            )
        )
    }


# ============================================================
# 2. ROLE DEFINITIONS
# ============================================================

ROLE_SKILLS = {

    "ai/ml engineer": [
        "python",
        "machine learning",
        "deep learning",
        "artificial intelligence",
        "ai",
        "tensorflow",
        "pytorch",
        "data science"
    ],

    "frontend developer": [
        "html",
        "css",
        "javascript",
        "react",
        "frontend",
        "ui",
        "ui/ux",
        "web development"
    ],

    "backend developer": [
        "python",
        "java",
        "node.js",
        "node",
        "django",
        "flask",
        "fastapi",
        "backend",
        "api",
        "sql"
    ],

    "database engineer": [
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "database",
        "dbms"
    ],

    "ui/ux designer": [
        "ui",
        "ux",
        "ui/ux",
        "figma",
        "design",
        "graphic design"
    ],

    "data analyst": [
        "python",
        "sql",
        "excel",
        "statistics",
        "data analysis",
        "data visualization",
        "data science"
    ],

    "devops engineer": [
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "cloud",
        "devops",
        "linux",
        "ci/cd"
    ],

    "cybersecurity engineer": [
        "cybersecurity",
        "security",
        "network security",
        "ethical hacking",
        "penetration testing",
        "cryptography"
    ],

    "mobile developer": [
        "android",
        "ios",
        "flutter",
        "react native",
        "mobile development",
        "kotlin",
        "swift"
    ],

    "project manager": [
        "leadership",
        "management",
        "project management",
        "communication",
        "planning"
    ],

    "researcher": [
        "research",
        "data science",
        "statistics",
        "machine learning",
        "analysis"
    ]
}


# ============================================================
# 3. ROLE NORMALIZATION
# ============================================================

def normalize_role(role):
    """Normalize common role names."""

    role = normalize_text(role)

    if not role:
        return ""

    aliases = {

        "ai engineer":
            "ai/ml engineer",

        "ml engineer":
            "ai/ml engineer",

        "machine learning engineer":
            "ai/ml engineer",

        "ai/ml":
            "ai/ml engineer",

        "frontend":
            "frontend developer",

        "front end":
            "frontend developer",

        "front-end developer":
            "frontend developer",

        "backend":
            "backend developer",

        "back end":
            "backend developer",

        "back-end developer":
            "backend developer",

        "ui designer":
            "ui/ux designer",

        "ux designer":
            "ui/ux designer",

        "designer":
            "ui/ux designer",

        "database developer":
            "database engineer",

        "db engineer":
            "database engineer",

        "data scientist":
            "data analyst",

        "devops":
            "devops engineer",

        "security engineer":
            "cybersecurity engineer",

        "cyber security engineer":
            "cybersecurity engineer",

        "android developer":
            "mobile developer",

        "ios developer":
            "mobile developer",

        "pm":
            "project manager"
    }

    return aliases.get(
        role,
        role
    )


# ============================================================
# 4. ROLE-SKILL MATCHING
# ============================================================

def calculate_role_skill_match(
    participant,
    role
):
    """
    Calculate how well participant skills
    match the selected role.
    """

    role = normalize_role(role)

    member = normalize_participant(
        participant
    )

    participant_skills = set(
        member["skills"]
    )

    required_skills = set(
        ROLE_SKILLS.get(
            role,
            []
        )
    )

    if (
        not participant_skills
        or not required_skills
    ):
        return 0.0

    matched_skills = (
        participant_skills
        & required_skills
    )

    score = (
        len(matched_skills)
        / len(required_skills)
    ) * 100

    return round(
        score,
        2
    )


# ============================================================
# 5. ROLE ASSIGNMENT SCORE
# ============================================================

def calculate_role_assignment_score(
    participant,
    role,
    used_roles=None
):
    """
    Calculate suitability of a participant
    for a particular role.

    Weight:
        Preference = 50%
        Skill      = 40%
        Uniqueness = 10%
    """

    if used_roles is None:
        used_roles = set()

    member = normalize_participant(
        participant
    )

    role = normalize_role(role)

    preferred_role = normalize_role(
        member["preferred_role"]
    )

    # Preference
    if (
        preferred_role
        and preferred_role == role
    ):
        preference_score = 100.0
    else:
        preference_score = 0.0

    # Skill match
    skill_score = calculate_role_skill_match(
        member,
        role
    )

    # Encourage different roles
    if role not in used_roles:
        uniqueness_score = 100.0
    else:
        uniqueness_score = 0.0

    final_score = (
        preference_score * 0.50
        + skill_score * 0.40
        + uniqueness_score * 0.10
    )

    return round(
        final_score,
        2
    )


# ============================================================
# 6. INTELLIGENT ROLE ASSIGNMENT
# ============================================================

def assign_roles(team):
    """
    Assign the most suitable role to every
    team member.
    """

    if not team:
        return []

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    available_roles = list(
        ROLE_SKILLS.keys()
    )

    # Include custom preferred roles
    for member in members:

        preferred_role = normalize_role(
            member["preferred_role"]
        )

        if (
            preferred_role
            and preferred_role not in available_roles
        ):
            available_roles.append(
                preferred_role
            )

    assigned_roles = set()

    # Members with preferences get processed first.
    members.sort(
        key=lambda member: (
            0
            if member["preferred_role"]
            else 1
        )
    )

    for member in members:

        best_role = ""
        best_score = -1

        preferred_role = normalize_role(
            member["preferred_role"]
        )

        candidate_roles = available_roles

        if preferred_role:

            candidate_roles = (
                [preferred_role]
                + [
                    role
                    for role in available_roles
                    if role != preferred_role
                ]
            )

        for role in candidate_roles:

            score = calculate_role_assignment_score(
                member,
                role,
                assigned_roles
            )

            if score > best_score:

                best_score = score
                best_role = role

        member["assigned_role"] = best_role

        if best_role:
            assigned_roles.add(
                best_role
            )

    return members


# ============================================================
# 7. SKILL DIVERSITY - 30%
# ============================================================

def calculate_skill_diversity(team):
    """
    Calculate how complementary the team members'
    skills are.

    Less skill overlap = higher diversity.
    """

    if len(team) < 2:
        return 0.0

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    pair_scores = []

    for i in range(
        len(members)
    ):

        for j in range(
            i + 1,
            len(members)
        ):

            skills_a = set(
                members[i]["skills"]
            )

            skills_b = set(
                members[j]["skills"]
            )

            union = (
                skills_a
                | skills_b
            )

            intersection = (
                skills_a
                & skills_b
            )

            if not union:
                similarity = 0.0
            else:
                similarity = (
                    len(intersection)
                    / len(union)
                )

            diversity = (
                1 - similarity
            )

            pair_scores.append(
                diversity
            )

    if not pair_scores:
        return 0.0

    score = (
        sum(pair_scores)
        / len(pair_scores)
    ) * 100

    return round(
        score,
        2
    )


# ============================================================
# 8. ROLE COVERAGE - 25%
# ============================================================

def calculate_role_coverage(team):
    """
    Calculate percentage of unique roles
    covered by the team.
    """

    if not team:
        return 0.0

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    roles = set()

    for member in members:

        role = (
            member["assigned_role"]
            or member["preferred_role"]
        )

        if role:

            roles.add(
                normalize_role(role)
            )

    score = (
        len(roles)
        / len(members)
    ) * 100

    return round(
        score,
        2
    )


# ============================================================
# 9. EXPERIENCE BALANCE - 20%
# ============================================================

EXPERIENCE_LEVELS = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3
}


def calculate_experience_balance(team):
    """
    Calculate experience diversity and balance.
    """

    if not team:
        return 0.0

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    experience_values = []

    for member in members:

        experience = member[
            "experience"
        ]

        if experience in EXPERIENCE_LEVELS:

            experience_values.append(
                EXPERIENCE_LEVELS[
                    experience
                ]
            )

    if not experience_values:
        return 0.0

    unique_levels = len(
        set(experience_values)
    )

    if unique_levels == 1:
        diversity_score = 40.0

    elif unique_levels == 2:
        diversity_score = 75.0

    else:
        diversity_score = 100.0

    counts = {}

    for value in experience_values:

        counts[value] = (
            counts.get(
                value,
                0
            ) + 1
        )

    largest_group = max(
        counts.values()
    )

    dominance = (
        largest_group
        / len(experience_values)
    )

    distribution_score = (
        1 - dominance
    ) * 100

    score = (
        diversity_score * 0.70
        + distribution_score * 0.30
    )

    return round(
        score,
        2
    )


# ============================================================
# 10. INTEREST COMPATIBILITY - 15%
# ============================================================

def calculate_interest_compatibility(team):
    """
    Calculate compatibility based on shared interests.
    """

    if len(team) < 2:
        return 0.0

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    pair_scores = []

    for i in range(
        len(members)
    ):

        for j in range(
            i + 1,
            len(members)
        ):

            interests_a = set(
                members[i]["interests"]
            )

            interests_b = set(
                members[j]["interests"]
            )

            union = (
                interests_a
                | interests_b
            )

            intersection = (
                interests_a
                & interests_b
            )

            if not union:
                similarity = 0.0

            else:
                similarity = (
                    len(intersection)
                    / len(union)
                )

            pair_scores.append(
                similarity
            )

    if not pair_scores:
        return 0.0

    score = (
        sum(pair_scores)
        / len(pair_scores)
    ) * 100

    return round(
        score,
        2
    )


# ============================================================
# 11. PREFERENCE SATISFACTION - 10%
# ============================================================

def calculate_preference_satisfaction(team):
    """
    Calculate how many members received
    their preferred roles.
    """

    if not team:
        return 0.0

    members = [
        normalize_participant(
            participant
        )
        for participant in team
    ]

    satisfaction_scores = []

    for member in members:

        preferred_role = normalize_role(
            member["preferred_role"]
        )

        assigned_role = normalize_role(
            member["assigned_role"]
        )

        # No preference = no penalty
        if not preferred_role:
            continue

        if (
            assigned_role
            == preferred_role
        ):

            satisfaction_scores.append(
                100.0
            )

        else:

            satisfaction_scores.append(
                0.0
            )

    if not satisfaction_scores:
        return 0.0

    score = (
        sum(satisfaction_scores)
        / len(satisfaction_scores)
    )

    return round(
        score,
        2
    )


# ============================================================
# 12. OVERALL TEAM SCORE
# ============================================================

def calculate_team_score(team):
    """
    Calculate weighted overall team score.
    """

    skill_diversity = (
        calculate_skill_diversity(
            team
        )
    )

    role_coverage = (
        calculate_role_coverage(
            team
        )
    )

    experience_balance = (
        calculate_experience_balance(
            team
        )
    )

    interest_compatibility = (
        calculate_interest_compatibility(
            team
        )
    )

    preference_satisfaction = (
        calculate_preference_satisfaction(
            team
        )
    )

    total_score = (

        skill_diversity * 0.30

        + role_coverage * 0.25

        + experience_balance * 0.20

        + interest_compatibility * 0.15

        + preference_satisfaction * 0.10
    )

    return {

        "score":
            round(
                total_score,
                2
            ),

        "score_breakdown": {

            "skill_diversity":
                skill_diversity,

            "role_coverage":
                role_coverage,

            "experience_balance":
                experience_balance,

            "interest_compatibility":
                interest_compatibility,

            "preference_satisfaction":
                preference_satisfaction
        }
    }


# ============================================================
# 13. TEAM SIZE CALCULATION
# ============================================================

def calculate_team_sizes(
    participant_count,
    team_size
):
    """
    Calculate balanced team sizes.

    Examples:

        6 participants, size 3
        -> [3, 3]

        7 participants, size 3
        -> [3, 2, 2]

        8 participants, size 3
        -> [3, 3, 2]

        10 participants, size 3
        -> [3, 3, 2, 2]
    """

    if participant_count <= 0:
        return []

    if team_size <= 0:
        raise ValueError(
            "team_size must be greater than 0"
        )

    team_count = (
        participant_count
        + team_size
        - 1
    ) // team_size

    base_size = (
        participant_count
        // team_count
    )

    remainder = (
        participant_count
        % team_count
    )

    sizes = []

    for index in range(
        team_count
    ):

        if index < remainder:

            sizes.append(
                base_size + 1
            )

        else:

            sizes.append(
                base_size
            )

    return sizes


# ============================================================
# 14. INITIAL TEAM FORMATION
# ============================================================

def generate_initial_teams(
    participants,
    team_size
):
    """
    Generate initial balanced teams.

    Every participant is included exactly once.
    """

    if not participants:
        return []

    if team_size <= 0:
        raise ValueError(
            "team_size must be greater than 0"
        )

    if team_size > len(
        participants
    ):
        raise ValueError(
            "team_size cannot be greater "
            "than the number of participants"
        )

    members = [
        normalize_participant(
            participant
        )
        for participant in participants
    ]

    team_sizes = calculate_team_sizes(
        len(members),
        team_size
    )

    team_count = len(
        team_sizes
    )

    teams = [
        []
        for _ in range(
            team_count
        )
    ]

    # Advanced first,
    # then intermediate,
    # then beginner.
    experience_order = {
        "advanced": 1,
        "intermediate": 2,
        "beginner": 3
    }

    members.sort(
        key=lambda member:
            experience_order.get(
                member["experience"],
                4
            )
    )

    # Distribute members.
    #
    # This uses the calculated capacities
    # so no team exceeds its target size.

    current_team = 0

    for member in members:

        # Find the next team with capacity.
        while (
            current_team < team_count
            and len(
                teams[current_team]
            ) >= team_sizes[current_team]
        ):

            current_team += 1

        if current_team >= team_count:
            break

        teams[current_team].append(
            member
        )

    return teams


# ============================================================
# 15. CONFIGURATION SCORE
# ============================================================

def calculate_configuration_score(
    teams
):
    """
    Calculate the average score across all teams.
    """

    if not teams:
        return 0.0

    total_score = 0.0

    for team in teams:

        assigned_team = assign_roles(
            team
        )

        result = calculate_team_score(
            assigned_team
        )

        total_score += result[
            "score"
        ]

    return round(
        total_score
        / len(teams),
        2
    )


# ============================================================
# 16. TEAM OPTIMIZATION
# ============================================================

def optimize_teams(
    teams,
    max_iterations=50
):
    """
    Improve team configuration using
    member swaps.

    A swap is accepted only if the
    overall configuration score improves.
    """

    if len(teams) < 2:
        return teams

    current_teams = [
        list(team)
        for team in teams
    ]

    current_score = (
        calculate_configuration_score(
            current_teams
        )
    )

    for _ in range(
        max_iterations
    ):

        best_score = current_score
        best_teams = None

        for i in range(
            len(current_teams)
        ):

            for j in range(
                i + 1,
                len(current_teams)
            ):

                team_a = current_teams[i]
                team_b = current_teams[j]

                for member_a_index in range(
                    len(team_a)
                ):

                    for member_b_index in range(
                        len(team_b)
                    ):

                        candidate_teams = [
                            list(team)
                            for team in current_teams
                        ]

                        (
                            candidate_teams[i][
                                member_a_index
                            ],
                            candidate_teams[j][
                                member_b_index
                            ]
                        ) = (
                            candidate_teams[j][
                                member_b_index
                            ],
                            candidate_teams[i][
                                member_a_index
                            ]
                        )

                        candidate_score = (
                            calculate_configuration_score(
                                candidate_teams
                            )
                        )

                        if (
                            candidate_score
                            > best_score
                        ):

                            best_score = (
                                candidate_score
                            )

                            best_teams = (
                                candidate_teams
                            )

        if best_teams is None:
            break

        current_teams = best_teams
        current_score = best_score

    return current_teams


# ============================================================
# 17. EXPLANATION GENERATION
# ============================================================

def generate_team_reasons(
    team,
    score_breakdown
):
    """
    Generate human-readable explanations
    based on actual scores.
    """

    reasons = []

    skill_score = score_breakdown.get(
        "skill_diversity",
        0
    )

    role_score = score_breakdown.get(
        "role_coverage",
        0
    )

    experience_score = score_breakdown.get(
        "experience_balance",
        0
    )

    interest_score = score_breakdown.get(
        "interest_compatibility",
        0
    )

    preference_score = score_breakdown.get(
        "preference_satisfaction",
        0
    )

    # --------------------------------------------------------
    # Skill diversity
    # --------------------------------------------------------

    if skill_score >= 80:

        reasons.append(
            "Strong skill diversity across team members."
        )

    elif skill_score >= 50:

        reasons.append(
            "Moderate skill diversity with some overlapping skills."
        )

    else:

        reasons.append(
            "Several members have overlapping skills."
        )

    # --------------------------------------------------------
    # Role coverage
    # --------------------------------------------------------

    if role_score >= 80:

        reasons.append(
            "Good coverage of different team roles."
        )

    elif role_score >= 50:

        reasons.append(
            "The team covers several important roles."
        )

    else:

        reasons.append(
            "Some team roles have overlapping responsibilities."
        )

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    if experience_score >= 80:

        reasons.append(
            "Balanced mix of experience levels."
        )

    elif experience_score >= 50:

        reasons.append(
            "The team contains a reasonable mix of experience."
        )

    else:

        reasons.append(
            "Experience levels are relatively similar."
        )

    # --------------------------------------------------------
    # Interests
    # --------------------------------------------------------

    if interest_score >= 70:

        reasons.append(
            "Members share several common interests."
        )

    elif interest_score >= 40:

        reasons.append(
            "Members have some overlapping interests."
        )

    else:

        reasons.append(
            "Members bring diverse interests to the team."
        )

    # --------------------------------------------------------
    # Preferences
    # --------------------------------------------------------

    if preference_score >= 80:

        reasons.append(
            "Most members received their preferred roles."
        )

    elif preference_score >= 50:

        reasons.append(
            "Several members received their preferred roles."
        )

    else:

        reasons.append(
            "Some members were assigned alternative roles "
            "to improve team coverage."
        )

    return reasons


# ============================================================
# 18. API-READY MEMBER OUTPUT
# ============================================================

def format_member_for_api(
    member
):
    """
    Convert internal participant data into
    clean API response format.
    """

    return {

        "id":
            member.get("id"),

        "name":
            member.get(
                "name",
                "Unknown"
            ),

        "skills":
            member.get(
                "skills",
                []
            ),

        "experience":
            member.get(
                "experience",
                ""
            ),

        "interests":
            member.get(
                "interests",
                []
            ),

        "preferred_role":
            member.get(
                "preferred_role",
                ""
            ),

        "role":
            member.get(
                "assigned_role",
                ""
            )
    }


# ============================================================
# 19. API-READY TEAM OUTPUT
# ============================================================

def format_team_for_api(
    team_id,
    team,
    score_result
):
    """
    Convert a team into the final API response format.
    """

    score_breakdown = (
        score_result[
            "score_breakdown"
        ]
    )

    reasons = generate_team_reasons(
        team,
        score_breakdown
    )

    return {

        "team_id":
            team_id,

        "team_name":
            f"Team {team_id}",

        "score":
            score_result["score"],

        "members": [
            format_member_for_api(
                member
            )
            for member in team
        ],

        "score_breakdown":
            score_breakdown,

        "reasons":
            reasons
    }


# ============================================================
# 20. FINAL API FUNCTION
# ============================================================

def generate_teams(
    participants,
    team_size
):
    """
    Main function used by the FastAPI backend.

    Input:
        participants = list of participant dictionaries
        team_size = desired maximum team size

    Output:
        API-ready dictionary containing teams,
        scores, explanations and metadata.
    """

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    if not participants:

        return {
            "success": False,
            "message": "No participants provided.",
            "teams": [],
            "total_participants": 0,
            "total_teams": 0
        }

    if team_size <= 0:

        raise ValueError(
            "team_size must be greater than 0"
        )

    if team_size > len(
        participants
    ):

        raise ValueError(
            "team_size cannot be greater "
            "than the number of participants"
        )

    # --------------------------------------------------------
    # Create initial teams
    # --------------------------------------------------------

    initial_teams = (
        generate_initial_teams(
            participants,
            team_size
        )
    )

    # --------------------------------------------------------
    # Optimize teams
    # --------------------------------------------------------

    optimized_teams = (
        optimize_teams(
            initial_teams
        )
    )

    # --------------------------------------------------------
    # Create final API response
    # --------------------------------------------------------

    final_teams = []

    for index, team in enumerate(
        optimized_teams
    ):

        # Assign roles after optimization.
        assigned_team = assign_roles(
            team
        )

        score_result = (
            calculate_team_score(
                assigned_team
            )
        )

        api_team = format_team_for_api(
            index + 1,
            assigned_team,
            score_result
        )

        final_teams.append(
            api_team
        )

    # --------------------------------------------------------
    # Calculate overall configuration score
    # --------------------------------------------------------

    if final_teams:

        overall_score = round(
            sum(
                team["score"]
                for team in final_teams
            )
            / len(final_teams),
            2
        )

    else:

        overall_score = 0.0

    # --------------------------------------------------------
    # Return final API-ready structure
    # --------------------------------------------------------

    return {

        "success":
            True,

        "message":
            "Teams generated successfully.",

        "total_participants":
            len(participants),

        "total_teams":
            len(final_teams),

        "team_size":
            team_size,

        "overall_score":
            overall_score,

        "teams":
            final_teams
    }


# ============================================================
# 21. EDGE-CASE VALIDATION
# ============================================================

def validate_team_configuration(
    teams,
    expected_participant_count
):
    """
    Validate the final team configuration.

    Checks:
        - No missing participants
        - No duplicate participants
        - Correct total count
        - No empty teams
    """

    if not teams:

        return {
            "valid": False,
            "message": "No teams generated."
        }

    participant_ids = []

    for team in teams:

        if not team:

            return {
                "valid": False,
                "message": "Empty team detected."
            }

        for member in team:

            participant_ids.append(
                member.get("id")
            )

    # --------------------------------------------------------
    # Check count
    # --------------------------------------------------------

    if len(
        participant_ids
    ) != expected_participant_count:

        return {
            "valid": False,
            "message":
                "Participant count mismatch."
        }

    # --------------------------------------------------------
    # Check duplicates
    # --------------------------------------------------------

    if len(
        set(participant_ids)
    ) != len(participant_ids):

        return {
            "valid": False,
            "message":
                "Duplicate participant detected."
        }

    # --------------------------------------------------------
    # Everything valid
    # --------------------------------------------------------

    return {
        "valid": True,
        "message":
            "Every participant is included exactly once."
    }


# ============================================================
# 22. TEST DATA
# ============================================================

TEST_PARTICIPANTS = [

    {
        "id": 1,
        "name": "Alice",
        "skills": [
            "Python",
            "Machine Learning"
        ],
        "experience": "Advanced",
        "interests": [
            "AI",
            "Robotics"
        ],
        "preferred_role":
            "AI/ML Engineer"
    },

    {
        "id": 2,
        "name": "Bob",
        "skills": [
            "React",
            "UI/UX"
        ],
        "experience": "Intermediate",
        "interests": [
            "AI",
            "Design"
        ],
        "preferred_role":
            "Frontend Developer"
    },

    {
        "id": 3,
        "name": "Charlie",
        "skills": [
            "SQL",
            "Backend"
        ],
        "experience": "Beginner",
        "interests": [
            "AI",
            "Data Science"
        ],
        "preferred_role":
            "Backend Developer"
    },

    {
        "id": 4,
        "name": "David",
        "skills": [
            "Figma",
            "UI/UX"
        ],
        "experience": "Intermediate",
        "interests": [
            "Design",
            "Art"
        ],
        "preferred_role":
            "UI/UX Designer"
    },

    {
        "id": 5,
        "name": "Emma",
        "skills": [
            "Docker",
            "AWS",
            "Linux"
        ],
        "experience": "Advanced",
        "interests": [
            "Cloud",
            "Technology"
        ],
        "preferred_role":
            "DevOps Engineer"
    },

    {
        "id": 6,
        "name": "Frank",
        "skills": [
            "SQL",
            "Statistics",
            "Python"
        ],
        "experience": "Beginner",
        "interests": [
            "Data",
            "AI"
        ],
        "preferred_role":
            "Data Analyst"
    },

    {
        "id": 7,
        "name": "Grace",
        "skills": [
            "JavaScript",
            "HTML",
            "CSS"
        ],
        "experience": "Intermediate",
        "interests": [
            "Web",
            "Design"
        ],
        "preferred_role":
            "Frontend Developer"
    }
]


# ============================================================
# 23. TESTING
# ============================================================

if __name__ == "__main__":

    print(
        "\n========================================"
    )

    print(
        "       SMART TEAM BUILDER TEST"
    )

    print(
        "========================================"
    )

    participants = TEST_PARTICIPANTS

    team_size = 3

    # --------------------------------------------------------
    # Test 1: Team size calculation
    # --------------------------------------------------------

    print(
        "\n[TEST 1] Team Size Calculation"
    )

    calculated_sizes = (
        calculate_team_sizes(
            len(participants),
            team_size
        )
    )

    print(
        "Participants:",
        len(participants)
    )

    print(
        "Requested Team Size:",
        team_size
    )

    print(
        "Calculated Team Sizes:",
        calculated_sizes
    )

    # --------------------------------------------------------
    # Test 2: Generate teams
    # --------------------------------------------------------

    print(
        "\n[TEST 2] Team Generation"
    )

    result = generate_teams(
        participants,
        team_size
    )

    # --------------------------------------------------------
    # Test 3: Display API response
    # --------------------------------------------------------

    print(
        "\n[TEST 3] API-Ready Team Output"
    )

    for team in result["teams"]:

        print(
            "\n----------------------------------------"
        )

        print(
            team["team_name"]
        )

        print(
            "Team Score:",
            team["score"]
        )

        print(
            "Members:"
        )

        for member in team[
            "members"
        ]:

            print(
                f"  {member['name']}"
                f" -> {member['role']}"
            )

        print(
            "\nScore Breakdown:"
        )

        for category, score in team[
            "score_breakdown"
        ].items():

            print(
                f"  {category}: {score}"
            )

        print(
            "\nReasons:"
        )

        for reason in team[
            "reasons"
        ]:

            print(
                f"  - {reason}"
            )

    # --------------------------------------------------------
    # Test 4: Configuration validation
    # --------------------------------------------------------

    print(
        "\n[TEST 4] Configuration Validation"
    )

    raw_teams = [
        team["members"]
        for team in result["teams"]
    ]

    validation = (
        validate_team_configuration(
            raw_teams,
            len(participants)
        )
    )

    print(
        "Validation:",
        validation["message"]
    )

    # --------------------------------------------------------
    # Test 5: Final summary
    # --------------------------------------------------------

    print(
        "\n[TEST 5] Final Summary"
    )

    print(
        "Success:",
        result["success"]
    )

    print(
        "Total Participants:",
        result["total_participants"]
    )

    print(
        "Total Teams:",
        result["total_teams"]
    )

    print(
        "Overall Configuration Score:",
        result["overall_score"]
    )

    # --------------------------------------------------------
    # Test 6: Edge Cases
    # --------------------------------------------------------

    print(
        "\n[TEST 6] Edge Case Testing"
    )

    edge_cases = [
        (1, 1),
        (2, 2),
        (5, 2),
        (7, 3),
        (8, 3),
        (10, 3)
    ]

    for participant_count, size in edge_cases:

        sizes = calculate_team_sizes(
            participant_count,
            size
        )

        total = sum(sizes)

        valid = (
            total
            == participant_count
        )

        print(
            f"  {participant_count} "
            f"participants / "
            f"team size {size} "
            f"-> {sizes} "
            f"-> {'PASS' if valid else 'FAIL'}"
        )

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    print(
        "\n========================================"
    )

    if (
        result["success"]
        and validation["valid"]
    ):

        print(
            "✓ ALL CORE TESTS PASSED"
        )

    else:

        print(
            "✗ SOME TESTS FAILED"
        )

    print(
        "========================================\n"
    )
