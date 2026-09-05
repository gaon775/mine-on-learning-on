import React, { useState, useEffect } from "react";
import { SessionData, LessonStage } from "./types";
import { StudentPortal } from "./components/StudentPortal";
import { TeacherDashboard } from "./components/TeacherDashboard";
import {
  HeartHandshake,
  Smartphone,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Info,
  Layers,
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [viewMode, setViewMode] = useState<"teacher" | "student">("teacher");
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleStageChange = async (stage: LessonStage) => {
    try {
      await fetch("/api/session/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      fetchSession();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSession = async () => {
    try {
      await fetch("/api/session/reset", { method: "POST" });
      fetchSession();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">마음 ON, 배움 ON 시스템 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <HeartHandshake className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  마음 ON, 배움 ON
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  학생 정서·성취도 AI 분석
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {session.className} · {session.subject}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Student Device vs Teacher Dashboard */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                id="mode-teacher-btn"
                onClick={() => setViewMode("teacher")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "teacher"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>교사 대시보드</span>
              </button>

              <button
                type="button"
                id="mode-student-btn"
                onClick={() => setViewMode("student")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "student"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>학생 단말기 (태블릿)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {viewMode === "teacher" ? (
          <TeacherDashboard
            session={session}
            onRefreshSession={fetchSession}
            onStageChange={handleStageChange}
            onResetSession={handleResetSession}
          />
        ) : (
          <StudentPortal
            session={session}
            onRefreshSession={fetchSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>마음 ON, 배움 ON (Mind ON, Learning ON) · 초·중등 정서 및 학습 상관관계 AI 진단 시스템</span>
          <span className="text-slate-400">자연어 처리 기반 감정 지수 정량화 & 4대 정서변동 유형 자동 진단</span>
        </div>
      </footer>
    </div>
  );
}
