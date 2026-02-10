import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function scoreJobs(
  jobs: { id: string; title: string; description: string; skills: string[]; budget: string }[],
  profile: { name: string; skills: string[]; hourlyRate: string; experience: string; categories: string[] }
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a freelance job matching expert. Score each job 0-100 based on how well it matches this freelancer profile.

PROFILE:
- Name: ${profile.name}
- Skills: ${profile.skills.join(", ")}
- Hourly Rate: ${profile.hourlyRate}
- Experience: ${profile.experience}
- Categories: ${profile.categories.join(", ")}

JOBS:
${jobs.map((j, i) => `[${i}] Title: ${j.title}\nDescription: ${j.description.slice(0, 500)}\nSkills: ${j.skills.join(", ")}\nBudget: ${j.budget}`).join("\n\n")}

Return ONLY a JSON array of objects with "id" and "score" fields. Example: [{"id":"abc","score":85}]
Use these IDs: ${jobs.map(j => j.id).join(", ")}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return jobs.map(j => ({ id: j.id, score: 50 }));
  try {
    return JSON.parse(jsonMatch[0]) as { id: string; score: number }[];
  } catch {
    return jobs.map(j => ({ id: j.id, score: 50 }));
  }
}

export async function generateProposal(
  job: { title: string; description: string; skills: string[]; budget: string },
  profile: { name: string; skills: string[]; hourlyRate: string; experience: string; categories: string[] }
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Write a professional, compelling freelance proposal for this job. Be specific, reference the job requirements, and show relevant experience.

JOB:
Title: ${job.title}
Description: ${job.description}
Skills needed: ${job.skills.join(", ")}
Budget: ${job.budget}

FREELANCER PROFILE:
Name: ${profile.name}
Skills: ${profile.skills.join(", ")}
Hourly Rate: ${profile.hourlyRate}
Experience Level: ${profile.experience}

Write the proposal in first person. Keep it concise (200-300 words). Include:
1. A hook showing you understand their problem
2. Relevant experience/skills
3. Proposed approach
4. A call to action

Return ONLY the proposal text, no extra formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
