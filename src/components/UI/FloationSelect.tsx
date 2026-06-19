"use client";

import React, {
  forwardRef,
  SelectHTMLAttributes,
  useState,
} from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";

interface FloatingSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const FloatingSelect = forwardRef<
  HTMLSelectElement,
  FloatingSelectProps
>(
  (
    {
      label,
      error,
      id,
      className,
      children,
      value,
      defaultValue,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputId = id || props.name;

    const hasValue =
      value !== "" &&
      value !== undefined &&
      value !== null &&
      value !== defaultValue;

    const isActive = isFocused || hasValue;

    return (
      <div className="space-y-1">
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "peer h-[46px] w-full appearance-none rounded-md border bg-white px-3 text-sm transition-all",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-zinc-300",
              className
            )}
            {...props}
          >
            <option value="" disabled hidden></option>
            {children}
          </select>

          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-3 bg-white px-1 transition-all duration-200",
              isActive
                ? "top-0 -translate-y-1/2 text-xs text-[gray]"
                : "top-1/2 -translate-y-1/2 text-sm text-zinc-400"
            )}
          >
            {label}
          </label>

          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="min-h-[18px]">
          {error && (
            <p className="ml-1 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FloatingSelect.displayName = "FloatingSelect";

export default FloatingSelect;