import React from "react";
import { StudentData, QuizQuestion } from "../types";
import { InteractiveCharacter } from "./InteractiveCharacter";
import {
  X,
  FileText,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Globe2,
  Sparkles,
} from "lucide-react";

interface StudentDetailModalProps {
  student: StudentData | null;
  quiz: QuizQuestion[];
  onClose: () => void;
  onOpenCounselingReport: (student: StudentData) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  quiz,
  onClose,
  onOpenCounselingReport,
}) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
              {student.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{student.name} 학생</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {student.code}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                정서 변동 유형: <strong className="text-indigo-600 font-bold">{student.quadrant}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Dual Character Preview */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">수업 전</span>
              <InteractiveCharacter
                emotion={student.preEmotion}
                bodyConditions={student.bodyConditions}
                size="sm"
              />
              <span className="text-xs font-bold text-slate-800 mt-2 block">{student.preEmotion}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">수업 후</span>
              <InteractiveCharacter
                emotion={student.postEmotion || "대기 중"}
                size="sm"
              />
              <span className="text-xs font-bold text-indigo-700 mt-2 block">
                {student.postEmotion || "미제출"}
              </span>
            </div>
          </div>

          {/* Pre-Class Diary & Symptoms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                1. 수업 전 말풍선 일기 및 컨디션
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-slate-100 text-slate-600">
                {student.isDiaryPrivate ? (
                  <>
                    <Lock className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-700">비공개(AI 분석만 반영)</span>
                  </>
                ) : (
                  <>
                    <Globe2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">교사 공개</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              {student.isDiaryPrivate ? (
                <div className="text-slate-500 italic">
                  학생이 '비공개'로 설정한 일기입니다. (AI 1:1 상담 리포트 엔진에는 정서 분석 자료로 포함됩니다)
                </div>
              ) : (
                <div>"{student.preDiary || "(작성한 일기 없음)"}"</div>
              )}
              {student.bodyConditions?.length > 0 && (
                <div className="mt-2 text-rose-600 font-semibold flex items-center gap-1">
                  <span>신체 상태:</span>
                  <span>{student.bodyConditions.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post-Class Reflection */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              2. 수업 후 성찰일지 및 키워드
            </h4>
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-700">
              <div>"{student.postReflection || "(성찰일지 미작성)"}"</div>
              {student.keywords?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {student.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[10px] font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quiz Assessment Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                3. 형성평가 문항별 응답 결과
              </h4>
              <span className="text-xs font-extrabold text-indigo-700">
                점수: {student.quizScore} / {quiz.length}점
              </span>
            </div>

            <div className="space-y-2">
              {quiz.map((q, idx) => {
                const isCorrect = student.quizAnswers?.[idx] === q.correctAnswer;
                const studentAns = student.quizAnswers?.[idx];
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {idx + 1}번 ({q.concept}): {q.question}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        학생 응답: {studentAns !== undefined ? `${studentAns + 1}번 (${q.options[studentAns]})` : "미응답"} · 정답: {q.correctAnswer + 1}번
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 ${
                        isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isCorrect ? "정답" : "오답"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => onOpenCounselingReport(student)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 맞춤 상담 리포트 생성 및 인쇄</span>
          </button>
        </div>
      </div>
    </div>
  );
};
