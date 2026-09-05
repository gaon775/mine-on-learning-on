import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Bandage, Zap, Eye, CheckCircle2 } from "lucide-react";

interface InteractiveCharacterProps {
  emotion: string; // "설렘", "걱정됨", "피곤함", "뿌듯함", "우울", "기대됨", "이해됨", "답답함", "신남" 등
  bodyConditions?: string[]; // ["머리 (두통)", "눈 (피로)", "배 (복통)", "어깨 (뻐근함)"]
  onToggleBodyCondition?: (condition: string) => void;
  allowInteraction?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
}

export const InteractiveCharacter: React.FC<InteractiveCharacterProps> = ({
  emotion,
  bodyConditions = [],
  onToggleBodyCondition,
  allowInteraction = false,
  size = "lg",
  showSpeechBubble = false,
  speechText = "",
  className = "",
}) => {
  // Determine emotional mood
  const isHappy = [
    "설렘",
    "뿌듯함",
    "기대됨",
    "이해됨",
    "신남",
    "편안함",
    "기쁨",
    "자신감 생김",
    "즐거움",
    "후련함",
  ].includes(emotion);

  const isSadOrTired = [
    "피곤함",
    "걱정됨",
    "우울",
    "답답함",
    "여전히 어려움",
    "지침",
    "불안함",
    "속상함",
  ].includes(emotion);

  // Colors based on mood
  const faceColor = isHappy
    ? "#FEF08A" // warm sunny amber/yellow
    : isSadOrTired
    ? "#E0E7FF" // soft lilac/indigo mist
    : "#FEF9C3"; // default soft neutral yellow

  const cheeksColor = isHappy
    ? "#F43F5E" // vibrant blush
    : isSadOrTired
    ? "#94A3B8" // muted blush
    : "#FB7185";

  const outfitColor = isHappy
    ? "#10B981" // fresh emerald/green
    : isSadOrTired
    ? "#6366F1" // deep calming indigo
    : "#3B82F6"; // sky blue

  // Has conditions
  const hasHeadache = bodyConditions.some((c) => c.includes("머리") || c.includes("두통"));
  const hasEyeStrain = bodyConditions.some((c) => c.includes("눈") || c.includes("피로"));
  const hasStomachache = bodyConditions.some((c) => c.includes("배") || c.includes("복통"));
  const hasShoulderPain = bodyConditions.some((c) => c.includes("어깨") || c.includes("뻐근"));

  // Scale map
  const scaleMap = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-60 h-60",
    xl: "w-72 h-72",
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-3 max-w-xs px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-700 text-sm font-medium text-center relative z-20"
          >
            "{speechText}"
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Character Body Container */}
      <motion.div
        animate={
          isHappy
            ? {
                y: [0, -8, 0],
                rotate: [0, 1.5, -1.5, 0],
              }
            : isSadOrTired
            ? {
                y: [0, 4, 0],
                rotate: [0, -1, 1, 0],
              }
            : {
                y: [0, -3, 0],
              }
        }
        transition={{
          duration: isHappy ? 2.2 : isSadOrTired ? 3.5 : 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative ${scaleMap[size]} flex items-center justify-center`}
      >
        {/* Ambient Mood Aura Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-700 pointer-events-none ${
            isHappy
              ? "bg-amber-300"
              : isSadOrTired
              ? "bg-indigo-300"
              : "bg-emerald-200"
          }`}
        />

        {/* Floating Sparkles for Happy Mood */}
        {isHappy && (
          <>
            <motion.div
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], y: [-5, -20] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
              className="absolute -top-2 -right-1 text-amber-400 z-10 pointer-events-none"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ scale: [0, 1.1, 0], opacity: [0, 0.9, 0], y: [-2, -15] }}
              transition={{ repeat: Infinity, duration: 2.3, delay: 1 }}
              className="absolute top-8 -left-3 text-pink-400 z-10 pointer-events-none"
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
          </>
        )}

        {/* Droplets for Sad/Tired Mood */}
        {isSadOrTired && (
          <motion.div
            animate={{ opacity: [0.3, 0.9, 0.3], y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1/2 -right-4 text-indigo-400 z-10 pointer-events-none"
          >
            <div className="w-3.5 h-5 bg-indigo-400 rounded-full rounded-tr-none rotate-45 opacity-70" />
          </motion.div>
        )}

        {/* SVG Mascot Character */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full drop-shadow-lg overflow-visible"
        >
          {/* Hair / Head Top */}
          <ellipse cx="100" cy="85" rx="58" ry="58" fill="#1E293B" />
          <path
            d="M 60 70 Q 100 20 140 70 Q 155 90 148 110 Q 100 80 52 110 Q 45 90 60 70 Z"
            fill="#0F172A"
          />

          {/* Ears */}
          <circle cx="42" cy="95" r="12" fill={faceColor} />
          <circle cx="158" cy="95" r="12" fill={faceColor} />
          <circle cx="42" cy="95" r="7" fill={cheeksColor} opacity="0.4" />
          <circle cx="158" cy="95" r="7" fill={cheeksColor} opacity="0.4" />

          {/* Face Base */}
          <circle cx="100" cy="95" r="50" fill={faceColor} />

          {/* Cheeks Blush */}
          <ellipse cx="72" cy="112" rx="9" ry="5" fill={cheeksColor} opacity={isHappy ? 0.6 : 0.3} />
          <ellipse cx="128" cy="112" rx="9" ry="5" fill={cheeksColor} opacity={isHappy ? 0.6 : 0.3} />

          {/* Eyes */}
          {isHappy ? (
            /* Happy Arched Eyes */
            <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M 68 96 Q 78 85 88 96" />
              <path d="M 112 96 Q 122 85 132 96" />
            </g>
          ) : isSadOrTired ? (
            /* Droopy / Tired Eyes */
            <g>
              <ellipse cx="78" cy="96" rx="5" ry="3" fill="#334155" />
              <ellipse cx="122" cy="96" rx="5" ry="3" fill="#334155" />
              <path d="M 70 88 Q 78 92 86 90" stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 114 90 Q 122 92 130 88" stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Bright Round Curious Eyes */
            <g fill="#1E293B">
              <circle cx="78" cy="95" r="7" />
              <circle cx="76" cy="93" r="2.5" fill="#FFFFFF" />
              <circle cx="122" cy="95" r="7" />
              <circle cx="120" cy="93" r="2.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Eyebrows */}
          {isHappy ? (
            <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 68 82 Q 78 77 86 82" />
              <path d="M 114 82 Q 122 77 132 82" />
            </g>
          ) : isSadOrTired ? (
            <g stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 70 80 Q 78 84 86 86" />
              <path d="M 114 86 Q 122 84 130 80" />
            </g>
          ) : (
            <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 70 82 Q 78 80 86 82" />
              <path d="M 114 82 Q 122 80 130 82" />
            </g>
          )}

          {/* Mouth */}
          {isHappy ? (
            <path
              d="M 85 116 Q 100 132 115 116 Z"
              fill="#E11D48"
              stroke="#BE123C"
              strokeWidth="2"
            />
          ) : isSadOrTired ? (
            <path
              d="M 88 122 Q 100 114 112 122"
              stroke="#475569"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M 90 118 Q 100 126 110 118"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Body / Torso */}
          <path
            d="M 60 145 C 60 140 75 138 100 138 C 125 138 140 140 140 145 L 148 200 C 148 205 135 208 100 208 C 65 208 52 205 52 200 Z"
            fill={outfitColor}
          />
          {/* Collar Accent */}
          <path d="M 88 140 L 100 152 L 112 140" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Arms */}
          <g fill={outfitColor}>
            {/* Left Arm */}
            <path d="M 60 148 Q 40 165 48 180 Q 55 185 62 175 Z" />
            {/* Right Arm */}
            <path d="M 140 148 Q 160 165 152 180 Q 145 185 138 175 Z" />
          </g>

          {/* Hands */}
          <circle cx="47" cy="182" r="7" fill={faceColor} />
          <circle cx="153" cy="182" r="7" fill={faceColor} />

          {/* ================= CONDITION OVERLAYS (BANDAGES / PATCHES) ================= */}
          {/* Head Bandage (두통) */}
          {hasHeadache && (
            <g transform="translate(108, 62) rotate(15)">
              <rect x="-16" y="-8" width="32" height="16" rx="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
              <line x1="-4" y1="-8" x2="-4" y2="8" stroke="#CA8A04" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="4" y1="-8" x2="4" y2="8" stroke="#CA8A04" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* Eye Strain Patch (눈 피로) */}
          {hasEyeStrain && (
            <g transform="translate(68, 92)">
              <circle cx="10" cy="4" r="14" fill="#60A5FA" opacity="0.3" />
              <circle cx="10" cy="4" r="14" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3,2" fill="none" />
              <path d="M 6 4 L 14 4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Stomach Patch (복통 / 배 불편) */}
          {hasStomachache && (
            <g transform="translate(100, 172)">
              <circle cx="0" cy="0" r="16" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
              <path d="M -8 0 Q 0 -6 8 0 Q 0 6 -8 0" fill="#EA580C" opacity="0.7" />
            </g>
          )}

          {/* Shoulder Bandage (어깨 뻐근) */}
          {hasShoulderPain && (
            <g transform="translate(142, 150) rotate(-20)">
              <rect x="-12" y="-6" width="24" height="12" rx="3" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#10B981" />
            </g>
          )}
        </svg>

        {/* ================= INTERACTIVE HOTSPOT BUTTONS (If Enabled) ================= */}
        {allowInteraction && onToggleBodyCondition && (
          <div className="absolute inset-0 z-30 pointer-events-auto">
            {/* Head Hotspot */}
            <button
              type="button"
              id="hotspot-head"
              onClick={() => onToggleBodyCondition("머리 (두통)")}
              title="머리 터치: 두통"
              className={`absolute top-[18%] left-[50%] -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                hasHeadache
                  ? "bg-amber-500 text-white ring-2 ring-amber-300 scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-amber-600 hover:scale-110 border border-slate-200"
              }`}
            >
              <Bandage className="w-3.5 h-3.5" />
              <span>머리(두통)</span>
            </button>

            {/* Eyes Hotspot */}
            <button
              type="button"
              id="hotspot-eyes"
              onClick={() => onToggleBodyCondition("눈 (피로)")}
              title="눈 터치: 피로"
              className={`absolute top-[42%] left-[20%] px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                hasEyeStrain
                  ? "bg-blue-500 text-white ring-2 ring-blue-300 scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 hover:scale-110 border border-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>눈(피로)</span>
            </button>

            {/* Belly Hotspot */}
            <button
              type="button"
              id="hotspot-belly"
              onClick={() => onToggleBodyCondition("배 (복통)")}
              title="배 터치: 복통/소화불량"
              className={`absolute top-[72%] left-[50%] -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                hasStomachache
                  ? "bg-orange-500 text-white ring-2 ring-orange-300 scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-orange-600 hover:scale-110 border border-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>배(복통)</span>
            </button>

            {/* Shoulder Hotspot */}
            <button
              type="button"
              id="hotspot-shoulder"
              onClick={() => onToggleBodyCondition("어깨 (뻐근함)")}
              title="어깨 터치: 뻐근함"
              className={`absolute top-[62%] right-[10%] px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                hasShoulderPain
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-600 hover:scale-110 border border-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>어깨(뻐근)</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Emotion Pill Badge */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs ${
            isHappy
              ? "bg-amber-100/90 text-amber-900 border-amber-300"
              : isSadOrTired
              ? "bg-indigo-100/90 text-indigo-900 border-indigo-300"
              : "bg-slate-100 text-slate-800 border-slate-300"
          }`}
        >
          {emotion || "기본 상태"}
        </span>

        {bodyConditions.map((cond) => (
          <span
            key={cond}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 flex items-center gap-1"
          >
            <Bandage className="w-3 h-3 text-red-500" />
            {cond}
          </span>
        ))}
      </div>
    </div>
  );
};
