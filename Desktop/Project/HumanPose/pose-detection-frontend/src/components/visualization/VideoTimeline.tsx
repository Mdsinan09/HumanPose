import { useEffect, useState } from 'react';

interface Thumb {
  time: number;
  src: string;
}

interface Props {
  videoEl: HTMLVideoElement | null;
  duration?: number;
  intervalSeconds?: number;
  onSeek?: (time: number) => void;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function VideoTimeline({ videoEl, duration = 0, intervalSeconds = 1, onSeek }: Props) {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!videoEl || !duration || duration <= 0) return;
    let cancelled = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const wasPlaying = !videoEl.paused && !videoEl.ended;
    const createThumb = async (t: number) => {
      return new Promise<Thumb | null>((resolve) => {
        const onSeeked = () => {
          try {
            canvas.width = videoEl.videoWidth || 160;
            canvas.height = videoEl.videoHeight || 90;
            if (ctx) ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL('image/jpeg', 0.6);
            resolve({ time: t, src: data });
          } catch {
            resolve(null);
          } finally {
            videoEl.removeEventListener('seeked', onSeeked);
          }
        };
        videoEl.addEventListener('seeked', onSeeked, { once: true });
        videoEl.currentTime = clamp(t, 0, duration);
      });
    };

    (async () => {
      try {
        videoEl.pause();
        const temp: Thumb[] = [];
        for (let t = 0; t < duration; t += intervalSeconds) {
          if (cancelled) break;
          const thumb = await createThumb(Math.min(t, duration));
          if (thumb) temp.push(thumb);
        }
        if (!cancelled) setThumbs(temp);
      } finally {
        if (!cancelled && wasPlaying) {
          videoEl.play().catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoEl, duration, intervalSeconds]);

  useEffect(() => {
    if (!videoEl) return;
    const onTime = () => setCurrent(videoEl.currentTime);
    videoEl.addEventListener('timeupdate', onTime);
    return () => videoEl.removeEventListener('timeupdate', onTime);
  }, [videoEl]);

  return (
    <div className="mt-4">
      <div className="flex gap-2 overflow-x-auto py-2">
        {thumbs.length === 0 ? (
          <div className="text-sm text-gray-400">Generating thumbnails…</div>
        ) : (
          thumbs.map((t, idx) => (
            <button
              key={idx}
              onClick={() => onSeek && onSeek(t.time)}
              className={`relative rounded overflow-hidden border ${Math.abs(current - t.time) < (intervalSeconds / 2) ? 'ring-2 ring-blue-500' : 'border-gray-700'}`}
              aria-label={`Seek to ${Math.round(t.time)}s`}
              title={`${Math.round(t.time)}s`}
            >
              <img src={t.src} className="w-32 h-20 object-cover" alt={`thumb-${idx}`} />
              <div className="absolute bottom-0 right-0 bg-black/60 text-xs text-white px-1">
                {Math.round(t.time)}s
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}