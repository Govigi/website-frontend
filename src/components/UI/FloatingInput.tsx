import React, { forwardRef, InputHTMLAttributes } from "react";

interface FloatingInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, id, type = "text", ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <>
        <div className="floating-input-container">
          <div className="floating-input-wrapper">
            <input
              ref={ref}
              id={inputId}
              type={type}
              placeholder=" "
              className={`floating-input ${error ? "error" : ""}`}
              {...props}
            />

            <label
              htmlFor={inputId}
              className="floating-label"
            >
              {label}
            </label>
          </div>

          <div className="floating-error">
            {error}
          </div>
        </div>

        <style>{`
          .floating-input-container {
            width: 100%;
          }

          .floating-input-wrapper {
            position: relative;
          }

          .floating-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d4d4d8;
            border-radius: 6px;
            background: white;
            font-size: 14px;
            outline: none;
            transition: all .2s;
          }

          .floating-input:focus {
            border-color: #10b981;
          }

          .floating-input.error {
            border-color: #ef4444;
          }

          .floating-label {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            padding: 0 4px;
            background: white;
            color: #a1a1aa;
            font-size: 14px;
            pointer-events: none;
            transition: all .2s ease;
          }

          .floating-input:focus + .floating-label,
          .floating-input:not(:placeholder-shown) + .floating-label {
            top: 0;
            transform: translateY(-50%);
            font-size: 12px;
            color: gray;
          }

          .floating-input.error:focus + .floating-label,
          .floating-input.error:not(:placeholder-shown) + .floating-label {
            color: #ef4444;
          }

          .floating-error {
            min-height: 18px;
            margin-top: 6px;
            margin-left: 4px;
            font-size: 12px;
            color: #ef4444;
          }
        `}</style>
      </>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;