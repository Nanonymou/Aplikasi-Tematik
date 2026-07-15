"use client";

import { useRef } from "react";
import { PIN_LENGTH } from "@/lib/users";

/**
 * Input PIN 4 digit ramah anak: kotak besar per digit,
 * di belakangnya satu input numerik tersembunyi supaya keyboard
 * HP/tablet langsung muncul angka.
 */
export default function PinInput({
  value,
  onChange,
  label,
  masked = true,
  autoFocus = false,
}: {
  value: string;
  onChange: (pin: string) => void;
  label: string;
  masked?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className="flex flex-col items-center gap-2">
      <span className="text-sm font-bold text-night/60">{label}</span>
      <div
        className="relative flex cursor-text gap-3"
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const filled = i < value.length;
          const isNext = i === value.length;
          return (
            <div
              key={i}
              className={`flex h-16 w-14 items-center justify-center rounded-2xl border-4 bg-white text-3xl font-extrabold text-night shadow-pop-sm ${
                isNext ? "border-sky" : filled ? "border-mint" : "border-night/10"
              }`}
            >
              {filled ? (masked ? "●" : value[i]) : ""}
            </div>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={label}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
          }
          className="absolute inset-0 h-full w-full opacity-0"
        />
      </div>
    </label>
  );
}
