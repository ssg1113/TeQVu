'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { playNotificationSound } from '../../lib/utils';
import type { Technology, Article, AppNotification } from '../../lib/types';

// Minimum time between real-time notification alerts (30 minutes)
const MIN_NOTIFICATION_INTERVAL_MS = 30 * 60 * 1000;
// Polling cycle: check once every 15 minutes (stepped down from 1 minute)
const CHECK_CYCLE_MS = 15 * 60 * 1000;

// High-severity keywords that signify truly critical tech events
const CRITICAL_SECURITY_KEYWORDS = [
  'zero-day',
  '0-day',
  'critical cve',
  'critical vulnerability',
  'actively exploited',
  'remote code execution',
  'emergency patch',
  'major security breach',
  'catastrophic exploit',
  'global infrastructure outage',
];

const CRITICAL_BREAKTHROUGH_KEYWORDS = [
  'gpt-5',
  'quantum supremacy',
  'agi breakthrough',
  'revolutionary reasoning architecture',
  'supercomputing milestone',
];

function isWithinQuietHours(quietStart?: string, quietEnd?: string): boolean {
  if (!quietStart || !quietEnd) return false;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = quietStart.split(':').map(Number);
    const [endH, endM] = quietEnd.split(':').map(Number);

    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Over midnight (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  } catch {
    return false;
  }
}

