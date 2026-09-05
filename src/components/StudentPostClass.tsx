import React, { useState } from "react";
import { StudentData, QuizQuestion, QuadrantType } from "../types";
import { InteractiveCharacter } from "./InteractiveCharacter";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  BookCheck,
  Send,
  RefreshCcw,
} from "lucide-react";

interface StudentPostClassProps {
  student: StudentData;
  quiz: QuizQuestion[];
  onSubmit: (data: {
    postEmotion: string;
    postReflection: string;
    keywords: string[];
    quizAnswers: number[];
    score: number;
  }) => void;
  isSubmitting?: boolean;
}

const POST_EMOTIONS = [
  { label: "뿌듯함", score: 2, desc: "오늘 배운 내용을 잘 해냈어요!", isPositive: true },
  { label: "이해됨", score: 2, desc: "설명을 듣고 나니 원리가 쏙쏙 들어와요", isPositive: true },
  { label: "자신감 생김", score: 2, desc: "다음 문제도 잘 풀 수 있을 것 같아요", isPositive: true },
  { label: "후련함", score: 1, desc: "수업을 집중해서 마치니 기분이 좋아요", isPositive: true },
  { label: "답답함", score: -1, desc: "어떤 문제가 잘 안 풀려서 아쉬워요", isPositive: false },
  { label: "여전히 어려움", score: -2, desc: "개념이 아직 헷갈리고 막막해요", isPositive: false },
  { label: "지침", score: -1, desc: "머리를 많이 써서 에너지가 빠졌어요", isPositive: false },
];

