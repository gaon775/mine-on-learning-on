import React from "react";
import { LessonStage, StudentData } from "../types";
import { PlayCircle, Clock, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

interface StageControllerBarProps {
  currentStage: LessonStage;
  students: StudentData[];
  onStageChange: (stage: LessonStage) => void;
  onResetSession: () => void;
}

export const StageControllerBar: React.FC<StageControllerBarProps> = ({
  currentStage,
  students,
  onStageChange,
  onResetSession,
}) => {
  const preSubmittedCount = students.filter((s) => s.preSubmitted).length;
  const postSubmittedCount = students.filter((s) => s.postSubmitted).length;

  const stages: { id: LessonStage; name: string; time: string; desc: string }[] = [
    {
      id: "pre",
      name: "도입 3분",
      time: "진입 정서 파악",
      desc: "감정·신체 체크 & 오프닝 멘트",
    },
    {
      id: "during",
      name: "본 수업 35분",
      time: "수업 진행",
      desc: "분수의 나눗셈 원리 학습",
    },
    {
      id: "post",
      name: "정리 7분",
      time: "정서 재측정 & 퀴즈",
      desc: "성찰일지 & 형성평가 3문항",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Stages Control Buttons */}
      <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          수업 운영 시나리오:
        </span>
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onStageChange(st.id)}
              className={`px-3.5 py-2 rounded-2xl border text-left transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-200"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black ${isActive ? "text-white" : "text-slate-900"}`}>
                  {st.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {st.time}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                {st.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Real-time Submissions Badge & Reset Action */}
      <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
        <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600 font-medium">
            진입 정서:{" "}
            <strong className="text-slate-900 font-bold">
              {preSubmittedCount}/{students.length}명
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            사후 퀴즈:{" "}
            <strong className="text-slate-900 font-bold">
              {postSubmittedCount}/{students.length}명
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onResetSession}
          title="초기 샘플 데이터로 리셋"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">리셋</span>
        </button>
      </div>
    </div>
  );
};
