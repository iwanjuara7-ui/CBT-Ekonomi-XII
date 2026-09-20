import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  totalSeconds: number;
  onTimeExpired: () => void;
  onTick?: (remainingSeconds: number) => void;
  isSubmitted?: boolean;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  totalSeconds,
  onTimeExpired,
  onTick,
  isSubmitted = false,
  className = '',
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [hasExpired, setHasExpired] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState<string | null>(null);

  const hasExpiredRef = useRef(false);
  const onTimeExpiredRef = useRef(onTimeExpired);
  const onTickRef = useRef(onTick);
  const warned5MinRef = useRef(false);
  const warned1MinRef = useRef(false);

  // Keep callback refs updated to avoid interval recreation
  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Accurate timestamp-based timer countdown to avoid drift or background tab throttle
  useEffect(() => {
    if (isSubmitted || hasExpiredRef.current) return;

    const targetEndTime = Date.now() + remainingSeconds * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = targetEndTime - now;
      const currentRemaining = Math.max(0, Math.ceil(diffMs / 1000));

      setRemainingSeconds(currentRemaining);
      onTickRef.current?.(currentRemaining);

      // Warning triggers
      if (currentRemaining <= 300 && currentRemaining > 295 && !warned5MinRef.current) {
        warned5MinRef.current = true;
        setShowWarningToast('Perhatian: Waktu ujian tersisa 5 menit lagi!');
        setTimeout(() => setShowWarningToast(null), 4000);
      }

      if (currentRemaining <= 60 && currentRemaining > 55 && !warned1MinRef.current) {
        warned1MinRef.current = true;
        setShowWarningToast('Peringatan Kritis: Waktu tersisa kurang dari 1 menit!');
        setTimeout(() => setShowWarningToast(null), 5000);
      }

      if (currentRemaining <= 0) {
        clearInterval(interval);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          setHasExpired(true);
          onTimeExpiredRef.current?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted]); // Only depend on isSubmitted, not answers or rapidly changing state

  // Format MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (100% down to 0%)
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  // Determine urgency tier
  const isCritical = remainingSeconds <= 60; // <= 1 min
  const isWarning = remainingSeconds <= 300 && !isCritical; // <= 5 min

  // Theme styling based on urgency tier
  let containerStyle = 'bg-slate-50 text-[#12355b] border-slate-200 hover:border-slate-300';
  let badgeStyle = 'text-slate-500 bg-slate-100';
  let progressColor = 'bg-emerald-600';
  let statusText = 'Sisa Waktu';

  if (hasExpired || remainingSeconds === 0) {
    containerStyle = 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse';
    badgeStyle = 'text-rose-700 bg-rose-200';
    progressColor = 'bg-rose-600';
    statusText = 'Waktu Habis';
  } else if (isCritical) {
    containerStyle = 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm animate-pulse';
    badgeStyle = 'text-rose-700 bg-rose-100 font-bold';
    progressColor = 'bg-rose-500';
    statusText = 'Waktu Kritis!';
  } else if (isWarning) {
    containerStyle = 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs';
    badgeStyle = 'text-amber-800 bg-amber-100';
    progressColor = 'bg-amber-500';
    statusText = '≤ 5 Menit';
  }

  return (
    <div className="relative inline-flex flex-col items-end">
      {/* Timer Container */}
      <div
        id="exam-countdown-timer"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Sisa waktu ujian: ${minutes} menit ${seconds} detik`}
        className={`flex items-center gap-2.5 px-3 sm:px-4 py-1.5 rounded-xl border transition-all select-none ${containerStyle} ${className}`}
      >
        {/* Icon with status animation */}
        <div className="shrink-0 flex items-center justify-center">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
          ) : isWarning ? (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          ) : (
            <Clock className="w-4 h-4 text-slate-500" />
          )}
        </div>

        {/* Text & Time Display */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <span
              id="timer-status-label"
              className={`text-[9px] uppercase tracking-wider font-bold px-1 rounded ${badgeStyle}`}
            >
              {statusText}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              id="timer-value"
              className="font-mono font-extrabold text-base sm:text-lg tracking-wider tabular-nums leading-none"
            >
              {formattedTime}
            </span>
            <span className="text-[10px] text-slate-400 font-sans font-semibold">
              WIB
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div
            id="timer-progress-bar-container"
            className="w-full bg-slate-200/80 rounded-full h-1 mt-1 overflow-hidden"
            title={`Sisa Waktu: ${progressPercent.toFixed(0)}%`}
          >
            <div
              id="timer-progress-bar"
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${progressColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Warning Banner (e.g. 5m and 1m markers) */}
      {showWarningToast && (
        <div
          id="timer-warning-toast"
          className="absolute -bottom-11 right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border flex items-center gap-1.5 transition-all animate-in fade-in slide-in-from-top-1 duration-300 bg-amber-600 text-white border-amber-700"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{showWarningToast}</span>
        </div>
      )}
    </div>
  );
};
