'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  X,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONFIRMATION_PREFIXES = [
  'DELETE-TEQVU',
  'CONFIRM-PURGE',
  'TERMINATE-ACCOUNT',
  'PERMANENT-DELETE',
  'WIPE-MY-DATA',
];

function generateConfirmationWord(): string {
  const prefix = CONFIRMATION_PREFIXES[Math.floor(Math.random() * CONFIRMATION_PREFIXES.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const { currentUser, deleteAccount } = useAppStore();

  const [confirmationWord, setConfirmationWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate a fresh confirmation word whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmationWord(generateConfirmationWord());
      setUserInput('');
      setErrorMsg(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = userInput.trim() === confirmationWord;

  const handleCopyWord = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(confirmationWord);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateWord = () => {
    setConfirmationWord(generateConfirmationWord());
    setUserInput('');
    setErrorMsg(null);
  };

  const handleDelete = async () => {
    if (!isMatch) {
      setErrorMsg(`Verification failed. Please enter "${confirmationWord}" exactly.`);
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      await deleteAccount();
      onClose();
      router.push('/signin?notice=account_deleted');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f1629] border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-red-500/5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Delete TeQVu Account
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                  Irreversible
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Account:{' '}
                <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                  {currentUser.email || 'Current Account'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: This action cannot be undone</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-red-700 dark:text-red-300/90 pl-1 leading-relaxed">
              <li>Your personal profile, preferences, and custom settings will be permanently erased.</li>
              <li>All bookmarked intelligence dossiers and monitored watchlist items will be cleared.</li>
              <li>Automated newsletter delivery schedules and email subscriptions will be canceled.</li>
              <li>Your authentication credentials will be removed from the system.</li>
            </ul>
          </div>

          {/* System Given Confirmation Word Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                System-Given Verification Phrase
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyWord}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition"
                  title="Copy verification phrase"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <span className="text-slate-400">&bull;</span>
                <button
                  type="button"
                  onClick={handleRegenerateWord}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition"
                  title="Generate another word"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>New Word</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono font-black text-sm sm:text-base tracking-widest text-cyan-400 select-all shadow-inner">
              {confirmationWord}
            </div>
            <p className="text-[11px] text-slate-400">
              To verify your intention, please type the exact verification phrase displayed above into the field below:
            </p>
          </div>

          {/* User Confirmation Input */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isDeleting}
                placeholder={`Type "${confirmationWord}" here`}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs font-mono text-slate-900 dark:text-white uppercase tracking-wider focus:outline-none transition ${
                  isMatch
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-red-500'
                }`}
                autoComplete="off"
                spellCheck="false"
              />
              {isMatch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-400 text-[11px] font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-[11px] font-mono text-red-400 animate-fade-in">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
