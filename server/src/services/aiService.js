import axios from "axios";

const ai = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: 60000, // LLM calls can be slow
});

export async function generateQuestions({ role, difficulty, topics, count }) {
  const { data } = await ai.post("/generate-questions", { role, difficulty, topics, count });
  return data.questions || [];
}

export async function evaluateAnswer({ question, answer, role }) {
  const { data } = await ai.post("/evaluate-answer", { question, answer, role });
  return data;
}