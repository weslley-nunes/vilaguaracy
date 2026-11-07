// Efeitos sonoros sintetizados via Web Audio API (sem necessidade de arquivos externos)

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, type = "sine", duration = 0.15, delay = 0, volume = 0.12) {
    if (this.muted || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration + 0.02);
    } catch (e) {
      // Ignora bloqueio de autoplay do navegador
    }
  }

  playBuy() {
    // Som de ordem de compra executada (acorde ascendente otimista)
    this.playTone(523.25, "triangle", 0.12, 0, 0.14); // C5
    this.playTone(659.25, "triangle", 0.12, 0.08, 0.14); // E5
    this.playTone(783.99, "triangle", 0.22, 0.16, 0.16); // G5
  }

  playSell() {
    // Som de venda / caixa registradora
    this.playTone(880, "sine", 0.1, 0, 0.14); // A5
    this.playTone(1174.66, "sine", 0.25, 0.09, 0.16); // D6
  }

  playBreakingNews() {
    // Vinheta estilo Plantão de Telejornal Financeiro
    this.playTone(587.33, "sawtooth", 0.14, 0, 0.09);    // D5
    this.playTone(587.33, "sawtooth", 0.14, 0.16, 0.09); // D5
    this.playTone(880.00, "sawtooth", 0.28, 0.32, 0.11); // A5
    this.playTone(783.99, "sawtooth", 0.35, 0.62, 0.10); // G5
  }

  playBell() {
    // Sino de Abertura / Encerramento da Bolsa B3V
    this.playTone(1046.5, "sine", 0.45, 0, 0.18);
    this.playTone(1046.5, "sine", 0.45, 0.35, 0.18);
    this.playTone(1318.5, "sine", 0.7, 0.7, 0.2);
  }
}

export const soundFX = new SoundManager();
