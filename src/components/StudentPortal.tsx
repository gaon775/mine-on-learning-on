import React, { useState } from "react";
import { StudentData, SessionData, QuizQuestion } from "../types";
import { StudentPreClass } from "./StudentPreClass";
import { StudentDuringClass } from "./StudentDuringClass";
import { StudentPostClass } from "./StudentPostClass";
import { User, LogIn, KeyRound, CheckCircle2, ChevronRight } from "lucide-react";

interface StudentPortalProps {
  session: SessionData;
  onRefreshSession: () => void;
  onSelectStudentForCounseling?: (studentId: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  session,
  onRefreshSession,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(session.students[0]?.id || "");
  const [inputCode, setInputCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active student object
  const currentStudent = session.students.find((s) => s.id === selectedStudentId) || session.students[0];

  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const matched = session.students.find(
      (s) => s.code.toLowerCase() === inputCode.trim().toLowerCase()
    );
    if (matched) {
      setSelectedStudentId(matched.id);
      setInputCode("");
    } else {
      setLoginError("해당 코드의 학생을 찾을 수 없습니다. (예: M101 ~ M112)");
    }
  };

  const handlePreSubmit = async (data: {
    preEmotion: string;
    preSituation: string[];
    bodyConditions: string[];
    preDiary: string;
    isDiaryPrivate: boolean;
    score: number;
  }) => {
    if (!currentStudent) return;
    setSubmitting(true);
    try {
      await fetch("/api/student/pre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudent.id,
          ...data,
        }),
      });
      onRefreshSession();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostSubmit = async (data: {
    postEmotion: string;
    postReflection: string;
    keywords: string[];
    quizAnswers: number[];
    score: number;
  }) => {
    if (!currentStudent) return;
    setSubmitting(true);
    try {
      await fetch("/api/student/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudent.id,
          ...data,
        }),
      });
      onRefreshSession();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">학생 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Student Switcher / Code Login Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
            {currentStudent.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">{currentStudent.name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                코드: {currentStudent.code}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {session.className} · {session.subject}
            </div>
          </div>
        </div>

        {/* Quick Student Selector Dropdown & Code Input for testing */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-slate-500">학생 전환 (시뮬레이션):</label>
          <select
            value={currentStudent.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {session.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number}번 {s.name} ({s.code}) - {s.quadrant}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Step Indicator */}
      <div className="flex items-center justify-center gap-2 max-w-xl mx-auto py-1">
        {[
          { id: "pre", label: "1. 도입 (사전 정서)" },
          { id: "during", label: "2. 본 수업 (집중)" },
          { id: "post", label: "3. 정리 (사후 정서 & 퀴즈)" },
        ].map((s, idx) => {
          const isCurrent = session.currentStage === s.id;
          return (
            <React.Fragment key={s.id}>
              {idx > 0 && <div className="w-6 h-0.5 bg-slate-200" />}
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Render Active Stage */}
      {session.currentStage === "pre" && (
        <StudentPreClass
          student={currentStudent}
          onSubmit={handlePreSubmit}
          isSubmitting={submitting}
        />
      )}

      {session.currentStage === "during" && (
        <StudentDuringClass
          student={currentStudent}
          subject={session.subject}
          lessonGoal={session.lessonGoal}
          onProceedToPost={() => {
            // student local progression
            fetch("/api/session/stage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stage: "post" }),
            }).then(() => onRefreshSession());
          }}
        />
      )}

      {session.currentStage === "post" && (
        <StudentPostClass
          student={currentStudent}
          quiz={session.quiz}
          onSubmit={handlePostSubmit}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
};
