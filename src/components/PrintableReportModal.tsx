import React, { useState, useEffect } from "react";
import { StudentData, QuizQuestion, AICounselingReport } from "../types";
import { InteractiveCharacter } from "./InteractiveCharacter";
import {
  Printer,
  X,
  Sparkles,
  User,
  Heart,
  BookOpen,
  BrainCircuit,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";

interface PrintableReportModalProps {
  student: StudentData | null;
  quiz: QuizQuestion[];
  className: string;
  subject: string;
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  student,
  quiz,
  className,
  subject,
  onClose,
}) => {
  const [report, setReport] = useState<AICounselingReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) return;

    let isMounted = true;
    setLoading(true);

    fetch("/api/ai/counseling-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.report) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error("Counseling report load error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student]);

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "Positive Turn":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Sustained Positive":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Negative Turn":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Sustained Negative":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">
              AI 맞춤형 교사 1:1 상담 자료 리포트 (공식 양식)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 저장</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Document Canvas ================= */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 print:p-6 print:space-y-4 font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-indigo-600 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                마음 ON, 배움 ON · 학생 정서·성취도 연계 AI 분석 시스템
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                방과 후 1:1 맞춤 상담 및 정서 케어 가이드라인
              </h1>
            </div>
            <div className="text-right text-xs text-slate-500 font-medium">
              <div>발행일: 2026. 09. 04</div>
              <div>
                대상 학급: {className} | 교과: {subject}
              </div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">학생 성명</span>
              <strong className="text-sm font-extrabold text-slate-900">
                {student.name} ({student.number}번)
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">단말기 코드</span>
              <strong className="text-sm font-mono text-slate-800">{student.code}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">정서 변동 유형</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border mt-0.5 ${getQuadrantColor(
                  student.quadrant
                )}`}
              >
                {student.quadrant}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">형성평가 성취도</span>
              <strong className="text-sm font-extrabold text-indigo-700">
                {student.quizScore} / 3점 ({Math.round((student.quizScore / 3) * 100)}점)
              </strong>
            </div>
          </div>

          {/* Section 1: Pre & Post Emotion Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Class Card */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  [수업 전] 진입 정서 및 신체 상태
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">
                  {student.isDiaryPrivate ? "🔒 비공개(AI 분석만)" : "공개(교사 공유)"}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                선택 감정: <strong className="text-slate-900">{student.preEmotion}</strong>
              </div>
              {student.bodyConditions?.length > 0 && (
                <div className="text-xs text-rose-700 font-medium">
                  신체 증상: {student.bodyConditions.join(", ")}
                </div>
              )}
              {student.preSituation?.length > 0 && (
                <div className="text-xs text-slate-500">
                  관련 상황: {student.preSituation.join(", ")}
                </div>
              )}
              <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100">
                말풍선 일기: "{student.preDiary || "(작성 내용 없음)"}"
              </div>
            </div>

            {/* Post-Class Card */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  [수업 후] 정서 변화 및 형성평가
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                  {student.quizScore === 3 ? "만점" : `${student.quizScore}점 획득`}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                변화 감정: <strong className="text-indigo-700">{student.postEmotion}</strong>
              </div>
              <div className="text-xs text-slate-600">
                형성평가 결과: 1번({student.quizAnswers?.[0] === 1 ? "정답" : "오답"}), 2번 응용(
                <strong
                  className={
                    student.quizAnswers?.[1] === 0 ? "text-emerald-600" : "text-rose-600 font-bold"
                  }
                >
                  {student.quizAnswers?.[1] === 0 ? "정답" : "오답"}
                </strong>
                ), 3번({student.quizAnswers?.[2] === 1 ? "정답" : "오답"})
              </div>
              <div className="p-2.5 bg-indigo-50/50 rounded-xl text-xs text-slate-700 italic border border-indigo-100">
                성찰일지: "{student.postReflection || "(성찰 내용 없음)"}"
              </div>
            </div>
          </div>

          {/* Section 2: AI In-Depth Diagnostic Summary */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900">
              <BrainCircuit className="w-4 h-4 text-amber-600" />
              <span>AI 종합 정서 변동 및 학습 연계 진단</span>
            </div>
            {loading ? (
              <div className="text-xs text-slate-500 animate-pulse py-2">
                Gemini AI가 학생의 감정-학습 데이터를 다각도로 정밀 분석하고 있습니다...
              </div>
            ) : report ? (
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900">{report.summary}</p>
                <div className="border-t border-amber-200/60 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <strong className="text-amber-950 font-bold block mb-0.5">
                      정서 및 신체 컨디션 심층 요인:
                    </strong>
                    <p className="text-slate-600">{report.emotionAnalysis}</p>
                  </div>
                  <div>
                    <strong className="text-amber-950 font-bold block mb-0.5">
                      학습 결손 및 취약 개념:
                    </strong>
                    <p className="text-slate-600">{report.learningAnalysis}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section 3: Recommended Teacher Opening Ment */}
          {report?.recommendedOpeningMent && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
              <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                교사용 추천 1:1 상담 오프닝 멘트 (라포 형성용)
              </span>
              <p className="text-xs font-semibold text-indigo-950 italic pl-5 leading-relaxed">
                {report.recommendedOpeningMent}
              </p>
            </div>
          )}

          {/* Section 4: Key Counseling Questions & Action Plan */}
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Key Questions */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <strong className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                  1:1 맞춤형 핵심 상담 질문지 (3선)
                </strong>
                <ul className="space-y-1.5 list-decimal list-inside text-slate-700">
                  {report.keyQuestions.map((q, idx) => (
                    <li key={idx} className="leading-snug">
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Plan */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <strong className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                  방과 후 보충 및 정서 케어 실천 가이드라인
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  {report.actionPlan.map((act, idx) => (
                    <li key={idx} className="leading-snug">
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>마음 ON, 배움 ON · 학생 맞춤형 교육 복지 및 정서 안전망 지원</span>
            <span>담당 교사 서명: ____________________ (인)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
