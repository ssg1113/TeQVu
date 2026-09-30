'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { playNotificationSound } from '../../lib/utils';
import type { Technology, Article, AppNotification } from '../../lib/types';

export function NotificationManager() {
  const {
    watchlistIds,
    interests,
    newsletterPrefs,
    addNotification,
    hasNotifiedKey,
    recordNotifiedKey,
  } = useAppStore();

  const isCheckingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkSignals = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      // Fetch latest news and trends simultaneously
      const [newsRes, trendsRes] = await Promise.allSettled([
        fetch('/api/tech-news?limit=15', { cache: 'no-store' }),
        fetch('/api/trends?timeframe=24h', { cache: 'no-store' }),
      ]);

      let newNotificationsToQueue: AppNotification[] = [];

      // 1. EVALUATE MOST IMPORTANT NEWS UPDATE
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        if (newsData.success && Array.isArray(newsData.articles) && newsData.articles.length > 0) {
          const articles: Article[] = newsData.articles;

          // Priority score for articles based on source trust, breaking keywords, and freshness
          const scoredArticles = articles.map((article) => {
            const titleLower = article.title.toLowerCase();
            const summaryLower = (article.summary || '').toLowerCase();
            let score = article.source?.trustScore || 8;

            // Breaking / urgent keyword weighting
            const highImpactWords = [
              'breaking',
              'critical vulnerability',
              'zero-day',
              'unveils',
              'launches',
              'breakthrough',
              'releases',
              'major update',
              'merges',
              'acquires',
              'open source',
              'quantum supremacy',
              'gpt-5',
              'gemini',
              'claude',
              'deepmind',
              'nvidia',
            ];
            for (const word of highImpactWords) {
              if (titleLower.includes(word)) score += 4;
              else if (summaryLower.includes(word)) score += 2;
            }

            // User interest match weighting
            if (interests.some((int) => article.category.toLowerCase().includes(int.toLowerCase()))) {
              score += 3;
            }

            return { article, score };
          });

          scoredArticles.sort((a, b) => b.score - a.score);
          const topArticle = scoredArticles[0]?.article;

          if (topArticle) {
            // Stable signature key for the article
            const articleKey = `article-${topArticle.id || topArticle.title.toLowerCase().slice(0, 35).replace(/\s+/g, '-')}`;

            if (!hasNotifiedKey(articleKey)) {
              recordNotifiedKey(articleKey);

              const isBreaking =
                topArticle.isBreaking ||
                /breaking|unveils|critical|vulnerability|launches|breakthrough/i.test(topArticle.title);

              const newsNotification: AppNotification = {
                id: `notif-news-${Date.now()}`,
                title: topArticle.title,
                message: topArticle.summary
                  ? topArticle.summary.slice(0, 160) + (topArticle.summary.length > 160 ? '...' : '')
                  : `High-priority intelligence report from ${topArticle.source.name}.`,
                type: isBreaking ? 'breaking' : 'update',
                category: topArticle.category,
                timestamp: new Date().toISOString(),
                url: topArticle.url,
                link: '/latest',
                isRead: false,
                importance: 'high',
                metric: `${topArticle.source.name || 'Verified Source'}`,
                sourceName: topArticle.source.name,
              };

              newNotificationsToQueue.push(newsNotification);
            }
          }
        }
      }

      // 2. EVALUATE MOST IMPORTANT TECHNOLOGY TREND
      if (trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
        const trendsData = await trendsRes.value.json();
        const techList: Technology[] =
          trendsData.technologies || trendsData.trends || [];

        if (techList.length > 0) {
          // Sort to find the highest velocity emerging trend
          const sortedTechs = [...techList].sort((a, b) => {
            // Favor followed watchlist techs
            const aWatched = watchlistIds.includes(a.id) ? 30 : 0;
            const bWatched = watchlistIds.includes(b.id) ? 30 : 0;
            return (b.growth + bWatched) - (a.growth + aWatched);
          });

          const topTrend = sortedTechs[0];

          if (topTrend) {
            // Unique signature key combining tech slug and growth tier
            const growthTier = Math.floor((topTrend.growth || 0) / 15);
            const trendKey = `trend-${topTrend.slug || topTrend.id}-tier${growthTier}`;

            if (!hasNotifiedKey(trendKey)) {
              recordNotifiedKey(trendKey);

              const isWatchlist = watchlistIds.includes(topTrend.id);
              const trendNotification: AppNotification = {
                id: `notif-trend-${Date.now()}`,
                title: isWatchlist
                  ? `Watchlist Surge: ${topTrend.name}`
                  : `Breakout Trend: ${topTrend.name}`,
                message:
                  topTrend.whyTrending ||
                  topTrend.description ||
                  `Mentions and velocity surging across open-source repositories and research papers.`,
                type: isWatchlist ? 'watchlist' : 'trend',
                category: topTrend.category,
                timestamp: new Date().toISOString(),
                url: topTrend.github || topTrend.website || `/technologies/${topTrend.slug}`,
                link: `/trending`,
                isRead: false,
                importance: 'high',
                metric: `+${topTrend.growth}% Velocity`,
                sourceName: 'Tech Radar',
                relatedTech: topTrend.name,
              };

              newNotificationsToQueue.push(trendNotification);
            }
          }
        }
      }

      // 3. DISPATCH NOTIFICATIONS WITH QUEUE PACING
      if (newNotificationsToQueue.length > 0) {
        newNotificationsToQueue.forEach((notif) => {
          addNotification(notif);
        });
        playNotificationSound();

        // Native browser notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(newNotificationsToQueue[0].title, {
              body: newNotificationsToQueue[0].message,
              icon: '/logo-emblem.png',
            });
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn('Notification signal check failed:', err);
    } finally {
      isCheckingRef.current = false;
    }
  }, [
    watchlistIds,
    interests,
    newsletterPrefs,
    addNotification,
    hasNotifiedKey,
    recordNotifiedKey,
  ]);

  useEffect(() => {
    // Initial check on mount
    checkSignals();

    // Check periodically every 60 seconds
    const interval = setInterval(checkSignals, 60 * 1000);

    // Also check when window regains focus
    const handleFocus = () => {
      checkSignals();
    };
    window.addEventListener('focus', handleFocus);

    // Optional global debug hook for manual test in console
    (window as any).__teqvuCheckSignals = checkSignals;

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkSignals]);

  return null;
}
