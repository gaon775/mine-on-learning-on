import React, { useState, useMemo } from "react";
import { SessionData, StudentData, LessonStage, QuadrantType } from "../types";
import { StageControllerBar } from "./StageControllerBar";
import { WordCloud } from "./WordCloud";
import { CorrelationAnalysis } from "./CorrelationAnalysis";
import { StudentDetailModal } from "./StudentDetailModal";
import { PrintableReportModal } from "./PrintableReportModal";
import { InteractiveCharacter } from "./InteractiveCharacter";
import {
  Users,
  Grid,
  TrendingUp,
  Cloud,
  FileText,
  AlertTriangle,
  Sparkles,
  Lock,
  Globe2,
  Bandage,
  Search,
  Filter,
} from "lucide-react";

interface TeacherDashboardProps {
  session: SessionData;
  onRefreshSession: () => void;
  onStageChange: (stage: LessonStage) => void;
  onResetSession: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  onRefreshSession,
  onStageChange,
  onResetSession,
}) => {
  const [activeTab, setActiveTab] = useState<"grid" | "correlation" | "cloud" | "counseling">("grid");
  const [filterQuadrant, setFilterQuadrant] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentData | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentData | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return session.students.filter((s) => {
      // Quadrant filter
      if (filterQuadrant === "risk") {
        if (s.quadrant !== "Negative Turn" && s.quadrant !== "Sustained Negative") return false;
      } else if (filterQuadrant !== "all" && s.quadrant !== filterQuadrant) {
        return false;
      }
      // Search filter
      if (searchKeyword.trim()) {
        const query = searchKeyword.trim().toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchCode = s.code.toLowerCase().includes(query);
        const matchEmotion = (s.preEmotion + s.postEmotion).toLowerCase().includes(query);
        const matchDiary = (s.preDiary + s.postReflection).toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchEmotion && !matchDiary) return false;
      }
      return true;
    });
  }, [session.students, filterQuadrant, searchKeyword]);

  // Quadrant counts
  const positiveTurnCount = session.students.filter((s) => s.quadrant === "Positive Turn").length;
  const sustainedPosCount = session.students.filter((s) => s.quadrant === "Sustained Positive").length;
  const negativeTurnCount = session.students.filter((s) => s.quadrant === "Negative Turn").length;
  const sustainedNegCount = session.students.filter((s) => s.quadrant === "Sustained Negative").length;

  return (
    <div className="space-y-6">
      {/* Lesson Stage Controller Bar */}
      <StageControllerBar
        currentStage={session.currentStage}
        students={session.students}
        onStageChange={onStageChange}
        onResetSession={onResetSession}
      />

      {/* Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80 overflow-x-auto">
          {[
            { id: "grid", label: "실시간 학급 모니터링", icon: Grid, count: session.students.length },
            { id: "correlation", label: "정서-성취도 상관분석", icon: TrendingUp },
            { id: "cloud", label: "키워드 워드 클라우드", icon: Cloud },
            {
              id: "counseling",
              label: "AI 1:1 맞춤 상담 리포트",
              icon: FileText,
              badge: negativeTurnCount + sustainedNegCount,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-extrabold">
                    {tab.count}
                  </span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Alert Pill */}
        {negativeTurnCount > 0 && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 px-3.5 py-1.5 rounded-2xl border border-amber-200 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Negative Turn 알림:</strong> {negativeTurnCount}명 학생의 정서가 수업 중
              부정으로 위축됨 (2번 문항 오답 분석 필요)
            </span>
          </div>
        )}
      </div>

      {/* Tab 1: Real-time Class Grid */}
      {activeTab === "grid" && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> 필터:
              </span>
              {[
                { id: "all", label: "전체", count: session.students.length },
                { id: "Positive Turn", label: "Positive Turn", count: positiveTurnCount, color: "emerald" },
                { id: "Sustained Positive", label: "Sustained Positive", count: sustainedPosCount, color: "blue" },
                { id: "Negative Turn", label: "Negative Turn", count: negativeTurnCount, color: "amber" },
                { id: "Sustained Negative", label: "Sustained Negative", count: sustainedNegCount, color: "rose" },
                { id: "risk", label: "🚨 관심·케어 필요군", count: negativeTurnCount + sustainedNegCount },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterQuadrant(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    filterQuadrant === f.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="학생 이름, 코드, 감정 검색..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Student Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((st) => {
              const isNegativeTurn = st.quadrant === "Negative Turn";
              const isSustainedNegative = st.quadrant === "Sustained Negative";
              const isPositiveTurn = st.quadrant === "Positive Turn";

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentForDetail(st)}
                  className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-md relative flex flex-col justify-between ${
                    isNegativeTurn
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : isSustainedNegative
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : isPositiveTurn
                      ? "border-emerald-200/90"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    {/* Top Row: Number, Name, Quadrant Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 font-black text-slate-800 text-xs flex items-center justify-center">
                          {st.number}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            ({st.code})
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
                          isPositiveTurn
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : st.quadrant === "Sustained Positive"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : isNegativeTurn
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        {st.quadrant}
                      </span>
                    </div>

                    {/* Pre & Post Emotion Shift */}
                    <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">수업 전</span>
                        <strong className="text-slate-800 font-bold">{st.preEmotion}</strong>
                      </div>
                      <span className="text-slate-300 font-bold">→</span>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">수업 후</span>
                        <strong
                          className={
                            isNegativeTurn || isSustainedNegative
                              ? "text-rose-600 font-black"
                              : "text-indigo-600 font-black"
                          }
                        >
                          {st.postEmotion || "대기 중"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">퀴즈</span>
                        <strong className="text-slate-800 font-mono">{st.quizScore}/3</strong>
                      </div>
                    </div>

                    {/* Symptoms / Tags */}
                    {st.bodyConditions?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {st.bodyConditions.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium flex items-center gap-1"
                          >
                            <Bandage className="w-2.5 h-2.5" />
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Diary Snippet & Privacy Status */}
                    <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {st.isDiaryPrivate ? (
                        <span className="text-purple-600 italic font-medium flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3" />
                          비공개 일기 (AI 분석 전용 반영됨)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          "{st.preDiary || st.postReflection || "성찰 작성 완료"}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">상세보기 클릭</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudentForReport(st);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>1:1 상담 리포트</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Correlation Analysis */}
      {activeTab === "correlation" && (
        <CorrelationAnalysis
          students={session.students}
          quiz={session.quiz}
          onSelectStudentForCounseling={(id) => {
            const st = session.students.find((s) => s.id === id);
            if (st) setSelectedStudentForReport(st);
          }}
        />
      )}

      {/* Tab 3: Word Cloud */}
      {activeTab === "cloud" && <WordCloud students={session.students} />}

      {/* Tab 4: AI Counseling Direct List */}
      {activeTab === "counseling" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI 맞춤형 교사 상담 자료 자동 생성 센터
              </div>
              <h3 className="text-xl font-black text-slate-800">
                학생별 1:1 맞춤 상담 리포트 및 인쇄
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                정서 저해요인 및 형성평가 오답 유형을 분석하여 구체적인 상담 멘트와 질문지를 자동 생성합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {session.students.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {st.number}번 {st.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                      {st.quadrant}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {st.preEmotion} → {st.postEmotion} ({st.quizScore}/3점)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudentForReport(st)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
                >
                  리포트 생성
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        quiz={session.quiz}
        onClose={() => setSelectedStudentForDetail(null)}
        onOpenCounselingReport={(st) => {
          setSelectedStudentForDetail(null);
          setSelectedStudentForReport(st);
        }}
      />

      <PrintableReportModal
        student={selectedStudentForReport}
        quiz={session.quiz}
        className={session.className}
        subject={session.subject}
        onClose={() => setSelectedStudentForReport(null)}
      />
    </div>
  );
};
