import React, { useState } from "react";
import { InteractiveCharacter } from "./InteractiveCharacter";
import { StudentData } from "../types";
import { Lock, Globe2, Send, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

interface StudentPreClassProps {
  student: StudentData;
  onSubmit: (data: {
    preEmotion: string;
    preSituation: string[];
    bodyConditions: string[];
    preDiary: string;
    isDiaryPrivate: boolean;
    score: number;
  }) => void;
  isSubmitting?: boolean;
}

const PRE_EMOTIONS = [
  { label: "설렘", score: 2, desc: "오늘 수업이 기다려져요", color: "from-pink-400 to-rose-400" },
  { label: "기대됨", score: 2, desc: "새로운 걸 배우고 싶어요", color: "from-amber-400 to-orange-400" },
  { label: "편안함", score: 1, desc: "마음이 안정적이고 차분해요", color: "from-emerald-400 to-teal-400" },
  { label: "피곤함", score: -1, desc: "눈이 감기고 몸이 무거워요", color: "from-indigo-400 to-blue-500" },
  { label: "걱정됨", score: -1, desc: "어려울까 봐 긴장돼요", color: "from-purple-400 to-indigo-500" },
  { label: "우울", score: -2, desc: "마음이 무겁고 힘이 안 나요", color: "from-slate-500 to-slate-700" },
  { label: "불안함", score: -2, desc: "틀릴까 봐 가슴이 두근거려요", color: "from-rose-500 to-red-600" },
];

const SITUATION_TAGS = [
  "공부 어려움",
  "수면 부족 (졸림)",
  "친구관계 고민",
  "신체 컨디션 저하",
  "숙제·과제 부담",
  "칭찬받고 싶음",
  "날씨 영향",
];

export const StudentPreClass: React.FC<StudentPreClassProps> = ({
  student,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState(student.preEmotion || "기대됨");
  const [selectedSituations, setSelectedSituations] = useState<string[]>(student.preSituation || []);
  const [bodyConditions, setBodyConditions] = useState<string[]>(student.bodyConditions || []);
  const [diaryText, setDiaryText] = useState(student.preDiary || "");
  const [isPrivate, setIsPrivate] = useState(student.isDiaryPrivate ?? false);

  const toggleSituation = (tag: string) => {
    setSelectedSituations((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleBodyCondition = (condition: string) => {
    setBodyConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentEmotionObj = PRE_EMOTIONS.find((e) => e.label === selectedEmotion);
    const score = currentEmotionObj ? currentEmotionObj.score : 0;

    onSubmit({
      preEmotion: selectedEmotion,
      preSituation: selectedSituations,
      bodyConditions,
      preDiary: diaryText,
      isDiaryPrivate: isPrivate,
      score,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-rose-500/10 p-5 rounded-2xl border border-slate-200/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              도입 3분 · 진입 정서 측정
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              반가워요, <span className="text-indigo-600 font-black">{student.name}</span> 학생!
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              수업을 시작하기 전, 오늘 나의 마음과 몸 상태를 솔직하게 들려주세요.
            </p>
          </div>
          <div className="text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">단말기 연결됨 (코드: {student.code})</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Character & Body Check */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full text-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              내 감정 캐릭터
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              캐릭터 신체 부위(머리, 눈, 배, 어깨)를 터치하면 상태가 기록돼요!
            </p>
          </div>

          <div className="my-2 py-3 w-full flex justify-center">
            <InteractiveCharacter
              emotion={selectedEmotion}
              bodyConditions={bodyConditions}
              onToggleBodyCondition={toggleBodyCondition}
              allowInteraction={true}
              size="lg"
              showSpeechBubble={true}
              speechText={diaryText || `${selectedEmotion} 기분으로 수업을 준비 중이에요!`}
            />
          </div>

          {/* Quick Body Condition Chips */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>신체 상태 체크</span>
              <span className="text-slate-400 font-normal">직접 선택 또는 터치</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "머리 (두통)", key: "머리" },
                { label: "눈 (피로)", key: "눈" },
                { label: "배 (복통)", key: "배" },
                { label: "어깨 (뻐근함)", key: "어깨" },
              ].map((item) => {
                const isActive = bodyConditions.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleBodyCondition(item.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Emotion Curation, Situation, Speech Diary & Privacy */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Emotion Word Curation Cards */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-sm font-extrabold text-slate-800">
              1. 지금 가장 느껴지는 감정 단어 하나를 선택해 주세요
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRE_EMOTIONS.map((item) => {
                const isSelected = selectedEmotion === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedEmotion(item.label)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Situation Word Recommendations */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-sm font-extrabold text-slate-800">
              2. 이 기분과 관련된 상황이나 원인은 무엇인가요? (복수 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {SITUATION_TAGS.map((tag) => {
                const isChecked = selectedSituations.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSituation(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isChecked
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200/70"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Speech Bubble One-Line Diary & Privacy Setting */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="student-pre-diary" className="text-sm font-extrabold text-slate-800">
                3. 캐릭터 말풍선 한 줄 일기
              </label>
              <span className="text-xs text-slate-400">최대 100자</span>
            </div>

            <textarea
              id="student-pre-diary"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="예: 점심 시간 후라 졸려요. / 어제 배운 내용이 살짝 헷갈려서 걱정돼요."
              maxLength={100}
              rows={2}
              className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none text-slate-800 placeholder:text-slate-400"
            />

            {/* Privacy Setting Toggle: Public vs Private */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isPrivate ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isPrivate ? <Lock className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    일기 공개 설정:{" "}
                    <span className={isPrivate ? "text-purple-600 font-extrabold" : "text-emerald-600 font-extrabold"}>
                      {isPrivate ? "비공개 (AI 전용)" : "공개 (선생님께 공유)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isPrivate
                      ? "선생님 대시보드에는 비공개 처리되며, AI 분석과 추천에만 반영됩니다."
                      : "선생님께서 대시보드에서 일기를 확인하고 수업 중 따뜻하게 배려해주십니다."}
                  </p>
                </div>
              </div>

              <div className="inline-flex rounded-xl p-1 bg-slate-200/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    !isPrivate
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  공개
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    isPrivate
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  비공개
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="student-pre-submit-btn"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "제출 중..." : "수업 전 정서 측정 완료하고 수업 시작하기"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
