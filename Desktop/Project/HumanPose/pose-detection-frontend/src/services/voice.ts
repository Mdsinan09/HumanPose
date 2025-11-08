import { useEffect } from 'react';

export function speak(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const useVoiceFeedback = (feedbackText: string) => {
  useEffect(() => {
    speak(feedbackText);
  }, [feedbackText]);
};

export default { speak, stopSpeaking };