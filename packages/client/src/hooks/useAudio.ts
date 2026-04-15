import { useRef, useCallback, useState } from "react";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolumeState] = useState(0.8);

  const play = useCallback((url: string, vol?: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(url);
    audio.volume = vol ?? volume;
    audio.play().catch(console.error);
    audioRef.current = audio;
  }, [volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  return { play, stop, volume, setVolume };
}
