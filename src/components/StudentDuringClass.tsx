import React, { useState, useEffect } from "react";
import { StudentData } from "../types";
import { InteractiveCharacter } from "./InteractiveCharacter";
import { Clock, BookOpen, CheckCircle, Sparkles, ArrowRight } from "lucide-react";

interface StudentDuringClassProps {
  student: StudentData;
  subject: string;
  lessonGoal: string;
  onProceedToPost: () => void;
}

export const StudentDuringClass: React.FC<StudentDuringClassProps> = ({
  student,
  subject,
  lessonGoal,
  onProceedToPost,
}) => {
  const [seconds, setSeconds] = useState(35 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Live Status Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          본 수업 35분 · 학습 집중 모드
        </div>

        <h2 className="text-2xl font-black text-slate-800">{subject}</h2>
        <p className="text-sm font-medium text-slate-600 mt-1 max-w-lg mx-auto">
          학습 목표: <span className="text-indigo-600 font-bold">{lessonGoal}</span>
        </p>

        {/* Timer Display */}
        <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200">
          <Clock className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <span className="text-xs font-semibold text-slate-500">수업 잔여 시간</span>
          <span className="text-lg font-black font-mono text-slate-800">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Mascot Cheer & Student Snapshot */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-6 rounded-3xl border border-indigo-100/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left space-y-2 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            선생님과 함께 몰입하는 시간
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {student.name} 학생의 수업 전 마음:{" "}
            <span className="text-indigo-600 font-extrabold">{student.preEmotion}</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            "{student.preDiary || "열심히 수업에 참여해 볼게요!"}"
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>선생님 대시보드에 수업 준비 상태가 전달되었습니다.</span>
          </div>
        </div>

        <div className="shrink-0">
          <InteractiveCharacter
            emotion={student.preEmotion}
            bodyConditions={student.bodyConditions}
            size="md"
          />
        </div>
      </div>

      {/* Manual Transition Bar if Student is ready for Wrap-up */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-600">
          수업 정리가 시작되었나요? 수업 후 정서 변화와 퀴즈를 풀 준비가 되었다면 이동하세요.
        </div>
        <button
          type="button"
          onClick={onProceedToPost}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>정리 7분 단계로 이동</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
