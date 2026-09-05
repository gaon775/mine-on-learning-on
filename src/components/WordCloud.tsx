import React, { useState, useMemo } from "react";
import { StudentData, WordItem } from "../types";
import { Cloud, Sparkles, Filter, Users } from "lucide-react";

interface WordCloudProps {
  students: StudentData[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ students }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "emotion" | "diary" | "concept">("all");

  // Compile words from students' preEmotion, postEmotion, preSituation, keywords, and diary words
  const wordList = useMemo<WordItem[]>(() => {
    const map = new Map<string, { count: number; sentiment: "positive" | "negative" | "neutral"; category: "emotion" | "diary" | "concept" }>();

    students.forEach((s) => {
      // 1. Pre Emotion
      if (s.preEmotion) {
        const isPos = ["설렘", "기대됨", "뿌듯함", "신남", "편안함"].includes(s.preEmotion);
        const cur = map.get(s.preEmotion) || { count: 0, sentiment: isPos ? "positive" : "negative", category: "emotion" };
        cur.count += 2;
        map.set(s.preEmotion, cur);
      }

      // 2. Post Emotion
      if (s.postEmotion) {
        const isPos = ["뿌듯함", "이해됨", "자신감 생김", "후련함"].includes(s.postEmotion);
        const cur = map.get(s.postEmotion) || { count: 0, sentiment: isPos ? "positive" : "negative", category: "emotion" };
        cur.count += 2;
        map.set(s.postEmotion, cur);
      }

      // 3. Situation tags
      s.preSituation?.forEach((sit) => {
        const cur = map.get(sit) || { count: 0, sentiment: "negative", category: "diary" };
        cur.count += 1;
        map.set(sit, cur);
      });

      // 4. Body conditions
      s.bodyConditions?.forEach((cond) => {
        const cur = map.get(cond) || { count: 0, sentiment: "negative", category: "diary" };
        cur.count += 1;
        map.set(cond, cur);
      });

      // 5. Post Keywords
      s.keywords?.forEach((kw) => {
        const isPos = kw.includes("이해") || kw.includes("재미") || kw.includes("만점") || kw.includes("자신감");
        const isNeg = kw.includes("어려움") || kw.includes("헷갈림") || kw.includes("오답") || kw.includes("속상");
        const sentiment = isPos ? "positive" : isNeg ? "negative" : "neutral";
        const cur = map.get(kw) || { count: 0, sentiment, category: "concept" };
        cur.count += 1;
        map.set(kw, cur);
      });
    });

    return Array.from(map.entries()).map(([text, data]) => ({
      text,
      ...data,
    }));
  }, [students]);

  const filteredWords = useMemo(() => {
    if (filterCategory === "all") return wordList;
    return wordList.filter((w) => w.category === filterCategory);
  }, [wordList, filterCategory]);

  // Find students who used selected word
  const studentsWithSelectedWord = useMemo(() => {
    if (!selectedWord) return [];
    return students.filter((s) => {
      return (
        s.preEmotion === selectedWord ||
        s.postEmotion === selectedWord ||
        s.preSituation?.includes(selectedWord) ||
        s.bodyConditions?.includes(selectedWord) ||
        s.keywords?.includes(selectedWord) ||
        s.preDiary?.includes(selectedWord) ||
        s.postReflection?.includes(selectedWord)
      );
    });
  }, [selectedWord, students]);

  // Max count for scaling
  const maxCount = Math.max(...wordList.map((w) => w.count), 1);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <Cloud className="w-3.5 h-3.5 text-indigo-600" />
            실시간 학급 키워드 워드 클라우드
          </div>
          <h3 className="text-xl font-black text-slate-800">
            학급 전체의 감정 및 학습 키워드 분포
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            단어를 클릭하면 해당 단어를 선택/작성한 학생 명단과 맥락을 확인합니다.
          </p>
        </div>

        {/* Category Filters */}
        <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80">
          {[
            { id: "all", label: "전체" },
            { id: "emotion", label: "정서 단어" },
            { id: "concept", label: "학습/개념 키워드" },
            { id: "diary", label: "상황/신체 체크" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud Canvas Area */}
      <div className="min-h-[300px] p-8 rounded-2xl bg-gradient-to-br from-slate-50/70 via-indigo-50/30 to-amber-50/20 border border-slate-200/80 flex flex-wrap items-center justify-center gap-3 md:gap-4 relative overflow-hidden">
        {filteredWords.map((item) => {
          // Calculate font size dynamically (13px to 32px)
          const sizeRatio = (item.count / maxCount);
          const fontSize = 13 + Math.round(sizeRatio * 18);
          const isSelected = selectedWord === item.text;

          // Sentiment colors
          let colorClass = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
          if (item.sentiment === "positive") {
            colorClass = isSelected
              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md"
              : "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100";
          } else if (item.sentiment === "negative") {
            colorClass = isSelected
              ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 shadow-md"
              : "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100";
          } else {
            colorClass = isSelected
              ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 shadow-md"
              : "bg-indigo-50 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100";
          }

          return (
            <button
              key={item.text}
              type="button"
              onClick={() => setSelectedWord(selectedWord === item.text ? null : item.text)}
              style={{ fontSize: `${fontSize}px` }}
              className={`px-4 py-2 rounded-2xl font-black border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs ${colorClass}`}
            >
              <span>{item.text}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 opacity-80 font-bold">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Word Details Panel */}
      {selectedWord && (
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                키워드 '<span className="text-indigo-600 font-extrabold">{selectedWord}</span>'와 연결된 학생 ({studentsWithSelectedWord.length}명)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedWord(null)}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {studentsWithSelectedWord.map((st) => (
              <div
                key={st.id}
                className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {st.number}번 {st.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {st.quadrant}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] line-clamp-2">
                  수업 전: {st.preEmotion} · 수업 후: {st.postEmotion}
                </div>
                {st.postReflection && (
                  <p className="text-[11px] text-slate-500 italic truncate">
                    "{st.postReflection}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