export const StudentPostClass: React.FC<StudentPostClassProps> = ({
  student,
  quiz,
  onSubmit,
  isSubmitting = false,
}) => {
  const [postEmotion, setPostEmotion] = useState(student.postEmotion || "이해됨");
  const [reflection, setReflection] = useState(student.postReflection || "");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    student.keywords?.length ? student.keywords : ["분수 나눗셈", "역수 계산", "피자 조각"]
  );
  const [answers, setAnswers] = useState<number[]>(
    student.quizAnswers?.length === quiz.length ? student.quizAnswers : new Array(quiz.length).fill(-1)
  );
  const [step, setStep] = useState<"questions" | "result">(
    student.postSubmitted ? "result" : "questions"
  );

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emotionObj = POST_EMOTIONS.find((e) => e.label === postEmotion);
    const score = emotionObj ? emotionObj.score : 1;

    onSubmit({
      postEmotion,
      postReflection: reflection,
      keywords,
      quizAnswers: answers,
      score,
    });

    // Fire Confetti if Positive Turn or high score
    const isPreNegative = student.preScore < 0;
    const isPostPositive = score >= 0;
    if (isPreNegative && isPostPositive) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setStep("result");
  };

  // Determine Quadrant
  const calculateResultQuadrant = (): QuadrantType => {
    const emotionObj = POST_EMOTIONS.find((e) => e.label === postEmotion);
    const postScore = emotionObj ? emotionObj.score : 1;
    const isPrePos = student.preScore >= 0;
    const isPostPos = postScore >= 0;

    if (!isPrePos && isPostPos) return "Positive Turn";
    if (isPrePos && isPostPos) return "Sustained Positive";
    if (isPrePos && !isPostPos) return "Negative Turn";
    return "Sustained Negative";
  };

  const resultQuadrant = calculateResultQuadrant();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-5 rounded-3xl border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-800 text-xs font-bold mb-1">
              <BookCheck className="w-3.5 h-3.5 text-indigo-600" />
              정리 7분 · 정서 재측정, 성찰일지 & 형성평가
            </div>
            <h2 className="text-xl font-black text-slate-800">
              수업을 마친 지금, 기분은 어떤가요?
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              오늘 배운 핵심을 점검하고 마음의 변화를 기록해 보세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(step === "questions" ? "result" : "questions")}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {step === "questions" ? "내 정서 비교 컷 보기" : "퀴즈/입력 내용 수정"}
            </button>
          </div>
        </div>
      </div>

      {step === "questions" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Post-Emotion Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-black">
                  1
                </span>
                수업 후 현재 나의 기분을 선택해 주세요
              </label>
              <span className="text-xs text-indigo-600 font-semibold">
                선택 즉시 캐릭터가 반응해요!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {POST_EMOTIONS.map((item) => {
                  const isSelected = postEmotion === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setPostEmotion(item.label)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-200 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                        {item.isPositive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            긍정
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                            부담
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-tight">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Real-time Character Preview */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 mb-1">
                  변화된 캐릭터 표정
                </span>
                <InteractiveCharacter
                  emotion={postEmotion}
                  size="md"
                  showSpeechBubble={true}
                  speechText={postEmotion}
                />
              </div>
            </div>
          </div>

          {/* 2. Formative Assessment (형성평가 3문항) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-black">
                  2
                </span>
                오늘 수업 핵심 형성평가 (3문항)
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-8">
                오늘 배운 개념을 점검해 보세요. 점수는 선생님의 맞춤 지도 자료로 활용됩니다.
              </p>
            </div>

            <div className="space-y-4">
              {quiz.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md shrink-0">
                      문제 {qIdx + 1} ({q.concept})
                    </span>
                    <span className="text-xs text-slate-400">배점 1점</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{q.question}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="line-clamp-2">
                            {optIdx + 1}. {opt}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Reflection Diary & Word Cloud Keywords */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-black">
                3
              </span>
              수업 성찰일지 및 핵심 키워드
            </label>

            <div>
              <span className="text-xs font-bold text-slate-700">오늘 수업 한 줄 성찰일지</span>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="예: 선생님의 설명이 재미있었고, 피자 그림을 생각하며 퀴즈에 참여했더니 즐거웠어요."
                rows={2}
                className="w-full mt-1 p-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700">
                학급 워드클라우드용 핵심 키워드 태그 (단어 입력 후 추가)
              </span>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="예: 분수의 나눗셈, 피자 조각, 역수"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer"
                >
                  추가
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-indigo-400 hover:text-indigo-700 text-xs font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "제출 중..." : "정서 변화 & 퀴즈 응답 제출하고 비교 컷 확인"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================== COMPARISON & SELF-REFLECTION CUT VIEW ================== */
        <div className="space-y-6">
          {/* Visual Dual Character Cut Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
            <div className="text-center max-w-lg mx-auto mb-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                정서 변화 2단계 비교 컷 & 피드백
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                수업 전후 나의 마음 변화
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                수업을 통해 내 마음에 일어난 변화를 직관적으로 확인하고 스스로를 칭찬해 주세요!
              </p>
            </div>

            {/* 2-Cut Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Arrow Connector on Desktop */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border-2 border-indigo-400 shadow-md items-center justify-center text-indigo-600">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* 1. Pre-Class Character Cut */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center relative">
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-black mb-3">
                  1단계: 수업 시작 전
                </span>
                <InteractiveCharacter
                  emotion={student.preEmotion || "기본"}
                  bodyConditions={student.bodyConditions}
                  size="md"
                  showSpeechBubble={true}
                  speechText={student.preDiary || student.preEmotion}
                />
                <div className="mt-4 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">{student.preEmotion}</span> 상태로
                  수업을 시작했습니다.
                </div>
              </div>

              {/* 2. Post-Class Character Cut */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 flex flex-col items-center text-center relative">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black mb-3">
                  2단계: 수업 종료 후
                </span>
                <InteractiveCharacter
                  emotion={postEmotion}
                  size="md"
                  showSpeechBubble={true}
                  speechText={reflection || postEmotion}
                />
                <div className="mt-4 text-xs text-slate-600">
                  수업 후 <span className="font-bold text-indigo-700">{postEmotion}</span>(으)로
                  변화되었습니다!
                </div>
              </div>
            </div>

            {/* Quadrant Badge & Self-Reflection Message */}
            <div className="mt-8 p-5 rounded-2xl border bg-gradient-to-r from-slate-50 to-indigo-50/40 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-bold text-slate-500">나의 정서 변동 유형:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      resultQuadrant === "Positive Turn"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : resultQuadrant === "Sustained Positive"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : resultQuadrant === "Negative Turn"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {resultQuadrant}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {resultQuadrant === "Positive Turn"
                    ? "수업 전의 걱정과 긴장을 털어내고 뿌듯한 성취로 멋지게 전환했어요! 최고예요!"
                    : resultQuadrant === "Sustained Positive"
                    ? "처음부터 끝까지 즐겁게 몰입하여 높은 집중도를 유지했어요. 훌륭합니다!"
                    : resultQuadrant === "Negative Turn"
                    ? "수업 도중 어려운 문제나 피로로 힘들었군요. 괜찮아요, 선생님이 친절하게 보충해 주실 거예요!"
                    : "몸도 무겁고 어려웠을 텐데 끝까지 포기하지 않고 수업을 마친 자신을 꼭 안아주세요."}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("questions")}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>다시 풀기 / 수정</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