export function NotificationManager() {
  const {
    isAuthenticated,
    watchlistIds,
    newsletterPrefs,
    addNotification,
    hasNotifiedKey,
    recordNotifiedKey,
  } = useAppStore();

  const isCheckingRef = useRef(false);

  const checkSignals = useCallback(async () => {
    // 1. Guard against unauthenticated users or alerts disabled
    if (!isAuthenticated || newsletterPrefs.enableAlerts === false || isCheckingRef.current) {
      return;
    }

    // 2. Enforce strict pacing / cooldown (maximum 1 notification per 30 minutes)
    if (typeof window !== 'undefined') {
      const lastDispatchStr = localStorage.getItem('teqvu_last_critical_dispatch');
      if (lastDispatchStr) {
        const lastDispatch = parseInt(lastDispatchStr, 10);
        if (!isNaN(lastDispatch) && Date.now() - lastDispatch < MIN_NOTIFICATION_INTERVAL_MS) {
          return;
        }
      }
    }

    isCheckingRef.current = true;

    try {
      // Fetch latest articles and trends simultaneously
      const [newsRes, trendsRes] = await Promise.allSettled([
        fetch('/api/tech-news?limit=20', { cache: 'no-store' }),
        fetch('/api/trends?timeframe=24h', { cache: 'no-store' }),
      ]);

      let candidateNotification: AppNotification | null = null;

      // 3. EVALUATE ARTICLES FOR RARE, HIGH-SEVERITY EVENTS
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        if (newsData.success && Array.isArray(newsData.articles)) {
          const articles: Article[] = newsData.articles;

          for (const article of articles) {
            const titleLower = article.title.toLowerCase();
            const summaryLower = (article.summary || '').toLowerCase();

            const isSecurityCritical = CRITICAL_SECURITY_KEYWORDS.some(
              (kw) => titleLower.includes(kw) || summaryLower.includes(kw)
            );

            const isTechBreakthrough = CRITICAL_BREAKTHROUGH_KEYWORDS.some(
              (kw) => titleLower.includes(kw) || summaryLower.includes(kw)
            );

            // Article qualifies ONLY if it represents a critical zero-day, monumental frontier breakthrough, or massive multi-outlet breaking cluster
            if (isSecurityCritical || isTechBreakthrough || (article.isBreaking && (article.clusterSize || 0) >= 6)) {
              const articleKey = `critical-news-${article.id || titleLower.slice(0, 30).replace(/\s+/g, '-')}`;

              if (!hasNotifiedKey(articleKey)) {
                recordNotifiedKey(articleKey);

                candidateNotification = {
                  id: `notif-crit-${Date.now()}`,
                  title: isSecurityCritical
                    ? `Critical Security Alert: ${article.title}`
                    : `Frontier Tech Breakthrough: ${article.title}`,
                  message: article.summary
                    ? article.summary.slice(0, 160) + (article.summary.length > 160 ? '...' : '')
                    : `Urgent intelligence report verified by ${article.source?.name || 'Security Wire'}.`,
                  type: 'breaking',
                  category: article.category,
                  timestamp: new Date().toISOString(),
                  url: article.url,
                  link: '/latest',
                  isRead: false,
                  importance: 'critical',
                  metric: isSecurityCritical ? 'Zero-Day Advisory' : 'Frontier Milestone',
                  sourceName: article.source?.name || 'Verified Signal',
                };
                break; // Found top critical event; stop searching articles
              }
            }
          }
        }
      }

      // 4. EVALUATE TRENDS ONLY FOR PHENOMENAL BREAKOUT SURGES (>150% Velocity)
      if (!candidateNotification && trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
        const trendsData = await trendsRes.value.json();
        const techList: Technology[] = trendsData.technologies || trendsData.trends || [];

        // Filter strictly to massive breakouts (>150% growth with high mention volume)
        const criticalSurges = techList.filter((tech) => {
          const isExtremeGrowth = tech.growth >= 150 && (tech.mentions || 0) >= 12000;
          const isWatchlistSurge = watchlistIds.includes(tech.id) && tech.growth >= 120;
          return isExtremeGrowth || isWatchlistSurge;
        });

        if (criticalSurges.length > 0) {
          criticalSurges.sort((a, b) => b.growth - a.growth);
          const topBreakout = criticalSurges[0];
          const trendKey = `critical-surge-${topBreakout.slug || topBreakout.id}-${Math.floor(topBreakout.growth / 50)}`;

          if (!hasNotifiedKey(trendKey)) {
            recordNotifiedKey(trendKey);

            candidateNotification = {
              id: `notif-surge-${Date.now()}`,
              title: `Unprecedented Breakout Surge: ${topBreakout.name}`,
              message:
                topBreakout.whyTrending ||
                `Exponential velocity (+${topBreakout.growth}%) surging across global open-source infrastructure and research clusters.`,
              type: 'trend',
              category: topBreakout.category,
              timestamp: new Date().toISOString(),
              url: topBreakout.github || topBreakout.website || `/technologies/${topBreakout.slug}`,
              link: '/trending',
              isRead: false,
              importance: 'critical',
              metric: `+${topBreakout.growth}% Surge`,
              sourceName: 'Tech Radar Peak',
              relatedTech: topBreakout.name,
            };
          }
        }
      }

      // 5. DISPATCH THE SINGLE CRITICAL NOTIFICATION (Paced & Respecting Quiet Hours)
      if (candidateNotification) {
        addNotification(candidateNotification);

        // Record timestamp to enforce 30-minute cooldown
        if (typeof window !== 'undefined') {
          localStorage.setItem('teqvu_last_critical_dispatch', Date.now().toString());
        }

        // Only play audio if not during user's configured quiet hours
        const quiet = isWithinQuietHours(
          newsletterPrefs.quietHoursStart,
          newsletterPrefs.quietHoursEnd
        );

        if (!quiet) {
          playNotificationSound();

          // Native browser alert for critical breaking news if permitted
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(candidateNotification.title, {
                body: candidateNotification.message,
                icon: '/icon.png',
              });
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (err) {
      console.warn('Critical radar check note:', err);
    } finally {
      isCheckingRef.current = false;
    }
  }, [
    isAuthenticated,
    watchlistIds,
    newsletterPrefs,
    addNotification,
    hasNotifiedKey,
    recordNotifiedKey,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial check on mount
    checkSignals();

    // Check periodically on a 15-minute interval (stepped down from aggressive 1-minute loop)
    const interval = setInterval(checkSignals, CHECK_CYCLE_MS);

    // Optional global debug hook for testing critical signals in browser console
    (window as any).__teqvuCheckSignals = checkSignals;

    return () => {
      clearInterval(interval);
    };
  }, [checkSignals, isAuthenticated]);

  return null;
}
