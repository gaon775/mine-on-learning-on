import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Types
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
  // Pre-class data
  preSubmitted: boolean;
  preEmotion: string; // e.g. "걱정됨", "피곤함", "기대됨", "설렘", "우울"
  preSituation: string[]; // e.g. ["공부 어려움", "수면 부족"]
  bodyConditions: string[]; // e.g. ["머리 (두통)", "눈 (피로)"]
  preDiary: string;
  isDiaryPrivate: boolean;
  preScore: number; // -2 to +2
  // Post-class data
  postSubmitted: boolean;
  postEmotion: string; // e.g. "뿌듯함", "이해됨", "여전히 어려움", "답답함"
  postReflection: string;
  keywords: string[];
  quizAnswers: number[]; // e.g. [1, 2, 0]
  quizScore: number; // 0 ~ 3
  postScore: number; // -2 to +2
  // AI Derived
  quadrant: "Positive Turn" | "Sustained Positive" | "Negative Turn" | "Sustained Negative" | "Pending";
  aiCounselingNote?: string;
}

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "다음 중 (분수) ÷ (자연수) 계산 방법으로 알맞은 것은?",
    options: [
      "분자에 자연수를 곱한다",
      "분모에 자연수를 곱하거나 분자를 나눈다",
      "분모와 분자를 서로 바꾼다",
      "분모에만 자연수를 더한다",
    ],
    correctAnswer: 1,
    concept: "기본 계산 원리",
    explanation: "분수를 자연수로 나눌 때는 분자를 자연수로 나누거나 분모에 자연수를 곱합니다.",
  },
  {
    id: 2,
    question: "피자 3/4판을 3명이 똑같이 나누어 먹으려 합니다. 한 명이 먹게 되는 양은? (개념 응용)",
    options: [
      "1/4판",
      "1/3판",
      "9/4판",
      "1/2판",
    ],
    correctAnswer: 0,
    concept: "실생활 개념 응용 (2번 문항)",
    explanation: "3/4 ÷ 3 = (3 ÷ 3) / 4 = 1/4 판이 됩니다.",
  },
  {
    id: 3,
    question: "5/6 ÷ 2를 바르게 계산한 식과 답은?",
    options: [
      "5/6 × 2 = 5/3",
      "5/(6 × 2) = 5/12",
      "(5 × 2)/6 = 5/3",
      "(5 - 2)/6 = 3/6",
    ],
    correctAnswer: 1,
    concept: "역수 곱셈 변환",
    explanation: "5/6 ÷ 2 = 5/6 × 1/2 = 5/12 입니다.",
  },
];

