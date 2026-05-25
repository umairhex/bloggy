'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { isDBConfigured } from '@/lib/config/storage';

export default function OnboardingTour() {
  useEffect(() => {
    const isConfigured = isDBConfigured();
    const onboardingCompleted = localStorage.getItem('bloggy_onboarding_completed') === 'true';

    if (isConfigured || onboardingCompleted) {
      return;
    }

    const timer = setTimeout(() => {
      const configBtn = document.getElementById('db-config-button');
      if (!configBtn) return;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        popoverClass: 'driverjs-theme',
        nextBtnText: 'Next \u00A0 \u2192',
        prevBtnText: '\u2190 \u00A0 Previous',
        doneBtnText: 'Done',
        steps: [
          {
            popover: {
              title: 'Welcome to Bloggy!',
              description:
                'A premium, privacy-first blogging workspace. All your posts and configurations are kept strictly on your local device under your own control.',
            },
          },
          {
            element: '#db-config-button',
            popover: {
              title: 'Connect Your MongoDB',
              description:
                'Click this gear icon to connect your MongoDB database. Local URIs work only when Bloggy runs locally; hosted deployments need a publicly reachable host or Atlas.',
              side: 'bottom',
              align: 'end',
            },
          },
          {
            element: '#nav-editor',
            popover: {
              title: 'Compose Beautiful Stories',
              description:
                'Once connected, our immersive rich-text editor lets you write posts, add tags, feature images, and manage SEO parameters effortlessly.',
              side: 'right',
              align: 'start',
            },
          },
          {
            element: '#nav-projects',
            popover: {
              title: 'Manage Multiple Projects',
              description:
                'Organize your posts across different blogs or projects with custom names and individual configurations.',
              side: 'right',
              align: 'start',
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem('bloggy_onboarding_completed', 'true');
        },
      });

      driverObj.drive();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
