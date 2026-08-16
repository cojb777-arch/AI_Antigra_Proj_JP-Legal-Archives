/* =========================================================
   🔊 SPEECH SERVICE (Web Speech API 条文素読・音声朗読)
   ========================================================= */

export const SpeechService = {
  synth: window.speechSynthesis,
  currentUtterance: null as SpeechSynthesisUtterance | null,
  rate: 1.0,

  speak(text: string, title: string = "条文を素読中", onEnd?: () => void): void {
    this.stop();

    if (!('speechSynthesis' in window)) {
      alert('お使いのブラウザは音声読み上げ機能に対応しておりません。');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = this.rate;

    // 日本語音声を探す
    const voices = this.synth.getVoices();
    const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    const bar = document.getElementById('global-speech-bar');
    const titleEl = document.getElementById('speech-title');
    if (bar && titleEl) {
      titleEl.textContent = title;
      bar.classList.remove('hidden');
    }

    utterance.onend = () => {
      if (bar) bar.classList.add('hidden');
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      if (bar) bar.classList.add('hidden');
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  },

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    } else if (this.synth.paused) {
      this.synth.resume();
    }
  },

  stop(): void {
    if (this.synth.speaking || this.synth.paused) {
      this.synth.cancel();
    }
    const bar = document.getElementById('global-speech-bar');
    if (bar) bar.classList.add('hidden');
    this.currentUtterance = null;
  },

  setRate(rate: number): void {
    this.rate = rate;
  }
};