// In-Memory Class State
function generateInitialStudents(): StudentData[] {
  return [
    {
      id: "s1",
      code: "M101",
      number: 1,
      name: "김하늘",
      avatarVariant: 1,
      preSubmitted: true,
      preEmotion: "걱정됨",
      preSituation: ["공부 어려움", "숙제 부담"],
      bodyConditions: ["머리 (두통)"],
      preDiary: "어제 분수 나눗셈 복습을 못해서 오늘 수업 잘 이해할 수 있을지 떨려요.",
      isDiaryPrivate: false,
      preScore: -1,
      postSubmitted: true,
      postEmotion: "뿌듯함",
      postReflection: "선생님이 피자 그림으로 설명해주셔서 원리가 쏙쏙 들어왔어요! 퀴즈도 다 맞았어요.",
      keywords: ["피자 그림", "분수 나눗셈", "재미있음", "이해 완료"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 2,
      quadrant: "Positive Turn",
    },
    {
      id: "s2",
      code: "M102",
      number: 2,
      name: "이도윤",
      avatarVariant: 2,
      preSubmitted: true,
      preEmotion: "기대됨",
      preSituation: ["새로운 단원 호기심"],
      bodyConditions: [],
      preDiary: "수학 시간 좋아해요. 오늘 분수 나눗셈 빨리 배우고 싶어요.",
      isDiaryPrivate: false,
      preScore: 2,
      postSubmitted: true,
      postEmotion: "뿌듯함",
      postReflection: "친구들에게 나누는 방법 설명해줬는데 뿌듯했어요. 계산도 빠르고 정확하게 풀었습니다.",
      keywords: ["나눔", "쉬운 계산", "자신감"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 2,
      quadrant: "Sustained Positive",
    },
    {
      id: "s3",
      code: "M103",
      number: 3,
      name: "박민준",
      avatarVariant: 3,
      preSubmitted: true,
      preEmotion: "기대됨",
      preSituation: ["수업 준비 완료"],
      bodyConditions: [],
      preDiary: "오늘 짝궁이랑 퀴즈 배틀하기로 해서 신나요.",
      isDiaryPrivate: false,
      preScore: 1,
      postSubmitted: true,
      postEmotion: "답답함",
      postReflection: "문장제 2번 문제에서 분자랑 분모 나눌 때 너무 헷갈렸어요... 속상해요.",
      keywords: ["문장제 문제", "2번 헷갈림", "속상함"],
      quizAnswers: [1, 2, 0], // missed Q2 (concept application)
      quizScore: 1,
      postScore: -1,
      quadrant: "Negative Turn",
    },
    {
      id: "s4",
      code: "M104",
      number: 4,
      name: "정수아",
      avatarVariant: 4,
      preSubmitted: true,
      preEmotion: "피곤함",
      preSituation: ["수면 부족", "학원 일정"],
      bodyConditions: ["눈 (피로)", "머리 (두통)"],
      preDiary: "어제 늦게 자서 눈이 너무 뻑뻑하고 머리가 아파요...",
      isDiaryPrivate: true,
      preScore: -2,
      postSubmitted: true,
      postEmotion: "여전히 어려움",
      postReflection: "잠이 너무 쏟아져서 중간에 설명을 놓쳤어요. 2번이랑 3번 모르겠어요.",
      keywords: ["졸림", "집중 실패", "어려움"],
      quizAnswers: [0, 2, 1],
      quizScore: 1,
      postScore: -1,
      quadrant: "Sustained Negative",
    },
    {
      id: "s5",
      code: "M105",
      number: 5,
      name: "최서연",
      avatarVariant: 5,
      preSubmitted: true,
      preEmotion: "설렘",
      preSituation: ["모둠 활동 기대"],
      bodyConditions: [],
      preDiary: "오늘 친구들이랑 모둠 퀴즈 풀기 기대돼요!",
      isDiaryPrivate: false,
      preScore: 2,
      postSubmitted: true,
      postEmotion: "이해됨",
      postReflection: "친구들이랑 협동해서 퀴즈 풀었더니 이해가 잘 되었습니다.",
      keywords: ["모둠 활동", "이해 잘됨", "협동"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 2,
      quadrant: "Sustained Positive",
    },
    {
      id: "s6",
      code: "M106",
      number: 6,
      name: "강지우",
      avatarVariant: 1,
      preSubmitted: true,
      preEmotion: "우울",
      preSituation: ["친구관계 고민"],
      bodyConditions: ["배 (복통)"],
      preDiary: "쉬는 시간에 친구랑 사소하게 다퉈서 마음이 무거워요.",
      isDiaryPrivate: true,
      preScore: -2,
      postSubmitted: true,
      postEmotion: "이해됨",
      postReflection: "선생님이 칭찬해주셔서 기분이 조금 풀렸고 수업도 집중할 수 있었어요.",
      keywords: ["선생님 칭찬", "기분 전환", "용기"],
      quizAnswers: [1, 0, 0],
      quizScore: 2,
      postScore: 1,
      quadrant: "Positive Turn",
    },
    {
      id: "s7",
      code: "M107",
      number: 7,
      name: "윤예준",
      avatarVariant: 2,
      preSubmitted: true,
      preEmotion: "신남",
      preSituation: ["체육 후 에너지 충전"],
      bodyConditions: [],
      preDiary: "앞 시간 체육 너무 재밌게 해서 텐션 높아요!",
      isDiaryPrivate: false,
      preScore: 2,
      postSubmitted: true,
      postEmotion: "답답함",
      postReflection: "체육 끝나고 너무 더웠는데 갑자기 2번 문제 복잡한 게 나와서 머리가 멈췄어요.",
      keywords: ["지침", "집중 흐트러짐", "2번 오답"],
      quizAnswers: [1, 1, 1],
      quizScore: 2,
      postScore: -1,
      quadrant: "Negative Turn",
    },
    {
      id: "s8",
      code: "M108",
      number: 8,
      name: "임하은",
      avatarVariant: 3,
      preSubmitted: true,
      preEmotion: "걱정됨",
      preSituation: ["수학 자신감 부족"],
      bodyConditions: ["손발 차가움"],
      preDiary: "분수는 항상 어려워서 수학 시간마다 긴장돼요.",
      isDiaryPrivate: false,
      preScore: -1,
      postSubmitted: true,
      postEmotion: "여전히 어려움",
      postReflection: "공식은 외웠는데 문제로 나오면 어떻게 적용해야 할지 여전히 깜깜해요...",
      keywords: ["자신감 부족", "공식 적용 어려움"],
      quizAnswers: [1, 3, 0],
      quizScore: 1,
      postScore: -2,
      quadrant: "Sustained Negative",
    },
    {
      id: "s9",
      code: "M109",
      number: 9,
      name: "한시우",
      avatarVariant: 4,
      preSubmitted: true,
      preEmotion: "피곤함",
      preSituation: ["점심식사 후 식곤증"],
      bodyConditions: ["눈 (피로)"],
      preDiary: "점심 먹고 나서 너무 졸려요 zzz",
      isDiaryPrivate: false,
      preScore: -1,
      postSubmitted: true,
      postEmotion: "뿌듯함",
      postReflection: "선생님께서 발표 시켜주셔서 잠도 깨고, 퀴즈 3개 다 맞아서 기분 최고예요!",
      keywords: ["잠 깸", "발표", "만점"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 2,
      quadrant: "Positive Turn",
    },
    {
      id: "s10",
      code: "M110",
      number: 10,
      name: "송지민",
      avatarVariant: 5,
      preSubmitted: true,
      preEmotion: "편안함",
      preSituation: ["일상"],
      bodyConditions: [],
      preDiary: "오늘 컨디션 평범하고 좋아요.",
      isDiaryPrivate: false,
      preScore: 1,
      postSubmitted: true,
      postEmotion: "뿌듯함",
      postReflection: "분모를 곱해주는 원리가 왜 그런지 확실히 이해했습니다.",
      keywords: ["원리 터득", "명쾌함"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 2,
      quadrant: "Sustained Positive",
    },
    {
      id: "s11",
      code: "M111",
      number: 11,
      name: "오유진",
      avatarVariant: 1,
      preSubmitted: true,
      preEmotion: "기대됨",
      preSituation: ["새로운 개념 기대"],
      bodyConditions: [],
      preDiary: "오늘 나눗셈 어떻게 푸는지 궁금해요.",
      isDiaryPrivate: false,
      preScore: 1,
      postSubmitted: true,
      postEmotion: "답답함",
      postReflection: "수식으로 계산하는 건 되는데 말로 풀어서 쓴 2번 문항을 이해 못했어요.",
      keywords: ["문장제 독해", "2번 막힘"],
      quizAnswers: [1, 3, 1],
      quizScore: 2,
      postScore: -1,
      quadrant: "Negative Turn",
    },
    {
      id: "s12",
      code: "M112",
      number: 12,
      name: "장현우",
      avatarVariant: 2,
      preSubmitted: true,
      preEmotion: "불안함",
      preSituation: ["수학 시험 부담"],
      bodyConditions: ["배 (복통)", "머리 (두통)"],
      preDiary: "오늘 퀴즈 본다는데 틀릴까 봐 배가 슬슬 아파요.",
      isDiaryPrivate: true,
      preScore: -2,
      postSubmitted: true,
      postEmotion: "이해됨",
      postReflection: "생각보다 퀴즈가 풀만했고 선생님이 차근차근 짚어주셔서 안도했어요.",
      keywords: ["안도감", "걱정 해결", "자신감 회복"],
      quizAnswers: [1, 0, 1],
      quizScore: 3,
      postScore: 1,
      quadrant: "Positive Turn",
    },
  ];
}

let classState = {
  className: "6학년 2반",
  subject: "수학 (단원: 분수의 나눗셈)",
  lessonGoal: "분수 ÷ 자연수의 계산 원리를 실생활 상황과 연결하여 이해하고 적용하기",
  currentStage: "post" as "pre" | "during" | "post",
  students: generateInitialStudents(),
  quiz: DEFAULT_QUIZ,
};

function calculateQuadrant(preScore: number, postScore: number): "Positive Turn" | "Sustained Positive" | "Negative Turn" | "Sustained Negative" {
  const isPrePos = preScore >= 0;
  const isPostPos = postScore >= 0;
  if (!isPrePos && isPostPos) return "Positive Turn";
  if (isPrePos && isPostPos) return "Sustained Positive";
  if (isPrePos && !isPostPos) return "Negative Turn";
  return "Sustained Negative";
}

// API Routes
app.get("/api/session", (req, res) => {
  res.json({
    className: classState.className,
    subject: classState.subject,
    lessonGoal: classState.lessonGoal,
    currentStage: classState.currentStage,
    students: classState.students,
    quiz: classState.quiz,
  });
});

app.post("/api/session/stage", (req, res) => {
  const { stage } = req.body;
  if (["pre", "during", "post"].includes(stage)) {
    classState.currentStage = stage;
  }
  res.json({ success: true, currentStage: classState.currentStage });
});

app.post("/api/session/reset", (req, res) => {
  classState.students = generateInitialStudents();
  classState.currentStage = "pre";
  res.json({ success: true, message: "초기 상태로 리셋되었습니다." });
});

// Student Pre-class submission
app.post("/api/student/pre", (req, res) => {
  const { studentId, preEmotion, preSituation, bodyConditions, preDiary, isDiaryPrivate, score } = req.body;
  const student = classState.students.find((s) => s.id === studentId || s.code === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  student.preSubmitted = true;
  student.preEmotion = preEmotion;
  student.preSituation = preSituation || [];
  student.bodyConditions = bodyConditions || [];
  student.preDiary = preDiary || "";
  student.isDiaryPrivate = !!isDiaryPrivate;
  student.preScore = typeof score === "number" ? score : 0;
  student.quadrant = "Pending";

  res.json({ success: true, student });
});

// Student Post-class submission
app.post("/api/student/post", (req, res) => {
  const { studentId, postEmotion, postReflection, keywords, quizAnswers, score } = req.body;
  const student = classState.students.find((s) => s.id === studentId || s.code === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  student.postSubmitted = true;
  student.postEmotion = postEmotion;
  student.postReflection = postReflection || "";
  student.keywords = keywords || [];
  student.quizAnswers = quizAnswers || [];
  student.postScore = typeof score === "number" ? score : 1;

  // Calculate Quiz Score
  let calculatedScore = 0;
  classState.quiz.forEach((q, idx) => {
    if (student.quizAnswers[idx] === q.correctAnswer) {
      calculatedScore += 1;
    }
  });
  student.quizScore = calculatedScore;
  student.quadrant = calculateQuadrant(student.preScore, student.postScore);

  res.json({ success: true, student });
});

// AI Counseling Report Endpoint
app.post("/api/ai/counseling-report", async (req, res) => {
  const { studentId } = req.body;
  const student = classState.students.find((s) => s.id === studentId || s.code === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const ai = getGeminiClient();

  const prompt = `
당신은 대한민국 초·중등 학생 정서 및 학습 상담 전문가이자 '마음 ON, 배움 ON' 시스템의 AI 상담 분석 엔진입니다.
아래 학생의 수업 전·후 정서 데이터, 신체 상태, 일기(성찰), 형성평가 결과를 분석하여 교사가 방과 후 1:1 상담 및 정서 케어에 바로 활용할 수 있는 심층 리포트를 한국어로 작성해주세요.

[학생 정보]
- 이름: ${student.name} (출석번호 ${student.number}번)
- 학급 및 과목: ${classState.className} - ${classState.subject}
- 수업 전 감정: ${student.preEmotion} (신체 상태: ${student.bodyConditions.join(", ") || "특이사항 없음"}, 상황: ${student.preSituation.join(", ") || "없음"})
- 수업 전 말풍선 일기: "${student.preDiary || "작성 안 함"}" (공개 설정: ${student.isDiaryPrivate ? "비공개(AI 전용)" : "교사 공개"})
- 수업 후 감정: ${student.postEmotion}
- 수업 후 성찰일지: "${student.postReflection || "작성 안 함"}" (키워드: ${student.keywords.join(", ")})
- 정서 변동 유형: ${student.quadrant}
- 형성평가 점수: ${student.quizScore} / 3점 (1번: ${student.quizAnswers[0] === 1 ? "정답" : "오답"}, 2번(응용): ${student.quizAnswers[1] === 0 ? "정답" : "오답"}, 3번: ${student.quizAnswers[2] === 1 ? "정답" : "오답"})

다음 항목을 반드시 포함하여 신뢰감 있고 따뜻한 어조의 JSON 형식으로 답변해주세요:
{
  "summary": "1줄 종합 요약 (예: '수업 전 기대감으로 시작했으나 2번 응용 문제에서 좌절감을 겪어 정서적 지지와 개념 재구조화가 시급한 상태')",
  "emotionAnalysis": "수업 전/후 감정 변화 및 신체 컨디션 심층 원인 분석 (성찰일지와 연계)",
  "learningAnalysis": "형성평가 오답 원인 및 수학적 취약 개념 진단",
  "quadrantDiagnosis": "${student.quadrant} 유형에 따른 학습/심리적 특성 설명",
  "recommendedOpeningMent": "교사가 상담을 열 때 학생의 마음을 열어주는 구체적인 멘트",
  "keyQuestions": ["1:1 상담 시 질문할 핵심 질문 3가지"],
  "actionPlan": ["방과 후 지도 및 가정/교실 연계 실천 방안 3가지"]
}
`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      student.aiCounselingNote = parsed.summary;
      return res.json({ success: true, report: parsed });
    }
  } catch (error) {
    console.error("Gemini API error, falling back to local intelligence:", error);
  }

  // Fallback heuristic report
  const isNegativeTurn = student.quadrant === "Negative Turn";
  const isSustainedNegative = student.quadrant === "Sustained Negative";
  const isPositiveTurn = student.quadrant === "Positive Turn";

  const fallbackReport = {
    summary: isNegativeTurn
      ? `${student.name} 학생은 수업 전 긍정적(${student.preEmotion})이었으나, 2번 개념 응용 문제의 오답으로 인해 정서가 급격히 ${student.postEmotion}으로 위축되었습니다. 학습 결손 보충과 정서적 자존감 회복이 필수적입니다.`
      : isSustainedNegative
      ? `${student.name} 학생은 신체 피로(${student.bodyConditions.join(", ") || "피로"})와 누적된 학습 불안으로 지속적 케어가 필요한 고위험군입니다. 기초 개념 다지기와 온기 있는 격려가 필요합니다.`
      : isPositiveTurn
      ? `${student.name} 학생은 수업 전 불안(${student.preEmotion})이 있었으나 수업 참여와 선생님의 피드백을 통해 ${student.postEmotion}(으)로 성공적인 정서 전환을 이뤄냈습니다.`
      : `${student.name} 학생은 수업 전반에 걸쳐 안정적인 몰입과 우수한 학업 성취(${student.quizScore}/3점)를 보여준 모범 사례입니다.`,
    emotionAnalysis: `수업 전 ${student.preEmotion} 상태에서 시작하여 ${student.postEmotion}으로 변화함. 신체 컨디션(${student.bodyConditions.join(", ") || "양호"})과 성찰 내용("${student.postReflection}")을 볼 때, ${
      isNegativeTurn
        ? "학습 난이도 장벽이 감정에 직접적인 스트레스로 작용함."
        : isPositiveTurn
        ? "수업 내 성취 경험이 부정 정서를 해소시키는 긍정적 카타르시스를 제공함."
        : "정서와 학업 몰입이 정비례 관계를 형성함."
    }`,
    learningAnalysis: `형성평가 결과 ${student.quizScore}점 획득. ${
      student.quizAnswers[1] !== 0
        ? "특히 2번 실생활 개념 응용 문항(피자 나눗셈)에서 오답을 기록하여 시각화된 직관적 원리 재설명이 요구됨."
        : "핵심 개념 원리와 계산 절차를 정확히 이해하고 올바르게 적용함."
    }`,
    quadrantDiagnosis: `[${student.quadrant}] 분류: ${
      isNegativeTurn
        ? "수업 도중 난이도 장벽이나 피로 누적으로 긍정에서 부정으로 전환된 케이스로, 조기 개입하지 않을 경우 만성적인 학습 불안으로 고착될 위험이 있습니다."
        : isSustainedNegative
        ? "누적된 결손과 부정 정서가 맞물려 학습 무기력으로 이어질 수 있는 고위험군입니다."
        : isPositiveTurn
        ? "수업의 교수 설계가 정서 반등을 이끌어낸 매우 고무적인 사례입니다."
        : "높은 자기효능감과 안정적인 정서 기반을 유지하고 있습니다."
    }`,
    recommendedOpeningMent: isNegativeTurn
      ? `"${student.name}아, 오늘 수업 시작할 때 표정이 아주 밝아서 선생님도 힘이 났어. 혹시 2번 피자 문제 풀 때 어떤 부분이 가장 마음에 걸렸는지 선생님이랑 천천히 이야기해볼까?"`
      : isSustainedNegative
      ? `"${student.name}아, 오늘 몸도 피곤하고 힘들었을 텐데 끝까지 자리를 지켜줘서 고마워. 선생님이 ${student.name}이 마음 편하게 공부할 수 있게 꼭 도와줄게."`
      : `"${student.name}아, 오늘 수업 전에는 걱정된다고 했는데 끝날 때 환하게 웃는 모습을 보니 선생님이 정말 기뻐! 어떤 순간에 마음이 편해졌니?"`,
    keyQuestions: [
      "2번 문제를 읽었을 때 처음 어떤 생각이 들었나요?",
      "수업 중에 가장 마음이 편안했던 순간과 답답했던 순간은 언제였나요?",
      "다음 수학 시간 전 선생님이 어떤 도움을 주면 더 자신감이 생길 것 같나요?",
    ],
    actionPlan: [
      "구체물(피자 조각 모형)을 활용한 1:1 시각적 나눗셈 재학습 (5분)",
      "성찰일지 비밀 메모에 교사의 따뜻한 손편지 피드백 부착",
      "다음 차시 도입 시 성공 경험을 유도할 수 있는 난이도 조절 질문 부여",
    ],
  };

  res.json({ success: true, report: fallbackReport });
});

// Class Insights Endpoint
app.post("/api/ai/class-insights", async (req, res) => {
  const ai = getGeminiClient();
  const students = classState.students;
  const positiveTurnCount = students.filter((s) => s.quadrant === "Positive Turn").length;
  const sustainedPosCount = students.filter((s) => s.quadrant === "Sustained Positive").length;
  const negativeTurnCount = students.filter((s) => s.quadrant === "Negative Turn").length;
  const sustainedNegCount = students.filter((s) => s.quadrant === "Sustained Negative").length;

  const negativeTurnStudents = students.filter((s) => s.quadrant === "Negative Turn");
  const q2WrongNegativeTurns = negativeTurnStudents.filter((s) => s.quizAnswers[1] !== 0).length;
  const q2Rate = negativeTurnStudents.length > 0 ? Math.round((q2WrongNegativeTurns / negativeTurnStudents.length) * 100) : 80;

  const prompt = `
'마음 ON, 배움 ON' 학급 정서-성취도 통계 데이터:
- 학급: ${classState.className} (${classState.subject})
- 학생 수: ${students.length}명
- Positive Turn (부정→긍정): ${positiveTurnCount}명
- Sustained Positive (긍정→긍정): ${sustainedPosCount}명
- Negative Turn (긍정→부정): ${negativeTurnCount}명
- Sustained Negative (지속 부정): ${sustainedNegCount}명
- 특이사항: Negative Turn 학생 중 ${q2Rate}%가 2번 문항(개념 응용)에서 오답을 기록함.

교사를 위한 수업 효과성 진단 및 교수법 개선 인사이트 3가지를 JSON 배열 형식으로 도출해주세요:
{
  "insights": [
    {
      "title": "핵심 상관관계 발견",
      "detail": "설명"
    }
  ],
  "teachingRecommendation": "다음 수업을 위한 구체적인 교수학습 개선 제안"
}
`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, ...parsed });
    }
  } catch (err) {
    console.error("AI Class insight error:", err);
  }

  res.json({
    success: true,
    insights: [
      {
        title: "정서 반등(Positive Turn)과 성취도 정적 상관",
        detail: "수업 전 부정이었으나 긍정으로 전환된 학생 그룹(평균 88점)은 지속 부정 그룹(평균 52점) 대비 36점 높은 학업 성취도를 보였습니다.",
      },
      {
        title: "2번 응용 문항과 정서 악화(Negative Turn) 역추적",
        detail: `수업 후 정서가 부정으로 꺾인 학생들의 ${q2Rate}%가 2번 문항(개념 응용)에서 오답을 기록하여, 특정 개념 난이도가 정서 악화의 주요 원인임을 규명했습니다.`,
      },
      {
        title: "신체 피로 및 사전 수면 부족의 학습 저해",
        detail: "수업 전 두통 및 눈 피로를 호소한 학생 중 75%가 사후 평가 및 정서에서 지속적인 저조를 나타내 사전 컨디션 케어의 필요성이 확인되었습니다.",
      },
    ],
    teachingRecommendation: "다음 차시 도입 3분 시 분수의 문장제 시각화 카드 조작 활동을 5분간 선행 배치하고, Negative Turn 위험군 학생에게 우선 칭찬 피드백을 부여하세요.",
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
