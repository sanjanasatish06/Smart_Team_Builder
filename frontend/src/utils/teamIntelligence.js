/**
 * AI Team Intelligence derivation utility.
 * Strictly derives metrics, coverage, strengths, gaps, risks, and recommendations
 * from REAL backend response data (scores, breakdown, members, reasons) and project requirements.
 * No fabricated data.
 */

export function deriveTeamIntelligence(team, projectRequirements = null) {
  if (!team) return null;

  const members = team.members || [];
  const breakdown = team.score_breakdown || {};
  const reasons = team.reasons || [];
  const teamScore = Number(team.score || 0);

  // 1. Skill Collection
  const allTeamSkills = Array.from(
    new Set(
      members.flatMap((m) =>
        (m.skills || []).map((s) => s.trim())
      )
    )
  );

  const teamSkillsLower = new Set(allTeamSkills.map((s) => s.toLowerCase()));

  // Project skill requirements comparison
  const reqSkills = (projectRequirements?.required_skills || [])
    .map((s) => s.trim())
    .filter(Boolean);

  let matchedRequiredSkills = [];
  let missingRequiredSkills = [];
  let skillCoveragePct = Math.round(breakdown.skill_diversity || teamScore);

  if (reqSkills.length > 0) {
    matchedRequiredSkills = reqSkills.filter((req) =>
      teamSkillsLower.has(req.toLowerCase())
    );
    missingRequiredSkills = reqSkills.filter(
      (req) => !teamSkillsLower.has(req.toLowerCase())
    );
    skillCoveragePct = Math.round(
      (matchedRequiredSkills.length / reqSkills.length) * 100
    );
  }

  // 2. Role Analysis
  const assignedRoles = members.map((m) => m.role || m.preferred_role || "Unassigned");
  const uniqueRoles = Array.from(new Set(assignedRoles.map((r) => r.toLowerCase())));
  const roleCounts = {};
  assignedRoles.forEach((role) => {
    const formatted = role.charAt(0).toUpperCase() + role.slice(1);
    roleCounts[formatted] = (roleCounts[formatted] || 0) + 1;
  });

  const preferredRolesReq = (projectRequirements?.preferred_roles || [])
    .map((r) => r.trim())
    .filter(Boolean);

  let coveredPreferredRoles = [];
  let missingPreferredRoles = [];
  if (preferredRolesReq.length > 0) {
    coveredPreferredRoles = preferredRolesReq.filter((req) =>
      uniqueRoles.includes(req.toLowerCase())
    );
    missingPreferredRoles = preferredRolesReq.filter(
      (req) => !uniqueRoles.includes(req.toLowerCase())
    );
  }

  // 3. Experience Spread
  const expCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  members.forEach((m) => {
    const exp = (m.experience || "").toLowerCase();
    if (exp === "beginner") expCounts.Beginner += 1;
    else if (exp === "advanced") expCounts.Advanced += 1;
    else expCounts.Intermediate += 1;
  });

  // 4. Strengths (Derived from high-scoring breakdown metrics >= 75%)
  const strengths = [];
  if (breakdown.skill_diversity >= 75) {
    strengths.push({
      title: "Complementary Skill Diversity",
      detail: `Diversity score ${breakdown.skill_diversity}%. Broad toolset minimizing single-domain bottlenecks.`,
    });
  }
  if (breakdown.role_coverage >= 75) {
    strengths.push({
      title: "Strong Role Breadth",
      detail: `Role coverage score ${breakdown.role_coverage}%. Distinct capabilities across UI, logic, and data.`,
    });
  }
  if (breakdown.experience_balance >= 75) {
    strengths.push({
      title: "Balanced Seniority Distribution",
      detail: `Balance score ${breakdown.experience_balance}%. Mix of experienced mentors (${expCounts.Advanced}) and agile builders.`,
    });
  }
  if (breakdown.interest_compatibility >= 60) {
    strengths.push({
      title: "High Interest Synergy",
      detail: `Interest alignment ${breakdown.interest_compatibility}%. Overlapping enthusiasm for shared hackathon domains.`,
    });
  }
  if (breakdown.preference_satisfaction >= 80) {
    strengths.push({
      title: "High Role Preference Satisfaction",
      detail: `Satisfaction score ${breakdown.preference_satisfaction}%. Members are operating in their preferred domains.`,
    });
  }

  // Fallback strength if none exceeded 75
  if (strengths.length === 0 && reasons.length > 0) {
    strengths.push({
      title: "Algorithm Core Synergy",
      detail: reasons[0],
    });
  }

  // 5. Gaps & Risks (Derived from low metrics < 50% or missing requirements)
  const risksAndGaps = [];
  if (missingRequiredSkills.length > 0) {
    risksAndGaps.push({
      title: "Uncovered Project Skills",
      detail: `Project requires [${missingRequiredSkills.join(", ")}], but no member currently lists them.`,
      severity: "medium",
    });
  }

  if (missingPreferredRoles.length > 0) {
    risksAndGaps.push({
      title: "Desired Role Not Filled",
      detail: `Desired project roles not present in this group: ${missingPreferredRoles.join(", ")}.`,
      severity: "low",
    });
  }

  if (breakdown.experience_balance < 50) {
    risksAndGaps.push({
      title: "Experience Skew",
      detail: `Experience balance is ${breakdown.experience_balance}%. One experience tier dominates the team.`,
      severity: "medium",
    });
  }

  if (breakdown.preference_satisfaction < 60) {
    risksAndGaps.push({
      title: "Role Adaptation Required",
      detail: `Preference score is ${breakdown.preference_satisfaction}%. Some members accepted alternative roles to maximize team coverage.`,
      severity: "low",
    });
  }

  if (breakdown.interest_compatibility < 40) {
    risksAndGaps.push({
      title: "Diverse Project Interests",
      detail: `Interest compatibility is ${breakdown.interest_compatibility}%. Encourage a kickoff alignment on project vision.`,
      severity: "low",
    });
  }

  // 6. Tactical Recommendations
  const recommendations = [];
  const advancedMembers = members.filter(
    (m) => (m.experience || "").toLowerCase() === "advanced"
  );
  const beginnerMembers = members.filter(
    (m) => (m.experience || "").toLowerCase() === "beginner"
  );

  if (advancedMembers.length > 0 && beginnerMembers.length > 0) {
    recommendations.push(
      `Pair senior member ${advancedMembers[0].name} with ${beginnerMembers[0].name} for rapid architecture setup and early code reviews.`
    );
  } else if (advancedMembers.length > 0) {
    recommendations.push(
      `Designate ${advancedMembers[0].name} (${advancedMembers[0].role}) as technical lead for system architecture and sprint planning.`
    );
  }

  if (missingRequiredSkills.length > 0) {
    recommendations.push(
      `Leverage rapid libraries or APIs to compensate for lack of in-house ${missingRequiredSkills[0]} expertise.`
    );
  }

  if (breakdown.preference_satisfaction < 100) {
    recommendations.push(
      "Conduct a quick 5-minute kickoff sync to align members on secondary responsibilities and shared ownership."
    );
  }

  // 7. Team Readiness Calculation
  let compositeReadinessScore = teamScore;
  if (reqSkills.length > 0) {
    compositeReadinessScore = Math.round(teamScore * 0.6 + skillCoveragePct * 0.4);
  }

  let readinessLevel;
  let readinessColor;
  if (compositeReadinessScore >= 85) {
    readinessLevel = "Elite Hackathon Readiness (Tier 1)";
    readinessColor = "#5F8A62";
  } else if (compositeReadinessScore >= 70) {
    readinessLevel = "Strong Contender (Tier 2)";
    readinessColor = "#7F9163";
  } else {
    readinessLevel = "Needs Alignment (Tier 3)";
    readinessColor = "#B98545";
  }

  return {
    teamId: team.team_id,
    teamName: team.team_name,
    teamScore,
    compositeReadinessScore,
    readinessLevel,
    readinessColor,
    allTeamSkills,
    skillCoveragePct,
    matchedRequiredSkills,
    missingRequiredSkills,
    roleCounts,
    coveredPreferredRoles,
    missingPreferredRoles,
    expCounts,
    strengths,
    risksAndGaps,
    recommendations,
    breakdown,
    reasons,
  };
}
