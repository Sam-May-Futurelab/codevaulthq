// Audio feedback system for Code Vault HQ
class AudioFeedback {
  private static instance: AudioFeedback;
  private context: AudioContext | null = null;
  private enabled: boolean = false;

  private constructor() {
    // Initialize on first user interaction
    this.initializeOnFirstInteraction();
  }

  public static getInstance(): AudioFeedback {
    if (!AudioFeedback.instance) {
      AudioFeedback.instance = new AudioFeedback();
    }
    return AudioFeedback.instance;
  }

  private initializeOnFirstInteraction() {
    const initialize = () => {
      if (!this.context) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.enabled = true;
      }
      document.removeEventListener('click', initialize);
      document.removeEventListener('keydown', initialize);
    };

    document.addEventListener('click', initialize);
    document.addEventListener('keydown', initialize);
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.context || !this.enabled) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  public playHover() {
    this.createTone(800, 0.1, 'sine', 0.05);
  }

  public playClick() {
    this.createTone(1200, 0.15, 'square', 0.08);
  }

  public playSuccess() {
    if (!this.context || !this.enabled) return;
    
    // Play a pleasant success chord
    setTimeout(() => this.createTone(523.25, 0.3, 'sine', 0.06), 0);   // C5
    setTimeout(() => this.createTone(659.25, 0.3, 'sine', 0.06), 50);  // E5
    setTimeout(() => this.createTone(783.99, 0.3, 'sine', 0.06), 100); // G5
  }

  public playError() {
    this.createTone(200, 0.3, 'sawtooth', 0.08);
  }

  public playUpload() {
    // Futuristic upload sound
    if (!this.context || !this.enabled) return;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createTone(400 + i * 100, 0.1, 'square', 0.04);
      }, i * 50);
    }
  }

  public toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }
}

export default AudioFeedback;
