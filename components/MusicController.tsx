"use client";

import { useEffect } from "react";
import { isMusicEnabled, SETTINGS_EVENT, type AppSettings } from "@/lib/settings";
import { startMusic, stopMusic } from "@/lib/music";

/**
 * Pemutar musik latar global (dipasang di layout).
 * - Menyalakan/mematikan musik saat preferensi berubah.
 * - Karena browser memblokir autoplay, saat halaman dimuat ulang musik
 *   baru mulai setelah interaksi pertama (pointerdown/keydown).
 */
export default function MusicController() {
  useEffect(() => {
    const startIfEnabled = () => {
      if (isMusicEnabled()) startMusic();
    };

    const onFirstInteraction = () => {
      startIfEnabled();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
    window.addEventListener("pointerdown", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);

    const onSettingsChanged = (e: Event) => {
      const settings = (e as CustomEvent<AppSettings>).detail;
      if (settings.music) startMusic();
      else stopMusic();
    };
    window.addEventListener(SETTINGS_EVENT, onSettingsChanged);

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener(SETTINGS_EVENT, onSettingsChanged);
      stopMusic();
    };
  }, []);

  return null;
}
