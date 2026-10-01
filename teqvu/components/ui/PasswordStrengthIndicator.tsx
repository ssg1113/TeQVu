'use client';

import React, { useEffect, useMemo } from 'react';
import { Check, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { validatePassword, getStrengthBadge } from '../../lib/security/password';

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  userEmail?: string;
  showChecks?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  confirmPassword,
  userEmail,
  showChecks = true,
  onValidationChange,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const result = useMemo(() => {
    return validatePassword(password, userEmail);
  }, [password, userEmail]);

  const passwordsMatch = useMemo(() => {
    if (confirmPassword === undefined) return true;
    return password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const isFullyValid = result.isValid && passwordsMatch;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFullyValid);
    }
  }, [isFullyValid, onValidationChange]);

  const badge = getStrengthBadge(result.strengthLevel);

  if (!password && !confirmPassword) {
    return null;
  }

  return (
    <div className={`space-y-3 pt-1 text-xs ${className}`}>
      {/* Strength Bar & Badge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            {result.strengthLevel === 'strong' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : result.strengthLevel === 'good' ? (
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-slate-600 dark:text-slate-400">Password Strength:</span>
            <span className={`font-bold ${badge.color}`}>{badge.label}</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">{result.score}%</span>
        </div>

        {/* 4-segment visual bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              result.score > 0 ? (result.score < 40 ? 'bg-red-500' : result.score < 60 ? 'bg-amber-500' : 'bg-cyan-500') : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              result.score >= 40
                ? result.score < 60
                  ? 'bg-amber-500'
                  : result.score < 80
                  ? 'bg-cyan-500'
                  : 'bg-emerald-500'
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              result.score >= 60
                ? result.score < 80
                  ? 'bg-cyan-500'
                  : 'bg-emerald-500'
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              result.score >= 80 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Security Requirements Checklist */}
      {showChecks && (
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Security Requirements
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            <RequirementItem
              satisfied={result.checks.minLength}
              label="8+ characters"
            />
            <RequirementItem
              satisfied={result.checks.hasUppercase}
              label="Uppercase letter (A-Z)"
            />
            <RequirementItem
              satisfied={result.checks.hasLowercase}
              label="Lowercase letter (a-z)"
            />
            <RequirementItem
              satisfied={result.checks.hasNumber}
              label="Number (0-9)"
            />
            <RequirementItem
              satisfied={result.checks.hasSpecial}
              label="Symbol (!@#$%^&*)"
            />
            <RequirementItem
              satisfied={result.checks.notCommon && result.checks.noEmailMatch}
              label="Not easily guessable"
            />

            {confirmPassword !== undefined && (
              <div className="sm:col-span-2 pt-0.5 border-t border-slate-200/50 dark:border-slate-800/50">
                <RequirementItem
                  satisfied={passwordsMatch}
                  label={
                    passwordsMatch
                      ? 'Passwords match perfectly'
                      : confirmPassword.length > 0
                      ? 'Passwords do not match yet'
                      : 'Confirm password must match'
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors ${
        satisfied ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
          satisfied
            ? 'bg-emerald-500/20 text-emerald-500'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
        }`}
      >
        {satisfied ? <Check className="w-2.5 h-2.5" /> : <X className="w-2 h-2" />}
      </div>
      <span>{label}</span>
    </div>
  );
}
