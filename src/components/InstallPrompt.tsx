// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState, type MouseEvent } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isInstalledStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const IOS_USER_AGENT = /iPhone|iPad|iPod/.test(navigator.userAgent);

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (isInstalledStandalone()) return null;

  const install = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    await deferredPrompt!.prompt();
    await deferredPrompt!.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      {IOS_USER_AGENT && !deferredPrompt && (
        <button
          type="button"
          className="install-info"
          aria-label="How to install on iOS"
          aria-haspopup="dialog"
          onClick={() => setShowHelp(true)}
        >
          ⓘ
        </button>
      )}
      {IOS_USER_AGENT && !deferredPrompt && showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="How to install on iOS"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Install on iOS</h3>
              <button className="modal-close" onClick={() => setShowHelp(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="install-help-body">
              <ol>
                <li>Tap the <strong>Share</strong> icon in the toolbar.</li>
                <li>Tap <strong>“Add to Home Screen”</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
              <p>
                You can then use Mahjong Trainer offline from your home screen.
              </p>
            </div>
          </div>
        </div>
      )}
      {!IOS_USER_AGENT && deferredPrompt && (
        <a href="#" className="install-link" onClick={install} role="button">
          Install app
        </a>
      )}
    </>
  );
}
