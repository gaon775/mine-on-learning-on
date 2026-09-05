export type LessonStage = "pre" | "during" | "post";

export type QuadrantType =
  | "Positive Turn"
  | "Sustained Positive"
  | "Negative Turn"
  | "Sustained Negative"
  | "Pending";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  concept: string;
  explanation: string;
}

export interface StudentData {
  id: string;
  code: string;
  number: number;
  name: string;
  avatarVariant: number;
  // Pre-class
  preSubmitted: boolean;
  preEmotion: string;
  preSituation: string[];
  bodyConditions: string[];
  preDiary: string;
  isDiaryPrivate: boolean;
  preScore: number;
  // Post-class
  postSubmitted: boolean;
  postEmotion: string;
  postReflection: string;
  keywords: string[];
  quizAnswers: number[];
  quizScore: number;
  postScore: number;
  // AI Derived
  quadrant: QuadrantType;
  aiCounselingNote?: string;
}

export interface SessionData {
  className: string;
  subject: string;
  lessonGoal: string;
  currentStage: LessonStage;
  students: StudentData[];
  quiz: QuizQuestion[];
}

export interface AICounselingReport {
  summary: string;
  emotionAnalysis: string;
  learningAnalysis: string;
  quadrantDiagnosis: string;
  recommendedOpeningMent: string;
  keyQuestions: string[];
  actionPlan: string[];
}

export interface WordItem {
  text: string;
  count: number;
  sentiment: "positive" | "negative" | "neutral";
  category: "emotion" | "diary" | "concept";
}
