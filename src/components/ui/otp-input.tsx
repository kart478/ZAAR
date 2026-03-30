import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  ({ length = 6, value = "", onChange, onComplete, disabled = false, className }, ref) => {
    const [internalValue, setInternalValue] = useState(value);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Sync with external value
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = (index: number, newValue: string) => {
      // Only allow numbers
      if (newValue && !/^\d$/.test(newValue)) {
        return;
      }

      const newOTP = internalValue.split('');
      newOTP[index] = newValue;
      const otpString = newOTP.join('');

      setInternalValue(otpString);
      onChange?.(otpString);

      // Auto-advance to next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      if (otpString.length === length && /^\d+$/.test(otpString)) {
        onComplete?.(otpString);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        
        if (internalValue[index]) {
          // Clear current input
          const newOTP = internalValue.split('');
          newOTP[index] = '';
          const otpString = newOTP.join('');
          setInternalValue(otpString);
          onChange?.(otpString);
        } else if (index > 0) {
          // Move to previous input and clear it
          const newOTP = internalValue.split('');
          newOTP[index - 1] = '';
          const otpString = newOTP.join('');
          setInternalValue(otpString);
          onChange?.(otpString);
          inputRefs.current[index - 1]?.focus();
        }
      }

      // Handle arrow keys
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }

      // Handle paste
      if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then((pastedText) => {
          const numbers = pastedText.replace(/\D/g, '').slice(0, length);
          if (numbers.length > 0) {
            const newOTP = numbers.padEnd(length, '0').split('');
            const otpString = newOTP.join('');
            setInternalValue(otpString);
            onChange?.(otpString);
            
            // Focus the last filled input
            const lastFilledIndex = Math.min(numbers.length - 1, length - 1);
            inputRefs.current[lastFilledIndex]?.focus();
            
            // Auto-submit if complete
            if (numbers.length === length) {
              onComplete?.(otpString);
            }
          }
        });
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const numbers = pastedText.replace(/\D/g, '').slice(0, length);
      
      if (numbers.length > 0) {
        const newOTP = numbers.padEnd(length, '0').split('');
        const otpString = newOTP.join('');
        setInternalValue(otpString);
        onChange?.(otpString);
        
        // Focus the last filled input
        const lastFilledIndex = Math.min(numbers.length - 1, length - 1);
        inputRefs.current[lastFilledIndex]?.focus();
        
        // Auto-submit if complete
        if (numbers.length === length) {
          onComplete?.(otpString);
        }
      }
    };

    // Focus first input on mount
    useEffect(() => {
      if (!disabled && inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }, [disabled]);

    return (
      <div
        ref={ref}
        className={cn("flex gap-2", className)}
      >
        {Array.from({ length }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={internalValue[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold",
              "focus:ring-2 focus:ring-primary focus:border-primary",
              "transition-all duration-200"
            )}
            autoComplete="off"
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = "OTPInput";

export { OTPInput };
