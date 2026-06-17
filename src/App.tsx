import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Backpack, Settings, Eye, Sliders, X } from "lucide-react";

const MenuTypewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let index = 0;
    const playTick = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800 + Math.random() * 150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.02);
      } catch (e) {}
    };

    timerRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        playTick();
        index++;
      } else {
        clearInterval(timerRef.current);
      }
    }, 20);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text]);

  return (
    <div className="text-[10px] md:text-[11px] font-mono text-amber-500/95 tracking-[0.15em] font-extrabold uppercase min-h-[40px] max-w-[340px] text-center border-t border-white/10 pt-3.5 w-full leading-normal">
      {displayedText}
    </div>
  );
};

declare global {
  interface Window {
    respawnTriggered: boolean;
    selectedSkinMain: string;
    selectedSkinDark: string;
    selectedSkinHands: string;
  }
}

const CAMPFIRE_BIOS: Record<string, {
  name: string;
  role: string;
  lore: string;
  history: string;
  preferredWeapon: string;
  resistencia: string;
  velocidade: string;
  dano: string;
  colorClass: string;
  skinId: string;
  statWidths: { res: string; vel: string; dmg: string };
  imgScale: string;
  imgTranslateY: string;
}> = {
  red: {
    name: "Líder Brank",
    role: "Veterano & Estrategista",
    lore: "Assumiu a liderança do grupo após o colapso mundial. Mantém a ordem com punho de ferro e táticas precisas de combate urbano.",
    history: "Sobreviveu a três cercos em metrópoles destruídas. Sua blindagem vermelha foi forjada de placas de blindagem militar. Seu lema é: 'Nenhum sobrevivente fica para trás'.",
    preferredWeapon: "Pistola Pesada (Dano de Fogo +25%)",
    resistencia: "-20% de Dano Recebido",
    velocidade: "1.00x Velocidade padrão",
    dano: "+25% Dano de Pistola",
    colorClass: "text-red-500",
    skinId: "red",
    statWidths: { res: "80%", vel: "75%", dmg: "80%" },
    imgScale: "135%",
    imgTranslateY: "25px"
  },
  purple: {
    name: "Sniper Mexicano",
    role: "Atirador de Elite Fantasma",
    lore: "Silencioso e letal nas regiões áridas. Ele consegue se mover rapidamente pelo terreno sem ser notado por hordas.",
    history: "Conhecido como 'El Espectro'. Ele limpou caminhos inteiros abrindo espaço de cobertura para sobreviventes com disparos precisos a longa distância.",
    preferredWeapon: "Rifle de Assalto / Precisão (+30%)",
    resistencia: "Dano padrão",
    velocidade: "1.15x Velocidade aumentada",
    dano: "+30% Dano de Rifle",
    colorClass: "text-purple-500",
    skinId: "purple",
    statWidths: { res: "50%", vel: "90%", dmg: "85%" },
    imgScale: "185%",
    imgTranslateY: "82px"
  },
  orange: {
    name: "Nier o Bazuqueiro",
    role: "Especialista em Demolições",
    lore: "Equipado com traje selado pesado. Acredita que a melhor defesa é uma explosão colossal para limpar o perímetro.",
    history: "Ex-engenheiro de escavação, ele adaptou lançadores de foguetes para conter grandes aglomerações e mutações gigantes de zumbis.",
    preferredWeapon: "Lança-Foguetes / Bazuca (+50%)",
    resistencia: "-40% de Dano Recebido (Pesado)",
    velocidade: "0.85x Velocidade reduzida",
    dano: "+50% Dano de Bazuca",
    colorClass: "text-amber-500",
    skinId: "orange",
    statWidths: { res: "100%", vel: "60%", dmg: "100%" },
    imgScale: "140%",
    imgTranslateY: "32px"
  },
  blue: {
    name: "Bluer Louco",
    role: "Combatente Ágil e Veloz",
    lore: "Reflexos sobre-humanos e impulsivo. Limpa corredores apertados e escapa de cercos inimigos em frações de segundos.",
    history: "Piloto de fuga de elite. Quando a infecção estourou, converteu sua coordenação motora para desviar de zumbis com rajadas rápidas de Uzi.",
    preferredWeapon: "Uzi / Submetralhadora (+20%)",
    resistencia: "-10% de Dano Recebido",
    velocidade: "1.25x Velocidade máxima",
    dano: "+20% Dano de Uzi",
    colorClass: "text-sky-500",
    skinId: "blue",
    statWidths: { res: "70%", vel: "100%", dmg: "70%" },
    imgScale: "140%",
    imgTranslateY: "38px"
  }
};

const availableSkins = [
  {
    id: "red",
    colorMain: "#dc2626",
    colorDark: "#991b1b",
    colorSkin: "#fca5a5",
    name: "Líder Brank",
    desc: "Comandante implacável da linha de frente. Liderança forte e precisão militar.",
    arma: "M4 ASSAULT RIFLE",
    resistencia: "-20% Dano Recebido",
    velocidade: "1.00x (Padrão)",
    dano: "+25% Dano com Fuzil de Assalto",
    imgUrl: "/lendas/personagens/lider brank.jpeg",
    stats: { resistance: 0.8, speed: 1.0, damage: 1.25, preferredWeapon: "gun" }
  },
  {
    id: "purple",
    colorMain: "#9333ea",
    colorDark: "#6b21a8",
    colorSkin: "#e9d5ff",
    name: "Sniper Mexicano",
    desc: "Atirador de elite fantasma. Frio, preciso e extremamente furtivo.",
    arma: "HEAVY SNIPER RIFLE",
    resistencia: "1.00x (Padrão)",
    velocidade: "1.15x (+15% Rápido)",
    dano: "+30% Dano com Sniper Rifle",
    imgUrl: "/lendas/personagens/Sniper mexicano.jpeg",
    stats: { resistance: 1.0, speed: 1.15, damage: 1.30, preferredWeapon: "rifle" }
  },
  {
    id: "orange",
    colorMain: "#f97316",
    colorDark: "#c2410c",
    colorSkin: "#fdba74",
    name: "Nier o Bazuqueiro",
    desc: "Demolidor tático pesado. Armadura impenetrável e destruição massiva.",
    arma: "ROCKET LAUNCHER",
    resistencia: "-40% Dano Recebido",
    velocidade: "0.85x (-15% Lento)",
    dano: "+50% Dano com Bazuca",
    imgUrl: "/lendas/personagens/nier o bazuqueiro.jpeg",
    stats: { resistance: 0.6, speed: 0.85, damage: 1.50, preferredWeapon: "basuca" }
  },
  {
    id: "blue",
    colorMain: "#2563eb",
    colorDark: "#1d4ed8",
    colorSkin: "#bfdbfe",
    name: "Bluer Louco",
    desc: "Especialista ágil em combate de curta distância. Velocidade de reação absurda.",
    arma: "DUAL UZIS",
    resistencia: "-10% Dano Recebido",
    velocidade: "1.25x (+25% Rápido)",
    dano: "+20% Dano com Uzi",
    imgUrl: "/lendas/personagens/bluer louco.jpeg",
    stats: { resistance: 0.9, speed: 1.25, damage: 1.20, preferredWeapon: "uzi" }
  },
];

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  public menuMusic: HTMLAudioElement | null = null;
  public gameplayMusic: HTMLAudioElement | null = null;
  private zombies: HTMLAudioElement | null = null;
  private motor: HTMLAudioElement | null = null;
  private sounds: Record<string, HTMLAudioElement> = {};
  private activeMusicType: "NONE" | "MENU" | "GAMEPLAY" = "NONE";
  private fadeIntervals: Set<any> = new Set();
  private menuMusicSource: MediaElementAudioSourceNode | null = null;
  private gameplayMusicSource: MediaElementAudioSourceNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  // Custom Track Rotation properties
  private gameplayTracks: string[] = [
    "/sounds/alec_koff-heavy-doom-dark-metal-493397.mp3",
    "/sounds/dragon-studio-dance-with-demons-fight-music-316548.mp3",
    "/sounds/warbringerghesh-cloud-of-doom-538508.mp3"
  ];
  private currentTrackIndex = 0;
  private maxTrackDuration = 90; // Cut tracks at 90 seconds (1 minute 30 seconds)
  private trackCheckInterval: any = null;
  public isMuted = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.menuMusic = new Audio("/sounds/musica_menu.mp3");
      this.menuMusic.loop = true;
      this.menuMusic.volume = 0.35;

      // Start with the first gameplay track
      this.gameplayMusic = new Audio(this.gameplayTracks[0]);
      this.gameplayMusic.loop = false; // We cycle tracks instead of looping one
      this.gameplayMusic.volume = 0.25;

      this.music = this.gameplayMusic;

      this.zombies = new Audio("/sounds/somde zumbis.mp3");
      this.zombies.loop = true;
      this.zombies.volume = 0;

      this.motor = new Audio("/sounds/motor combe.mp3");
      this.motor.loop = true;
      this.motor.volume = 0;

      const soundFiles = {
        death: "/sounds/zumbi morrendo.mp3",
        headshot: "/sounds/read choot zumbi.mp3",
        heart: "/sounds/coletacoraçao.mp3",
        horn: "/sounds/buzina combe.mp3",
        gameover: "/sounds/gamer over.mp3",
        zombieShoot: "/sounds/tiro zumbi.mp3"
      };

      Object.entries(soundFiles).forEach(([name, path]) => {
        this.sounds[name] = new Audio(path);
      });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    // Set up persistent music filters to avoid browser audio graph crashes
    if (this.ctx && !this.musicFilter) {
      try {
        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = "lowpass";
        this.musicFilter.frequency.setValueAtTime(
          (window as any).cinematicModeActive ? 850 : 22000,
          this.ctx.currentTime
        );
        this.musicFilter.connect(this.ctx.destination);
        
        if (this.menuMusic) {
          this.menuMusicSource = this.ctx.createMediaElementSource(this.menuMusic);
          this.menuMusicSource.connect(this.musicFilter);
        }
        if (this.gameplayMusic) {
          this.gameplayMusicSource = this.ctx.createMediaElementSource(this.gameplayMusic);
          this.gameplayMusicSource.connect(this.musicFilter);
        }
      } catch (e) {
        console.warn("Could not route music through AudioContext filters:", e);
      }
    }
    
    return this.ctx;
  }

  public playTypewriterSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1450, time);
    osc.frequency.exponentialRampToValueAtTime(550, time + 0.025);
    
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.03);
  }

  public playClickSound(volume: number = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1000, time);
    osc1.frequency.exponentialRampToValueAtTime(350, time + 0.04);
    
    gain1.gain.setValueAtTime(volume * 0.2, time);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(time);
    osc1.stop(time + 0.05);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(150, time);
    osc2.frequency.exponentialRampToValueAtTime(60, time + 0.08);
    
    gain2.gain.setValueAtTime(volume * 0.45, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(time);
    osc2.stop(time + 0.09);
  }

  private startTrackCheck() {
    if (this.trackCheckInterval) clearInterval(this.trackCheckInterval);
    
    if (this.gameplayMusic) {
      this.gameplayMusic.onended = () => {
        this.playNextGameplayTrack();
      };
    }

    this.trackCheckInterval = setInterval(() => {
      if (this.activeMusicType !== "GAMEPLAY" || !this.gameplayMusic) return;
      
      // If the song plays past the limit (90 seconds), fade and switch
      if (this.gameplayMusic.currentTime >= this.maxTrackDuration) {
        this.playNextGameplayTrack();
      }
    }, 1000);
  }

  private stopTrackCheck() {
    if (this.trackCheckInterval) {
      clearInterval(this.trackCheckInterval);
      this.trackCheckInterval = null;
    }
  }

  private playNextGameplayTrack() {
    if (!this.gameplayMusic || this.activeMusicType !== "GAMEPLAY") return;
    
    this.fadeAudioOut(this.gameplayMusic, 2000);
    
    setTimeout(() => {
      if (this.activeMusicType !== "GAMEPLAY" || !this.gameplayMusic) return;
      
      // Advance to next index
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.gameplayTracks.length;
      
      this.gameplayMusic.src = this.gameplayTracks[this.currentTrackIndex];
      this.gameplayMusic.load();
      this.gameplayMusic.volume = 0.01;
      
      this.gameplayMusic.play().then(() => {
        const targetVol = this.isMuted ? 0 : 0.25;
        this.fadeAudioIn(this.gameplayMusic, targetVol, 1500);
      }).catch(e => console.log("Next track failed", e));
    }, 2100);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.menuMusic) this.menuMusic.volume = 0;
      if (this.gameplayMusic) this.gameplayMusic.volume = 0;
    } else {
      if (this.activeMusicType === "MENU" && this.menuMusic) {
        this.menuMusic.volume = 0.35;
      }
      if (this.activeMusicType === "GAMEPLAY" && this.gameplayMusic) {
        this.gameplayMusic.volume = 0.25;
      }
    }
    return this.isMuted;
  }

  public playMenuMusic() {
    this.initContext();
    if (this.activeMusicType === "MENU") return;
    this.activeMusicType = "MENU";
    
    this.clearAllFades();
    this.stopTrackCheck();

    if (this.gameplayMusic) {
      this.fadeAudioOut(this.gameplayMusic, 1200);
    }
    if (this.menuMusic) {
      this.menuMusic.volume = 0.01;
      this.menuMusic.play().then(() => {
        const targetVol = this.isMuted ? 0 : 0.35;
        this.fadeAudioIn(this.menuMusic, targetVol, 1200);
      }).catch(e => console.log("Menu music failed", e));
    }
  }

  public playGameplayMusic() {
    this.initContext();
    if (this.activeMusicType === "GAMEPLAY") return;
    this.activeMusicType = "GAMEPLAY";
    
    this.clearAllFades();

    if (this.menuMusic) {
      this.fadeAudioOut(this.menuMusic, 1200);
    }
    if (this.gameplayMusic) {
      this.startTrackCheck();
      this.gameplayMusic.volume = 0.01;
      this.gameplayMusic.play().then(() => {
        const targetVol = this.isMuted ? 0 : 0.25;
        this.fadeAudioIn(this.gameplayMusic, targetVol, 1200);
      }).catch(e => console.log("Gameplay music failed", e));
    }
  }

  private clearAllFades() {
    this.fadeIntervals.forEach(interval => clearInterval(interval));
    this.fadeIntervals.clear();
  }

  public fadeAudioIn(audio: HTMLAudioElement, targetVol: number, durationMs: number) {
    if (this.isMuted) {
      audio.volume = 0;
      return;
    }
    const steps = 25;
    const stepTime = durationMs / steps;
    let currentStep = 0;
    const interval = setInterval(() => {
      if (this.isMuted) {
        audio.volume = 0;
        clearInterval(interval);
        this.fadeIntervals.delete(interval);
        return;
      }
      currentStep++;
      const ratio = currentStep / steps;
      audio.volume = ratio * targetVol;
      if (currentStep >= steps) {
        audio.volume = targetVol;
        clearInterval(interval);
        this.fadeIntervals.delete(interval);
      }
    }, stepTime);
    this.fadeIntervals.add(interval);
  }

  public fadeAudioOut(audio: HTMLAudioElement, durationMs: number) {
    const steps = 25;
    const stepTime = durationMs / steps;
    const startVol = audio.volume;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const ratio = 1 - currentStep / steps;
      audio.volume = Math.max(0, ratio * startVol);
      if (currentStep >= steps) {
        audio.volume = 0;
        audio.pause();
        clearInterval(interval);
        this.fadeIntervals.delete(interval);
      }
    }, stepTime);
    this.fadeIntervals.add(interval);
  }

   public updateCinematicFilter(active: boolean) {
    this.initContext();
    if (this.ctx && this.musicFilter) {
      const targetFreq = active ? 800 : 22000;
      this.musicFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
    }
  }

  public playReloadSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Slide/Insert clip (clack 1)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.linearRampToValueAtTime(120, now + 0.12);
    gain1.gain.setValueAtTime(this.isMuted ? 0 : 0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Pull bolt back (sharp click at 0.22s)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(850, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(350, now + 0.28);
    gain2.gain.setValueAtTime(this.isMuted ? 0 : 0.18, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.29);
    
    // Lock bolt forward (metallic chamber lock snap at 0.38s)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(650, now + 0.38);
    osc3.frequency.exponentialRampToValueAtTime(180, now + 0.45);
    gain3.gain.setValueAtTime(this.isMuted ? 0 : 0.28, now + 0.38);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.38);
    osc3.stop(now + 0.46);
  }

  public playSound(name: string, volume: number = 0.5) {
    const ctx = this.initContext();
    if (name === "click") {
      if (ctx && (window as any).cinematicModeActive) {
        this.playClickSound(volume * 0.7);
      } else {
        this.playClickSound(volume);
      }
      return;
    }
    const original = this.sounds[name];
    if (original) {
      const clone = original.cloneNode() as HTMLAudioElement;
      clone.volume = (window as any).cinematicModeActive ? volume * 0.65 : volume; // muffled volume in cinematic mode
      
      clone.play().catch(e => console.log("Audio play failed", e));
      clone.onended = () => {
        clone.remove();
      };
    }
  }

  public playUpgradeCollectSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    
    // Lowpass filter if cinematic mode is active to muffle it
    let filterNode: BiquadFilterNode | null = null;
    if ((window as any).cinematicModeActive) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(1200, time);
      filterNode.connect(ctx.destination);
    }

    // Satisfying sci-fi synthesizer collect chime arpeggio: C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const noteTime = time + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);
      // slight pitch slide up for sci-fi feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, noteTime + 0.15);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);
      
      osc.connect(gain);
      if (filterNode) {
        gain.connect(filterNode);
      } else {
        gain.connect(ctx.destination);
      }
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  public playFootstepSound(volume: number = 0.08) {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    
    // Softer, premium acoustic/organic shoe footstep:
    // We combine a very soft low frequency sine pop (sole impact) with a tiny noise rustle (sand shift)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(65, time); // Low thud frequency
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.09);
    
    oscGain.gain.setValueAtTime(volume * 0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    
    osc.connect(oscGain);
    
    // Noise component for texture
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(180, time);
    bandpass.Q.setValueAtTime(2.0, time);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.28, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    
    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    
    // Lowpass filter destination to keep it incredibly soft and dynamic
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime((window as any).cinematicModeActive ? 350 : 550, time);
    lowpass.connect(ctx.destination);
    
    oscGain.connect(lowpass);
    noiseGain.connect(lowpass);
    
    osc.start(time);
    osc.stop(time + 0.1);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  public playCasingDropSound(isBazooka: boolean = false, volume: number = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    
    // Create filter for cinematic mode if active
    let filterNode: BiquadFilterNode | null = null;
    if ((window as any).cinematicModeActive) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(1200, time);
      filterNode.connect(ctx.destination);
    }

    const playBounce = (delay: number, bounceVol: number, pitchShift: number) => {
      const noteTime = time + delay;
      const finalVolume = bounceVol * volume;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      const baseFreq = isBazooka ? 650 * pitchShift : 3300 * pitchShift;
      osc.frequency.setValueAtTime(baseFreq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, noteTime + 0.08);
      
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(finalVolume * (isBazooka ? 0.09 : 0.05), noteTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.08);
      
      osc.connect(gain);
      if (filterNode) {
        gain.connect(filterNode);
      } else {
        gain.connect(ctx.destination);
      }
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.08);

      // Add a subtle high-pass noise burst for metal-concrete impact click
      const bufferSize = ctx.sampleRate * 0.015;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(4200, noteTime);
      
      noiseGain.gain.setValueAtTime(finalVolume * (isBazooka ? 0.045 : 0.038), noteTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.015);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      if (filterNode) {
        noiseGain.connect(filterNode);
      } else {
        noiseGain.connect(ctx.destination);
      }
      
      noise.start(noteTime);
      noise.stop(noteTime + 0.02);
    };

    // Impact + 2 bounces
    playBounce(0, 1.0, 1.0);
    playBounce(0.055 + Math.random() * 0.015, 0.42, 0.95);
    playBounce(0.11 + Math.random() * 0.015, 0.18, 0.9);
  }

  public startBGMusic() {
    this.initContext();
    this.playGameplayMusic();
    if (this.zombies) {
      this.zombies.play().catch(e => console.log("Zombie ambient failed", e));
    }
    if (this.motor) {
      this.motor.play().catch(e => console.log("Motor ambient failed", e));
    }
  }

  public stopBGMusic() {
    this.clearAllFades();
    this.activeMusicType = "NONE";
    if (this.menuMusic) this.menuMusic.pause();
    if (this.gameplayMusic) this.gameplayMusic.pause();
    if (this.zombies) this.zombies.pause();
    if (this.motor) this.motor.pause();
  }

  public setZombieVolume(vol: number) {
    if (this.zombies) {
      this.zombies.volume = Math.max(0, Math.min(0.7, vol));
    }
  }

  public setMotorVolume(vol: number) {
    if (this.motor) {
      this.motor.volume = Math.max(0, Math.min(1.0, vol));
    }
  }

  public playShoot(weapon: string) {
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, time);

    // Dynamic compression to glue transients and add massive punch/realism
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, time);
    compressor.knee.setValueAtTime(20, time);
    compressor.ratio.setValueAtTime(15, time);
    compressor.attack.setValueAtTime(0.001, time);
    compressor.release.setValueAtTime(0.08, time);

    if ((window as any).cinematicModeActive) {
      // Abafado bem dinâmico e encorpado: lowpass de 1800Hz com leve ganho nas frequências médias/baixas para manter o impacto
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(1800, time);
      lowpass.Q.setValueAtTime(1.5, time); // Adds resonance peak to keep it punchy and bass-heavy
      
      masterGain.connect(lowpass);
      lowpass.connect(compressor);
    } else {
      masterGain.connect(compressor);
    }
    compressor.connect(ctx.destination);

    // Cinematic Environment Reverb Tail (simulates world reflections)
    const reverbDelay = ctx.createDelay();
    reverbDelay.delayTime.setValueAtTime(0.08, time);
    const reverbFeedback = ctx.createGain();
    reverbFeedback.gain.setValueAtTime(0.32, time);
    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.setValueAtTime(1200, time);

    masterGain.connect(reverbDelay);
    reverbDelay.connect(reverbFilter);
    reverbFilter.connect(reverbFeedback);
    reverbFeedback.connect(reverbDelay);
    reverbFeedback.connect(compressor);

    const playNoise = (duration: number, bandpassFreq: number, q: number, gainVal: number, filterType: "bandpass" | "lowpass" | "highpass" = "bandpass") => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(bandpassFreq, time);
      filter.Q.setValueAtTime(q, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noiseNode.start(time);
      noiseNode.stop(time + duration);
    };

    const playThump = (startFreq: number, endFreq: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + duration);
    };

    const playRing = (freq: number, duration: number, gainVal: number, delay: number = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time + delay);

      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(gainVal, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time + delay);
      osc.stop(time + delay + duration);
    };

    switch (weapon) {
      case "pistola":
        // Snappy, clean tactical pistol shot
        playNoise(0.09, 800, 2.0, 0.7);
        playNoise(0.04, 3000, 1.0, 0.3, "highpass"); // crisp snap
        playThump(220, 70, 0.08, 0.85);
        this.playCasing(ctx, time + 0.12, 3000);
        break;

      case "gun":
        // M4 Assault Rifle: Realistic, punchy, high-definition rifle sound
        playNoise(0.18, 500, 2.0, 0.85); // main blast body
        playNoise(0.06, 2800, 3.0, 0.6, "highpass"); // crisp high-frequency gas/supersonic crack
        playThump(150, 60, 0.1, 1.2); // punchy low-end kick
        playRing(1200, 0.15, 0.05, 0.02); // subtle metallic receiver vibration
        this.playCasing(ctx, time + 0.15, 2600);
        break;

      case "uzi":
        // Micro Uzi: High speed chatter, high pitch mechanical crack
        playNoise(0.07, 700, 3.0, 0.65);
        playNoise(0.04, 2000, 2.0, 0.35, "highpass");
        playThump(240, 85, 0.06, 0.75);
        this.playCasing(ctx, time + 0.08, 3300);
        break;

      case "doze":
        // Calibre 12: Devastating explosion, muffled bass boom and pellets expansion
        playNoise(0.28, 200, 0.8, 1.4, "lowpass"); // low rumble
        playNoise(0.22, 600, 1.2, 0.9, "bandpass"); // pellets blast
        playThump(80, 30, 0.4, 1.6);
        this.playMechanicalReload(ctx, time + 0.35, "doze_pump");
        this.playCasing(ctx, time + 0.55, 1100);
        break;

      case "basuca":
        // Bazooka RPG: Heavy whoosh propulsion + low sub-bass rocket rumble
        playNoise(0.75, 120, 0.5, 1.5, "lowpass");
        playThump(55, 15, 0.9, 2.0);
        break;

      case "rifle":
        // Sniper Rifle: High caliber supersonic snap, massive body, huge reverb tail
        playNoise(0.9, 450, 1.2, 1.3, "bandpass"); // body rumble
        playNoise(0.12, 3500, 4.0, 0.9, "highpass"); // supersonic snap
        playThump(160, 40, 0.28, 1.5);
        this.playMechanicalReload(ctx, time + 0.55, "rifle_bolt");
        this.playCasing(ctx, time + 0.85, 1900);
        break;

      case "magnum":
        // Magnum Cromada: High-caliber hand-cannon explosion with long metallic ring
        playNoise(0.2, 500, 1.0, 1.1);
        playNoise(0.05, 1200, 2.0, 0.4, "highpass");
        playThump(250, 45, 0.22, 1.4);
        playRing(1600, 0.4, 0.15); // metallic chamber resonance
        this.playCasing(ctx, time + 0.25, 1600);
        break;

      case "minigun":
        // M134 Minigun: Ultra high-speed, mechanical buzz combined with heavy gas bursts
        playNoise(0.08, 900, 2.5, 0.75); // rapid burst noise
        playNoise(0.04, 3200, 1.5, 0.45, "highpass"); // mechanical click/snap
        playThump(180, 75, 0.06, 0.95); // bass punch
        playRing(1400, 0.08, 0.04); // high metallic ring
        this.playCasing(ctx, time + 0.05, 3100);
        break;

      default:
        this.playSound("zombieShoot", 0.6);
        break;
    }
  }

  private playCasing(ctx: AudioContext, startTime: number, pitch: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, startTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.05);

    const t2 = startTime + 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(pitch * 0.95, t2);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.04, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.03);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.04);
  }

  private playMechanicalReload(ctx: AudioContext, startTime: number, type: string) {
    const playClick = (time: number, freq: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    if (type === "doze_pump") {
      playClick(startTime, 600, 0.05, 0.25);
      playClick(startTime + 0.12, 450, 0.06, 0.3);
    } else if (type === "rifle_bolt") {
      playClick(startTime, 800, 0.04, 0.2);
      playClick(startTime + 0.15, 500, 0.06, 0.2);
      playClick(startTime + 0.45, 600, 0.05, 0.2);
      playClick(startTime + 0.55, 900, 0.04, 0.25);
    }
  }

  public playReload(weapon: string) {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;

    const playClick = (delay: number, freq: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time + delay);
      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(vol, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time + delay);
      osc.stop(time + delay + duration);
    };

    const playSlide = (delay: number, startFreq: number, endFreq: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, time + delay);
      osc.frequency.linearRampToValueAtTime(endFreq, time + delay + duration);
      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(vol, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time + delay);
      osc.stop(time + delay + duration);
    };

    switch (weapon) {
      case "pistola":
        playClick(0.1, 700, 0.05, 0.25);
        playClick(0.4, 600, 0.06, 0.3);
        playSlide(0.7, 800, 400, 0.08, 0.25);
        break;

      case "gun":
        playClick(0.2, 500, 0.08, 0.25);
        playClick(1.0, 450, 0.08, 0.35);
        playSlide(1.6, 900, 300, 0.12, 0.3);
        playClick(1.8, 700, 0.06, 0.25);
        break;

      case "uzi":
        playClick(0.15, 800, 0.04, 0.25);
        playClick(0.6, 700, 0.05, 0.3);
        playSlide(1.0, 950, 500, 0.08, 0.25);
        break;

      case "doze":
        playClick(0.3, 500, 0.05, 0.25);
        playClick(0.8, 510, 0.05, 0.25);
        playClick(1.3, 490, 0.05, 0.25);
        playClick(1.8, 505, 0.05, 0.25);
        playSlide(2.3, 700, 400, 0.08, 0.3);
        playSlide(2.4, 400, 800, 0.08, 0.3);
        break;

      case "basuca":
        playClick(0.5, 300, 0.1, 0.25);
        playSlide(1.2, 350, 200, 0.3, 0.2);
        playClick(2.2, 600, 0.08, 0.3);
        break;

      case "rifle":
        playClick(0.2, 800, 0.05, 0.2);
        playSlide(0.4, 600, 400, 0.12, 0.2);
        playClick(1.0, 500, 0.06, 0.25);
        playClick(1.5, 450, 0.06, 0.3);
        playSlide(2.1, 400, 650, 0.1, 0.2);
        playClick(2.3, 900, 0.05, 0.25);
        break;

      case "magnum":
        playClick(0.2, 400, 0.06, 0.25);
        playSlide(0.6, 500, 200, 0.15, 0.2);
        playClick(1.2, 650, 0.08, 0.3);
        playClick(1.6, 550, 0.05, 0.35);
        break;
    }
  }

  public playExplosion() {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, time);
    
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-28, time);
    compressor.knee.setValueAtTime(30, time);
    compressor.ratio.setValueAtTime(20, time);
    compressor.attack.setValueAtTime(0.001, time);
    compressor.release.setValueAtTime(0.15, time);
    
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Deep sub-bass boom
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(10, time + 0.8);
    oscGain.gain.setValueAtTime(1.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.8);

    // Thick lowpass noise blast
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, time);
    filter.frequency.exponentialRampToValueAtTime(30, time + 1.2);
    filter.Q.setValueAtTime(2.0, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseNode.start(time);
  }

  public playLaserToggle(on: boolean) {
    const ctx = this.initContext();
    if (!ctx) return;
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (on) {
      osc.frequency.setValueAtTime(600, time);
      osc.frequency.exponentialRampToValueAtTime(1400, time + 0.12);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    } else {
      osc.frequency.setValueAtTime(1000, time);
      osc.frequency.exponentialRampToValueAtTime(300, time + 0.12);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    }

    // Connect audio routing (handle low-pass cinematic filter if active)
    let outputNode: AudioNode = ctx.destination;
    if ((window as any).cinematicFilter) {
      outputNode = (window as any).cinematicFilter;
    }

    osc.connect(gain);
    gain.connect(outputNode);
    osc.start(time);
    osc.stop(time + 0.16);
  }
}

export const SoundManager = new SoundManagerClass();

export const WEAPONS_DETAILS: Record<
  string,
  {
    id: string;
    name: string;
    desc: string;
    damage: number;
    fireRate: number;
    ammoMax: number;
    reloadTime: number;
    bulletSpeed: number;
    recoil: number;
    maxRecoil: number;
    kickback: number;
    range: number;
    handed: "one" | "two";
    spread: number;
    cost: number;
    color: string;
  }
> = {
  gun: {
    id: "gun",
    name: "M4 ASSAULT RIFLE",
    desc: "Fuzil automático padrão equilibrado, confiável em qualquer cenário.",
    damage: 25,
    fireRate: 0.12,
    ammoMax: 200,
    reloadTime: 2.5,
    bulletSpeed: 1500,
    recoil: 0.08,
    maxRecoil: 0.4,
    kickback: 16,
    range: 3.0,
    handed: "two",
    spread: 0.08,
    cost: 320,
    color: "#34d399",
  },
  pistola: {
    id: "pistola",
    name: "TACTICAL PISTOL",
    desc: "Pistola semi-automática de alta precisão armada com uma única mão.",
    damage: 22,
    fireRate: 0.22,
    ammoMax: 15,
    reloadTime: 1.2,
    bulletSpeed: 1800,
    recoil: 0.04,
    maxRecoil: 0.18,
    kickback: 8,
    range: 2.8,
    handed: "one",
    spread: 0.03,
    cost: 35,
    color: "#60a5fa",
  },
  uzi: {
    id: "uzi",
    name: "MICRO UZI",
    desc: "Metralhadora compacta de tiro rápido, operada com uma única mão.",
    damage: 18,
    fireRate: 0.06,
    ammoMax: 40,
    reloadTime: 1.8,
    bulletSpeed: 1400,
    recoil: 0.12,
    maxRecoil: 0.6,
    kickback: 9,
    range: 2.5,
    handed: "one",
    spread: 0.15,
    cost: 95,
    color: "#ec4899",
  },
  doze: {
    id: "doze",
    name: "CALIBRE 12 (DOZE)",
    desc: "Escopeta devastadora. Dispara 6 balins simultâneos de alta dispersão.",
    damage: 32,
    fireRate: 0.65,
    ammoMax: 8,
    reloadTime: 2.8,
    bulletSpeed: 1300,
    recoil: 0.28,
    maxRecoil: 0.7,
    kickback: 45,
    range: 1.5,
    handed: "two",
    spread: 0.22,
    cost: 280,
    color: "#f97316",
  },
  basuca: {
    id: "basuca",
    name: "RPG BAZUCA",
    desc: "Lança-foguetes pesado. Causa dano massivo em área e empurra o atirador traseiramente com extrema força.",
    damage: 250,
    fireRate: 1.4,
    ammoMax: 5,
    reloadTime: 3.5,
    bulletSpeed: 1350,
    recoil: 0.4,
    maxRecoil: 1.0,
    kickback: 95, // substantial pushback velocity
    range: 4.5,
    handed: "two",
    spread: 0.01,
    cost: 950,
    color: "#f87171",
  },
  rifle: {
    id: "rifle",
    name: "RIFLE DE PRECISÃO",
    desc: "Rifle sniper com mira telescópica de altíssimo dano. Zoom de longa distância aumentado.",
    damage: 180,
    fireRate: 1.0,
    ammoMax: 10,
    reloadTime: 3.0,
    bulletSpeed: 3800,
    recoil: 0.01,
    maxRecoil: 0.05,
    kickback: 35,
    range: 8.5,
    handed: "two",
    spread: 0.002,
    cost: 500,
    color: "#a855f7",
  },
  magnum: {
    id: "magnum",
    name: "MAGNUM CROMADA",
    desc: "Revólver pesado de calibre .44 com altíssimo poder de parada.",
    damage: 120,
    fireRate: 0.45,
    ammoMax: 6,
    reloadTime: 2.0,
    bulletSpeed: 2000,
    recoil: 0.15,
    maxRecoil: 0.5,
    kickback: 25,
    range: 3.0,
    handed: "one",
    spread: 0.02,
    cost: 160,
    color: "#e2e8f0",
  },
  minigun: {
    id: "minigun",
    name: "M134 MINIGUN",
    desc: "Metralhadora giratória de supressão absoluta. Fogo contínuo extremamente denso, causando grande penalidade na velocidade de movimento do operador.",
    damage: 16,
    fireRate: 0.04, // Extremely fast!
    ammoMax: 800,
    reloadTime: 4.5,
    bulletSpeed: 1400,
    recoil: 0.05,
    maxRecoil: 0.35,
    kickback: 3,
    range: 3.5,
    handed: "two",
    spread: 0.15,
    cost: 1500,
    color: "#facc15",
  },
};

export const getBarrelTip = (wType: string) => {
  if (wType === "pistola") return { x: 48, y: -6 };
  if (wType === "magnum") return { x: 52, y: -6 };
  if (wType === "uzi") return { x: 56, y: -7 };
  if (wType === "doze") return { x: 94, y: -6 };
  if (wType === "basuca") return { x: 125, y: -12 };
  if (wType === "rifle") return { x: 131, y: -10 };
  if (wType === "minigun") return { x: 110, y: -8 };
  return { x: 100, y: -9 }; // gun
};

const weaponImageUrls: Record<string, string> = {
  gun: "/m4a1.png",
  pistola: "/glock.png",
  uzi: "/uzi.png",
  rifle: "/rifle sniper.png",
  basuca: "/bazuka.png",
  magnum: "/magnum cromada.png",
  doze: "/dose padrao.png",
  minigun: "/weapons/minigun_base.png",
};

export const WEAPON_SKINS = [
  // M4 skins
  { id: "m4_azulao", weapon: "gun", name: "Azulão", url: "/skins/sem-fundo-m4 azulao.png", themeColor: "#3b82f6", cost: 120 },
  { id: "m4_dourada", weapon: "gun", name: "Dourada", url: "/skins/sem-fundo-m4 dourada.png", themeColor: "#d4af37", cost: 200 },
  { id: "m4_roxada", weapon: "gun", name: "Roxada", url: "/skins/sem-fundo-m4 roxada.png", themeColor: "#a855f7", cost: 150 },
  { id: "m4_vermelhada", weapon: "gun", name: "Vermelhada", url: "/skins/sem-fundo-m4 vermelhada.png", themeColor: "#ef4444", cost: 150 },
  { id: "m4_8bit", weapon: "gun", name: "8-Bit Rifle", url: "/skins/sem-fundo-8-bit_pixel_art_rifle_202606151117.png", themeColor: "#22d3ee", cost: 180 },
  // Sniper skins
  { id: "sniper_8bit", weapon: "rifle", name: "8-Bit", url: "/skins/sem-fundo-8-bit_2D_pixel_art_sniper_202606082343 (1).png", themeColor: "#22d3ee", cost: 180 },
  { id: "sniper_congelada", weapon: "rifle", name: "Congelada", url: "/skins/sem-fundo-sniper congelada.png", themeColor: "#60a5fa", cost: 160 },
  { id: "sniper_eradoouro", weapon: "rifle", name: "Era de Ouro", url: "/skins/sem-fundo-sniper era de ouro.png", themeColor: "#fbbf24", cost: 250 },
  { id: "sniper_lava", weapon: "rifle", name: "Lava", url: "/skins/sem-fundo-sniper lava.png", themeColor: "#f97316", cost: 200 },
  { id: "sniper_roxada", weapon: "rifle", name: "Roxada", url: "/skins/sem-fundo-sniper roxada.png", themeColor: "#9333ea", cost: 150 },
  { id: "sniper_acid", weapon: "rifle", name: "Acid Accents", url: "/skins/sem-fundo-8-bit_sniper_rifle_acid_accents_202606151117.png", themeColor: "#84cc16", cost: 220 },
  { id: "sniper_rusted", weapon: "rifle", name: "Rusted", url: "/skins/sem-fundo-8-bit_sniper_rifle_rusted_skin_202606151117.png", themeColor: "#a16207", cost: 140 },
  { id: "sniper_whitegold", weapon: "rifle", name: "White Gold", url: "/skins/sem-fundo-8-bit_sniper_rifle_white_gold_202606151117.png", themeColor: "#fef3c7", cost: 300 },
  // Doze skins
  { id: "doze_padrao", weapon: "doze", name: "Dose Padrão", url: "/dose padrao.png", themeColor: "#fcd34d", cost: 80 },
  { id: "doze_cromada", weapon: "doze", name: "Dose Cromada", url: "/dose cromada.png", themeColor: "#fbbf24", cost: 120 },
  { id: "doze_platinado", weapon: "doze", name: "Dose Platinado", url: "/dose platinado.png", themeColor: "#e2e8f0", cost: 160 },
  { id: "doze_roxada", weapon: "doze", name: "Dose Roxada", url: "/dose roxado.png", themeColor: "#a855f7", cost: 150 },
  { id: "doze_magman", weapon: "doze", name: "Dose Magman", url: "/dose magman (2).png", themeColor: "#ef4444", cost: 180 },
  { id: "doze_obsidian", weapon: "doze", name: "Obsidian Lava", url: "/skins/sem-fundo-Tactical_shotgun_obsidian_lava_skin_202606151117.png", themeColor: "#f97316", cost: 250 },
  // Uzi skins
  { id: "uzi_8bit", weapon: "uzi", name: "8-Bit SMG", url: "/skins/sem-fundo-8-bit_pixel_art_submachine_gun_202606151117.png", themeColor: "#22d3ee", cost: 160 },
  { id: "uzi_graffiti", weapon: "uzi", name: "Graffiti", url: "/skins/sem-fundo-Pixel_art_submachine_gun_graffiti_202606151117.png", themeColor: "#f472b6", cost: 200 },
  // Basuca skins
  { id: "basuca_hazard", weapon: "basuca", name: "Hazard", url: "/skins/sem-fundo-8-bit_rocket_launcher_hazard_skin_202606151117.png", themeColor: "#eab308", cost: 280 },
  { id: "basuca_navy", weapon: "basuca", name: "Navy Chrome", url: "/skins/sem-fundo-8-bit_rocket_launcher_navy_chrome_202606151117.png", themeColor: "#60a5fa", cost: 320 },
  { id: "basuca_olive", weapon: "basuca", name: "Olive Drab", url: "/skins/sem-fundo-8-bit_rocket_launcher_olive_drab_202606151117.png", themeColor: "#65a30d", cost: 250 },
  // Minigun skins
  { id: "minigun_gold", weapon: "minigun", name: "Ouro Maciço", url: "/weapons/minigun_gold.png", themeColor: "#fbbf24", cost: 450 },
  { id: "minigun_lava", weapon: "minigun", name: "Lava Obsidiana", url: "/weapons/minigun_lava.png", themeColor: "#ef4444", cost: 500 },
  { id: "minigun_purple", weapon: "minigun", name: "Ameaça Roxa", url: "/weapons/minigun_purple.png", themeColor: "#a855f7", cost: 400 },
  { id: "minigun_silver", weapon: "minigun", name: "Prata Cromada", url: "/weapons/minigun_silver.png", themeColor: "#e4e4e7", cost: 350 },
  { id: "minigun_toxic", weapon: "minigun", name: "Slime Tóxico", url: "/weapons/minigun_toxic.png", themeColor: "#84cc16", cost: 400 },
];

const loadedWeaponImages: Record<string, HTMLImageElement> = {};
const loadedSkinImages: Record<string, HTMLImageElement> = {};
const loadedVanImage = typeof window !== "undefined" ? new Image() : null;
if (loadedVanImage) loadedVanImage.src = "/combe loja de armas.png";

let VAN_X = 0;
let VAN_Y = -350;
let vanState: "OUT" | "ENTERING" | "PARKED" | "LEAVING" = "PARKED";
let vanTargetX = 0;
let vanTargetY = -350;
let vanAngle = Math.PI / 2;
const VAN_RADIUS = 160;

if (typeof window !== "undefined") {
  Object.entries(weaponImageUrls).forEach(([key, url]) => {
    const img = new Image();
    img.src = url;
    loadedWeaponImages[key] = img;
  });
  WEAPON_SKINS.forEach(skin => {
    const img = new Image();
    img.src = skin.url;
    loadedSkinImages[skin.id] = img;
  });
}

const WEAPON_RENDER_CONFIG: Record<
  string,
  {
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
  }
> = {
  gun: { width: 100, height: 36, x: 0, y: -9, rotation: 0 },
  pistola: { width: 44, height: 24, x: 42, y: 4, rotation: Math.PI },
  uzi: { width: 56, height: 28, x: 0, y: -7, rotation: 0 },
  doze: { width: 96, height: 24, x: -2, y: -6, rotation: 0 },
  basuca: { width: 140, height: 48, x: -15, y: -12, rotation: 0 },
  rifle: { width: 136, height: 40, x: -5, y: -10, rotation: 0 },
  magnum: { width: 48, height: 26, x: 4, y: -6, rotation: 0 },
  minigun: { width: 120, height: 38, x: -8, y: -6, rotation: 0 },
};

export const RenderWeaponIcon = ({
  type,
  color,
  skinUrl,
  isHudLarge,
}: {
  type: string;
  color?: string;
  skinUrl?: string;
  isHudLarge?: boolean;
}) => {
  const strokeColor = color || "white";
  const imgUrl = skinUrl || weaponImageUrls[type];
  if (imgUrl) {
    let widthVal = "26px";
    if (isHudLarge) {
      widthVal = type === "pistola" || type === "magnum" ? "52px" : type === "uzi" ? "72px" : "104px";
    } else {
      widthVal = type === "pistola" || type === "magnum" ? "26px" : type === "uzi" ? "36px" : "52px";
    }
    return (
      <img
        src={imgUrl}
        alt={type}
        className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]"
        style={{
          width: widthVal,
          height: "auto",
        }}
      />
    );
  }
  if (type === "gun") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <path d="M2 11h14v1.5H2z" />
        <path d="M10 12.5l1.5 4h-2l-1.5-4" />
        <path d="M2.5 12.5c-0.7 1-1.5 2-1.5 2.5v1c0.8 0 1.5-0.8 1.5-0.8l1.5-1.7" />
        <path d="M6 11V9.5h3.5V11" />
        <line x1="16" y1="11.8" x2="23" y2="11.8" stroke={strokeColor} strokeWidth="2" />
        <path d="M7 12.5l-1 3" />
      </svg>
    );
  }
  if (type === "pistola") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <path d="M5 9h12v3H5z" />
        <path d="M11 12l2 6h-3.5l-2-6" />
        <path d="M9 12v2.5h2.5" />
        <path d="M4.5 10h1" />
      </svg>
    );
  }
  if (type === "uzi") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <rect x="5" y="8" width="11" height="4.5" rx="0.5" />
        <path d="M10.5 12.5l1 5h-2.5l-1-5" />
        <path d="M16 10h3" />
        <path d="M10.5 17.5v2h1.5v-2" />
        <path d="M8.5 12.5v1.5h1.5" />
      </svg>
    );
  }
  if (type === "doze") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <path d="M3 11h17v1.5H3z" />
        <path d="M3 12.5c-1 0.5-2 1.5-2 2.5v1s0.8 0 1.5-0.8l2.5-2.7" />
        <rect x="7" y="11.5" width="5" height="2.2" rx="0.3" />
        <rect
          x="13"
          y="12"
          width="4"
          height="1.5"
          rx="0.2"
          fill={strokeColor}
          opacity="0.3"
        />
      </svg>
    );
  }
  if (type === "basuca") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <path d="M2 11h15v2.5H2z" />
        <path d="M2 13.5l-1.5 1.5v-5l1.5 1.5" />
        <path d="M17 10l4.5 2.25-4.5 2.25z" />
        <path d="M21.5 12h1.5" />
        <path d="M11 11v-2h2.5v1.5" />
        <path d="M7 13.5v2.5M13 13.5v2.5" />
      </svg>
    );
  }
  if (type === "rifle") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
      >
        <path d="M1 13.5l4-2.5h5.5l1 1.5" />
        <path d="M1 13.5c1 0.5 2 1.5 2 2.5h1.5l1.5-2.5" />
        <path d="M10.5 11h11v1h-11z" />
        <path d="M5.5 10v-1.5h4V10" />
        <path d="M4.5 8.5h6" />
        <path d="M12 12l-1 2.5M13 12l0.5 2.5" />
      </svg>
    );
  }
  return null;
};

export const RenderWeaponBlueprint = ({
  type,
  color,
}: {
  type: string;
  color: string;
}) => {
  const imgUrl = weaponImageUrls[type];
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={type}
        className="max-w-[140px] max-h-[52px] object-contain filter brightness-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]"
      />
    );
  }
  if (type === "gun") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20 H30 V35 H10 Z" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <path d="M30 25 H50 V32 H30 Z" stroke={color} strokeWidth="1.2" />
        <rect x="50" y="20" width="45" height="15" rx="1.5" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <path d="M70 35 L75 52 H88 L83 35 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.2" />
        <rect x="95" y="22" width="40" height="11" rx="1" stroke={color} strokeWidth="1.2" />
        <line x1="135" y1="27" x2="165" y2="27" stroke={color} strokeWidth="2" />
        <rect x="150" y="22" width="6" height="5" stroke={color} strokeWidth="1" />
        <path d="M60 20 L65 12 H82 L87 20" stroke={color} strokeWidth="1.2" fill="none" />
        <circle cx="73" cy="12" r="1.5" fill={color} />
        <path d="M58 35 L48 48 H58 L66 35" stroke={color} strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === "pistola") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="55" y="16" width="65" height="15" rx="1.5" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <line x1="120" y1="22" x2="128" y2="22" stroke={color} strokeWidth="2" />
        <path d="M100 31 L84 54 H98 L114 31 Z" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <path d="M100 31 C92 31 92 41 100 41" stroke={color} strokeWidth="1.2" fill="none" />
        <path d="M96 36 L92 36" stroke={color} strokeWidth="1.2" />
        <rect x="58" y="12" width="4" height="4" stroke={color} strokeWidth="1" />
        <rect x="115" y="12" width="3" height="4" stroke={color} strokeWidth="1" />
      </svg>
    );
  }
  if (type === "uzi") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="15" width="55" height="22" rx="2" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <rect x="115" y="21" width="18" height="6" stroke={color} strokeWidth="1.2" fill={color} opacity="0.1" />
        <line x1="133" y1="24" x2="142" y2="24" stroke={color} strokeWidth="1.8" />
        <path d="M84 37 L78 55 H90 L96 37" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <path d="M82 55 L80 68 H90 L92 55" stroke={color} strokeWidth="1.2" />
        <rect x="75" y="10" width="8" height="5" stroke={color} strokeWidth="1.2" />
        <path d="M96 37 H110 V27" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    );
  }
  if (type === "doze") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 18 L24 18 L48 34 H12 Z" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <rect x="48" y="20" width="40" height="15" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <rect x="88" y="23" width="35" height="11" rx="2" stroke={color} strokeWidth="1.2" />
        <line x1="123" y1="23" x2="168" y2="23" stroke={color} strokeWidth="2" />
        <line x1="123" y1="28" x2="168" y2="28" stroke={color} strokeWidth="2" />
        <line x1="123" y1="33" x2="152" y2="33" stroke={color} strokeWidth="1.2" />
        <circle cx="55" cy="38" r="4" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    );
  }
  if (type === "basuca") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="22" width="105" height="10" rx="1" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <path d="M25 22 L12 16 V38 L25 32 Z" stroke={color} strokeWidth="1.2" fill="none" />
        <path d="M60 32 L55 45 H63 L68 32" stroke={color} strokeWidth="1.2" />
        <path d="M92 32 L87 45 H95 L100 32" stroke={color} strokeWidth="1.2" />
        <path d="M72 22 L75 14 H85 L88 22" stroke={color} strokeWidth="1.2" fill="none" />
        <rect x="73" y="12" width="16" height="4.5" rx="1" stroke={color} strokeWidth="1" />
        <path d="M130 20 L140 18 L155 27 L140 36 L130 34 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <line x1="155" y1="27" x2="172" y2="27" stroke={color} strokeWidth="1.8" />
        <path d="M135 19 L132 11 L144 19" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    );
  }
  if (type === "rifle") {
    return (
      <svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 18 H32 L26 36 H12 Z" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <line x1="8" y1="26" x2="28" y2="26" stroke={color} strokeWidth="1" />
        <rect x="32" y="21" width="50" height="13" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" />
        <path d="M48 21 L43 14" stroke={color} strokeWidth="1.2" />
        <circle cx="43" cy="14" r="1.5" fill={color} />
        <rect x="44" y="10" width="30" height="6.5" rx="1" fill={color} opacity="0.1" stroke={color} strokeWidth="1.2" />
        <path d="M38 10 H44 M74 10 H80" stroke={color} strokeWidth="1" />
        <path d="M50 16.5 L52 21 M68 16.5 L66 21" stroke={color} strokeWidth="1.2" />
        <line x1="82" y1="26.5" x2="162" y2="26.5" stroke={color} strokeWidth="1.8" />
        <rect x="162" y="23.5" width="10" height="6" rx="0.5" stroke={color} strokeWidth="1" fill={color} opacity="0.2" />
        <path d="M42 34 L36 46 H44 L50 34" stroke={color} strokeWidth="1.2" />
        <rect x="58" y="34" width="12" height="14" rx="1" fill={color} opacity="0.15" stroke={color} strokeWidth="1.2" />
        <path d="M96 28 L104 43 M96 28 L88 43" stroke={color} strokeWidth="1" />
      </svg>
    );
  }
  return null;
};

const GAMEPLAY_TIPS = [
  {
    title: "ONDAS DE ZUMBIS",
    text: "Sobreviva a ondas progressivas de zumbis. A cada onda superada, novos inimigos mais fortes, velozes e resistentes surgirão para te caçar."
  },
  {
    title: "LOJA DE EQUIPAMENTOS",
    text: "Durante a partida, aproxime-se da Kombi verde estacionada no centro do mapa e aperte [E] para abrir a loja. Compre fuzis, escopetas, bazucas e munição."
  },
  {
    title: "APRIMORAMENTOS PERMANENTES",
    text: "Na aba 'Aprimoramentos' do menu de Personagem, use os créditos recebidos nas ondas para aprimorar vida máxima, velocidade, munição e dano permanentemente."
  },
  {
    title: "ATRIBUTOS DE OPERADORES",
    text: "Cada skin tem atributos reais: Líder Brank tem resistência e dano de pistola, Sniper Mexicano corre mais rápido, Nier é blindado e Bluer tem velocidade pura."
  },
  {
    title: "CONTROLE E ESQUIVA",
    text: "Pressione [Shift] ou [Espaço] para dar uma rolada tática. Isso te concede aceleração temporária e permite escapar de cercos mortais de zumbis."
  }
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  const topBlurRef = useRef<HTMLDivElement>(null);
  const bottomBlurRef = useRef<HTMLDivElement>(null);
  const [showInitialTips, setShowInitialTips] = useState(true);
  const [isLoadingProtocol, setIsLoadingProtocol] = useState(true);
  const [protocolProgress, setProtocolProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [gameState, setGameState] = useState<"MENU" | "PLAYING">("MENU");
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [musicMuted, setMusicMuted] = useState(false);
  useEffect(() => {
    const handleError = (msg: any, url: any, line: any, col: any, error: any) => {
      const errDiv = document.createElement("div");
      errDiv.id = "runtime-error-overlay";
      errDiv.style.position = "fixed";
      errDiv.style.top = "0";
      errDiv.style.left = "0";
      errDiv.style.width = "100%";
      errDiv.style.backgroundColor = "rgba(255, 0, 0, 0.95)";
      errDiv.style.color = "white";
      errDiv.style.zIndex = "999999";
      errDiv.style.padding = "20px";
      errDiv.style.fontFamily = "monospace";
      errDiv.style.fontSize = "14px";
      errDiv.style.maxHeight = "50vh";
      errDiv.style.overflowY = "auto";
      errDiv.style.whiteSpace = "pre-wrap";
      errDiv.style.pointerEvents = "auto";
      errDiv.innerHTML = `<strong>Error:</strong> ${msg}<br/><strong>Line:</strong> ${line}:${col}<br/><strong>Stack:</strong> ${error ? error.stack : 'N/A'}`;
      document.body.appendChild(errDiv);
      return false;
    };
    window.onerror = handleError;
    
    if (gameState === "PLAYING") {
      if (cutsceneRef.current.active) {
        SoundManager.playMenuMusic();
      } else {
        SoundManager.playGameplayMusic();
      }
    } else {
      SoundManager.playMenuMusic();
    }

    const handleUserGesture = () => {
      if (gameState !== "PLAYING") {
        SoundManager.playMenuMusic();
      }
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
    window.addEventListener("click", handleUserGesture);
    window.addEventListener("keydown", handleUserGesture);

    return () => {
      window.onerror = null;
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      SoundManager.stopBGMusic();
    };
  }, [gameState]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const isInventoryOpenRef = useRef(false);
  useEffect(() => {
    isInventoryOpenRef.current = isInventoryOpen;
  }, [isInventoryOpen]);
  const [animateBackpack, setAnimateBackpack] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const isShopOpenRef = useRef(false);
  useEffect(() => {
    isShopOpenRef.current = isShopOpen;
  }, [isShopOpen]);
  const [inspectingItem, setInspectingItem] = useState<{type: "weapon" | "skin", id: string} | null>(null);
  const [isOutfitsOpen, setIsOutfitsOpen] = useState(false);
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [selectedBestiaryZombie, setSelectedBestiaryZombie] = useState<string | null>(null);
  const [viewingSkin, setViewingSkin] = useState<any | null>(null);
  const [hoveredSkin, setHoveredSkin] = useState<any | null>(null);
  const [shopTab, setShopTab] = useState<"weapons" | "upgrades" | "skins">("weapons");
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>("damage");

  const [gameplayTipsOpen, setGameplayTipsOpen] = useState(false);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingTextFade, setTypingTextFade] = useState(false);
  const [typingScreenFade, setTypingScreenFade] = useState(false);
  const [hoveredCampfireChar, setHoveredCampfireChar] = useState<string | null>(null);
  const [viewingCampfireChar, setViewingCampfireChar] = useState<string>("red");
  const [introFadeOut, setIntroFadeOut] = useState(false);

  // Simulated Protocol Loading progress loop with synthesized high-tech audio ticks (~7.5 seconds duration)
  useEffect(() => {
    if (!isLoadingProtocol) return;

    let progress = 0;
    const interval = setInterval(() => {
      // Small progress steps to lengthen loading to ~7.5 seconds
      progress += Math.random() < 0.7 ? 2 : 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsLoadingProtocol(false);
          // Play a dynamic success beep chime
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = audioCtx.currentTime;
            
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = "triangle";
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.02, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(now);
            osc1.stop(now + 0.12);
            
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(1320, now + 0.08);
            gain2.gain.setValueAtTime(0.02, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.22);
          } catch(e) {}

          // Start the menu music smoothly
          SoundManager.playMenuMusic();
        }, 500);
      }
      
      setProtocolProgress(progress);
      
      // Play a quick, clean high-tech synth tick on each step
      if (typeof window !== "undefined" && progress < 100) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          // Pitch increases slightly as the protocol loading completes
          osc.frequency.setValueAtTime(500 + progress * 7, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1000 + progress * 4, audioCtx.currentTime + 0.04);
          
          gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.04);
        } catch (e) {}
      }
    }, 130);

    return () => clearInterval(interval);
  }, [isLoadingProtocol]);

  // Dark intro fade - starts dark, fades to reveal menu after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFadeOut(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showInitialTips) return;
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % GAMEPLAY_TIPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [showInitialTips]);

  const skipTypewriter = () => {
    setIsTypingActive(false);
    setTypingText("");
    setTypingTextFade(false);
    setTypingScreenFade(false);
    setShowInitialTips(false);
    SoundManager.playMenuMusic();
  };

  const startTypewriterTransition = () => {
    // Stop the menu music immediately to leave typewriter in absolute, tense silence
    SoundManager.stopBGMusic();
    
    setIsTypingActive(true);
    setTypingText("");
    setTypingTextFade(false);
    setTypingScreenFade(false);
    
    const targetText = "ANO 2049. A TERRA SE TORNOU UM CEMITÉRIO TÓXICO... ENTRE AS CINZAS DA CIVILIZAÇÃO, APENAS 4 LENDAS RESTARAM PARA ENFRENTAR O SUBMUNDO.";
    let index = 0;
    
    setTimeout(() => {
      const typeNextChar = () => {
        if (index < targetText.length) {
          setTypingText((prev) => prev + targetText[index]);
          SoundManager.playTypewriterSound();
          index++;
          // A bit faster typing speed for readability of longer text
          setTimeout(typeNextChar, 60 + Math.random() * 45);
        } else {
          // Pause 2.2s after finishing typing so player can read
          setTimeout(() => {
            setTypingTextFade(true); // Fade out typing text
            
            // Screen stays pitch-black for 1s
            setTimeout(() => {
              setShowInitialTips(false);
              SoundManager.playMenuMusic(); // Start menu music smoothly
              setTypingScreenFade(true); // Fade out black screen overlay
              
              setTimeout(() => {
                setIsTypingActive(false);
                setTypingText("");
                setTypingTextFade(false);
                setTypingScreenFade(false);
              }, 1500);
            }, 1000);
          }, 2200);
        }
      };
      typeNextChar();
    }, 400);
  };

  // Simulated ad states
  const [activeAd, setActiveAd] = useState<{
    type: "upgrade" | "revive";
    weaponId?: string;
    upgradeKey?: string;
    cost?: number;
    onComplete: () => void;
  } | null>(null);
  const [adTimer, setAdTimer] = useState(4);
  const [adFinished, setAdFinished] = useState(false);
  const [fakeAdIndex, setFakeAdIndex] = useState(0);
  const [adAlertOpen, setAdAlertOpen] = useState(false);
  const [isWavePanelMinimized, setIsWavePanelMinimized] = useState(false);

  // Fake Ads Database
  const FAKE_ADS = [
    {
      title: "MANÍACO DO PIX 💸",
      tagline: "Ganhos automáticos clicando em zumbis!",
      desc: "Cadastre-se hoje e receba um bônus de 500 rodadas grátis no cassino do submundo! Dinheiro rápido e fácil!",
      action: "BAIXAR E GANHAR PIX",
      bgColor: "from-emerald-950 via-zinc-950 to-zinc-950",
      glowColor: "#10b981",
    },
    {
      title: "SUPER ANTIVÍRUS PRO MAX 🛡️",
      tagline: "Aviso: Seu celular possui 43 ameaças!",
      desc: "Limpeza profunda de RAM e resfriador de CPU em 3 segundos. Remova infecções digitais antes que seja tarde!",
      action: "LIMPAR APARELHO AGORA",
      bgColor: "from-blue-950 via-zinc-950 to-zinc-950",
      glowColor: "#3b82f6",
    },
    {
      title: "TIGRINHO DO SUBMUNDO 🐯",
      tagline: "O tigre está solto pagando muito!",
      desc: "Deposite 1 Cr e retire 1000 Cr na hora! Nova plataforma pagando no modo apocalipse. Jogue com moderação.",
      action: "SOLTAR O TIGRINHO",
      bgColor: "from-amber-950 via-zinc-950 to-zinc-950",
      glowColor: "#f59e0b",
    }
  ];

  // Ad timer effect
  useEffect(() => {
    if (!activeAd) return;
    setAdTimer(4);
    setAdFinished(false);
    setFakeAdIndex(Math.floor(Math.random() * FAKE_ADS.length));
    
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeAd]);

  // Handle window-level revive trigger
  useEffect(() => {
    (window as any).triggerAdRevive = () => {
      setAdAlertOpen(true);
    };
    return () => {
      delete (window as any).triggerAdRevive;
    };
  }, []);

  // Advanced settings
  const [goreLevel, setGoreLevel] = useState<"full" | "reduced" | "off">("full");
  const goreLevelRef = useRef<"full" | "reduced" | "off">("full");
  useEffect(() => { goreLevelRef.current = goreLevel; }, [goreLevel]);

  const [shellLevel, setShellLevel] = useState<"permanent" | "temporary" | "simplified" | "off">("temporary");
  const shellLevelRef = useRef<"permanent" | "temporary" | "simplified" | "off">("temporary");
  useEffect(() => { shellLevelRef.current = shellLevel; }, [shellLevel]);

  const [cinematicMode, setCinematicMode] = useState<boolean>(false);
  const cinematicModeRef = useRef<boolean>(false);
  useEffect(() => {
    cinematicModeRef.current = cinematicMode;
    (window as any).cinematicModeActive = cinematicMode;
    SoundManager.updateCinematicFilter(cinematicMode);
  }, [cinematicMode]);

  const [isHudHidden, setIsHudHidden] = useState<boolean>(false);
  useEffect(() => { (window as any).isHudHiddenActive = isHudHidden; }, [isHudHidden]);

  const [inTrainingMode, setInTrainingMode] = useState<boolean>(false);
  useEffect(() => {
    (window as any).setInTrainingModeReact = (val: boolean) => {
      setInTrainingMode(val);
    };
  }, []);


  // Wave state for React HUD rendering
  const [wave, setWave] = useState(0); 
  const [waveActive, setWaveActive] = useState(false);
  const [waveRemainingZombies, setWaveRemainingZombies] = useState(0);
  const [waveIntervalTime, setWaveIntervalTime] = useState(0);
  const [waveIntroText, setWaveIntroText] = useState<string | null>(null);

  // Handle wave completion panel auto-minimize after 3.5 seconds
  useEffect(() => {
    if (waveIntervalTime > 0) {
      setIsWavePanelMinimized(false);
      const timer = setTimeout(() => {
        setIsWavePanelMinimized(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setIsWavePanelMinimized(false);
    }
  }, [waveIntervalTime > 0]);

  // New states for mobile and wave mode
  const [isWaveMode, setIsWaveMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(true);

  // Track if mobile touch is active
  useEffect(() => {
    const checkTouch = () => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsMobile(isTouch);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  const [joystickStart, setJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [joystickCurrent, setJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const moveTouchIdRef = useRef<number | null>(null);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    moveTouchIdRef.current = touch.identifier;
    setJoystickStart({ x: touch.clientX, y: touch.clientY });
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (moveTouchIdRef.current === null || !joystickStart) return;
    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === moveTouchIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });

    const dx = touch.clientX - joystickStart.x;
    const dy = touch.clientY - joystickStart.y;
    const dist = Math.hypot(dx, dy);
    const maxDist = 50; 
    const angle = Math.atan2(dy, dx);
    const intensity = Math.min(dist / maxDist, 1.0);

    (window as any).mobileJoystick = {
      dx: Math.cos(angle) * intensity,
      dy: Math.sin(angle) * intensity
    };
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    if (moveTouchIdRef.current === null) return;
    let ended = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        ended = true;
        break;
      }
    }
    if (ended) {
      moveTouchIdRef.current = null;
      setJoystickStart(null);
      setJoystickCurrent(null);
      (window as any).mobileJoystick = { dx: 0, dy: 0 };
    }
  };

  const [aimJoystickStart, setAimJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [aimJoystickCurrent, setAimJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const fireTouchIdRef = useRef<number | null>(null);

  const handleAimStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    fireTouchIdRef.current = touch.identifier;
    setAimJoystickStart({ x: touch.clientX, y: touch.clientY });
    setAimJoystickCurrent({ x: touch.clientX, y: touch.clientY });
    (window as any).mobileShootActive = true;
  };

  const handleAimMove = (e: React.TouchEvent) => {
    if (fireTouchIdRef.current === null || !aimJoystickStart) return;
    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === fireTouchIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;
    setAimJoystickCurrent({ x: touch.clientX, y: touch.clientY });

    const dx = touch.clientX - aimJoystickStart.x;
    const dy = touch.clientY - aimJoystickStart.y;
    if (Math.hypot(dx, dy) > 5) {
      const angle = Math.atan2(dy, dx);
      (window as any).mobileAimJoystickAngle = angle;
    }
  };

  const handleAimEnd = (e: React.TouchEvent) => {
    if (fireTouchIdRef.current === null) return;
    let ended = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === fireTouchIdRef.current) {
        ended = true;
        break;
      }
    }
    if (ended) {
      fireTouchIdRef.current = null;
      setAimJoystickStart(null);
      setAimJoystickCurrent(null);
      (window as any).mobileShootActive = false;
      (window as any).mobileAimJoystickAngle = null;
    }
  };

  const [adsJoystickStart, setAdsJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [adsJoystickCurrent, setAdsJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const adsTouchIdRef = useRef<number | null>(null);

  const handleAdsJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    adsTouchIdRef.current = touch.identifier;
    setAdsJoystickStart({ x: touch.clientX, y: touch.clientY });
    setAdsJoystickCurrent({ x: touch.clientX, y: touch.clientY });
    (window as any).mobileAimActive = true;
  };

  const handleAdsJoystickMove = (e: React.TouchEvent) => {
    if (adsTouchIdRef.current === null || !adsJoystickStart) return;
    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === adsTouchIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;
    setAdsJoystickCurrent({ x: touch.clientX, y: touch.clientY });

    const dx = touch.clientX - adsJoystickStart.x;
    const dy = touch.clientY - adsJoystickStart.y;
    if (Math.hypot(dx, dy) > 5) {
      const angle = Math.atan2(dy, dx);
      (window as any).mobileAimJoystickAngle = angle;
    }
  };

  const handleAdsJoystickEnd = (e: React.TouchEvent) => {
    if (adsTouchIdRef.current === null) return;
    let ended = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === adsTouchIdRef.current) {
        ended = true;
        break;
      }
    }
    if (ended) {
      adsTouchIdRef.current = null;
      setAdsJoystickStart(null);
      setAdsJoystickCurrent(null);
      (window as any).mobileAimActive = false;
      (window as any).mobileAimJoystickAngle = null;
    }
  };

  // Player weapon-specific upgrades levels state
  const freshWeaponUpgrades = () => ({
    damage: 0,
    fireRate: 0,
    stability: 0,
    accuracy: 0,
    capacity: 0,
    reloadSpeed: 0,
    range: 0,
    scopeVision: 0,
  });

  const [upgrades, setUpgrades] = useState<Record<string, Record<string, number>>>({
    pistola: freshWeaponUpgrades(),
    gun: freshWeaponUpgrades(),
    uzi: freshWeaponUpgrades(),
    doze: freshWeaponUpgrades(),
    basuca: freshWeaponUpgrades(),
    rifle: freshWeaponUpgrades(),
    magnum: freshWeaponUpgrades(),
  });

  const [selectedWeaponForUpgrade, setSelectedWeaponForUpgrade] = useState<string | null>(null);

  const waveRef = useRef({
    mode: false,
    current: 1,
    active: false,
    zombiesTotal: 0,
    zombiesKilled: 0,
    zombiesSpawned: 0,
    spawnTimer: 0,
    intervalTimer: 0,
    introTimer: 0,
    introText: "",
    waveTime: 0,
    waveDamage: 0,
    lastWaveTime: 0,
    lastWaveDamage: 0,
    waveShots: 0,
    waveHits: 0,
    waveHeadshots: 0,
    waveCreditsEarned: 0,
    lastWaveShots: 0,
    lastWaveHits: 0,
    lastWaveHeadshots: 0,
    lastWaveCreditsEarned: 0,
  });

  const getMapSize = () => {
    if (waveRef.current.mode && waveRef.current.current >= 5) return 2000;
    return 1400;
  };

  const upgradesRef = useRef<Record<string, Record<string, number>>>({
    pistola: freshWeaponUpgrades(),
    gun: freshWeaponUpgrades(),
    uzi: freshWeaponUpgrades(),
    doze: freshWeaponUpgrades(),
    basuca: freshWeaponUpgrades(),
    rifle: freshWeaponUpgrades(),
    magnum: freshWeaponUpgrades(),
  });

  const initialCharUpgrades = () => ({
    maxHp: 0,
    staminaMax: 0,
    speed: 0,
  });
  const [charUpgrades, setCharUpgrades] = useState(initialCharUpgrades());
  const charUpgradesRef = useRef(initialCharUpgrades());
  const dustRef = useRef<{x: number, y: number, size: number, speed: number, alpha: number}[]>([]);

  const [credits, setCredits] = useState(() => {
    try { const s = localStorage.getItem('mns_globalCredits'); return s ? parseInt(s) : 0; } catch { return 0; }
  });
  const [globalCredits, setGlobalCredits] = useState(() => {
    try { const s = localStorage.getItem('mns_globalCredits'); return s ? parseInt(s) : 0; } catch { return 0; }
  });
  const [globalPurchasedSkins, setGlobalPurchasedSkins] = useState<string[]>(() => {
    try { const s = localStorage.getItem('mns_purchasedSkins'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const saveGlobalCredits = (val: number) => {
    setGlobalCredits(val);
    try { localStorage.setItem('mns_globalCredits', String(val)); } catch {}
  };
  const saveGlobalSkins = (skins: string[]) => {
    setGlobalPurchasedSkins(skins);
    try { localStorage.setItem('mns_purchasedSkins', JSON.stringify(skins)); } catch {}
  };
  const [purchasedWeaponIds, setPurchasedWeaponIds] = useState<string[]>([
    "pistola",
  ]);
  const [selectedShopWeaponId, setSelectedShopWeaponId] = useState<string>("pistola");
  const [selectedShopSkinId, setSelectedShopSkinId] = useState<string | null>(null);
  const [selectedShopSkinIndex, setSelectedShopSkinIndex] = useState(0);
  const [shopZoomed, setShopZoomed] = useState(false);
  useEffect(() => {
    setSelectedShopSkinIndex(0);
    setShopZoomed(false); // Reset zoom when changing weapons
  }, [selectedShopWeaponId]);
  const [weaponInfoActive, setWeaponInfoActive] = useState<number>(0);
  const [selectedBackpackSlot, setSelectedBackpackSlot] = useState<
    number | null
  >(null);
  const [selectedSkinId, setSelectedSkinId] = useState("red");
  const skinRef = useRef(availableSkins[0]);

  const menuWallpapers = [
    "/lendas/Four_soldiers_walking_towards_ex._202606160159.jpeg",
    "/lendas/Soldiers_in_desert_sandstorm_202606160200.jpeg",
    "/lendas/Squad_crossing_snowy_ridge_blizzard_202606160200.jpeg",
    "/lendas/Soldier_fires_at_zombies_202606141856.jpeg",
    "/lendas/Soldier_aiming_sniper_rifle_prone_202606141901.jpeg",
    "/lendas/Soldier_dual-wielding_Uzis_firing_202606141903.jpeg",
    "/lendas/Soldier_firing_bazooka_smoke_trail_202606141904.jpeg",
    "/lendas/Soldier_firing_heavy_sniper_rifle_202606141906.jpeg",
    "/lendas/Soldier_jumping_firing_dual_Uzis_202606141901.jpeg",
    "/lendas/Soldier_rappelling_down_wall_firing_202606141909 (1).jpeg"
  ];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [prevBgIndex, setPrevBgIndex] = useState(-1);
  const [cutscene, setCutscene] = useState({
    active: false,
    phase: "NONE" as "NONE" | "INTRO_FADE" | "KOMBI_ARRIVING" | "PLAYER_DESCENDING" | "PLAYER_LOADING_WEAPON" | "INTRO_SCREEN_FADE" | "FADING_GAME_IN",
    timer: 0,
    playerJumpProgress: 0,
    overlayAlpha: 0,
    hornTriggered: false,
    reloadTriggered: false,
  });
  const cutsceneRef = useRef({
    active: false,
    phase: "NONE" as "NONE" | "INTRO_FADE" | "KOMBI_ARRIVING" | "PLAYER_DESCENDING" | "PLAYER_LOADING_WEAPON" | "INTRO_SCREEN_FADE" | "FADING_GAME_IN",
    timer: 0,
    playerJumpProgress: 0,
    overlayAlpha: 0,
    hornTriggered: false,
    reloadTriggered: false,
  });

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const startLoadingScreen = () => {
    setGameState("LOADING");
    setLoadingProgress(0);
    setLoadingText("PREPARANDO VEÍCULO DE INSERÇÃO...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setLoadingText("INSERÇÃO AUTORIZADA!");
        setTimeout(() => {
          triggerCinematicCutscene();
        }, 800);
      } else {
        setLoadingProgress(progress);
        const texts = [
          "PREPARANDO VEÍCULO DE INSERÇÃO...",
          "SINCRONIZANDO EQUIPAMENTO TÁTICO...",
          "CONECTANDO VIA SATÉLITE...",
          "MAPEANDO COORDENADAS DO DESERTO...",
          "INICIALIZANDO MOTOR DA KOMBI...",
          "AVALIANDO ATIVIDADE ZUMBI...",
          "INSERÇÃO IMINENTE..."
        ];
        const textIdx = Math.min(texts.length - 1, Math.floor(progress / 15));
        setLoadingText(texts[textIdx]);
      }
    }, 150);
  };

  const triggerCinematicCutscene = () => {
    cutsceneRef.current = {
      active: true,
      phase: "INTRO_FADE",
      timer: 1.5,
      playerJumpProgress: 0,
      overlayAlpha: 1.0,
      hornTriggered: false,
      reloadTriggered: false,
    };
    setCutscene({ ...cutsceneRef.current });
    
    setGameState("PLAYING");
    
    vanState = "ENTERING";
    VAN_X = -1500;
    VAN_Y = -350;
    vanTargetX = 0;
    vanTargetY = -350;
    vanAngle = 0;
    
    const wRef = waveRef.current;
    wRef.mode = true;
    wRef.current = 1;
    wRef.active = false;
    wRef.zombiesKilled = 0;
    wRef.zombiesSpawned = 0;
    wRef.zombiesTotal = 15;
    wRef.intervalTimer = 0;
    wRef.introTimer = 0;
    wRef.waveTime = 0;
    wRef.waveDamage = 0;
    wRef.lastWaveTime = 0;
    wRef.lastWaveDamage = 0;

    setCredits(45);
    purchasedWeaponIds.length = 0;
    purchasedWeaponIds.push("pistola");
    inventoryRef.current = {
      hotbar: ["pistola", null, null, null, null],
      hotbarAmmo: [WEAPONS_DETAILS.pistola.ammoMax, 0, 0, 0, 0],
      backpack: Array(16).fill(null),
      activeSlot: 0,
      selectedItem: null,
      purchasedSkins: [...globalPurchasedSkins],
      equippedSkins: {}
    } as any;

    setWave(1);
    setWaveActive(false);
    setWaveIntervalTime(0);
    setWaveRemainingZombies(15);
    setIsWaveMode(true);
    
    (window as any).clearZombiesOnStart = true;
  };
  useEffect(() => {
    if (gameState !== "MENU") return;
    // Faster cycles (every 2.2s) during protocol load so 3 wallpapers are shown, slower (4.5s) on standard menu
    const delay = isLoadingProtocol ? 2200 : 4500;
    const interval = setInterval(() => {
      setPrevBgIndex(currentBgIndex);
      setCurrentBgIndex((prev) => (prev + 1) % menuWallpapers.length);
    }, delay);
    return () => clearInterval(interval);
  }, [gameState, currentBgIndex, isLoadingProtocol]);

  const [draggedItem, setDraggedItem] = useState<{ type: "hotbar" | "backpack"; index: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, type: "hotbar" | "backpack", index: number) => {
    setDraggedItem({ type, index });
    e.dataTransfer.setData("text/plain", `${type}-${index}`);
    
    const item = type === "hotbar" ? inventoryRef.current.hotbar[index] : inventoryRef.current.backpack[index];
    if (item && loadedWeaponImages[item]) {
      const img = loadedWeaponImages[item];
      const dragIcon = document.createElement("img");
      dragIcon.src = img.src;
      dragIcon.style.width = "70px";
      dragIcon.style.height = "auto";
      dragIcon.style.position = "absolute";
      dragIcon.style.top = "-1000px";
      dragIcon.style.filter = "drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))";
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 35, 15);
      setTimeout(() => { if (document.body.contains(dragIcon)) document.body.removeChild(dragIcon); }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetType: "hotbar" | "backpack", targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const inv = inventoryRef.current;
    
    // Pegar o item de origem
    const sourceItem = draggedItem.type === "hotbar" ? inv.hotbar[draggedItem.index] : inv.backpack[draggedItem.index];
    const targetItem = targetType === "hotbar" ? inv.hotbar[targetIndex] : inv.backpack[targetIndex];
    const sourceAmmo = draggedItem.type === "hotbar" ? inv.hotbarAmmo[draggedItem.index] : 0;
    const targetAmmo = targetType === "hotbar" ? inv.hotbarAmmo[targetIndex] : 0;

    if (!sourceItem && !targetItem) {
      setDraggedItem(null);
      return;
    }

    // Trocar de lugar - Origem recebe Destino
    if (draggedItem.type === "hotbar") {
      inv.hotbar[draggedItem.index] = targetItem;
      inv.hotbarAmmo[draggedItem.index] = targetItem ? (targetType === "hotbar" ? targetAmmo : WEAPONS_DETAILS[targetItem]?.ammoMax || 0) : 0;
    } else {
      inv.backpack[draggedItem.index] = targetItem;
    }

    // Destino recebe Origem
    if (targetType === "hotbar") {
      inv.hotbar[targetIndex] = sourceItem;
      inv.hotbarAmmo[targetIndex] = sourceItem ? (draggedItem.type === "hotbar" ? sourceAmmo : WEAPONS_DETAILS[sourceItem]?.ammoMax || 0) : 0;
    } else {
      inv.backpack[targetIndex] = sourceItem;
    }

    setDraggedItem(null);
    updateInv();
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoveredMenuBtn, setHoveredMenuBtn] = useState<string | null>(null);

  const hoverInfo: Record<string, { title: string; subtitle: string; desc: string }> = {
    wave_mode: {
      title: "OPERAÇÃO: ONDAS DE INSERÇÃO",
      subtitle: "CAMPANHA / SOBREVIVÊNCIA",
      desc: "Sobreviva a ondas progressivas de zumbis e mutantes no deserto. Acumule créditos para comprar upgrades permanentes para todos os seus agentes. Coordene retiradas táticas quando necessário."
    },
    sandbox_mode: {
      title: "SIMULADOR: ÁREA SANDBOX",
      subtitle: "REDE DE TESTE LIVRE",
      desc: "Treine sua pontaria e teste novos armamentos com munição ilimitada e créditos infinitos. Manequins de treinamento surgem na arena para servir de alvo estático."
    },
    shop: {
      title: "REDE DE SUPRIMENTOS",
      subtitle: "ADQUIRIR ARMAMENTOS & VISUAIS",
      desc: "Adquira novos fuzis, escopetas, bazucas e skins exclusivas para personalizar a identidade visual e o arsenal dos seus operadores táticos."
    },
    character: {
      title: "FICHAS: OPERADORES ATIVOS",
      subtitle: "BIOGRAFIAS E UPGRADES",
      desc: "Acesse as fichas confidenciais dos quatro agentes disponíveis. Compre melhorias permanentes de vida, stamina, dano e velocidade."
    },
    tips: {
      title: "MANUAL: DIRETRIZES DE CAMPO",
      subtitle: "DICAS DE SOBREVIVÊNCIA",
      desc: "Consulte o manual tático para dominar a movimentação, gerenciar o inventário da mochila de sobrevivência e entender as fraquezas das mutações."
    },
    bestiary: {
      title: "ARQUIVOS: MUTANTES DO SUBMUNDO",
      subtitle: "CATÁLOGO DE MUTAÇÕES",
      desc: "Estude os relatórios médicos e táticos sobre todas as espécies de zumbis catalogadas. Identifique zumbis comuns, saltadores e os perigosos chefes de área."
    }
  };

  const [isAimEnabled, setIsAimEnabled] = useState(true);
  const [isCrosshairEnabled, setIsCrosshairEnabled] = useState(true);
  const [aimSensitivity, setAimSensitivity] = useState(1.0);
  const [backpackImgUrl, setBackpackImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "/tactical_backpack.jpeg";
    img.onload = () => {
      const cvs = document.createElement("canvas");
      cvs.width = img.width;
      cvs.height = img.height;
      const cctx = cvs.getContext("2d");
      if (cctx) {
        cctx.drawImage(img, 0, 0);
        const imgData = cctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < 45 && data[i+1] < 45 && data[i+2] < 45) {
            data[i+3] = 0; // set alpha to 0 for black pixels
          }
        }
        cctx.putImageData(imgData, 0, 0);
        setBackpackImgUrl(cvs.toDataURL("image/png"));
      }
    };
  }, []);

  const isAimEnabledRef = useRef(true);
  const isCrosshairEnabledRef = useRef(true);
  const aimSensitivityRef = useRef(1.0);
  const showMobileControlsRef = useRef(true);
  const isMobileRef = useRef(false);

  useEffect(() => {
    isAimEnabledRef.current = isAimEnabled;
  }, [isAimEnabled]);

  useEffect(() => {
    isCrosshairEnabledRef.current = isCrosshairEnabled;
  }, [isCrosshairEnabled]);

  useEffect(() => {
    aimSensitivityRef.current = aimSensitivity;
  }, [aimSensitivity]);

  useEffect(() => {
    showMobileControlsRef.current = showMobileControls;
  }, [showMobileControls]);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    const skin = availableSkins.find((s) => s.id === selectedSkinId);
    if (skin) {
      skinRef.current = skin;
      
      // Determine starting/base weapon for this skin
      let baseWeapon = "gun";
      if (selectedSkinId === "purple") baseWeapon = "rifle";
      else if (selectedSkinId === "orange") baseWeapon = "basuca";
      else if (selectedSkinId === "blue") baseWeapon = "uzi";
      else if (selectedSkinId === "red") baseWeapon = "gun";
      
      // Set the active slot weapon to the base weapon
      const inv = inventoryRef.current;
      inv.hotbar[inv.activeSlot] = baseWeapon;
      
      // Give full ammo for the base weapon
      const ammoMax = WEAPONS_DETAILS[baseWeapon]?.ammoMax || 0;
      inv.hotbarAmmo[inv.activeSlot] = ammoMax;
      
      // Ensure it is unlocked in purchasedWeaponIds
      if (!purchasedWeaponIds.includes(baseWeapon)) {
        setPurchasedWeaponIds(prev => [...prev, baseWeapon]);
      }
      
      // Force render update
      updateInv();
    }
    (window as any).selectedSkinMain = skin?.colorMain || "#2d4c22";
    (window as any).selectedSkinDark = skin?.colorDark || "#1e3317";
    (window as any).selectedSkinHands = skin?.colorSkin || "#151515";
  }, [selectedSkinId, purchasedWeaponIds]);

  useEffect(() => {
    if (weaponInfoActive > 0) {
      const timer = setTimeout(() => setWeaponInfoActive(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [weaponInfoActive]);

  const startWavesMode = () => {
    upgradesRef.current = {
      pistola: freshWeaponUpgrades(),
      gun: freshWeaponUpgrades(),
      uzi: freshWeaponUpgrades(),
      doze: freshWeaponUpgrades(),
      basuca: freshWeaponUpgrades(),
      rifle: freshWeaponUpgrades(),
      magnum: freshWeaponUpgrades(),
    };
    setUpgrades(JSON.parse(JSON.stringify(upgradesRef.current)));
    charUpgradesRef.current = initialCharUpgrades();
    setCharUpgrades(initialCharUpgrades());

    const wRef = waveRef.current;
    wRef.mode = true;
    wRef.current = 1;
    wRef.active = false;
    wRef.zombiesKilled = 0;
    wRef.zombiesSpawned = 0;
    wRef.zombiesTotal = 15;
    wRef.intervalTimer = 0;
    wRef.introTimer = 3.0;
    wRef.introText = "PRIMEIRA ONDA";
    wRef.waveTime = 0;
    wRef.waveDamage = 0;
    wRef.lastWaveTime = 0;
    wRef.lastWaveDamage = 0;

    vanState = "OUT";
    VAN_X = -2000;
    VAN_Y = -2000;
    vanTargetX = 0;
    vanTargetY = -350;

    // Set all mannequins HP to 0 immediately so none are active during intro
    (window as any).clearZombiesOnStart = true;

    // Reset credits, purchases and inventory for clean start
    setCredits(45); // Start with 45 Cr for a clean start
    purchasedWeaponIds.length = 0;
    purchasedWeaponIds.push("pistola"); // default starting pistol
    inventoryRef.current = {
      hotbar: ["pistola", null, null, null, null],
      hotbarAmmo: [WEAPONS_DETAILS.pistola.ammoMax, 0, 0, 0, 0],
      backpack: Array(16).fill(null),
      activeSlot: 0,
      selectedItem: null,
      purchasedSkins: [...globalPurchasedSkins],
      equippedSkins: {}
    } as any;

    setWave(1);
    setWaveActive(false);
    setWaveIntroText("PRIMEIRA ONDA");
    setWaveIntervalTime(0);
    setWaveRemainingZombies(15);

    setIsWaveMode(true);
    setGameState("PLAYING");
  };

  const skipInterval = () => {
    if (waveRef.current.intervalTimer > 0) {
      waveRef.current.intervalTimer = 0.05;
    }
  };

  const inventoryRef = useRef({
    hotbar: ["gun", null, null, null, null] as (string | null)[],
    hotbarAmmo: [200, 0, 0, 0, 0] as number[],
    backpack: Array(16).fill(null) as (string | null)[],
    activeSlot: 0,
    selectedItem: null as { type: "hotbar" | "backpack"; index: number } | null,
    equippedSkins: {} as Record<string, string>,
    purchasedSkins: [] as string[],
  });
  const [, setForceRender] = useState(0);
  const updateInv = () => setForceRender((v) => v + 1);

  const toggleToBackpack = (hotbarIndex: number) => {
    (window as any).hotbarVisibleTimer = 4.0;
    const inv = inventoryRef.current;
    const item = inv.hotbar[hotbarIndex];
    if (item) {
      if (!isInventoryOpen) {
        setWeaponInfoActive(Date.now());
        // Auto-select the weapon if it was clicked
        inv.activeSlot = hotbarIndex;
        updateInv();
        return;
      }
      const firstEmpty = inv.backpack.findIndex((i) => i === null);
      if (firstEmpty !== -1) {
        // Ensure we don't un-equip exactly while firing if possible, but simplest is let it be null.
        inv.backpack[firstEmpty] = item;
        inv.hotbar[hotbarIndex] = null;
        inv.hotbarAmmo[hotbarIndex] = 0;
        updateInv();
      }
    }
  };

  const toggleToHotbar = (backpackIndex: number) => {
    (window as any).hotbarVisibleTimer = 4.0;
    const inv = inventoryRef.current;
    const item = inv.backpack[backpackIndex];
    if (item) {
      if (selectedBackpackSlot !== backpackIndex) {
        setSelectedBackpackSlot(backpackIndex);
        return;
      }
      const firstEmpty = inv.hotbar.findIndex((i) => i === null);
      if (firstEmpty !== -1) {
        inv.hotbar[firstEmpty] = item;
        inv.hotbarAmmo[firstEmpty] = WEAPONS_DETAILS[item]
          ? WEAPONS_DETAILS[item].ammoMax
          : 0;
        inv.backpack[backpackIndex] = null;
        setSelectedBackpackSlot(null);
        updateInv();
      }
    } else {
      setSelectedBackpackSlot(null);
    }
  };

  const purchaseWeapon = (weaponId: string) => {
    const stats = WEAPONS_DETAILS[weaponId];
    if (!stats) return;
    const isFreeMode = !waveRef.current.mode;
    if (!isFreeMode && credits < stats.cost) return;
    if (purchasedWeaponIds.includes(weaponId)) return;

    if (!isFreeMode) {
      setCredits((prev) => prev - stats.cost);
    }
    setPurchasedWeaponIds((prev) => [...prev, weaponId]);
    deliverToBackpack(weaponId); // Auto-equip to backpack
  };

  const deliverToBackpack = (weaponId: string) => {
    const inv = inventoryRef.current;
    
    // 1. Try to equip to the hotbar first
    const hotbarEmpty = inv.hotbar.findIndex((i) => i === null);
    if (hotbarEmpty !== -1) {
      inv.hotbar[hotbarEmpty] = weaponId;
      inv.hotbarAmmo[hotbarEmpty] = WEAPONS_DETAILS[weaponId]
        ? WEAPONS_DETAILS[weaponId].ammoMax
        : 0;
      inv.activeSlot = hotbarEmpty; // Switch to new weapon
      updateInv();
      return true;
    }
    
    // 2. If hotbar is full, deliver to backpack
    const firstEmpty = inv.backpack.findIndex((i) => i === null);
    if (firstEmpty !== -1) {
      inv.backpack[firstEmpty] = weaponId;
      updateInv();
      setAnimateBackpack(true);
      setTimeout(() => {
        setAnimateBackpack(false);
      }, 800);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (gameState !== "PLAYING" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ----- Game State -----
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const TILE_SIZE = 120;
    const PLAYER_SPEED = 400; // px/sec
    const BULLET_SPEED = 1500; // px/sec

    let lastTime = performance.now();
    let animationFrameId: number;

    const keys = { w: false, a: false, s: false, d: false, shift: false, space: false };
    const mouse = {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      down: false,
      rightDown: false,
    };

    const maxHpVal = 50 + (charUpgradesRef.current?.maxHp || 0) * 90;
    const staminaMaxVal = 100 + (charUpgradesRef.current?.staminaMax || 0) * 20;
    let _hp = maxHpVal;
    const player = {
      x: cutsceneRef.current.active ? -1500 : 0,
      y: cutsceneRef.current.active ? -350 : 0,
      vx: 0,
      vy: 0,
      get hp() { return _hp; },
      set hp(val) {
        if (val < _hp) {
          const dmg = _hp - val;
          const reducedDmg = dmg * (skinRef.current?.stats?.resistance ?? 1.0);
          _hp = Math.max(0, _hp - reducedDmg);
        } else {
          _hp = Math.min(this.maxHp, val);
        }
      },
      maxHp: maxHpVal,
      angle: 0,
      bloodiness: 0,
      stepDist: 0,
      leftFoot: false,
      isMoving: false,
      isRunning: false,
      moveTimer: 0,
      idleTimer: 0,
      gunDropLerp: 0,
      gunHeat: 0,
      ammo: 200,
      maxAmmo: 200,
      isReloading: false,
      reloadTimer: 0,
      wasShooting: false,
      gunSmokeTime: 0,
      speechText: "",
      speechTimer: 0,
      nextSpeechDelay: 5 + Math.random() * 5,
      hitMarkerTime: 0,
      kills: 0,
      furyKills: 0,
      furyTimer: 0,
      healthGlowTimer: 0,
      bloodAmount: 0,
      isLaserOn: false,
      isDead: false,
      deadTimer: 0,
      recoil: 0,
      isRolling: false,
      rollTimer: 0,
      rollDuration: 0,
      rollDirectionX: 0,
      rollDirectionY: 0,
      rollCooldown: 0,
      rollSpeed: 0,
      rollWasRunning: false,
      stamina: staminaMaxVal,
      staminaMax: staminaMaxVal,
      staminaExhausted: false,
    };

    const PHRASES = [
      "Haa que tédio da poha",
      "Quero mataaaa!!",
      "Vem pro pai...",
      "Onde estão eles?",
      "Silêncio demais...",
      "Mais sangue...",
      "Tô enferrujando aqui.",
      "Apareçam, covardes!",
    ];

    const dustParticles: {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number;
    }[] = [];

    const rollGhosts: {
      x: number; y: number; angle: number; alpha: number; scale: number; isBlue?: boolean; jumpHeight?: number; rollAngle?: number;
    }[] = [];

    const bullets: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      isFury?: boolean;
      isCrit?: boolean;
      dmgMult: number;
      hitEntityIds: number[];
      penetrationCount?: number;
      headshotsCount?: number;
      weaponType?: string;
      isRocket?: boolean;
      themeColor?: string;
    }[] = [];
    const particles: {
      x: number;
      y: number;
      relX?: number;
      relY?: number;
      relVx?: number;
      relVy?: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
      isSmoke?: boolean;
    }[] = [];
    const shells: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      angle: number;
      rotSpeed: number;
      life: number;
      isDead?: boolean;
      themeColor?: string;
      isBazooka?: boolean;
      isKicked?: boolean;
    }[] = [];
    const shellDecals: {
      x: number;
      y: number;
      angle: number;
      timer: number;
      themeColor?: string;
      isBazooka?: boolean;
      isKicked?: boolean;
    }[] = [];

    const explosionFlashes: {
      x: number;
      y: number;
      size: number;
      maxLife: number;
      life: number;
      color: string;
    }[] = [];

    const bloodDecals: {
      x: number;
      y: number;
      size: number;
      alpha: number;
      angle: number;
      stretch: number;
      type?: "blood" | "footprint" | "meat" | "charred";
      timer: number;
    }[] = [];
    const bloodDrops: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
    }[] = [];
    const gibs: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      angle: number;
      rotSpeed: number;
      size: number;
      life: number;
    }[] = [];
    const upgradeEnergyOrbs: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      bounceCount: number;
      life: number;
    }[] = [];
    const healthOrbs: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }[] = [];
    const furySouls: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }[] = [];

    (window as any).clearDecalsAndShells = () => {
      bloodDecals.length = 0;
      shells.length = 0;
      shellDecals.length = 0;
      bloodDrops.length = 0;
      gibs.length = 0;
    };

    const pushBloodDrop = (drop: any) => {
      const gl = goreLevelRef.current;
      if (gl === "off") return;
      if (gl === "reduced" && Math.random() > 0.3) return;
      Array.prototype.push.call(bloodDrops, drop);
    };

    const pushBloodDecal = (decal: any) => {
      const gl = goreLevelRef.current;
      if (decal.type !== "footprint" && decal.type !== "charred") {
        if (gl === "off") return;
        if (gl === "reduced" && Math.random() > 0.3) return;
      }
      Array.prototype.push.call(bloodDecals, decal);
      
      const maxDecals = isMobileDevice ? 150 : 400;
      if (bloodDecals.length > maxDecals) {
        bloodDecals.splice(0, bloodDecals.length - maxDecals);
      }
    };

    const pushShell = (shell: any) => {
      const sl = shellLevelRef.current;
      if (sl === "off") return;
      if (sl === "simplified" && Math.random() > 0.25) return;
      if (sl === "temporary") {
        shell.life = 3.0;
      }
      Array.prototype.push.call(shells, shell);
    };

    const pushGib = (gib: any) => {
      const gl = goreLevelRef.current;
      if (gl === "off") return;
      Array.prototype.push.call(gibs, gib);
    };

    const onZombieDeath = (m: any) => {
      SoundManager.playSound("death", 0.65);
      screenShakeStr = Math.max(screenShakeStr, 5);
      player.kills++;
      
      // Bestiary Unlocks
      try {
        if (m.profile === "ATIRADOR") {
          localStorage.setItem('mns_unlocked_atirador', 'true');
        } else if (m.profile === "DASHER") {
          localStorage.setItem('mns_unlocked_dasher', 'true');
        } else {
          localStorage.setItem('mns_unlocked_comum', 'true');
        }
      } catch (e) {}
      
      const earnedCredits = m.isBoss ? 75 : 15;
      setCredits((prev) => prev + earnedCredits);
      if (waveRef.current.mode && waveRef.current.active) {
        waveRef.current.waveCreditsEarned += earnedCredits;
      }

      // Spawn upgrade energy orb
      if (Math.random() < 0.6) {
        upgradeEnergyOrbs.push({
          x: m.x,
          y: m.y,
          z: 15,
          vx: (Math.random() - 0.5) * 350,
          vy: (Math.random() - 0.5) * 350,
          vz: 150 + Math.random() * 200,
          bounceCount: 0,
          life: 30, // Stay around a bit longer
        });
      }

      // Spawn health orb
      if (player.kills % 3 === 0 || player.hp < player.maxHp * 0.3) {
        healthOrbs.push({
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 150,
          vy: (Math.random() - 0.5) * 150,
          life: 20,
        });
      }

      // Spawn fury soul
      furySouls.push({
        x: m.x,
        y: m.y,
        vx: (Math.random() - 0.5) * 200,
        vy: -100 - Math.random() * 200,
        life: 0,
      });

      // Wave-mode-specific logic
      if (waveRef.current.mode) {
        waveRef.current.zombiesKilled++;
        const remaining = Math.max(0, waveRef.current.zombiesTotal - waveRef.current.zombiesKilled);
        setWaveRemainingZombies(remaining);

        // Check wave completion
        if (waveRef.current.zombiesKilled >= waveRef.current.zombiesTotal) {
          waveRef.current.active = false;
          setWaveActive(false);

          // Save wave stats
          waveRef.current.lastWaveTime = waveRef.current.waveTime;
          waveRef.current.lastWaveDamage = waveRef.current.waveDamage;
          waveRef.current.lastWaveShots = waveRef.current.waveShots;
          waveRef.current.lastWaveHits = waveRef.current.waveHits;
          waveRef.current.lastWaveHeadshots = waveRef.current.waveHeadshots;
          waveRef.current.lastWaveCreditsEarned = waveRef.current.waveCreditsEarned;

          // Reset stats
          waveRef.current.waveTime = 0;
          waveRef.current.waveDamage = 0;
          waveRef.current.waveShots = 0;
          waveRef.current.waveHits = 0;
          waveRef.current.waveHeadshots = 0;
          waveRef.current.waveCreditsEarned = 0;

          // Enter 6s countdown interval
          waveRef.current.intervalTimer = 6.0;
          setWaveIntervalTime(6);

          // Spawning the Kombi (arrives on wave 3, 6, 9 completion)
          const completedWave = waveRef.current.current;
          if (completedWave === 3 || completedWave === 6 || completedWave === 9) {
            vanState = "ENTERING";
            const spawnAngle = Math.random() * Math.PI * 2;
            VAN_X = player.x + Math.cos(spawnAngle) * 1200;
            VAN_Y = player.y + Math.sin(spawnAngle) * 1200; // spawn offscreen relative to player
            vanTargetX = player.x;
            vanTargetY = player.y - 120; // park near the player
            SoundManager.setMotorVolume(0.4);
            SoundManager.playSound("horn", 0.7); // HONK!
          }
        }
      }
    };

    const mannequins: {
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      hp: number;
      maxHp: number;
      hitTime: number;
      deadTime: number;
      angle: number;
      isTargeted?: boolean;
      isHeadTargeted?: boolean;
      type: "static" | "patrol";
      moveTargetX: number;
      moveTargetY: number;
      isBoss: boolean;
      focusLerp: number;
      attackTimer?: number;
      profile?: "AGRESSIVO" | "FLANQUEADOR" | "CERCO" | "SALTADOR" | "LENTO" | "ATIRADOR" | "DASHER";
      jumpCooldown?: number;
      isJumping?: boolean;
      jumpProgress?: number;
      jumpStartX?: number;
      jumpStartY?: number;
      jumpTargetX?: number;
      jumpTargetY?: number;
      isTrainingDummy?: boolean;
    }[] = [];
    for (let i = 0; i < 100; i++) {
      const isBoss = i === 0;
      let profile: "AGRESSIVO" | "FLANQUEADOR" | "CERCO" | "SALTADOR" | "LENTO" = "AGRESSIVO";
      if (!isBoss) {
        const rand = Math.random();
        if (rand < 0.15) profile = "SALTADOR";
        else if (rand < 0.40) profile = "FLANQUEADOR";
        else if (rand < 0.65) profile = "CERCO";
        else if (rand < 0.82) profile = "LENTO";
        else profile = "AGRESSIVO";
      }

      let hp = 100;
      if (isBoss) hp = 3500;
      else if (profile === "LENTO") hp = 220; // Heavy roadblock
      else if (profile === "SALTADOR") hp = 75;  // Fast but fragile

      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist = 800 + Math.random() * 1000;
      const initialZombX = Math.cos(spawnAngle) * spawnDist;
      const initialZombY = Math.sin(spawnAngle) * spawnDist;

      mannequins.push({
        id: i,
        x: initialZombX,
        y: initialZombY,
        vx: 0,
        vy: 0,
        hp: hp,
        maxHp: hp,
        hitTime: 0,
        deadTime: 0,
        angle: Math.random() * Math.PI * 2,
        type: "patrol",
        moveTargetX: (Math.random() - 0.5) * 3000,
        moveTargetY: (Math.random() - 0.5) * 3000,
        isBoss,
        focusLerp: 0,
        attackTimer: 0,
        profile,
        jumpCooldown: Math.random() * 4,
        isJumping: false,
        jumpProgress: 0,
      });
    }

    // Spawn 4 white training mannequins spread out and a moderate distance from the plate
    const dummyPositions = [
      { x: 100, y: 150 },
      { x: 250, y: 100 },
      { x: 80, y: 300 },
      { x: 250, y: 250 },
    ];
    for (let d = 0; d < 4; d++) {
      const dummyX = dummyPositions[d].x;
      const dummyY = dummyPositions[d].y;
      mannequins.push({
        id: 2000 + d,
        x: dummyX,
        y: dummyY,
        vx: 0,
        vy: 0,
        hp: 150,
        maxHp: 150,
        hitTime: 0,
        deadTime: 0,
        angle: Math.PI / 2,
        type: "static",
        moveTargetX: dummyX,
        moveTargetY: dummyY,
        isBoss: false,
        focusLerp: 0,
        attackTimer: 0,
        profile: "AGRESSIVO",
        isTrainingDummy: true,
      });
    }

    const damageTexts: {
      x: number;
      y: number;
      value: number | string;
      life: number;
      vx: number;
      vy: number;
      type?: "damage" | "heal" | "crit" | "player_damage";
      themeColor?: string;
      isTrainingDummy?: boolean;
    }[] = [];

    let camera = { x: 0, y: 0, zoom: 1, baseZoom: 1, tilt: 0 };
    let screenShakeX = 0;
    let screenShakeY = 0;
    let screenShakeStr = 0;

    let virtualMouseX = 0;
    let virtualMouseY = 0;
    let worldMouseX = 0;
    let worldMouseY = 0;

    let muzzleFlash = 0; // Flash intensity
    let playerDamageFlash = 0;

    // ----- Resize Handling -----
    const resizeCanvas = () => {
      const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const dpr = isMobileDevice ? Math.min(1.8, window.devicePixelRatio || 1) : (window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ----- Input Handling -----
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === "e") {
        if (isShopOpenRef.current) {
          setIsShopOpen(false);
        } else if (isInventoryOpenRef.current) {
          setIsInventoryOpen(false);
        } else {
          const vanDist = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
          if (vanDist < VAN_RADIUS + 50 && (!waveRef.current.mode || vanState === "PARKED")) {
             SoundManager.playSound("horn", 0.6);
             setIsShopOpen(true);
             setIsInventoryOpen(false);
             setIsOutfitsOpen(false);
          }
        }
      }

      const mappedKey = key === " " ? "space" : key;
      if (keys.hasOwnProperty(mappedKey)) {
        keys[mappedKey as keyof typeof keys] = true;
        if (key === " ") e.preventDefault();
      }
      if (["1", "2", "3", "4", "5"].includes(key)) {
        (window as any).hotbarVisibleTimer = 4.0;
        inventoryRef.current.activeSlot = parseInt(key) - 1;
        updateInv();
      }
      if (key === "r" && !player.isReloading && !player.isDead) {
        const actSlot = inventoryRef.current.activeSlot;
        const actWep = inventoryRef.current.hotbar[actSlot];
        const stats = actWep ? WEAPONS_DETAILS[actWep] : null;
        if (stats && player.ammo < stats.ammoMax) {
          player.isReloading = true;
          player.reloadTimer = stats.reloadTime;
          player.gunSmokeTime = 1.0;
          if (actWep) SoundManager.playReload(actWep);
        }
      }
      if (key === "l" && !player.isDead) {
        player.isLaserOn = !player.isLaserOn;
        SoundManager.playLaserToggle(player.isLaserOn);
        damageTexts.push({
          x: player.x,
          y: player.y - 45,
          value: player.isLaserOn ? "LASER LIGADO" : "LASER DESLIGADO",
          vx: 0,
          vy: -60,
          life: 1.5,
          type: "player_damage",
        } as any);
      }
      if (key === "t" && !waveRef.current.mode && !player.isDead) {
        const vanDist = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
        if (vanDist < VAN_RADIUS + 50) {
          SoundManager.playSound("heart", 1.0);
          (window as any).trainingTransitionActive = true;
          (window as any).trainingTransitionAlpha = 0;
          (window as any).trainingTransitionState = "FADING_OUT";
          (window as any).trainingTransitionTimer = 0;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mappedKey = key === " " ? "space" : key;
      if (keys.hasOwnProperty(mappedKey)) keys[mappedKey as keyof typeof keys] = false;
    };
    const handleBlur = () => {
      keys.w = false;
      keys.a = false;
      keys.s = false;
      keys.d = false;
      keys.shift = false;
      keys.space = false;
      mouse.down = false;
      mouse.rightDown = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.clientX = e.clientX;
      mouse.clientY = e.clientY;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseDown = (e: MouseEvent) => {
      const targetElement = e.target as HTMLElement;
      if (
        targetElement && (
          targetElement.tagName === "BUTTON" ||
          targetElement.tagName === "INPUT" ||
          targetElement.tagName === "TEXTAREA" ||
          targetElement.tagName === "SELECT" ||
          targetElement.closest("button") ||
          targetElement.closest(".pointer-events-auto")
        )
      ) {
        return;
      }
      if (e.button === 0) mouse.down = true;
      if (e.button === 2) mouse.rightDown = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouse.down = false;
      if (e.button === 2) mouse.rightDown = false;
    };
    const handleWheel = (e: WheelEvent) => {
      camera.baseZoom -= e.deltaY * 0.001;
      if (camera.baseZoom < 0.6) camera.baseZoom = 0.6;
      if (camera.baseZoom > 2.0) camera.baseZoom = 2.0;
    };

    let initialTouchDist = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const isLeftJoystickZone = t.clientX < 280 && t.clientY > window.innerHeight - 280;
          const isRightButtonZone = t.clientX > window.innerWidth - 280 && t.clientY > window.innerHeight - 280;
          
          const dx = t.clientX - window.innerWidth / 2;
          const dy = t.clientY - window.innerHeight / 2;
          const distToPlayer = Math.hypot(dx, dy);
          const isNearPlayer = distToPlayer < 300;

          if (isLeftJoystickZone || isRightButtonZone || !isNearPlayer) {
            initialTouchDist = 0;
            return;
          }
        }
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = camera.baseZoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDist > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const isLeftJoystickZone = t.clientX < 280 && t.clientY > window.innerHeight - 280;
          const isRightButtonZone = t.clientX > window.innerWidth - 280 && t.clientY > window.innerHeight - 280;
          
          const dx = t.clientX - window.innerWidth / 2;
          const dy = t.clientY - window.innerHeight / 2;
          const distToPlayer = Math.hypot(dx, dy);
          const isNearPlayer = distToPlayer < 300;

          if (isLeftJoystickZone || isRightButtonZone || !isNearPlayer) {
            return;
          }
        }
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / initialTouchDist;
        camera.baseZoom = initialZoom * factor;
        if (camera.baseZoom < 0.6) camera.baseZoom = 0.6;
        if (camera.baseZoom > 2.0) camera.baseZoom = 2.0;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialTouchDist = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    let lastShotTime = 0;
    const FIRE_RATE = 0.12; // slightly slower for punchier feel

    let aiMode = 2; // 0: STOPPED, 2: CHASE
    const btnAi = document.getElementById("btn-toggle-ai");
    if (btnAi) {
      btnAi.innerText = "AI: ON";
      btnAi.className =
        "mt-1 px-4 py-2 border border-red-500/50 text-red-400 text-xs font-bold tracking-widest bg-red-900/20 hover:bg-red-500/20 rounded backdrop-blur-md self-start border-l-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      btnAi.onclick = () => {
        aiMode = aiMode === 0 ? 2 : 0;
        if (aiMode === 0) {
          btnAi.innerText = "AI: OFF";
          btnAi.className =
            "mt-1 px-4 py-2 border border-gray-500/50 text-gray-400 text-xs font-bold tracking-widest bg-gray-900/20 hover:bg-gray-500/20 rounded backdrop-blur-md self-start border-l-4";
        } else {
          btnAi.innerText = "AI: ON";
          btnAi.className =
            "mt-1 px-4 py-2 border border-red-500/50 text-red-400 text-xs font-bold tracking-widest bg-red-900/20 hover:bg-red-500/20 rounded backdrop-blur-md self-start border-l-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
        }
      };
    }

    // ----- Game Loop -----
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      update(dt, time);
      draw(dt, time);

      animationFrameId = requestAnimationFrame(loop);
    };

    const update = (dt: number, time: number) => {
      // --- Update Training Transition ---
      if ((window as any).trainingTransitionActive) {
        const tr = window as any;
        if (tr.trainingTransitionState === "FADING_OUT") {
          tr.trainingTransitionAlpha = Math.min(1.0, tr.trainingTransitionAlpha + dt * 1.5);
          if (tr.trainingTransitionAlpha >= 1.0) {
            // Teleport player & Setup Training Area
            tr.trainingTransitionState = "ON_HOLD";
            tr.trainingTransitionTimer = 1.6; // Hold screen for 1.6s
            tr.inTrainingMode = true;
            if (tr.setInTrainingModeReact) tr.setInTrainingModeReact(true);
            tr.freeModeSpawningEnabled = false;
            
            // Teleport Player to center of Firing Range
            player.x = -5000;
            player.y = 5000;
            player.vx = 0;
            player.vy = 0;
            
            // Snap camera instantly to avoid mannequin culling
            camera.x = -5000;
            camera.y = 5000;
            
            // Clear current map mannequins and queue 15 training mannequins to emerge across a larger area
            mannequins.length = 0;
            tr.pendingTrainingSpawns = [
              { x: -5400, y: 4600 },
              { x: -4600, y: 4600 },
              { x: -5200, y: 4800 },
              { x: -4800, y: 4800 },
              { x: -5100, y: 4900 },
              { x: -4900, y: 4900 },
              { x: -5000, y: 4700 },
              { x: -5000, y: 4800, isBig: true },
              { x: -5300, y: 5100 },
              { x: -4700, y: 5100 },
              { x: -4800, y: 5200, isBig: true },
              { x: -5200, y: 5200 },
              { x: -5000, y: 5300, isBig: true },
              { x: -5400, y: 5400 },
              { x: -4600, y: 5400 }
            ];
            tr.trainingSpawnTimer = 0.5;
            
            // Reset player vital stats
            player.hp = player.maxHp;
            player.ammo = player.maxAmmo;
          }
        } else if (tr.trainingTransitionState === "ON_HOLD") {
          tr.trainingTransitionTimer -= dt;
          if (tr.trainingTransitionTimer <= 0) {
            tr.trainingTransitionState = "FADING_IN";
          }
        } else if (tr.trainingTransitionState === "FADING_IN") {
          tr.trainingTransitionAlpha = Math.max(0, tr.trainingTransitionAlpha - dt * 1.5);
          if (tr.trainingTransitionAlpha <= 0) {
            tr.trainingTransitionActive = false;
          }
        }
      }

      // --- Spawn training dummies one-by-one inside Firing Range ---
      if ((window as any).inTrainingMode && (window as any).pendingTrainingSpawns && (window as any).pendingTrainingSpawns.length > 0) {
        const tr = window as any;
        tr.trainingSpawnTimer -= dt;
        if (tr.trainingSpawnTimer <= 0) {
          const spawn = tr.pendingTrainingSpawns.shift();
          if (spawn) {
            mannequins.push({
              id: 3000 + mannequins.length,
              x: spawn.x,
              y: spawn.y,
              vx: 0,
              vy: 0,
              hp: spawn.isBig ? 500 : 150,
              maxHp: spawn.isBig ? 500 : 150,
              hitTime: 0,
              deadTime: 0,
              angle: Math.random() * Math.PI * 2,
              type: "static",
              moveTargetX: spawn.x,
              moveTargetY: spawn.y,
              isBoss: false,
              focusLerp: 0,
              attackTimer: 0,
              profile: "AGRESSIVO",
              isTrainingDummy: true,
              isBigDummy: spawn.isBig || false,
            } as any);
            tr.trainingSpawnTimer = 0.3; // slightly faster spawning for 15 dummies
          }
        }
      }

      // --- Update Cutscene ---
      if (cutsceneRef.current.active) {
        const cs = cutsceneRef.current;
        if (cs.phase === "INTRO_FADE") {
          cs.timer -= dt;
          cs.overlayAlpha = Math.max(0, cs.timer / 1.5);
          if (cs.timer <= 0) {
            cs.phase = "KOMBI_ARRIVING";
            cs.timer = 0;
            setCutscene({ ...cs });
            if (SoundManager.menuMusic) {
              SoundManager.fadeAudioOut(SoundManager.menuMusic, 3500);
            }
          }
        } else if (cs.phase === "KOMBI_ARRIVING") {
          if (vanState === "PARKED" || Math.hypot(VAN_X - vanTargetX, VAN_Y - vanTargetY) < 10) {
            cs.phase = "PLAYER_DESCENDING";
            cs.timer = 1.5;
            cs.playerJumpProgress = 0;
            cs.hornTriggered = false;
            cs.reloadTriggered = false;
            setCutscene({ ...cs });
          }
        } else if (cs.phase === "PLAYER_DESCENDING") {
          cs.timer -= dt;
          const progress = 1.0 - Math.max(0, cs.timer / 1.5);
          cs.playerJumpProgress = progress;
          setCutscene({ ...cs });
          
          const startX = 0;
          const startY = -350;
          const endX = 60;
          const endY = -250;
          
          player.x = startX + (endX - startX) * progress;
          player.y = startY + (endY - startY) * progress; // Walking straight down, no jumping height arc!
          player.angle = Math.PI / 2;

          // Kombi honks dynamically at 30% progress
          if (progress >= 0.3 && !cs.hornTriggered) {
            cs.hornTriggered = true;
            SoundManager.playSound("horn", 0.85);
          }
          
          if (progress >= 1.0) {
            cs.phase = "PLAYER_LOADING_WEAPON";
            cs.timer = 1.8;
            setCutscene({ ...cs });
            
            player.x = 60;
            player.y = -250;
          }
        } else if (cs.phase === "PLAYER_LOADING_WEAPON") {
          cs.timer -= dt;
          setCutscene({ ...cs });
          
          player.x = 60;
          player.y = -250;
          
          if (!cs.reloadTriggered) {
            cs.reloadTriggered = true;
            SoundManager.playReloadSound();
            player.speechText = "*CLACK* PREPARAR PARA O COMBATE!";
            player.speechTimer = 1.8;
          }
          
          if (cs.timer <= 0) {
            cs.phase = "INTRO_SCREEN_FADE";
            cs.timer = 1.5;
            setCutscene({ ...cs });
          }
        } else if (cs.phase === "INTRO_SCREEN_FADE") {
          cs.timer -= dt;
          cs.overlayAlpha = 1.0 - Math.max(0, cs.timer / 1.5); // Fades screen smoothly to absolute black
          setCutscene({ ...cs });
          
          player.x = 60;
          player.y = -250;
          
          if (cs.timer <= 0) {
            // Screen is solid black. Start departures and gameplay in background
            vanState = "LEAVING";
            vanTargetX = 1500;
            vanTargetY = -350;
            SoundManager.playSound("horn", 0.4);
            
            waveRef.current.introTimer = 3.0;
            waveRef.current.introText = "PRIMEIRA ONDA";
            setWaveIntroText("PRIMEIRA ONDA");
            setWaveActive(false);
            setWaveRemainingZombies(15);
            
            cs.phase = "FADING_GAME_IN";
            cs.timer = 1.5;
            cs.overlayAlpha = 1.0;
            setCutscene({ ...cs });
          }
        } else if (cs.phase === "FADING_GAME_IN") {
          cs.timer -= dt;
          cs.overlayAlpha = Math.max(0, cs.timer / 1.5); // Fade black overlay out to reveal playing field
          setCutscene({ ...cs });
          
          if (cs.timer <= 0) {
            cs.active = false;
            cs.phase = "NONE";
            cs.overlayAlpha = 0;
            setCutscene({ ...cs });
          }
        }
      }

      // Synchronize player upgrades dynamically in real-time
      const targetMaxHp = 50 + (charUpgradesRef.current?.maxHp || 0) * 90;
      if (player.maxHp !== targetMaxHp) {
        const diff = targetMaxHp - player.maxHp;
        player.maxHp = targetMaxHp;
        player.hp = Math.max(0, player.hp + diff);
      }
      const targetStaminaMax = 100 + (charUpgradesRef.current?.staminaMax || 0) * 20;
      if (player.staminaMax !== targetStaminaMax) {
        const diff = targetStaminaMax - player.staminaMax;
        player.staminaMax = targetStaminaMax;
        player.stamina = Math.max(0, player.stamina + diff);
      }

      const dpr = canvas.width / window.innerWidth;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      if ((window as any).clearZombiesOnStart) {
        (window as any).clearZombiesOnStart = false;
        for (const m of mannequins) {
          m.hp = 0;
          m.deadTime = 0;
        }
      }

      if (waveRef.current.mode) {
        if (waveRef.current.active) {
          waveRef.current.waveTime += dt;

          // Wave completion fail-safe: if all zombies are spawned and active zombies on screen is 0
          const activeZombiesCount = mannequins.filter(m => m.hp > 0).length;
          const allZombiesSpawned = waveRef.current.zombiesSpawned >= waveRef.current.zombiesTotal;
          if (allZombiesSpawned && activeZombiesCount === 0) {
            // Force wave completion
            waveRef.current.zombiesKilled = waveRef.current.zombiesTotal;
            setWaveRemainingZombies(0);
            
            waveRef.current.active = false;
            setWaveActive(false);

            // Save wave stats
            waveRef.current.lastWaveTime = waveRef.current.waveTime;
            waveRef.current.lastWaveDamage = waveRef.current.waveDamage;
            waveRef.current.lastWaveShots = waveRef.current.waveShots;
            waveRef.current.lastWaveHits = waveRef.current.waveHits;
            waveRef.current.lastWaveHeadshots = waveRef.current.waveHeadshots;
            waveRef.current.lastWaveCreditsEarned = waveRef.current.waveCreditsEarned;

            // Reset stats
            waveRef.current.waveTime = 0;
            waveRef.current.waveDamage = 0;
            waveRef.current.waveShots = 0;
            waveRef.current.waveHits = 0;
            waveRef.current.waveHeadshots = 0;
            waveRef.current.waveCreditsEarned = 0;

            // Enter 6s countdown interval (fast automatic close)
            waveRef.current.intervalTimer = 6.0;
            setWaveIntervalTime(6);

            // Spawning the Kombi (arrives on wave 3, 6, 9 completion)
            const completedWave = waveRef.current.current;
            if (completedWave === 3 || completedWave === 6 || completedWave === 9) {
              vanState = "ENTERING";
              VAN_X = -1500;
              VAN_Y = -350;
              vanTargetX = 0;
              vanTargetY = -350;
              vanAngle = 0;
            }
          }
        }
        // Handle Kombi movement
        if (vanState === "ENTERING") {
          const targetX = vanTargetX;
          const targetY = vanTargetY;
          const dx = targetX - VAN_X;
          const dy = targetY - VAN_Y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            vanAngle = Math.atan2(dy, dx);
            const speed = 400 * dt; // 400px/s driving speed
            if (speed >= dist) {
              VAN_X = targetX;
              VAN_Y = targetY;
              vanState = "PARKED";
            } else {
              VAN_X += (dx / dist) * speed;
              VAN_Y += (dy / dist) * speed;
            }
            
            // Dynamic smoke particles
            const backOffsetDist = -110;
            const sideOffsetDist = 35;
            const rotAngle = vanAngle;
            const exhaustX = VAN_X + Math.cos(rotAngle) * backOffsetDist - Math.sin(rotAngle) * sideOffsetDist;
            const exhaustY = VAN_Y + Math.sin(rotAngle) * backOffsetDist + Math.cos(rotAngle) * sideOffsetDist;
            if (Math.random() < 0.65) {
              particles.push({
                x: exhaustX + (Math.random() - 0.5) * 8,
                y: exhaustY + (Math.random() - 0.5) * 8,
                vx: -Math.cos(vanAngle) * (140 + Math.random() * 100) + (Math.random() - 0.5) * 50,
                vy: -Math.sin(vanAngle) * (140 + Math.random() * 100) + (Math.random() - 0.5) * 50,
                life: 0.8 + Math.random() * 1.2,
                color: `rgba(95, 95, 95, ${0.12 + Math.random() * 0.12})`,
                size: 7 + Math.random() * 10,
                isSmoke: true,
              });
            }
          } else {
            VAN_X = targetX;
            VAN_Y = targetY;
            vanState = "PARKED";
          }
        } else if (vanState === "LEAVING") {
          const targetX = 0;
          const targetY = -2500;
          const dx = targetX - VAN_X;
          const dy = targetY - VAN_Y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            vanAngle = Math.atan2(dy, dx);
            const speed = 500 * dt;
            if (speed >= dist) {
              VAN_X = targetX;
              VAN_Y = targetY;
              vanState = "OUT";
            } else {
              VAN_X += (dx / dist) * speed;
              VAN_Y += (dy / dist) * speed;
            }
            
            // Dynamic smoke particles
            const backOffsetDist = -110;
            const sideOffsetDist = 35;
            const rotAngle = vanAngle;
            const exhaustX = VAN_X + Math.cos(rotAngle) * backOffsetDist - Math.sin(rotAngle) * sideOffsetDist;
            const exhaustY = VAN_Y + Math.sin(rotAngle) * backOffsetDist + Math.cos(rotAngle) * sideOffsetDist;
            if (Math.random() < 0.65) {
              particles.push({
                x: exhaustX + (Math.random() - 0.5) * 8,
                y: exhaustY + (Math.random() - 0.5) * 8,
                vx: -Math.cos(vanAngle) * (200 + Math.random() * 150) + (Math.random() - 0.5) * 60,
                vy: -Math.sin(vanAngle) * (200 + Math.random() * 150) + (Math.random() - 0.5) * 60,
                life: 0.8 + Math.random() * 1.2,
                color: `rgba(95, 95, 95, ${0.12 + Math.random() * 0.12})`,
                size: 7 + Math.random() * 10,
                isSmoke: true,
              });
            }
          } else {
            VAN_X = targetX;
            VAN_Y = targetY;
            vanState = "OUT";
          }
        }

        // 1. Handle wave intro timer
        if (waveRef.current.introTimer > 0) {
          waveRef.current.introTimer -= dt;
          if (waveRef.current.introTimer <= 0) {
            waveRef.current.introTimer = 0;
            waveRef.current.active = true;
            setWaveActive(true);
            setWaveIntroText(null);
            SoundManager.playGameplayMusic();
            
            // Auto-clear blood decals and shell casings for a fresh wave start
            if ((window as any).clearDecalsAndShells) {
              (window as any).clearDecalsAndShells();
            }
            
            // Reset all existing mannequins to 0 HP so they can be recycled in the spawner
            for (const m of mannequins) {
              m.hp = 0;
              m.deadTime = 0;
            }
          }
        }

        // 2. Handle spawner
        if (waveRef.current.active && waveRef.current.zombiesSpawned < waveRef.current.zombiesTotal) {
          const wNum = waveRef.current.current;
          const spawnInterval = Math.max(0.5, 2.0 - wNum * 0.15);

          waveRef.current.spawnTimer += dt;
          if (waveRef.current.spawnTimer >= spawnInterval) {
            waveRef.current.spawnTimer = 0;

            const deadZombie = mannequins.find(m => m.hp <= 0);
            if (deadZombie) {
              const spawnAngle = Math.random() * Math.PI * 2;
              const spawnDist = 800 + Math.random() * 400;
              deadZombie.x = player.x + Math.cos(spawnAngle) * spawnDist;
              deadZombie.y = player.y + Math.sin(spawnAngle) * spawnDist;
              
              let hpMult = 1.0;
              let speedMult = 1.0;
              
              let profile: "AGRESSIVO" | "FLANQUEADOR" | "CERCO" | "SALTADOR" | "LENTO" | "ATIRADOR" | "DASHER" = "AGRESSIVO";
              const r = Math.random();
              
              if (wNum <= 3) {
                // Occasional ATIRADOR in early waves (Wave 2, 3) to train the player
                if (wNum >= 2 && r < 0.15) {
                  profile = "ATIRADOR";
                } else {
                  profile = r < 0.8 ? "AGRESSIVO" : "LENTO";
                }
                hpMult = 0.6 + wNum * 0.15;
                speedMult = 1.45 + wNum * 0.06; // Faster base speeds for early waves!
              } else if (wNum <= 7) {
                // Wave 4 to 7: Integrate SALTADOR (jumping zombie)
                if (r < 0.25) profile = "AGRESSIVO";
                else if (r < 0.42) profile = "FLANQUEADOR";
                else if (r < 0.55) profile = "CERCO";
                else if (r < 0.68) profile = "ATIRADOR";
                else if (r < 0.78) profile = "DASHER";
                else if (r < 0.90) profile = "SALTADOR";
                else profile = "LENTO";
                hpMult = 1.0 + wNum * 0.12;
                speedMult = 1.30 + wNum * 0.04;
              } else {
                if (r < 0.20) profile = "AGRESSIVO";
                else if (r < 0.38) profile = "FLANQUEADOR";
                else if (r < 0.53) profile = "CERCO";
                else if (r < 0.65) profile = "ATIRADOR";
                else if (r < 0.76) profile = "DASHER";
                else if (r < 0.90) profile = "SALTADOR";
                else profile = "LENTO";
                hpMult = 1.2 + wNum * 0.15;
                speedMult = 1.25 + wNum * 0.04;
              }

              // Extra speed boost from wave 5+
              if (wNum >= 5) {
                speedMult *= 1.20; // 20% faster from wave 5 onwards
              }

              let baseHp = 100;
              if (profile === "LENTO") baseHp = 220;
              else if (profile === "SALTADOR") baseHp = 75;
              else if (profile === "ATIRADOR") baseHp = 80;
              else if (profile === "DASHER") baseHp = 90;

              deadZombie.maxHp = Math.floor(baseHp * hpMult);
              deadZombie.hp = deadZombie.maxHp;
              (deadZombie as any).emergeTimer = 1.8;
              (deadZombie as any).emergeDuration = 1.8;
              deadZombie.profile = profile;
              deadZombie.isBoss = false;
              deadZombie.deadTime = 0;
              deadZombie.isJumping = false;
              deadZombie.jumpProgress = 0;
              deadZombie.jumpCooldown = 2 + Math.random() * 3;
              (deadZombie as any).baseSpeedMult = speedMult;

              waveRef.current.zombiesSpawned++;
            }
          }
        }

        // 3. Handle interval timer
        if (waveRef.current.intervalTimer > 0) {
          waveRef.current.intervalTimer -= dt;
          setWaveIntervalTime(Math.ceil(waveRef.current.intervalTimer));
          
          if (waveRef.current.intervalTimer <= 0) {
            waveRef.current.intervalTimer = 0;
            
            if (waveRef.current.current >= 10) {
              setCredits(globalCredits);
              setGameState("MENU");
              waveRef.current.mode = false;
              setIsWaveMode(false);
              alert("PARABÉNS! VOCÊ SOBREVIVEU ÀS 10 ONDAS!");
            } else {
              waveRef.current.current++;
              setWave(waveRef.current.current);
              
              const totalZombiesMap = [15, 20, 25, 30, 40, 50, 60, 75, 90, 110];
              const total = totalZombiesMap[waveRef.current.current - 1] || 30;
              
              waveRef.current.zombiesTotal = total;
              waveRef.current.zombiesKilled = 0;
              waveRef.current.zombiesSpawned = 0;
              setWaveRemainingZombies(total);
              
              waveRef.current.introTimer = 3.0;
              const textMap = [
                "PRIMEIRA ONDA", "SEGUNDA ONDA", "TERCEIRA ONDA",
                "QUARTA ONDA", "QUINTA ONDA", "SEXTA ONDA",
                "SÉTIMA ONDA", "OITAVA ONDA", "NONA ONDA", "DÉCIMA ONDA"
              ];
              const introTxt = textMap[waveRef.current.current - 1] || `ONDA ${waveRef.current.current}`;
              waveRef.current.introText = introTxt;
              setWaveIntroText(introTxt);
              
              if (vanState === "PARKED" || vanState === "ENTERING") {
                vanState = "LEAVING";
                SoundManager.playSound("horn", 0.7);
              }
            }
          }
        }
      }

      // Update Kombi and Zombie ambient sound volumes
      const vanDist = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
      const vanVolume = Math.max(0, 1 - vanDist / 850) * 1.35; // Boosted motor sound volume and audibility range
      SoundManager.setMotorVolume(vanVolume);

      // Trigger horn when player gets close to the van (disabled per user request to avoid annoying repetition)
      const isNearVan = vanDist < VAN_RADIUS + 80;
      if (isNearVan && !(player as any).wasNearVan && !player.isDead) {
        // SoundManager.playSound("horn", 0.7); // Disabled proximity honking
      }
      (player as any).wasNearVan = isNearVan;

      let zombieSum = 0;
      mannequins.forEach((m: any) => {
        if (m.hp > 0) {
          const dist = Math.hypot(player.x - m.x, player.y - m.y);
          zombieSum += 1 / (dist + 50);
        }
      });
      const zombieVolume = Math.min(0.7, zombieSum * 12);
      SoundManager.setZombieVolume(zombieVolume);

      // Sync mobile input overrides
      const mobShoot = (window as any).mobileShootActive;
      const mobAim = (window as any).mobileAimActive;
      if (mobShoot !== undefined) {
        mouse.down = mobShoot;
      }
      if (mobAim !== undefined) {
        mouse.rightDown = mobAim;
      }

      // 0. Smoothly interpolate virtualMouse towards the true mouse based on sensitivity
      if (virtualMouseX === 0 && virtualMouseY === 0) {
        virtualMouseX = mouse.x;
        virtualMouseY = mouse.y;
      }
      const safeDt = Math.min(0.1, dt);
      const lerpFactor = Math.min(1.0, aimSensitivityRef.current * 18 * safeDt);
      virtualMouseX += (mouse.x - virtualMouseX) * lerpFactor;
      virtualMouseY += (mouse.y - virtualMouseY) * lerpFactor;

      worldMouseX = camera.x - logicalWidth / 2 + virtualMouseX + screenShakeX;
      worldMouseY = camera.y - logicalHeight / 2 + virtualMouseY + screenShakeY;

      // 1. Move Player
      if (player.rollCooldown > 0) player.rollCooldown -= dt;

      // Stamina Regeneration
      if (!player.isRunning && !player.isRolling) {
        player.stamina = Math.min(player.staminaMax, player.stamina + dt * 15);
        if (player.stamina > 20) player.staminaExhausted = false;
      }

      // Read mobile roll trigger
      if ((window as any).mobileRollTrigger) {
        keys.space = true;
        (window as any).mobileRollTrigger = false;
      } else {
        const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isMobileDevice) {
          keys.space = false;
        }
      }

      let dx = 0;
      let dy = 0;
      if (!player.isDead && !player.isRolling && !cutsceneRef.current.active) {
        if (keys.w) dy -= 1;
        if (keys.s) dy += 1;
        if (keys.a) dx -= 1;
        if (keys.d) dx += 1;

        // Mobile joystick integration
        const mobJoy = (window as any).mobileJoystick;
        if (mobJoy && (mobJoy.dx !== 0 || mobJoy.dy !== 0)) {
          dx = mobJoy.dx;
          dy = mobJoy.dy;
        }
      }

      if (!player.isDead && !player.isRolling && keys.space && !cutsceneRef.current.active && player.rollCooldown <= 0 && player.stamina > 20 && !player.staminaExhausted) {
        player.isRolling = true;
        player.stamina -= 25;
        if (player.stamina <= 0) {
           player.stamina = 0;
           player.staminaExhausted = true;
        }
        (player as any).dashGhostTimer = 0; // reset ghost timer on dash start
        player.rollWasRunning = player.isRunning;
        player.rollDuration = player.isRunning ? 0.52 : 0.65;
        player.rollTimer = player.rollDuration;
        player.rollCooldown = 2.0; 
        
        let rdx = dx;
        let rdy = dy;
        if (rdx === 0 && rdy === 0) {
          rdx = Math.cos(player.angle);
          rdy = Math.sin(player.angle);
        }
        const len = Math.hypot(rdx, rdy);
        player.rollDirectionX = rdx / len;
        player.rollDirectionY = rdy / len;
        
        player.rollSpeed = player.isRunning ? PLAYER_SPEED * 3.7 : PLAYER_SPEED * 2.6;
        
        // Satisfying dark dust burst on launch
        const launchCount = 12;
        for (let i = 0; i < launchCount; i++) {
          const angle = (i / launchCount) * Math.PI * 2 + Math.random() * 0.5;
          const isRock = Math.random() > 0.5;
          dustParticles.push({
            x: player.x,
            y: player.y + 10,
            vx: Math.cos(angle) * (100 + Math.random() * 80),
            vy: Math.sin(angle) * (100 + Math.random() * 80),
            life: isRock ? 0.6 : 0.4,
            maxLife: isRock ? 0.6 : 0.4,
            size: isRock ? (2 + Math.random() * 2) : (6 + Math.random() * 5),
          });
        }
        
        // Burst of blue neon particles for the dash
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * (150 + Math.random() * 200),
            vy: Math.sin(angle) * (150 + Math.random() * 200),
            life: 0.3 + Math.random() * 0.4,
            color: Math.random() > 0.5 ? "#3b82f6" : "#60a5fa",
            size: 2 + Math.random() * 4,
          });
        }
      }

      // Update dust particles
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const p = dustParticles[i];
        p.life -= dt;
        if (p.life <= 0) { dustParticles.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.93;
        p.vy *= 0.93;
      }
      if (dustParticles.length > 80) dustParticles.splice(0, dustParticles.length - 80);

      if (player.isRolling) {
        player.rollTimer -= dt;
        if (player.rollTimer <= 0) {
          player.isRolling = false;
          // Tactical landing (screen shake if was running)
          if (player.rollWasRunning) {
            screenShakeStr = Math.max(screenShakeStr, 15);
          }
          // Landing dust/smoke burst (Aro de fumaca)
          const landCount = 15;
          for (let i = 0; i < landCount; i++) {
            const angle = (i / landCount) * Math.PI * 2;
            dustParticles.push({
              x: player.x + Math.cos(angle) * 15,
              y: player.y + Math.sin(angle) * 15,
              vx: Math.cos(angle) * (150 + Math.random() * 50),
              vy: Math.sin(angle) * (150 + Math.random() * 50),
              life: 0.5 + Math.random() * 0.2,
              maxLife: 0.5 + Math.random() * 0.2,
              size: 8 + Math.random() * 6,
            });
          }
        } else {
          const progress = 1 - (player.rollTimer / player.rollDuration);
          const currentSpeed = player.rollSpeed * (1 - Math.pow(progress, 1.8));
          player.vx = player.rollDirectionX * currentSpeed;
          player.vy = player.rollDirectionY * currentSpeed;
          player.x += player.vx * dt;
          player.y += player.vy * dt;
          player.isMoving = true;
          player.stepDist += Math.hypot(player.vx * dt, player.vy * dt);

          // Spawn blue afterimage every 55ms during dash
          if (!(player as any).dashGhostTimer) (player as any).dashGhostTimer = 0;
          (player as any).dashGhostTimer += dt;
          if ((player as any).dashGhostTimer >= 0.055) {
            (player as any).dashGhostTimer = 0;
            rollGhosts.push({
              x: player.x,
              y: player.y,
              angle: player.angle,
              alpha: 0.75,
              scale: 1.0,
              isBlue: true,
              jumpHeight: 0,
              rollAngle: 0,
            });
          }
        }
      } else if (dx !== 0 || dy !== 0) {
        player.isMoving = true;
        player.isRunning = player.isMoving && keys.shift && !player.staminaExhausted && player.stamina > 0;
        
        if (player.isRunning) {
          player.stamina -= dt * 25; // Consume stamina while running
          if (player.stamina <= 0) {
            player.stamina = 0;
            player.staminaExhausted = true;
            player.isRunning = false;
          }
        }

        // Spawn blue dash trails when running
        if (player.isRunning && !player.isRolling && !player.isDead) {
          if (!(player as any).runGhostTimer) (player as any).runGhostTimer = 0;
          (player as any).runGhostTimer += dt;
          if ((player as any).runGhostTimer > 0.06) {
            (player as any).runGhostTimer = 0;
            rollGhosts.push({
              x: player.x,
              y: player.y,
              angle: player.angle,
              alpha: 0.45,
              scale: 1.0,
              isBlue: true,
            });
          }
        }

        // Spawn extra smooth motion blur ghosts when cinematic mode is active and player is running
        if (cinematicModeRef.current && player.isRunning && !player.isDead) {
          if (!(player as any).cinematicGhostTimer) (player as any).cinematicGhostTimer = 0;
          (player as any).cinematicGhostTimer += dt;
          if ((player as any).cinematicGhostTimer > 0.045) {
            (player as any).cinematicGhostTimer = 0;
            const speed = Math.hypot(player.vx, player.vy);
            if (speed > 50) {
              rollGhosts.push({
                x: player.x,
                y: player.y,
                angle: player.angle,
                alpha: 0.28 * (speed / 300), // opacity scales slightly with speed for smoothness
                scale: 0.98,
                isBlue: true, // will draw a soft neon trace behind
              });
            }
          }
        }
        
        player.moveTimer += dt * (player.isRunning ? 1.5 : 1);
        player.idleTimer = 0;
        player.gunDropLerp = Math.max(0, player.gunDropLerp - dt * 10);

        let speedMult = 1.0;
        if (player.isRunning) {
          if (mouse.down)
            speedMult = 0.8; // Move slower when shooting and running
          else speedMult = 1.35; // Move faster when just running
        }

        const len = Math.hypot(dx, dy);
        const upgradeSpeedMult = 1.0 + (charUpgradesRef.current?.speed || 0) * 0.08;
        const charSpeedMult = skinRef.current?.stats?.speed || 1.0;
        const targetVx = (dx / len) * PLAYER_SPEED * speedMult * upgradeSpeedMult * charSpeedMult;
        const targetVy = (dy / len) * PLAYER_SPEED * speedMult * upgradeSpeedMult * charSpeedMult;

        player.vx += (targetVx - player.vx) * 15 * dt;
        player.vy += (targetVy - player.vy) * 15 * dt;

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        player.stepDist += Math.hypot(player.vx * dt, player.vy * dt);

        const px = player.x;
        const py = player.y;
        for (const decal of bloodDecals) {
          if (decal.type !== "footprint" && decal.type !== "meat") {
            const dx = px - decal.x;
            const dy = py - decal.y;
            const distSq = dx * dx + dy * dy;
            const size = decal.size;
            if (distSq < size * size) {
              player.bloodiness = Math.min(1.0, player.bloodiness + 0.05);
            }
          }
        }

        if (player.stepDist > 30) {
          player.stepDist = 0;
          player.leftFoot = !player.leftFoot;
          
          // Spawn sand footstep dust particles (pegadas de poeira)
          const moveAngle = Math.atan2(player.vy, player.vx);
          const footOffsetX = player.leftFoot ? -8 : 8;
          const fx = player.x + Math.cos(moveAngle + Math.PI / 2) * footOffsetX;
          const fy = player.y + Math.sin(moveAngle + Math.PI / 2) * footOffsetX;
          
          dustParticles.push({
            x: fx,
            y: fy + 8,
            vx: (Math.random() - 0.5) * 15 - player.vx * 0.12,
            vy: (Math.random() - 0.5) * 15 - player.vy * 0.12,
            life: 0.4 + Math.random() * 0.2,
            maxLife: 0.4 + Math.random() * 0.2,
            size: 4 + Math.random() * 4,
          });

          SoundManager.playFootstepSound(player.isRunning ? 0.11 : 0.07);

          if (player.bloodiness > 0) {
            const footOffsetX = player.leftFoot ? -8 : 8;
            const moveAngle = Math.atan2(player.vy, player.vx);
            const activeColor = skinRef.current ? skinRef.current.colorMain : "#2d4c22";
            pushBloodDecal({
              x: player.x + Math.cos(moveAngle + Math.PI / 2) * footOffsetX,
              y: player.y + Math.sin(moveAngle + Math.PI / 2) * footOffsetX,
              size: 7,
              alpha: player.bloodiness * 0.6,
              angle: moveAngle,
              stretch: 1.5,
              type: "footprint",
              timer: 0,
              color: activeColor,
            });
            player.bloodiness -= 0.04;
            if (player.bloodiness < 0) player.bloodiness = 0;
            if (bloodDecals.length > 2000) bloodDecals.shift();
          }
        }
      } else {
        player.vx *= Math.max(0, 1 - 10 * dt);
        player.vy *= Math.max(0, 1 - 10 * dt);

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        player.isMoving = false;
        player.isRunning = false;
        player.idleTimer += dt;
        player.gunDropLerp = Math.max(0, player.gunDropLerp - dt * 10);
        if (mouse.down || mouse.rightDown || muzzleFlash > 0) {
          player.idleTimer = 0;
        }
      }

      // Map Boundary Constraint for Player
      if ((window as any).inTrainingMode) {
        if (player.x < -5800) player.x = -5800;
        if (player.x > -4200) player.x = -4200;
        if (player.y < 4200) player.y = 4200;
        if (player.y > 5800) player.y = 5800;
      } else {
        const currentMapSize = getMapSize();
        if (player.x < -currentMapSize) player.x = -currentMapSize;
        if (player.x > currentMapSize) player.x = currentMapSize;
        if (player.y < -currentMapSize) player.y = -currentMapSize;
        if (player.y > currentMapSize) player.y = currentMapSize;
      }

      // Free Mode Activation Plate Detection
      if (!waveRef.current.mode) {
        const distToPlate = Math.hypot(player.x - 400, player.y - 400);
        if (distToPlate < 55) {
          if (!(player as any).onPlate) {
            (player as any).onPlate = true;
            SoundManager.playSound("horn", 0.7); // Alert sound
            
            // Spawn 2 zombies around the plate
            let spawned = 0;
            for (const m of mannequins) {
              if (m.hp <= 0 && spawned < 2 && !m.isTrainingDummy) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 600 + Math.random() * 300;
                m.x = 400 + Math.cos(angle) * dist;
                m.y = 400 + Math.sin(angle) * dist;
                m.hp = m.maxHp;
                m.deadTime = 0;
                (m as any).emergeTimer = 1.8;
                (m as any).emergeDuration = 1.8;
                spawned++;
              }
            }
            (window as any).freeModeSpawningEnabled = true;
            
            damageTexts.push({
              x: player.x,
              y: player.y - 40,
              value: "HORDA ATIVADA!",
              vx: 0,
              vy: -50,
              life: 2.0,
              type: "player_damage",
            } as any);
          }
        } else {
          (player as any).onPlate = false;
        }
      }
      if (!(window as any).inTrainingMode) {
        const pDistVan = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
        if (pDistVan < VAN_RADIUS) {
            const angle = Math.atan2(player.y - VAN_Y, player.x - VAN_X);
            player.x = VAN_X + Math.cos(angle) * VAN_RADIUS;
            player.y = VAN_Y + Math.sin(angle) * VAN_RADIUS;
        }
      }

      // Circular Physics Collisions
      for (let i = 0; i < mannequins.length; i++) {
        const m1 = mannequins[i];
        if (m1.hp <= 0) continue;

        // Player - Mannequin
        if (!player.isDead) {
          const pDist = Math.hypot(m1.x - player.x, m1.y - player.y);
          const minPDist = m1.isBoss ? 45 : 30;
          if (pDist < minPDist && pDist > 0.01) {
            const overlap = minPDist - pDist;
            const nx = (player.x - m1.x) / pDist;
            const ny = (player.y - m1.y) / pDist;

            // Push both apart (player has more mass)
            player.x += nx * overlap * 0.2;
            player.y += ny * overlap * 0.2;
            m1.x -= nx * overlap * 0.8;
            m1.y -= ny * overlap * 0.8;
          }
        }

        // Mannequin - Mannequin
        for (let j = i + 1; j < mannequins.length; j++) {
          const m2 = mannequins[j];
          if (m2.hp <= 0) continue;
          const minMDist = (m1.isBoss ? 35 : 20) + (m2.isBoss ? 35 : 20);
          const mDist = Math.hypot(m2.x - m1.x, m2.y - m1.y);
          if (mDist < minMDist && mDist > 0.01) {
            const overlap = minMDist - mDist;
            const nx = (m2.x - m1.x) / mDist;
            const ny = (m2.y - m1.y) / mDist;

            const mass1 = m1.isBoss ? 10 : 1;
            const mass2 = m2.isBoss ? 10 : 1;
            const totalMass = mass1 + mass2;

            m1.x -= nx * overlap * (mass2 / totalMass);
            m1.y -= ny * overlap * (mass2 / totalMass);
            m2.x += nx * overlap * (mass1 / totalMass);
            m2.y += ny * overlap * (mass1 / totalMass);
          }
        }
      }

      // Sync active weapon ammo state
      const activeSlot = inventoryRef.current.activeSlot;
      const activeWeapon = inventoryRef.current.hotbar[activeSlot];
      const activeStats = activeWeapon ? WEAPONS_DETAILS[activeWeapon] : null;
      const wUpgrades = activeWeapon && upgradesRef.current[activeWeapon]
        ? upgradesRef.current[activeWeapon]
        : { damage: 0, fireRate: 0, stability: 0, accuracy: 0, capacity: 0, reloadSpeed: 0, range: 0 };

      if (activeStats) {
        const currentAmmoMax = Math.ceil(activeStats.ammoMax * (1.0 + wUpgrades.capacity * 0.15));
        player.maxAmmo = currentAmmoMax;
        if (inventoryRef.current.hotbarAmmo[activeSlot] === undefined) {
          inventoryRef.current.hotbarAmmo[activeSlot] = currentAmmoMax;
        }
        player.ammo = Math.max(0, inventoryRef.current.hotbarAmmo[activeSlot]);
      } else {
        player.maxAmmo = 0;
        player.ammo = 0;
      }

      // Camera Follow (Smooth & ADS)
      let targetCamX = player.x;
      let targetCamY = player.y;
      let targetZoom = camera.baseZoom;

      // Recoil recovery
      let recoilRecoveryAmount = 0.5 * dt;

      if (cutsceneRef.current.active) {
        targetCamX = VAN_X;
        targetCamY = VAN_Y;
        if (cutsceneRef.current.phase === "PLAYER_DESCENDING") {
          targetZoom = 1.4;
          targetCamX = VAN_X + (60 - VAN_X) * cutsceneRef.current.playerJumpProgress;
          targetCamY = VAN_Y + (-250 - VAN_Y) * cutsceneRef.current.playerJumpProgress;
        } else if (cutsceneRef.current.phase === "PLAYER_LOADING_WEAPON") {
          targetCamX = 60;
          targetCamY = -250;
          targetZoom = 1.95; // Close cinematic zoom on player racking weapon!
        } else if (cutsceneRef.current.phase === "INTRO_SCREEN_FADE" || cutsceneRef.current.phase === "FADING_GAME_IN") {
          targetCamX = 60;
          targetCamY = -250;
          targetZoom = 1.25;
        } else if (cutsceneRef.current.phase === "KOMBI_LEAVING") {
          targetCamX = 60;
          targetCamY = -250;
          targetZoom = 1.25;
        } else {
          targetZoom = 1.15;
        }
      } else if (isShopOpenRef.current) {
        targetCamX = VAN_X;
        targetCamY = VAN_Y;
        targetZoom = 1.6;
      } else if (mouse.rightDown && isAimEnabledRef.current) {
        // Displace camera towards the world mouse position but with a professional distance clamp
        const dx = worldMouseX - player.x;
        const dy = worldMouseY - player.y;
        const dist = Math.hypot(dx, dy);
        
        // Scope vision upgrade gives 15% bonus per level
        const scopeBonus = 1.0 + ((wUpgrades as any).scopeVision || 0) * 0.15;
        const weight = cinematicModeRef.current ? 0.25 : (activeWeapon === "rifle" ? 0.70 : 0.50); // Much closer in cinematic mode
        const maxDist = (cinematicModeRef.current ? 75 : (activeWeapon === "rifle" ? 350 : 180)) * scopeBonus; // Closer displacement clamp
        const targetOffset = Math.min(dist * weight, maxDist);
        
        const angle = Math.atan2(dy, dx);
        targetCamX = player.x + Math.cos(angle) * targetOffset;
        targetCamY = player.y + Math.sin(angle) * targetOffset;
        
        // Reduce zoom (zoom out) based on scopeVision upgrade level to widen FOV when aiming
        const zoomOutAmount = ((wUpgrades as any).scopeVision || 0) * 0.08;
        if (cinematicModeRef.current) {
          // Do not zoom out much in cinematic mode, keep close focus
          targetZoom = Math.max(0.85, camera.baseZoom - 0.05 - zoomOutAmount);
        } else {
          targetZoom =
            activeWeapon === "rifle"
              ? Math.max(0.60, camera.baseZoom - 0.2 - zoomOutAmount)
              : Math.max(0.60, Math.min(2.5, camera.baseZoom + 0.4) - zoomOutAmount);
        }
        
        recoilRecoveryAmount = 2.0 * dt; // recovers faster
        player.recoil = Math.min(player.recoil, 0.1); // cap recoil while aiming
      } else if (player.isRolling) {
        targetZoom = camera.baseZoom - 0.15; // Tactical zoom out during roll
      } else {
        if (player.isRunning && !player.isDead) {
          targetZoom = Math.max(0.65, camera.baseZoom - 0.22); // Zoom out when running
          targetCamY = player.y - 45; // Offset camera upward
        }

        // Cinematic Van Area Focus
        const distToVan = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
        let cinematicBlur = 0;
        if (distToVan < 500) {
          cinematicBlur = 1.0 - (distToVan / 500); // 0 at 500, 1 at 0
          if (!player.isRunning) {
            targetZoom = Math.min(2.0, targetZoom + cinematicBlur * 0.7);
          }
        }

        const cinematicOverlay = document.getElementById("cinematic-van-overlay");
        if (cinematicOverlay) {
           cinematicOverlay.style.opacity = cinematicBlur.toString();
        }
      }

      player.recoil = Math.max(0, player.recoil - recoilRecoveryAmount);

      // Smooth dynamic offset leaning towards the player's aiming/facing angle
      if (!player.isDead && !isShopOpenRef.current) {
        let leanOffset = activeWeapon === "rifle" ? 100 : 50;
        if (cinematicModeRef.current) {
          // In cinematic camera mode, drift further in aim direction (leads the player)
          leanOffset = activeWeapon === "rifle" ? 240 : 150;
          // Add subtle camera drift breathing motion (Lissajous curves for realistic float)
          const driftX = Math.sin(Date.now() * 0.0008) * 18;
          const driftY = Math.cos(Date.now() * 0.0006) * 12;
          targetCamX += driftX;
          targetCamY += driftY;
          
          // Camera recoil push back
          if (player.recoil > 0) {
            targetCamX -= Math.cos(player.angle) * (player.recoil * 160);
            targetCamY -= Math.sin(player.angle) * (player.recoil * 160);
          }

          // Dynamic zoom depending on player movement speed and state in cinematic mode
          if (!mouse.rightDown && !player.isRolling) {
            if (player.isRunning) {
              targetZoom = Math.max(0.60, camera.baseZoom - 0.28);
            } else {
              const speed = Math.hypot(player.vx || 0, player.vy || 0);
              if (speed < 0.5) {
                // Focus close-up when standing still, with breathing zoom
                targetZoom = camera.baseZoom + 0.24 + Math.sin(Date.now() * 0.0005) * 0.03;
              } else {
                // Mid-zoom while moving
                targetZoom = camera.baseZoom - 0.04 + Math.sin(Date.now() * 0.001) * 0.015;
              }
            }
          }
        }
        targetCamX += Math.cos(player.angle) * leanOffset;
        targetCamY += Math.sin(player.angle) * leanOffset;
      }

      // Smooth camera tilt (roll) calculation
      let targetTilt = 0;
      if (cinematicModeRef.current && !player.isDead && !isShopOpenRef.current) {
        const speed = Math.hypot(player.vx || 0, player.vy || 0);
        if (speed > 1) {
          const moveAngle = Math.atan2(player.vy || 0, player.vx || 0);
          const angleDiff = Math.sin(moveAngle - player.angle);
          targetTilt = angleDiff * 0.035; // Tilt up to ~2 degrees
        } else {
          // Idle sway tilt
          targetTilt = Math.sin(Date.now() * 0.0007) * 0.006;
        }
      }
      camera.tilt += (targetTilt - camera.tilt) * 3 * dt;

      const camLerpSpeed = cinematicModeRef.current ? 2.2 : 5.0;
      camera.x += (targetCamX - camera.x) * camLerpSpeed * dt;
      camera.y += (targetCamY - camera.y) * camLerpSpeed * dt;
      camera.zoom += (targetZoom - camera.zoom) * (cinematicModeRef.current ? 3.0 : 5.0) * dt;

      // Update dynamic cinematic blur style overlays (tilt-shift)
      if (topBlurRef.current && bottomBlurRef.current) {
        const zoomVal = camera.zoom;
        const targetHeight = `${Math.max(8, 24 - (zoomVal * 12))}vh`;
        const targetBlur = `blur(${Math.max(0, 4 - (zoomVal * 2.5))}px)`;
        
        topBlurRef.current.style.height = targetHeight;
        topBlurRef.current.style.backdropFilter = targetBlur;
        topBlurRef.current.style.webkitBackdropFilter = targetBlur;
        topBlurRef.current.style.opacity = gameState === "PLAYING" ? "1" : "0";
        
        bottomBlurRef.current.style.height = targetHeight;
        bottomBlurRef.current.style.backdropFilter = targetBlur;
        bottomBlurRef.current.style.webkitBackdropFilter = targetBlur;
        bottomBlurRef.current.style.opacity = gameState === "PLAYING" ? "1" : "0";
      }

      // 3. Update Aiming Angle
      const screenCenterX = logicalWidth / 2;
      const screenCenterY = logicalHeight / 2;
      // Adjusting mouse vector relative to player's screen position, accounting for zoom
      const playerScreenX = screenCenterX + (player.x - camera.x) * camera.zoom;
      const playerScreenY = screenCenterY + (player.y - camera.y) * camera.zoom;

      const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (!cutsceneRef.current.active) {
        if (
          mouse.down ||
          (mouse.rightDown && isAimEnabledRef.current) ||
          muzzleFlash > 0 ||
          player.isReloading
        ) {
          let aimed = false;
          const mobAimAngle = (window as any).mobileAimJoystickAngle;
          if ((mobShoot || mobAim) && mobAimAngle !== undefined && mobAimAngle !== null) {
            player.angle = mobAimAngle;
            // Sync virtualMouse position relative to player
            virtualMouseX = playerScreenX + Math.cos(mobAimAngle) * 300;
            virtualMouseY = playerScreenY + Math.sin(mobAimAngle) * 300;
            aimed = true;
          } else if (isMobileDevice || mobShoot || mobAim) {
            let closestZ = null;
            let closestDist = 800; // auto-aim range
            for (const m of mannequins) {
              if (m.hp > 0) {
                const d = Math.hypot(m.x - player.x, m.y - player.y);
                if (d < closestDist) {
                  closestDist = d;
                  closestZ = m;
                }
              }
            }
            if (closestZ) {
              player.angle = Math.atan2(closestZ.y - player.y, closestZ.x - player.x);
              // Sync virtualMouse position
              const mScreenX = screenCenterX + (closestZ.x - camera.x) * camera.zoom;
              const mScreenY = screenCenterY + (closestZ.y - camera.y) * camera.zoom;
              virtualMouseX = mScreenX;
              virtualMouseY = mScreenY;
              aimed = true;
            }
          }
          if (!aimed) {
            const targetAngle = Math.atan2(
              virtualMouseY - playerScreenY,
              virtualMouseX - playerScreenX,
            );
            if (activeWeapon === "rifle") {
              const diff = Math.atan2(
                Math.sin(targetAngle - player.angle),
                Math.cos(targetAngle - player.angle)
              );
              // Smooth, weighted stabilization for sniper aiming (prevents rapid spinning)
              player.angle += diff * 7.5 * dt;
            } else {
              player.angle = targetAngle;
            }
          }
        } else {
          if (dx !== 0 || dy !== 0) {
            const targetAngle = Math.atan2(dy, dx);
            const diff = Math.atan2(
              Math.sin(targetAngle - player.angle),
              Math.cos(targetAngle - player.angle),
            );
            // Faster turn rate when walking
            player.angle += diff * 15 * dt;
          } else {
            let idleLook = 0;
            if (player.idleTimer > 2) {
              idleLook = Math.sin(player.idleTimer * 0.8) * 0.4;
            }
            let targetAngle =
              Math.atan2(virtualMouseY - playerScreenY, virtualMouseX - playerScreenX) +
              idleLook;

            // --- Estabilização de Mira (Auto-Aim Magnético) ---
            let closestDist = 180; // Alcance do imã da mira na tela
            let targetM = null;
            for (const m of mannequins) {
              if (m.hp > 0) {
                const mScreenX = screenCenterX + (m.x - camera.x) * camera.zoom;
                const mScreenY = screenCenterY + (m.y - camera.y) * camera.zoom;
                const distToMouse = Math.hypot(mScreenX - virtualMouseX, mScreenY - virtualMouseY);
                if (distToMouse < closestDist) {
                  closestDist = distToMouse;
                  targetM = m;
                }
              }
            }
            
            if (targetM) {
              const mScreenX = screenCenterX + (targetM.x - camera.x) * camera.zoom;
              const mScreenY = screenCenterY + (targetM.y - camera.y) * camera.zoom;
              targetAngle = Math.atan2(mScreenY - playerScreenY, mScreenX - playerScreenX);
              
              // Puxa suavemente a mira virtual na direção do zumbi
              virtualMouseX += (mScreenX - virtualMouseX) * 0.08;
              virtualMouseY += (mScreenY - virtualMouseY) * 0.08;
            }
            // ----------------------------------------------------

            const diff = Math.atan2(
              Math.sin(targetAngle - player.angle),
              Math.cos(targetAngle - player.angle),
            );
            // Gira um pouco mais rápido para a mira travar mais fácil
            player.angle += diff * (targetM ? 8 : 3) * dt;
          }
        }
      }

      // Focus Blur Overlay is now drawn natively on the Canvas inside the draw loop for maximum performance without freezes.

      // 4. Shooting Mechanism & Smoke
      if (player.gunHeat > 0)
        player.gunHeat = Math.max(0, player.gunHeat - dt * 1.5);

      if (player.gunSmokeTime > 0) {
        player.gunSmokeTime -= dt;

        if (player.gunHeat > 3) {
          const dropMoveX = player.gunDropLerp * -30;
          const dropMoveY = player.gunDropLerp * 18;
          const dropRot = player.gunDropLerp * 2.0;
          const walkBobTime = player.isMoving ? player.moveTimer * 12 : 0;
          const bobWalkX = player.isMoving
            ? Math.sin(walkBobTime) * (player.isRunning ? 8 : 4)
            : 0;
          const bobWalkY = player.isMoving
            ? Math.cos(walkBobTime * 2) * (player.isRunning ? 4 : 2)
            : 0;
          const swayRot = player.isMoving
            ? Math.sin(walkBobTime) * (player.isRunning ? 0.3 : 0.1)
            : 0;

          const gunAnimX = bobWalkX + dropMoveX;
          const gunAnimY = bobWalkY + dropMoveY;
          const gunAnimRot = swayRot + dropRot;

          const pivotX = 10,
            pivotY = 8;
          const bTip = getBarrelTip(activeWeapon || "pistola");
          const barrelX = bTip.x;
          const barrelY = bTip.y;

          const rotatedBarrelX =
            Math.cos(gunAnimRot) * (barrelX - pivotX) -
            Math.sin(gunAnimRot) * (barrelY - pivotY) +
            pivotX;
          const rotatedBarrelY =
            Math.sin(gunAnimRot) * (barrelX - pivotX) +
            Math.cos(gunAnimRot) * (barrelY - pivotY) +
            pivotY;

          const finalBarrelX = rotatedBarrelX + gunAnimX;
          const finalBarrelY = rotatedBarrelY + gunAnimY;

          const worldBarrelOffsetX =
            Math.cos(player.angle) * finalBarrelX -
            Math.sin(player.angle) * finalBarrelY;
          const worldBarrelOffsetY =
            Math.sin(player.angle) * finalBarrelX +
            Math.cos(player.angle) * finalBarrelY;

          const worldX = player.x + worldBarrelOffsetX;
          const worldY = player.y + worldBarrelOffsetY;

          const isBasuca = activeWeapon === "basuca";
          const smokeRate = isBasuca ? 6 : Math.min(4, Math.floor(player.gunHeat - 2));
          for (let i = 0; i < smokeRate; i++) {
            if (isBasuca || Math.random() < 0.6) {
              const alpha = isBasuca 
                ? 0.15 + Math.random() * 0.15 
                : 0.02 + Math.random() * 0.04;
              particles.push({
                x: worldX + (Math.random() - 0.5) * (isBasuca ? 12 : 4),
                y: worldY + (Math.random() - 0.5) * (isBasuca ? 12 : 4),
                vx:
                  player.vx * 0.8 +
                  Math.cos(player.angle) * (isBasuca ? 30 + Math.random() * 50 : 8) +
                  (Math.random() - 0.5) * (isBasuca ? 30 : 12),
                vy:
                  player.vy * 0.8 +
                  Math.sin(player.angle) * (isBasuca ? 30 + Math.random() * 50 : 8) +
                  (Math.random() - 0.5) * (isBasuca ? 30 : 12),
                life: isBasuca ? 2.5 + Math.random() * 2.0 : 1.0 + Math.random() * 2.5,
                color: isBasuca 
                  ? `rgba(70, 70, 70, ${alpha})` // Darker, thicker smoke for bazooka
                  : `rgba(200, 200, 200, ${alpha})`,
                size: isBasuca ? 12 + Math.random() * 12 : 2 + Math.random() * 4,
                isSmoke: true,
              });
            }
          }
        }
      }

      if (player.isReloading && !player.isDead) {
        player.reloadTimer -= dt;
        if (player.reloadTimer <= 0) {
          player.isReloading = false;
          if (activeStats) {
            const currentAmmoMax = Math.ceil(activeStats.ammoMax * (1.0 + wUpgrades.capacity * 0.15));
            inventoryRef.current.hotbarAmmo[activeSlot] = currentAmmoMax;
            player.ammo = currentAmmoMax;
          }
        }
      } else if (!player.isDead) {
        // Safe check for shooting - block if rolling or cutscene active
        if (mouse.down && player.ammo > 0 && activeStats && player.isRolling === false && !cutsceneRef.current.active) {
          const baseFireRate = activeStats.fireRate / (1.0 + wUpgrades.fireRate * 0.12);
          const currentFireRate = player.furyTimer > 0 ? baseFireRate * 0.55 : baseFireRate;
          if (time - lastShotTime > currentFireRate * 1000) {
            lastShotTime = time;
            player.ammo--;
            if (player.ammo < 0) player.ammo = 0;
            inventoryRef.current.hotbarAmmo[activeSlot] = player.ammo;
            shoot(activeWeapon);
          }
        } else if (
          mouse.down &&
          player.ammo <= 0 &&
          activeStats &&
          !player.isReloading &&
          player.isRolling === false &&
          !cutsceneRef.current.active
        ) {
          player.ammo = 0;
          inventoryRef.current.hotbarAmmo[activeSlot] = 0;
          player.isReloading = true;
          player.reloadTimer = activeStats.reloadTime / (1.0 + wUpgrades.reloadSpeed * 0.15);
          player.gunSmokeTime = 1.0;
          if (activeWeapon) SoundManager.playReload(activeWeapon);
        }
      }

      if (!mouse.down && player.wasShooting && player.ammo > 0) {
        player.gunSmokeTime = 1.2;
      }
      player.wasShooting = mouse.down;

      // Decrement muzzle flash
      if (muzzleFlash > 0) muzzleFlash -= dt * 15;
      if (muzzleFlash < 0) muzzleFlash = 0;

      // Screen shake decay
      if (screenShakeStr > 0) {
        screenShakeStr -= dt * 100;
        if (screenShakeStr < 0) screenShakeStr = 0;
      }
      screenShakeX = (Math.random() - 0.5) * screenShakeStr;
      screenShakeY = (Math.random() - 0.5) * screenShakeStr;

      if (player.hp < 30) {
        const deathTremble = ((30 - player.hp) / 30) * 4;
        screenShakeX += (Math.random() - 0.5) * deathTremble;
        screenShakeY += (Math.random() - 0.5) * deathTremble;
      }

      worldMouseX = camera.x - logicalWidth / 2 + virtualMouseX + screenShakeX;
      worldMouseY = camera.y - logicalHeight / 2 + virtualMouseY + screenShakeY;

      if (player.hitMarkerTime > 0) player.hitMarkerTime -= dt;
      if (player.healthGlowTimer > 0) player.healthGlowTimer -= dt;
      if (player.bloodAmount !== undefined && player.bloodAmount > 0)
        player.bloodAmount = Math.max(0, player.bloodAmount - dt * 0.02);

      // Invincibility shield tracking
      if ((player as any).shieldTimer && (player as any).shieldTimer > 0) {
        (player as any).shieldTimer -= dt;
        player.hp = Math.max(player.hp, (player as any).lastHp || player.hp);
      }
      (player as any).lastHp = player.hp;

      // Listen for manual respawn event
      if (player.isDead && window.respawnTriggered) {
        window.respawnTriggered = false;
        player.isDead = false;
        player.hp = player.maxHp;
        player.ammo = player.maxAmmo;
        SoundManager.startBGMusic();
        player.bloodAmount = 0;
        player.x = (Math.random() - 0.5) * 1000;
        player.y = (Math.random() - 0.5) * 1000;
        // Push zombies away
        for (const m of mannequins) {
          const dist = Math.hypot(m.x - player.x, m.y - player.y);
          if (dist < 400) {
            m.x += (Math.random() - 0.5) * 1000;
            m.y += (Math.random() - 0.5) * 1000;
          }
        }
      }

      // Listen for Ad-based revive event
      if (player.isDead && (window as any).respawnAdTriggered) {
        (window as any).respawnAdTriggered = false;
        player.isDead = false;
        player.hp = player.maxHp;
        player.ammo = player.maxAmmo;
        SoundManager.startBGMusic();
        player.bloodAmount = 0;
        (player as any).shieldTimer = 3.5; // 3.5 seconds of invincibility shield!
        
        // Push zombies away from the player's revive spot
        for (const m of mannequins) {
          const dist = Math.hypot(m.x - player.x, m.y - player.y);
          if (dist < 350) {
            const angle = Math.atan2(m.y - player.y, m.x - player.x) + (Math.random() - 0.5) * 0.5;
            m.vx = Math.cos(angle) * 850;
            m.vy = Math.sin(angle) * 850;
          }
        }
      }

      if (player.furyTimer > 0) {
        player.furyTimer -= dt;
        // Constant slight screen shake during fury
        camera.x += (Math.random() - 0.5) * 2;
        camera.y += (Math.random() - 0.5) * 2;
      }

      // --- Update Player Speech ---
      if (player.isMoving || mouse.down || mouse.rightDown) {
        player.speechTimer = 0; // Cancel current speech
      } else {
        if (player.speechTimer > 0) {
          player.speechTimer -= dt;
        } else {
          player.nextSpeechDelay -= dt;
          if (player.nextSpeechDelay <= 0) {
            player.speechText =
              PHRASES[Math.floor(Math.random() * PHRASES.length)];
            player.speechTimer = 2.5; // Show for 2.5 seconds
            player.nextSpeechDelay = 4 + Math.random() * 8; // Wait 4-12 seconds
          }
        }
      }

      // 5. Update Bullets and Mannequins
      for (const m of mannequins) {
        if (m.isTrainingDummy && waveRef.current.mode) {
          m.hp = 0;
          continue;
        }
        if (m.isTrainingDummy) {
          if (m.hitTime > 0) m.hitTime -= dt;
          if (m.hp <= 0) {
            m.deadTime += dt;
            if (m.deadTime > 4.0) { // Respawn/Reset training dummy after 4 seconds
              m.hp = m.maxHp;
              m.deadTime = 0;
            }
          }
          m.vx = 0;
          m.vy = 0;
          continue;
        }
        if (m.hp > 0 && m.type === "patrol") {
          // Handle emerging from ground
          if ((m as any).emergeTimer !== undefined && (m as any).emergeTimer > 0) {
            (m as any).emergeTimer -= dt;
            if ((m as any).emergeTimer < 0) (m as any).emergeTimer = 0;

            // Tremble slightly
            const emergeProgress = 1 - ((m as any).emergeTimer / ((m as any).emergeDuration || 1.8));
            const shakeVal = 3 * (1 - emergeProgress);
            const sx = (Math.random() - 0.5) * shakeVal;
            const sy = (Math.random() - 0.5) * shakeVal;
            m.x += sx;
            m.y += sy;

            // Generate dust particles, check count to not be exaggerated
            const emergingCount = mannequins.filter(z => z.hp > 0 && (z as any).emergeTimer && (z as any).emergeTimer > 0).length;
            const dustChance = emergingCount > 5 ? 0.08 : 0.35;

            if (Math.random() < dustChance) {
              dustParticles.push({
                x: m.x + (Math.random() - 0.5) * 25,
                y: m.y + (Math.random() - 0.5) * 25,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.5 + Math.random() * 0.3,
                size: 5 + Math.random() * 8,
              });
            }

            m.vx = 0;
            m.vy = 0;
            continue;
          }
          // Decrement jump cooldown if active
          if (m.jumpCooldown && m.jumpCooldown > 0) {
            m.jumpCooldown -= dt;
          }

          let tx = m.x;
          let ty = m.y;

          if (aiMode === 2) {
            if (m.isBoss) {
              tx = player.x;
              ty = player.y;
            } else if (m.profile === "FLANQUEADOR") {
              const angleToPlayer = Math.atan2(player.y - m.y, player.x - m.x);
              const offsetAngle = (m.id % 2 === 0 ? 1 : -1) * (Math.PI / 3); // 60 degrees flank angle
              tx = player.x + Math.cos(angleToPlayer + offsetAngle) * 200;
              ty = player.y + Math.sin(angleToPlayer + offsetAngle) * 200;
            } else if (m.profile === "CERCO") {
              const angle = (m.id * (2 * Math.PI)) / 100;
              tx = player.x + Math.cos(angle) * 150;
              ty = player.y + Math.sin(angle) * 150;

            } else if (m.profile === "SALTADOR") {
              const distToP = Math.hypot(player.x - m.x, player.y - m.y);
              
              if ((m as any).isPreparingJump) {
                (m as any).jumpPrepTimer -= dt;
                m.vx = 0;
                m.vy = 0;
                if ((m as any).jumpPrepTimer <= 0) {
                  (m as any).isPreparingJump = false;
                  m.isJumping = true;
                  m.jumpProgress = 0;
                  m.jumpStartX = m.x;
                  m.jumpStartY = m.y;
                  m.jumpTargetX = player.x;
                  m.jumpTargetY = player.y;
                }
              } else if (!m.isJumping && (!m.jumpCooldown || m.jumpCooldown <= 0) && distToP > 160 && distToP < 420 && !player.isDead) {
                (m as any).isPreparingJump = true;
                (m as any).jumpPrepTimer = 0.65; // 0.65s warning
                m.vx = 0;
                m.vy = 0;
              }
              tx = player.x;
              ty = player.y;
            } else { // AGRESSIVO or LENTO
              tx = player.x;
              ty = player.y;
            }
          } else if (aiMode === 1) {
            const distToTarget = Math.hypot(
              m.moveTargetX - m.x,
              m.moveTargetY - m.y,
            );
            if (distToTarget < 20) {
              m.moveTargetX = m.x + (Math.random() - 0.5) * 600;
              m.moveTargetY = m.y + (Math.random() - 0.5) * 600;
            }
            tx = m.moveTargetX;
            ty = m.moveTargetY;
          }

          if (m.isJumping) {
            m.jumpProgress += dt * 1.8; // jump duration ~0.55s
            if (m.jumpProgress >= 1.0) {
              m.jumpProgress = 1.0;
              m.isJumping = false;
              m.jumpCooldown = 4.0 + Math.random() * 3.0;
              m.x = m.jumpTargetX || player.x;
              m.y = m.jumpTargetY || player.y;
              
              // Impact check
              const distToP = Math.hypot(m.x - player.x, m.y - player.y);
              if (distToP < 50 && !player.isDead && !player.isRolling) {
                const dmg = 35; // high damage
                player.hp -= dmg;
                screenShakeStr = Math.max(screenShakeStr, 60);
                playerDamageFlash = 1.0;
                SoundManager.playSound("zombieShoot", 1.0); // impact sound
                
                damageTexts.push({
                  x: player.x,
                  y: player.y - 45,
                  value: "ATAQUE SÚBITO!",
                  vx: (Math.random() - 0.5) * 60,
                  vy: -150,
                  life: 1.5,
                  type: "player_damage",
                  themeColor: "#ff0055"
                } as any);

                // Knockback
                const pAngle = Math.atan2(player.y - m.y, player.x - m.x);
                player.vx += Math.cos(pAngle) * 2000;
                player.vy += Math.sin(pAngle) * 2000;

                // Blood drops
                for (let k = 0; k < 25; k++) {
                  pushBloodDrop({
                    x: player.x,
                    y: player.y,
                    z: 20 + Math.random() * 20,
                    vx: Math.cos(pAngle) * 400 + (Math.random() - 0.5) * 500,
                    vy: Math.sin(pAngle) * 400 + (Math.random() - 0.5) * 500,
                    vz: 120 + Math.random() * 150,
                    size: 4 + Math.random() * 6,
                    color: "#ff0000",
                  });
                }
              } else if (distToP >= 50 || player.isRolling) {
                // Dust particles on landing
                for (let k = 0; k < 15; k++) {
                  const pAngle = Math.random() * Math.PI * 2;
                  const pSpeed = Math.random() * 150 + 50;
                  particles.push({
                    x: m.x,
                    y: m.y,
                    vx: Math.cos(pAngle) * pSpeed,
                    vy: Math.sin(pAngle) * pSpeed,
                    life: 0.4 + Math.random() * 0.3,
                    color: "rgba(100, 100, 100, 0.4)",
                    size: 3 + Math.random() * 4,
                  });
                }
              }
            } else {
              m.x = (m.jumpStartX || m.x) + ((m.jumpTargetX || player.x) - (m.jumpStartX || m.x)) * m.jumpProgress;
              m.y = (m.jumpStartY || m.y) + ((m.jumpTargetY || player.y) - (m.jumpStartY || m.y)) * m.jumpProgress;
            }
          } else {
            // Apply steering forces (separation) to avoid overlapping and contour obstacles
            let avoidX = 0;
            let avoidY = 0;
            for (const other of mannequins) {
              if (other.id !== m.id && other.hp > 0 && !other.isJumping) {
                const distToOther = Math.hypot(m.x - other.x, m.y - other.y);
                const minAvoidDist = (m.isBoss ? 45 : 22) + (other.isBoss ? 45 : 22);
                if (distToOther < minAvoidDist && distToOther > 0.01) {
                  const force = (minAvoidDist - distToOther) / minAvoidDist;
                  avoidX += ((m.x - other.x) / distToOther) * force * 500;
                  avoidY += ((m.y - other.y) / distToOther) * force * 500;
                }
              }
            }

            // Van Avoidance
            const distToVan = Math.hypot(m.x - VAN_X, m.y - VAN_Y);
            if (distToVan < VAN_RADIUS + 30) {
              const force = (VAN_RADIUS + 30 - distToVan) / (VAN_RADIUS + 30);
              avoidX += ((m.x - VAN_X) / distToVan) * force * 800;
              avoidY += ((m.y - VAN_Y) / distToVan) * force * 800;
            }

            // Scenery Boundary Avoidance
            const avoidanceLimit = getMapSize();
            if (m.x < -avoidanceLimit) avoidX += 600;
            if (m.x > avoidanceLimit) avoidX -= 600;
            if (m.y < -avoidanceLimit) avoidY += 600;
            if (m.y > avoidanceLimit) avoidY -= 600;

            // Strict boundary clamp constraint to prevent zombies getting stuck in outer voids
            const hardMapLimit = avoidanceLimit + 45;
            if (m.x < -hardMapLimit) { m.x = -hardMapLimit; m.vx = 0; }
            if (m.x > hardMapLimit) { m.x = hardMapLimit; m.vx = 0; }
            if (m.y < -hardMapLimit) { m.y = -hardMapLimit; m.vy = 0; }
            if (m.y > hardMapLimit) { m.y = hardMapLimit; m.vy = 0; }

            const dx = tx - m.x;
            const dy = ty - m.y;
            const dist = Math.hypot(dx, dy);

            // Check if zombie is behind player
            const angleToZombie = Math.atan2(m.y - player.y, m.x - player.x);
            const angleDiff = Math.abs(Math.atan2(Math.sin(angleToZombie - player.angle), Math.cos(angleToZombie - player.angle)));
            const isBehindPlayer = angleDiff > 2.0;

            let speed = 130;
            if (m.isBoss) speed = 85;
            else if (m.profile === "LENTO") speed = 75;
            else if (m.profile === "SALTADOR") speed = 135;
            else if (m.profile === "AGRESSIVO") speed = 175;
            else if (m.profile === "FLANQUEADOR") speed = 140;
            else if (m.profile === "CERCO") speed = 125;
            else if (m.profile === "ATIRADOR") speed = 90; // keeps distance
            else if (m.profile === "DASHER") speed = 160;

            if ((m as any).baseSpeedMult) {
              speed *= (m as any).baseSpeedMult;
            }

            // Apply lunge speed burst (bote) if behind player and close
            if (isBehindPlayer && dist < 220 && (m.profile === "FLANQUEADOR" || m.profile === "CERCO")) {
              speed *= 1.8;
            }

            if (dist > 20 && aiMode !== 0) {
              m.vx += ( (dx / dist) * speed + avoidX ) * dt * 5;
              m.vy += ( (dy / dist) * speed + avoidY ) * dt * 5;

              // Apply friction
              m.vx *= Math.max(0, 1 - 4 * dt);
              m.vy *= Math.max(0, 1 - 4 * dt);

              const targetAngle = Math.atan2(dy, dx);
              const aDiff = Math.atan2(
                Math.sin(targetAngle - m.angle),
                Math.cos(targetAngle - m.angle),
              );
              m.angle += aDiff * 6 * dt;
            }
          }

          // ATIRADOR: keep distance and shoot homing red energy projectiles
          if (m.profile === "ATIRADOR" && m.hp > 0 && !(m as any).emergeTimer) {
            const distToP = Math.hypot(m.x - player.x, m.y - player.y);
            // Move away if too close
            if (distToP < 300) {
              const awayX = (m.x - player.x) / distToP;
              const awayY = (m.y - player.y) / distToP;
              m.vx += awayX * 350 * dt;
              m.vy += awayY * 350 * dt;
            }
            if (!(m as any).shootTimer) (m as any).shootTimer = 1.5 + Math.random();
            if ((m as any).burstShotsLeft === undefined) (m as any).burstShotsLeft = 0;
            
            (m as any).shootTimer -= dt;
            if ((m as any).shootTimer <= 0 && distToP < 700 && !player.isDead) {
              const wNum = waveRef.current.current;
              
              if ((m as any).burstShotsLeft <= 0) {
                // Initialize burst sequence based on wave number
                (m as any).burstShotsLeft = wNum >= 6 ? Math.min(4, Math.floor(wNum / 3)) : 1;
                // Add a small delay before the burst starts, giving player a visual cue
                (m as any).shootTimer = 0.4;
              } else {
                // Fire a shot in the burst
                (m as any).burstShotsLeft -= 1;
                const shootAngle = Math.atan2(player.y - m.y, player.x - m.x) + (Math.random() - 0.5) * 0.15;
                const bspeed = 360 + (wNum * 5); // Slightly faster projectiles in later waves
                bullets.push({
                  x: m.x,
                  y: m.y,
                  z: 20,
                  vx: Math.cos(shootAngle) * bspeed,
                  vy: Math.sin(shootAngle) * bspeed,
                  vz: 0,
                  life: 4.2, // Longer life to allow homing path to play out
                  dmgMult: -1.0, 
                  hitEntityIds: [-1], 
                  isEnemyBullet: true,
                  isHoming: true,
                  color: "#ef4444" 
                });
                SoundManager.playSound("zombieShoot", 0.45);
                
                // If burst is still going, short delay. Otherwise, long cooldown.
                if ((m as any).burstShotsLeft > 0) {
                  (m as any).shootTimer = 0.25; // extremely fast consecutive shots
                } else {
                  (m as any).shootTimer = 1.8 + Math.random() * 1.2;
                }
              }
            }
          }

          // DASHER: zig-zag toward player and evade incoming player bullets
          if (m.profile === "DASHER" && m.hp > 0 && !(m as any).emergeTimer) {
            if (!(m as any).zigzagTimer) (m as any).zigzagTimer = 0.4;
            if (!(m as any).zigzagDir) (m as any).zigzagDir = Math.random() > 0.5 ? 1 : -1;
            if (!(m as any).analyzeTimer) (m as any).analyzeTimer = 0;
            if (!(m as any).dashActiveTimer) (m as any).dashActiveTimer = 0;

            // 0. Update timers
            (m as any).zigzagTimer -= dt;
            if ((m as any).zigzagTimer <= 0) {
              (m as any).zigzagTimer = 0.25 + Math.random() * 0.15; // fast zig-zag adjustments
              (m as any).zigzagDir *= -1;
            }

            if ((m as any).analyzeTimer > 0) {
              (m as any).analyzeTimer -= dt;
              // Friction to slow down during analysis pause
              m.vx *= 0.15 * dt;
              m.vy *= 0.15 * dt;
              continue; // Skip dash/movement logic while analyzing the player
            }

            if ((m as any).dashActiveTimer > 0) {
              (m as any).dashActiveTimer -= dt;
              if ((m as any).dashActiveTimer <= 0) {
                // Dash just ended, check if player got away to trigger analysis pause
                const distToP = Math.hypot(m.x - player.x, m.y - player.y);
                if (distToP > 280) {
                  (m as any).analyzeTimer = 1.0 + Math.random() * 0.5; // wait/analyze player
                }
              }
            }

            const distToP = Math.hypot(m.x - player.x, m.y - player.y);
            const angleToP = Math.atan2(player.y - m.y, player.x - m.x);
            
            // 1. Zig-zag movement physics (Very fast and aggressive)
            if (!player.isDead) {
              const runSpeed = 260; // Increased base speed
              const lateralAngle = angleToP + (Math.PI / 2) * (m as any).zigzagDir;
              
              // Strong lateral vector for quick zig-zag
              const targetVx = Math.cos(angleToP) * runSpeed + Math.cos(lateralAngle) * runSpeed * 2.6;
              const targetVy = Math.sin(angleToP) * runSpeed + Math.sin(lateralAngle) * runSpeed * 2.6;
              
              m.vx += (targetVx - m.vx) * 8 * dt;
              m.vy += (targetVy - m.vy) * 8 * dt;
            }

            // 2. Dash / Evade trigger
            if (!(m as any).dashCooldown) (m as any).dashCooldown = 1.0 + Math.random();
            (m as any).dashCooldown -= dt;
            
            let shouldDash = false;
            let finalDashAngle = angleToP;
            let isEvade = false;

            // Evade bullets approaching DASHER (much faster reaction)
            if ((m as any).dashCooldown <= 0) {
              for (const b of bullets) {
                if (!b.isEnemyBullet && b.dmgMult > 0.1) {
                  const distToBullet = Math.hypot(m.x - b.x, m.y - b.y);
                  if (distToBullet < 550) { // Increased awareness radius
                    const bulletAngle = Math.atan2(b.vy, b.vx);
                    const dodgeDir = Math.random() > 0.5 ? 1 : -1;
                    finalDashAngle = bulletAngle + (Math.PI / 2) * dodgeDir;
                    shouldDash = true;
                    isEvade = true;
                    (m as any).dashCooldown = 0.05; // extremely agile dodge rate, almost spamming
                    break;
                  }
                }
              }
            }

            // Standard target dash toward player
            if (!shouldDash && (m as any).dashCooldown <= 0 && distToP > 100 && distToP < 550 && !player.isDead) {
              shouldDash = true;
              finalDashAngle = angleToP;
              (m as any).dashCooldown = 1.8 + Math.random() * 1.0;
            }

            if (shouldDash) {
              const dashPower = isEvade ? 2500 : 1550; // dodge dash is extremely fast
              m.vx = Math.cos(finalDashAngle) * dashPower;
              m.vy = Math.sin(finalDashAngle) * dashPower;
              (m as any).dashActiveTimer = 0.25; // dash lasts 0.25s

              // Spawn glowing orange trail ghosts behind the dashing zombie
              for (let gi = 0; gi < 8; gi++) {
                setTimeout(() => {
                  if (m.hp <= 0) return; // Don't spawn if zombie died during timeouts
                  rollGhosts.push({
                    x: m.x - Math.cos(finalDashAngle) * gi * 14,
                    y: m.y - Math.sin(finalDashAngle) * gi * 14,
                    angle: m.angle,
                    alpha: 0.65,
                    scale: 1.0,
                    isBlue: false,
                  });
                }, gi * 25);
              }
            }
          }
        }

        // Damage Player Logic
        if (m.attackTimer && m.attackTimer > 0) m.attackTimer -= dt;

        if (m.hp > 0 && !player.isDead && (!(m as any).emergeTimer || (m as any).emergeTimer <= 0)) {
          const playerDist = Math.hypot(m.x - player.x, m.y - player.y);
          const attackRange = m.isBoss ? 60 : 35;

          // Enemy bullets hit player
          if ((m as any).isEnemyBullet) { /* handled separately */ }

          // Only attack if within range and not on cooldown
          if (
            playerDist < attackRange &&
            (m.attackTimer === undefined || m.attackTimer <= 0)
          ) {
            const angleToZombie = Math.atan2(m.y - player.y, m.x - player.x);
            const angleDiff = Math.abs(Math.atan2(Math.sin(angleToZombie - player.angle), Math.cos(angleToZombie - player.angle)));
            const isBehindPlayer = angleDiff > 2.0;

            if (!player.isRolling) {
              const dmg = m.isBoss ? 40 : 15;
              player.hp -= dmg;
              screenShakeStr = Math.max(screenShakeStr, 35);
              playerDamageFlash = 1.0;
              m.attackTimer = isBehindPlayer ? 0.45 : 1.0; 
              damageTexts.push({
                x: player.x,
                y: player.y - 40,
                value: dmg,
                vx: (Math.random() - 0.5) * 50,
                vy: -100 - Math.random() * 50,
                life: 1.5,
                type: "player_damage",
              });

              // Knockback
              if (playerDist > 0) {
                const pushX = (player.x - m.x) / playerDist;
                const pushY = (player.y - m.y) / playerDist;
                player.vx += pushX * 1200; // Strong push
                player.vy += pushY * 1200;

                // Blood drops from player
                for (let j = 0; j < 15; j++) {
                  pushBloodDrop({
                    x: player.x,
                    y: player.y,
                    z: 20 + Math.random() * 20,
                    vx: pushX * 300 + (Math.random() - 0.5) * 400,
                    vy: pushY * 300 + (Math.random() - 0.5) * 400,
                    vz: 100 + Math.random() * 200,
                    size: 4 + Math.random() * 6,
                    color: Math.random() > 0.5 ? "#ff0000" : "#8b0000",
                  });
                }
              }

              player.bloodAmount = Math.min((player.bloodAmount || 0) + 0.3, 1.0);

              if (player.hp <= 0 && !player.isDead) {
                player.hp = 0;
                player.isDead = true;
                player.kills = 0;
                player.furyKills = 0;
                // Save credits to global bank on death
                saveGlobalCredits(globalCredits + credits);
                // Save any purchased skins to persistent storage
                const allSkins = [...new Set([...globalPurchasedSkins, ...inventoryRef.current.purchasedSkins])];
                saveGlobalSkins(allSkins);
                SoundManager.playSound("gameover", 0.9);
                SoundManager.stopBGMusic();

                const deathTitle = document.getElementById("death-title");
                if (deathTitle) {
                  const deathPhrases = [
                    "Seu corpo foi destroçado",
                    "Você morreu",
                    "Morreu brutalmente",
                    "Fim da linha",
                    "Sua alma foi rasgada",
                    "Aniquilação total",
                    "Restaram apenas pedaços",
                    "Devorado sem piedade",
                    "Sangue na tela",
                    "A caça terminou",
                    "A escuridão te consumiu",
                    "Sua resistência falhou",
                    "Mais um para a pilha",
                    "Morte iminente",
                    "Apagão",
                  ];
                  deathTitle.innerText =
                    deathPhrases[Math.floor(Math.random() * deathPhrases.length)];
                }

                // Explode player into huge blood
                for (let j = 0; j < 60; j++) {
                  pushBloodDrop({
                    x: player.x,
                    y: player.y,
                    z: 20 + Math.random() * 40,
                    vx: (Math.random() - 0.5) * 800,
                    vy: (Math.random() - 0.5) * 800,
                    vz: 100 + Math.random() * 200,
                    size: 5 + Math.random() * 8,
                    color: Math.random() > 0.4 ? "#ff0000" : "#8b0000",
                  });
                }
                for (let j = 0; j < 15; j++) {
                  pushGib({
                    x: player.x,
                    y: player.y,
                    z: 20,
                    vx: (Math.random() - 0.5) * 500,
                    vy: (Math.random() - 0.5) * 500,
                    vz: 100 + Math.random() * 200,
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 20,
                    size: 15 + Math.random() * 15,
                    life: 5 + Math.random() * 5,
                  });
                }
              }
            } else {
              m.attackTimer = isBehindPlayer ? 0.45 : 1.0;
            }
          }
        }

        const isSniper = activeWeapon === "rifle";
        // Target hover radius is tighter for precision
        const hitRadius = m.isBoss ? 75 : 45;
        const distToMouse = Math.hypot(m.x - worldMouseX, m.y - worldMouseY);
        let screenHoverTargeted = distToMouse < hitRadius;

        // Only the Sniper ("rifle") shows information for multiple zombies along the line of sight
        let aimLineTargeted = false;
        if (isSniper) {
          const dx = m.x - player.x;
          const dy = m.y - player.y;
          const distToPlayer = Math.hypot(dx, dy);
          if (distToPlayer < 1400) {
            const mAngle = Math.atan2(dy, dx);
            let angleDiff = Math.abs(mAngle - player.angle);
            while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
            if (angleDiff < 0.08) { // Tighter, more precise line of sight for sniper
              aimLineTargeted = true;
            }
          }
        }

        m.isTargeted = screenHoverTargeted || aimLineTargeted;

        const headRadius = m.isBoss ? 15 : 6;
        m.isHeadTargeted = m.isTargeted && (distToMouse < headRadius * (isSniper ? 2.5 : 1.0) || aimLineTargeted);

        const targetFocus = m.isTargeted || m.hitTime > 0 ? 1 : 0;
        m.focusLerp += (targetFocus - m.focusLerp) * 10 * dt;

        if (m.hitTime > 0) m.hitTime -= dt;
        if (m.hp <= 0) {
          if (!waveRef.current.mode && (window as any).freeModeSpawningEnabled && !m.isTrainingDummy) {
            const aliveCount = mannequins.filter(z => z.hp > 0 && !z.isTrainingDummy).length;
            m.deadTime += dt;
            if (m.deadTime > 3 && aliveCount < 4) {
              m.x = player.x + (Math.random() - 0.5) * 2000;
              m.y = player.y + (Math.random() - 0.5) * 2000;
              m.hp = m.maxHp;
              m.deadTime = 0;
              (m as any).emergeTimer = 1.8;
              (m as any).emergeDuration = 1.8;
              m.isJumping = false;
              m.jumpProgress = 0;
              m.jumpCooldown = 3 + Math.random() * 3;
            }
          }
        } else {
          m.angle = Math.atan2(player.y - m.y, player.x - m.x);
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // Zombie - Van Collision
        const zDistVan = Math.hypot(m.x - VAN_X, m.y - VAN_Y);
        if (zDistVan < VAN_RADIUS) {
            const angle = Math.atan2(m.y - VAN_Y, m.x - VAN_X);
            m.x = VAN_X + Math.cos(angle) * VAN_RADIUS;
            m.y = VAN_Y + Math.sin(angle) * VAN_RADIUS;
        }

        m.vx *= 0.9;
        m.vy *= 0.9;
      }

      // Physics collision between mannequins
      for (let i = 0; i < mannequins.length; i++) {
        const mA = mannequins[i];
        if (mA.hp <= 0) continue;
        for (let j = i + 1; j < mannequins.length; j++) {
          const mB = mannequins[j];
          if (mB.hp <= 0) continue;

          const mDx = mB.x - mA.x;
          const mDy = mB.y - mA.y;
          const mDist = Math.hypot(mDx, mDy);
          const minDist = (mA.isBoss ? 35 : 20) + (mB.isBoss ? 35 : 20);

          if (mDist < minDist && mDist > 0) {
            const overlap = minDist - mDist;
            const pushX = (mDx / mDist) * overlap * 0.5;
            const pushY = (mDy / mDist) * overlap * 0.5;
            const totalMass = (mA.isBoss ? 10 : 1) + (mB.isBoss ? 10 : 1);
            const massRatioA = (mB.isBoss ? 10 : 1) / totalMass;
            const massRatioB = (mA.isBoss ? 10 : 1) / totalMass;

            mA.x -= pushX * massRatioA * 2;
            mA.y -= pushY * massRatioA * 2;
            mB.x += pushX * massRatioB * 2;
            mB.y += pushY * massRatioB * 2;
          }
        }
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        // Homing logic for ATIRADOR red energy projectiles
        if ((b as any).isHoming && !player.isDead) {
          const targetAngle = Math.atan2(player.y - b.y, player.x - b.x);
          let currentAngle = Math.atan2(b.vy, b.vx);
          
          let diff = targetAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          
          const maxTurn = 3.8 * dt; // Turn speed in rads/sec
          currentAngle += Math.max(-maxTurn, Math.min(maxTurn, diff));
          
          const speed = Math.hypot(b.vx, b.vy);
          b.vx = Math.cos(currentAngle) * speed;
          b.vy = Math.sin(currentAngle) * speed;

          // Spawn beautiful red particle trailing effects
          if (Math.random() < 0.45) {
            particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 60 - b.vx * 0.15,
              vy: (Math.random() - 0.5) * 60 - b.vy * 0.15,
              life: Math.random() * 0.4 + 0.2,
              color: Math.random() < 0.3 ? "#ffffff" : "rgba(255, 30, 30, 0.85)",
              size: Math.random() * 3.5 + 1.5,
            });
          }
        }

        if ((b as any).lateralDrift && !b.isEnemyBullet) {
          const bAngle = Math.atan2(b.vy, b.vx);
          const driftMultiplier = Math.max(0.1, b.life / 1.5);
          b.vx += -Math.sin(bAngle) * (b as any).lateralDrift * dt * 3.8 * driftMultiplier;
          b.vy += Math.cos(bAngle) * (b as any).lateralDrift * dt * 3.8 * driftMultiplier;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if ((b as any).isEnemyBullet) {
          b.z = 24 + Math.sin(time * 8 + b.x * 0.05) * 6; // hovering motion
          b.vz = 0;
        } else {
          b.z += b.vz * dt;
          const gravityStrength = b.weaponType === "rifle" ? 10 : 300;
          b.vz -= gravityStrength * dt; // gravity
        }
        b.life -= dt;

        // Bullet vs Bullet collision (dynamic mini explosion)
        let collidedWithBullet = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (i === j) continue;
          const otherB = bullets[j];
          if ((b as any).isEnemyBullet !== (otherB as any).isEnemyBullet) {
            const distB = Math.hypot(b.x - otherB.x, b.y - otherB.y);
            // Collision radius for bullets
            if (distB < 35) {
              collidedWithBullet = true;
              
              // Spark effects (Mini Explosion)
              for (let k = 0; k < 18; k++) {
                particles.push({
                  x: b.x + (Math.random() - 0.5) * 15,
                  y: b.y + (Math.random() - 0.5) * 15,
                  vx: (Math.random() - 0.5) * 250,
                  vy: (Math.random() - 0.5) * 250,
                  life: 0.3 + Math.random() * 0.5,
                  color: Math.random() > 0.5 ? "#ef4444" : "#fbbf24",
                  size: 3 + Math.random() * 5
                });
              }
              SoundManager.playSound("headshot", 0.4); // metallic impact
              
              // Remove the other bullet
              bullets.splice(j, 1);
              if (j < i) i--;
              break;
            }
          }
        }
        
        if (collidedWithBullet) {
          bullets.splice(i, 1);
          continue;
        }

        // Enemy bullet hits player or other zombies (friendly fire)
        if ((b as any).isEnemyBullet) {
          const dpToPlayer = Math.hypot(b.x - player.x, b.y - player.y);
          if (dpToPlayer < 28 && !player.isDead && !player.isRolling) {
            player.hp -= 40;
            screenShakeStr = Math.max(screenShakeStr, 35);
            playerDamageFlash = 1.0;
            damageTexts.push({ x: player.x, y: player.y - 40, value: 40, vx: (Math.random()-0.5)*50, vy: -80, life: 1.2, type: "player_damage" });
            bullets.splice(i, 1);
            continue;
          }

          // Friendly fire between zombies
          let hitZombie = false;
          for (const m of mannequins) {
            if (m.hp > 0) {
              const distToZ = Math.hypot(b.x - m.x, b.y - m.y);
              const hitRadius = m.isBoss ? 55 : 28;
              // Add a threshold (distToZ > 25) so shooters don't hit themselves instantly
              if (distToZ < hitRadius && distToZ > 25) {
                m.hp -= 30; // Deal damage
                m.hitTime = 0.15;

                damageTexts.push({
                  x: m.x,
                  y: m.y - 35,
                  value: 30,
                  vx: (Math.random() - 0.5) * 60,
                  vy: -70,
                  life: 1.0,
                  type: "friendly_fire"
                });

                // Spawn blood particles
                for (let k = 0; k < 4; k++) {
                  pushBloodDrop({
                    x: m.x,
                    y: m.y,
                    z: 15,
                    vx: (Math.random() - 0.5) * 200,
                    vy: (Math.random() - 0.5) * 200,
                    vz: 100 + Math.random() * 80,
                    size: Math.random() * 3 + 2,
                    color: "rgba(220, 20, 20, 0.8)"
                  });
                }

                bullets.splice(i, 1);
                hitZombie = true;
                break;
              }
            }
          }
          if (hitZombie) continue;

          if (b.life <= 0) { bullets.splice(i, 1); continue; }
          continue; // skip normal zombie collision
        }

        // Bullet - Van Collision
        if (b.dmgMult > 0.1) {
          const bDistVan = Math.hypot(b.x - VAN_X, b.y - VAN_Y);
          if (bDistVan < VAN_RADIUS) {
              const normalX = (b.x - VAN_X) / bDistVan;
              const normalY = (b.y - VAN_Y) / bDistVan;
              const dot = b.vx * normalX + b.vy * normalY;
              
              b.vx = (b.vx - 2 * dot * normalX) * 0.15;
              b.vy = (b.vy - 2 * dot * normalY) * 0.15;
              b.dmgMult = 0.05; // Dead bullet
              
              for (let k = 0; k < 6; k++) {
                particles.push({
                  x: b.x,
                  y: b.y,
                  vx: normalX * (Math.random() * 200 + 100) + (Math.random()-0.5)*150,
                  vy: normalY * (Math.random() * 200 + 100) + (Math.random()-0.5)*150,
                  life: Math.random() * 0.2 + 0.1,
                  color: "#facc15",
                  size: Math.random() * 3 + 1,
                });
              }
          }
        }

        let destroyed = false;
        for (const m of mannequins) {
          if (m.hp > 0 && !b.hitEntityIds.includes(m.id)) {
            const hitRadius = m.isBoss ? 70 : 35;

            const prevX = b.x - b.vx * dt;
            const prevY = b.y - b.vy * dt;
            const dx = b.vx * dt;
            const dy = b.vy * dt;
            const l2 = dx * dx + dy * dy;
            let t = 0;
            if (l2 > 0) t = ((m.x - prevX) * dx + (m.y - prevY) * dy) / l2;
            t = Math.max(0, Math.min(1, t));
            const closestX = prevX + t * dx;
            const closestY = prevY + t * dy;
            const minDist = Math.hypot(closestX - m.x, closestY - m.y);

            if (minDist < hitRadius) {
              b.hitEntityIds.push(m.id);

              if (b.isRocket) {
                explodeRocket(b.x, b.y);
                destroyed = true;
                break;
              }

              const activeStatsObj = WEAPONS_DETAILS[b.weaponType || "gun"];
              const customStatsDmg = activeStatsObj
                ? activeStatsObj.damage
                : 25;
              const bUpgrades = b.weaponType && (upgradesRef.current as any)[b.weaponType]
                ? (upgradesRef.current as any)[b.weaponType]
                : { damage: 0 };
              const charDmgMult = (skinRef.current?.stats?.preferredWeapon === b.weaponType) ? (skinRef.current?.stats?.damage || 1.0) : 1.0;
              const baseDmg = (b.isFury ? customStatsDmg * 2.5 : customStatsDmg) * (1.0 + bUpgrades.damage * 0.15) * charDmgMult;
              const playerDist = Math.hypot(m.x - player.x, m.y - player.y);

              // Double damage up close
              const distMult =
                playerDist < 100 ? 2 : playerDist < 200 ? 1.5 : 1;

              const headRadius = m.isBoss ? 15 : 6;
              const isCrit = minDist < headRadius;

              if (waveRef.current.mode && waveRef.current.active) {
                waveRef.current.waveHits++;
                if (isCrit) {
                  waveRef.current.waveHeadshots++;
                }
              }

              let dmg = baseDmg * distMult * b.dmgMult;

              if (isCrit) {
                dmg *= 3; // Crit multiplier
                if (!m.isBoss) dmg = m.hp + 100; // Instakill normal zombies on headshot
                SoundManager.playSound("headshot", 0.35);
              } else {
                SoundManager.playSound("zombieShoot", 0.25);
              }

              const finalDmg = m.isBoss ? dmg * 0.5 : dmg;
              m.hp -= finalDmg;
              if (waveRef.current.mode && waveRef.current.active) {
                waveRef.current.waveDamage += Math.round(finalDmg);
              }

              m.hitTime = b.weaponType === "rifle" ? 1.2 : 0.3;
              player.hitMarkerTime = 0.2;

              m.vx += b.vx * 0.05;
              m.vy += b.vy * 0.05;

              if (b.penetrationCount !== undefined) {
                b.penetrationCount--;
                if (b.penetrationCount > 0) {
                  b.dmgMult *= 0.85; // Mantém dano para os próximos
                } else {
                  b.vx *= 0.3;
                  b.vy *= 0.3;
                  b.dmgMult *= 0.4;
                  b.life = Math.min(b.life, 0.05);
                }
              } else {
                b.vx *= 0.3;
                b.vy *= 0.3;
                b.dmgMult *= 0.4;
                b.life = Math.min(b.life, 0.05);
              }

              if (b.dmgMult < 0.1) {
                destroyed = true;
              }

              const isInstakillHeadshot = isCrit && !m.isBoss && m.hp <= 0;
              
              if (isInstakillHeadshot) {
                if (b.headshotsCount === undefined) b.headshotsCount = 0;
                b.headshotsCount++;
              }

              let extraTextValue: string | number = isCrit ? "HEADSHOT" : Math.floor(dmg);
              let extraLife = 1.0;
              let isSpecialMulti = false;

              if (b.headshotsCount === 2 && isInstakillHeadshot) {
                extraTextValue = "DOUBLE HEADSHOT!";
                extraLife = 2.0;
                screenShakeStr = Math.max(screenShakeStr, 50);
                playerDamageFlash = Math.max(playerDamageFlash, 0.8);
                isSpecialMulti = true;
              } else if (b.headshotsCount === 3 && isInstakillHeadshot) {
                extraTextValue = "TRIPLE PENETRATION!!!";
                extraLife = 3.0;
                screenShakeStr = Math.max(screenShakeStr, 80);
                playerDamageFlash = Math.max(playerDamageFlash, 1.0);
                isSpecialMulti = true;
              }

              if (!isInstakillHeadshot || isSpecialMulti) {
                damageTexts.push({
                  x: m.x + (Math.random() - 0.5) * 20,
                  y: m.y - 20,
                  value: extraTextValue,
                  vx: isCrit ? 0 : (Math.random() - 0.5) * 100,
                  vy: isCrit ? -250 : -150 - Math.random() * 100,
                  life: extraLife,
                  type: isCrit ? "crit" : "damage",
                  themeColor: b.themeColor,
                  isTrainingDummy: m.isTrainingDummy,
                });
              }

              if (isInstakillHeadshot) {
                screenShakeStr = Math.max(screenShakeStr, 35); // Dramatic impact
                
                const tColor = b.themeColor || "#ff0000";
                // Checa se a cor é especial (diferente da cor da arma padrão que normalmente é o verde esmeralda ou não possui skin equipada)
                const isSpecialSkin = b.themeColor && b.themeColor !== "#10b981" && b.themeColor !== "#ffffff";

                if (isSpecialSkin) {
                   // Efeito visual muito mais forte com a cor da skin (explosão de estilo)
                   for (let i = 0; i < 30; i++) {
                     particles.push({
                       x: m.x,
                       y: m.y - 30,
                       vx: (Math.random() - 0.5) * 800,
                       vy: (Math.random() - 0.5) * 800,
                       life: 1.0 + Math.random(),
                       color: tColor,
                       size: 3 + Math.random() * 5,
                     });
                   }
                }

                // Extra head explode gore & brain matter (massively boosted upward cinematic velocities!)
                for (let i = 0; i < 45; i++) {
                  pushBloodDrop({
                    x: m.x,
                    y: m.y,
                    z: 20 + Math.random() * 20,
                    vx: (Math.random() - 0.5) * 2200,
                    vy: (Math.random() - 0.5) * 2200,
                    vz: 700 + Math.random() * 1100, // Launches extremely high up!
                    size: 3.0 + Math.random() * 4.5,
                    color: Math.random() > 0.35 ? "#ef4444" : "#7f1d1d",
                  });
                }
                
                // Bone/Skull/Meat fragments
                for (let i = 0; i < 9; i++) {
                  pushGib({
                    x: m.x,
                    y: m.y,
                    z: 25,
                    vx: (Math.random() - 0.5) * 1100,
                    vy: (Math.random() - 0.5) * 1100,
                    vz: 500 + Math.random() * 800, // Boosted vertical projection
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 50,
                    size: 7 + Math.random() * 10,
                    life: 2.2 + Math.random() * 3.5,
                  });
                }
                
                damageTexts.push({
                  x: m.x + (Math.random() - 0.5) * 20,
                  y: m.y - 60,
                  value: isSpecialSkin ? "ESTILO HEADSHOT" : "FATAL HEADSHOT",
                  themeColor: isSpecialSkin ? tColor : "#ff0000",
                  vx: 0,
                  vy: -400,
                  life: 2.0,
                  type: "crit",
                });
                
                // Spawn bonus fury souls for headshot
                for (let i = 0; i < 3; i++) {
                  furySouls.push({
                    x: m.x + (Math.random() - 0.5) * 20,
                    y: m.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 400,
                    vy: -200 - Math.random() * 200,
                    life: 0,
                  });
                }
              }

              const splatterForce =
                Math.max(1, 200 / Math.max(playerDist, 30)) * 0.3;

              for (let j = 0; j < 4; j++) {
                particles.push({
                  x: b.x,
                  y: b.y,
                  vx:
                    (b.vx * 0.05 + (Math.random() - 0.5) * 150) * splatterForce,
                  vy:
                    (b.vy * 0.05 + (Math.random() - 0.5) * 150) * splatterForce,
                  life: 0.1 + Math.random() * 0.1,
                  color: "#fff",
                  size: Math.random() * 3 + 1,
                });
              }

              // Gore effects
              for (let j = 0; j < 25; j++) {
                pushBloodDrop({
                  x: m.x,
                  y: m.y,
                  z: 10 + Math.random() * 20,
                  vx:
                    (b.vx * 0.5 + (Math.random() - 0.5) * 500) * splatterForce,
                  vy:
                    (b.vy * 0.5 + (Math.random() - 0.5) * 500) * splatterForce,
                  vz: (150 + Math.random() * 250) * splatterForce,
                  size: 3 + Math.random() * 5,
                  color: Math.random() > 0.4 ? "#4a0000" : "#6b0000",
                });
              }

              // Immediate blood pool on the ground
              for (let j = 0; j < 6; j++) {
                pushBloodDecal({
                  x:
                    m.x +
                    b.vx * 0.02 * splatterForce +
                    (Math.random() - 0.5) * 30 * splatterForce,
                  y:
                    m.y +
                    b.vy * 0.02 * splatterForce +
                    (Math.random() - 0.5) * 30 * splatterForce,
                  size: 15 + Math.random() * 25,
                  alpha: 0.6 + Math.random() * 0.4,
                  angle: Math.random() * Math.PI * 2,
                  stretch: 1 + Math.random() * 1.5 * splatterForce,
                  type: "blood",
                  timer: 0,
                });
              }
              if (bloodDecals.length > 2000)
                bloodDecals.splice(0, bloodDecals.length - 2000);

              if (m.hp <= 0) {
                onZombieDeath(m);

                // Spawn Gibs
                for (let j = 0; j < 8; j++) {
                  pushGib({
                    x: m.x + (Math.random() - 0.5) * 20,
                    y: m.y + (Math.random() - 0.5) * 20,
                    z: 10 + Math.random() * 30,
                    vx: b.vx * 0.06 + (Math.random() - 0.5) * 300,
                    vy: b.vy * 0.06 + (Math.random() - 0.5) * 300,
                    vz: 70 + Math.random() * 150,
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 20,
                    size: 8 + Math.random() * 12,
                    life: 3 + Math.random() * 4,
                  });
                }

                // Check if player gets dirty with blood
                const distToPlayer = Math.hypot(m.x - player.x, m.y - player.y);
                if (distToPlayer < 120) {
                  player.bloodAmount = Math.min(
                    (player.bloodAmount || 0) + 0.3,
                    1.0,
                  );
                }

                // Huge blood explosion
                for (let j = 0; j < 40; j++) {
                  pushBloodDrop({
                    x: m.x,
                    y: m.y,
                    z: 10 + Math.random() * 20,
                    vx: b.vx * 0.7 + (Math.random() - 0.5) * 800,
                    vy: b.vy * 0.7 + (Math.random() - 0.5) * 800,
                    vz: 150 + Math.random() * 300,
                    size: 4 + Math.random() * 6,
                    color: Math.random() > 0.4 ? "#ff0000" : "#8b0000",
                  });
                }
                // Moderate blood pool
                for (let j = 0; j < 6; j++) {
                  pushBloodDecal({
                    x: m.x + (Math.random() - 0.5) * 40,
                    y: m.y + (Math.random() - 0.5) * 40,
                    size: 20 + Math.random() * 30,
                    alpha: 0.7 + Math.random() * 0.3,
                    angle: Math.random() * Math.PI * 2,
                    stretch: 1 + Math.random() * 1.5,
                    type: "blood",
                    timer: 0,
                  });
                }
              }

              if (destroyed) break;
            }
          }
        }
        if (destroyed) {
          bullets.splice(i, 1);
          if (screenShakeStr < 2) screenShakeStr = 2;
          continue;
        }

        if (b.z <= 0) {
          if (b.isRocket) {
            explodeRocket(b.x, b.y);
          } else {
            // puff of dust
            for (let k = 0; k < 3; k++) {
              particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 40,
                vy: (Math.random() - 0.5) * 40,
                life: 0.3 + Math.random() * 0.2,
                color: "rgba(200, 200, 200, 0.5)",
                size: 2 + Math.random() * 3,
                isSmoke: true,
              });
            }
          }
          bullets.splice(i, 1);
          continue;
        }

        if (b.life <= 0) {
          if (b.isRocket) {
            explodeRocket(b.x, b.y);
          }
          bullets.splice(i, 1);
          continue;
        }
      }

      // 6. Update Shells (Physics)
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];

        // Basic Shell-to-Shell collision so they don't pile up perfectly
        for (let j = i - 1; j >= 0; j--) {
          const s2 = shells[j];
          if (Math.abs(s.z - s2.z) < 10) {
            const dx = s.x - s2.x;
            const dy = s.y - s2.y;
            const distSq = dx * dx + dy * dy;
            // Treat shells as having a rough radius of 3 (distSq 36)
            if (distSq > 0.1 && distSq < 36) {
              const dist = Math.sqrt(distSq);
              const overlap = 6 - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              s.x += nx * overlap * 0.5;
              s.y += ny * overlap * 0.5;
              s2.x -= nx * overlap * 0.5;
              s2.y -= ny * overlap * 0.5;

              s.vx += nx * 5;
              s.vy += ny * 5;
              s2.vx -= nx * 5;
              s2.vy -= ny * 5;
            }
          }
        }

        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.z += s.vz * dt;
        s.vz -= 600 * dt; // gravity
        s.angle += s.rotSpeed * dt;

        if (s.z <= 0) {
          s.z = 0;
          s.vz *= -0.5;
          s.vx *= 0.6;
          s.vy *= 0.6;
          s.rotSpeed *= 0.5;
          if (Math.abs(s.vz) < 10) s.vz = 0;

          const dist = Math.hypot(player.x - s.x, player.y - s.y);
          if (dist < 35 && player.isMoving) {
            const kickAngle =
              Math.atan2(s.y - player.y, s.x - player.x) +
              (Math.random() - 0.5);
            const kickForce = (35 - dist) * 12;
            s.vx += Math.cos(kickAngle) * kickForce;
            s.vy += Math.sin(kickAngle) * kickForce;
            if (s.vz === 0) s.vz += 40 + Math.random() * 60;
            s.rotSpeed += (Math.random() - 0.5) * 50;
          }
        } else {
          s.vx *= 0.98;
          s.vy *= 0.98;
        }

        s.life -= dt;
        if (s.life <= 0) {
          // Play realistic casing drop sound on landing!
          const dx = s.x - player.x;
          const dy = s.y - player.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 700;
          if (dist < maxDist) {
            const vol = Math.max(0, 1.0 - dist / maxDist);
            SoundManager.playCasingDropSound(s.isBazooka, vol);
          }

          shellDecals.push({
            x: s.x,
            y: s.y,
            angle: s.angle,
            timer: s.isKicked ? 10 : 0,
            isBazooka: s.isBazooka,
            isKicked: s.isKicked,
            themeColor: s.themeColor,
          });
          const maxShellDecals = isMobileDevice ? 80 : 200;
          if (shellDecals.length > maxShellDecals) {
            shellDecals.splice(0, shellDecals.length - maxShellDecals);
          }
          shells.splice(i, 1);
        }
      }

      // --- Player Shell Decals Collision (Kicking ground casings) ---
      const px = player.x;
      const py = player.y;
      for (let i = shellDecals.length - 1; i >= 0; i--) {
        const sd = shellDecals[i];
        const dx = px - sd.x;
        const dy = py - sd.y;
        const distSq = dx * dx + dy * dy;
        const collRadius = sd.isBazooka ? 36 : 26; // Bazooka casing is larger
        if (distSq < collRadius * collRadius) {
          const dist = Math.sqrt(distSq);
          // Convert back to active bouncing shell
          const kickAngle = Math.atan2(sd.y - py, sd.x - px) + (Math.random() - 0.5) * 0.7;
          const kickForce = (collRadius - dist) * 7.5 + 25;
          
          pushShell({
            x: sd.x,
            y: sd.y,
            z: 2.0,
            vx: Math.cos(kickAngle) * kickForce + player.vx * 0.25,
            vy: Math.sin(kickAngle) * kickForce + player.vy * 0.25,
            vz: sd.isBazooka ? 50 + Math.random() * 60 : 35 + Math.random() * 45,
            angle: sd.angle,
            rotSpeed: (Math.random() - 0.5) * 50,
            life: sd.isBazooka ? 7.0 : 3.5, // slightly shorter life after kick
            isBazooka: sd.isBazooka,
            themeColor: sd.themeColor,
            isKicked: true,
          });
          shellDecals.splice(i, 1);
        }
      }

      // Update Health Orbs
      for (let i = healthOrbs.length - 1; i >= 0; i--) {
        const orb = healthOrbs[i];
        orb.x += orb.vx * dt;
        orb.y += orb.vy * dt;
        orb.vx *= 0.9;
        orb.vy *= 0.9;
        orb.life -= dt;

        const distToPlayer = Math.hypot(player.x - orb.x, player.y - orb.y);

        // Magnet effect (Increased range and acceleration curve for satisfaction)
        if (distToPlayer < 240) {
          const force = (1.0 - distToPlayer / 240) * 4000 + 1200;
          orb.vx += ((player.x - orb.x) / distToPlayer) * force * dt;
          orb.vy += ((player.y - orb.y) / distToPlayer) * force * dt;

          // Spawn sparkling trail particles
          if (Math.random() < 0.45) {
            particles.push({
              x: orb.x,
              y: orb.y,
              vx: -orb.vx * 0.15 + (Math.random() - 0.5) * 40,
              vy: -orb.vy * 0.15 + (Math.random() - 0.5) * 40,
              life: 0.4 + Math.random() * 0.4,
              color: Math.random() > 0.45 ? "#34d399" : "#a7f3d0", // sparkling emerald/mint greens
              size: 2.2 + Math.random() * 2.5,
            });
          }
        }

        if (distToPlayer < 25) {
          // Collect
          player.hp = Math.min(player.maxHp, player.hp + 15);
          player.healthGlowTimer = 0.6;
          SoundManager.playSound("heart", 0.85);

          // Screen shake for satisfaction
          camera.x += (Math.random() - 0.5) * 15;
          camera.y += (Math.random() - 0.5) * 15;

          // Add shiny particles
          for (let k = 0; k < 35; k++) {
            particles.push({
              x: player.x + (Math.random() - 0.5) * 30,
              y: player.y - 20,
              vx: (Math.random() - 0.5) * 250,
              vy: -200 - Math.random() * 450,
              life: 0.8 + Math.random() * 1.0,
              color: Math.random() > 0.3 ? "#ff3333" : "#ffffff",
              size: 2 + Math.random() * 7,
            });
          }

          damageTexts.push({
            x: player.x,
            y: player.y - 40,
            value: 15,
            vx: (Math.random() - 0.5) * 50,
            vy: -100 - Math.random() * 50,
            life: 1.5,
            type: "heal",
          });

          healthOrbs.splice(i, 1);
          continue;
        }

        if (orb.life <= 0) {
          healthOrbs.splice(i, 1);
        }
      }

      // Update Upgrade Energy Orbs
      for (let i = upgradeEnergyOrbs.length - 1; i >= 0; i--) {
        const orb = upgradeEnergyOrbs[i];
        orb.x += orb.vx * dt;
        orb.y += orb.vy * dt;
        
        // 3D physics simulation
        if (orb.z === undefined) orb.z = 0;
        if (orb.vz === undefined) orb.vz = 0;
        if (orb.bounceCount === undefined) orb.bounceCount = 0;
        
        orb.z += orb.vz * dt;
        orb.vz -= 650 * dt; // Gravity
        
        // Bouncing on the floor
        if (orb.z <= 0) {
          orb.z = 0;
          if (orb.bounceCount < 3) {
            orb.vz = -orb.vz * 0.55; // Bouncing elasticity
            orb.vx *= 0.6; // Ground friction
            orb.vy *= 0.6;
            orb.bounceCount++;
          } else {
            orb.vz = 0;
            orb.vx = 0;
            orb.vy = 0;
          }
        }
        
        orb.vx *= 0.96;
        orb.vy *= 0.96;
        orb.life -= dt;

        const distToPlayer = Math.hypot(player.x - orb.x, player.y - orb.y);

        // Clamped magnetism (must be close to start collecting)
        const magnetRange = 250;
        if (distToPlayer < magnetRange) {
          const force = (1.0 - distToPlayer / magnetRange) * 8000 + 3000;
          orb.vx += ((player.x - orb.x) / distToPlayer) * force * dt;
          orb.vy += ((player.y - orb.y) / distToPlayer) * force * dt;

          if (Math.random() < 0.5) {
            particles.push({
              x: orb.x,
              y: orb.y - orb.z, // Translate particle relative to z
              vx: -orb.vx * 0.1 + (Math.random() - 0.5) * 20,
              vy: -orb.vy * 0.1 + (Math.random() - 0.5) * 20,
              life: 0.3 + Math.random() * 0.3,
              color: Math.random() > 0.5 ? "#60a5fa" : "#93c5fd", // Blueish energy
              size: 2.0 + Math.random() * 2.0,
            });
          }
        }

        if (distToPlayer < 25) {
          // Collect
          setCredits((prev) => prev + 2); // Gives 2 credits per orb
          SoundManager.playUpgradeCollectSound();

          // Add shiny particles
          for (let k = 0; k < 20; k++) {
            particles.push({
              x: player.x + (Math.random() - 0.5) * 30,
              y: player.y - 20,
              vx: (Math.random() - 0.5) * 200,
              vy: -150 - Math.random() * 300,
              life: 0.6 + Math.random() * 0.8,
              color: Math.random() > 0.4 ? "#3b82f6" : "#60a5fa",
              size: 2 + Math.random() * 4,
            });
          }

          damageTexts.push({
            x: player.x,
            y: player.y - 40,
            value: "+2 UP",
            vx: (Math.random() - 0.5) * 30,
            vy: -80 - Math.random() * 30,
            life: 1.2,
            type: "heal",
            themeColor: "#60a5fa"
          });

          upgradeEnergyOrbs.splice(i, 1);
          continue;
        }

        if (orb.life <= 0) {
          upgradeEnergyOrbs.splice(i, 1);
        }
      }

      // 7. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.isSmoke) {
          p.size += dt * 15;
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else {
          p.vx *= 0.9;
          p.vy *= 0.9;
        }
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update Explosion Flashes
      for (let i = explosionFlashes.length - 1; i >= 0; i--) {
        explosionFlashes[i].life -= dt;
        if (explosionFlashes[i].life <= 0) explosionFlashes.splice(i, 1);
      }

      // Update Blood Drops
      for (let i = bloodDrops.length - 1; i >= 0; i--) {
        const drop = bloodDrops[i];
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
        drop.z += drop.vz * dt;
        drop.vz -= 1200 * dt; // gravity

        if (drop.z <= 0) {
          pushBloodDecal({
            x: drop.x,
            y: drop.y,
            size: drop.size * (1 + Math.random()),
            alpha: 0.6 + Math.random() * 0.4,
            angle: Math.atan2(drop.vy, drop.vx),
            stretch: 1 + Math.hypot(drop.vx, drop.vy) / 150,
            type: "blood",
            timer: 0,
          });
          if (bloodDecals.length > 1000) bloodDecals.shift();
          bloodDrops.splice(i, 1);
        }
      }

      // Update Fury Souls
      for (let i = furySouls.length - 1; i >= 0; i--) {
        const s = furySouls[i];
        s.life += dt;

        // Target is top left of the screen (where the fury bar is)
        const targetX =
          camera.x - logicalWidth / 2 / camera.zoom + 100 / camera.zoom;
        const targetY =
          camera.y - logicalHeight / 2 / camera.zoom + 100 / camera.zoom;

        const distX = targetX - s.x;
        const distY = targetY - s.y;
        const dist = Math.hypot(distX, distY);

        if (s.life > 0.5) {
          // High acceleration to target
          s.vx += (distX / dist) * 4500 * dt;
          s.vy += (distY / dist) * 4500 * dt;
          s.vx *= 0.92; // some drag
          s.vy *= 0.92;
        } else {
          // Initial velocity slow down
          s.vx *= 0.95;
          s.vy *= 0.95;
        }

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.life > 0.5 && dist < 60) {
          furySouls.splice(i, 1);
          player.furyKills++;
          if (player.furyKills >= 100 && player.furyTimer <= 0) {
            player.furyTimer = 8;
            player.furyKills = 0;
            screenShakeStr = 30;
            player.healthGlowTimer = 0.5;
          }
          // visual flash on UI
          const uiFuryFill = document.getElementById("ui-fury-fill");
          if (uiFuryFill) {
            uiFuryFill.style.backgroundColor = "#ffffff";
            uiFuryFill.style.boxShadow = "0 0 20px #ffffff";
            setTimeout(() => {
              if (uiFuryFill) {
                uiFuryFill.style.backgroundColor = "";
                uiFuryFill.style.boxShadow = "";
              }
            }, 100);
          }
          const uiMainBox = document.getElementById("ui-player-main-box");
          if (uiMainBox) {
            if (player.furyTimer > 0) {
              uiMainBox.style.boxShadow = "0 0 80px rgba(255, 0, 0, 1.0)";
              uiMainBox.style.borderColor = "#ff0000";
            } else {
              uiMainBox.style.boxShadow = "0 0 40px rgba(255, 60, 0, 0.6)";
            }
            setTimeout(() => {
              if (uiMainBox) {
                uiMainBox.style.boxShadow = "";
                uiMainBox.style.borderColor = "";
              }
            }, 150);
          }
        }
      }

      // Update Gibs
      for (let i = gibs.length - 1; i >= 0; i--) {
        const g = gibs[i];
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.z += g.vz * dt;
        g.vz -= 800 * dt;
        g.angle += g.rotSpeed * dt;

        if (g.z <= 0) {
          g.z = 0;
          g.vz *= -0.4;
          g.vx *= 0.5;
          g.vy *= 0.5;
          g.rotSpeed *= 0.5;
          if (Math.abs(g.vz) < 20) g.vz = 0;
        }

        g.life -= dt;
        if (g.life <= 0) {
          pushBloodDecal({
            x: g.x,
            y: g.y,
            size: g.size * 2.5,
            alpha: 0.7,
            angle: g.angle,
            stretch: 1,
            type: "blood",
            timer: 0,
          });
          pushBloodDecal({
            x: g.x,
            y: g.y,
            size: g.size,
            alpha: 1.0,
            angle: g.angle,
            stretch: 1,
            type: "meat",
            timer: 0,
          });
          if (bloodDecals.length > 1000)
            bloodDecals.splice(0, bloodDecals.length - 1000);
          gibs.splice(i, 1);
        }
      }

      // Update blood decals timer and rise smoke
      for (const d of bloodDecals) {
        if (d.timer < 60) d.timer += dt;
        if (d.type === "charred" && d.timer < 10) {
          if (Math.random() < 3.2 * dt) {
            particles.push({
              x: d.x + (Math.random() - 0.5) * (d.size * 0.45),
              y: d.y + (Math.random() - 0.5) * (d.size * 0.45),
              vx: (Math.random() - 0.5) * 15,
              vy: -15 - Math.random() * 25,
              life: 0.8 + Math.random() * 1.2,
              color:
                Math.random() > 0.5
                  ? "rgba(75, 75, 75, 0.05)"
                  : "rgba(105, 105, 105, 0.04)",
              size: 4 + Math.random() * 8,
              isSmoke: true,
            });
          }
        }
      }

      // Update shell decals timer
      for (const s of shellDecals) {
        if (s.timer < 10) s.timer += dt;
      }

      // 8. Update Damage Texts
      for (let i = damageTexts.length - 1; i >= 0; i--) {
        const t = damageTexts[i];
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.vy += 600 * dt; // Gravity effect pulling numbers down
        t.life -= dt;
        if (t.life <= 0) damageTexts.splice(i, 1);
      }

      if (playerDamageFlash > 0) {
        playerDamageFlash -= dt * 2;
        if (playerDamageFlash < 0) playerDamageFlash = 0;
      }
    };

    const explodeRocket = (rx: number, ry: number) => {
      // 1. Heavy Screen Shake
      screenShakeStr = Math.max(screenShakeStr, 60);
      SoundManager.playExplosion();
      SoundManager.playSound("zombieShoot", 0.9); // Add a heavy punchy layer

      // Add dynamic explosion visual particles
      for (let k = 0; k < 60; k++) {
        particles.push({
          x: rx + (Math.random() - 0.5) * 40,
          y: ry + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 600,
          vy: (Math.random() - 0.5) * 600,
          life: 0.5 + Math.random() * 1.5,
          color: Math.random() > 0.6 ? "#fbbf24" : Math.random() > 0.3 ? "#ef4444" : "#450a0a",
          size: 5 + Math.random() * 15
        });
      }
      for (let k = 0; k < 20; k++) {
        particles.push({
          x: rx,
          y: ry,
          vx: (Math.random() - 0.5) * 1200,
          vy: (Math.random() - 0.5) * 1200,
          life: 0.2 + Math.random() * 0.4,
          color: "#ffffff",
          size: 2 + Math.random() * 4
        });
      }

      // 2. Damage all mannequins within explosion radius
      const radius = 220;
      const charDmgMult = (skinRef.current?.stats?.preferredWeapon === "basuca") ? (skinRef.current?.stats?.damage || 1.0) : 1.0;
      const baseDamage = 350 * (1.0 + (upgradesRef.current.basuca?.damage || 0) * 0.15) * charDmgMult;

      for (const m of mannequins) {
        if (m.hp > 0) {
          const dist = Math.hypot(m.x - rx, m.y - ry);
          if (dist < radius) {
            // Damage falls off with distance from epicentre
            const damageFactor = 1.0 - dist / radius;
            const dmg = Math.floor(baseDamage * damageFactor);

            const finalDmg = !m.isBoss ? dmg : dmg * 0.45;
            m.hp -= finalDmg;
            if (waveRef.current.mode && waveRef.current.active) {
              waveRef.current.waveDamage += Math.round(finalDmg);
            }

            m.vx += ((m.x - rx) / (dist || 0.01)) * 1100 * damageFactor;
            m.vy += ((m.y - ry) / (dist || 0.01)) * 1100 * damageFactor;
            m.hitTime = 0.15;
            player.hitMarkerTime = 0.2;

            // Spawn damage numbers
            damageTexts.push({
              x: m.x,
              y: m.y - 30,
              value: dmg,
              vx: (Math.random() - 0.5) * 150,
              vy: -200 - Math.random() * 100,
              life: 1.2,
              type: "damage",
            });

            if (m.hp <= 0) {
              onZombieDeath(m);

              // Massive blood explosion
              for (let j = 0; j < 25; j++) {
                pushBloodDrop({
                  x: m.x,
                  y: m.y,
                  z: 10 + Math.random() * 30,
                  vx:
                    ((m.x - rx) / (dist || 0.1)) * 300 +
                    (Math.random() - 0.5) * 600,
                  vy:
                    ((m.y - ry) / (dist || 0.1)) * 300 +
                    (Math.random() - 0.5) * 600,
                  vz: 180 + Math.random() * 250,
                  size: 4 + Math.random() * 5,
                  color: Math.random() > 0.4 ? "#ff0000" : "#8b0000",
                });
              }
              // Spawn gibs (torn flesh chunks)
              for (let j = 0; j < 5; j++) {
                pushGib({
                  x: m.x,
                  y: m.y,
                  z: 10 + Math.random() * 20,
                  vx:
                    ((m.x - rx) / (dist || 0.1)) * 200 +
                    (Math.random() - 0.5) * 400,
                  vy:
                    ((m.y - ry) / (dist || 0.1)) * 200 +
                    (Math.random() - 0.5) * 400,
                  vz: 80 + Math.random() * 150,
                  angle: Math.random() * Math.PI * 2,
                  rotSpeed: (Math.random() - 0.5) * 20,
                  size: 8 + Math.random() * 10,
                  life: 3 + Math.random() * 2,
                });
              }

              // Blood pools on ground
              pushBloodDecal({
                x: m.x,
                y: m.y,
                size: 35 + Math.random() * 35,
                alpha: 0.8,
                angle: Math.random() * Math.PI * 2,
                stretch: 1.2,
                type: "blood",
                timer: 0,
              });
            }
          }
        }
      }

      // 2.5. Damage player if within explosion radius (bazooka self-damage)
      const distToPlayer = Math.hypot(player.x - rx, player.y - ry);
      if (distToPlayer < radius && !player.isDead) {
        const damageFactor = 1.0 - distToPlayer / radius;
        const playerDmg = Math.floor(180 * damageFactor); // Deals up to 180 dmg at epicentre
        if (!player.isRolling) {
          player.hp -= playerDmg;
          playerDamageFlash = Math.max(playerDamageFlash, 1.2 * damageFactor);
        }
        
        // Push the player away from explosion (knockback)
        const pushForce = 800 * damageFactor;
        const pushAngle = Math.atan2(player.y - ry, player.x - rx);
        player.vx += Math.cos(pushAngle) * pushForce;
        player.vy += Math.sin(pushAngle) * pushForce;

        // Spawn damage floating text for player
        damageTexts.push({
          x: player.x,
          y: player.y - 30,
          value: playerDmg,
          vx: (Math.random() - 0.5) * 100,
          vy: -180 - Math.random() * 80,
          life: 1.2,
          type: "damage",
          themeColor: "#ff3333",
        } as any);

        if (player.hp <= 0 && !player.isDead) {
          player.hp = 0;
          player.isDead = true;
          player.kills = 0;
          player.furyKills = 0;
          // Save credits to global bank on death
          saveGlobalCredits(globalCredits + credits);
          const allSkins = [...new Set([...globalPurchasedSkins, ...inventoryRef.current.purchasedSkins])];
          saveGlobalSkins(allSkins);
          SoundManager.playSound("gameover", 0.9);
          SoundManager.stopBGMusic();
        }
      }

      // 3. Ground decals for charred explosion ring
      for (let k = 0; k < 6; k++) {
        pushBloodDecal({
          x: rx + (Math.random() - 0.5) * 80,
          y: ry + (Math.random() - 0.5) * 80,
          size: 70 + Math.random() * 90,
          alpha: 0.9,
          angle: Math.random() * Math.PI * 2,
          stretch: 1.0,
          type: "charred", // acts as grey charred ground
          timer: 0, // starts at 0 for smoke rising trigger
        });
      }

      // 4. Fire particles
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 450 + 100;
        particles.push({
          x: rx,
          y: ry,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.35 + Math.random() * 0.5,
          color:
            Math.random() > 0.3
              ? "#f97316"
              : Math.random() > 0.5
                ? "#ef4444"
                : "#facc15",
          size: 6 + Math.random() * 10,
        });
      }
      // Heavy gray smoke clouds
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 20;
        particles.push({
          x: rx + (Math.random() - 0.5) * 30,
          y: ry + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.2 + Math.random() * 1.5,
          color:
            Math.random() > 0.4
              ? "rgba(90, 90, 90, 0.16)"
              : "rgba(120, 120, 120, 0.13)",
          size: 16 + Math.random() * 16,
          isSmoke: true,
        });
      }

      // Push the massive light flash for illuminating the area!
      explosionFlashes.push({
        x: rx,
        y: ry,
        size: 550,
        maxLife: 0.5,
        life: 0.5,
        color: "rgba(255, 120, 20, 1.0)",
      });
    };

    const shoot = (wType: string) => {
      const stats = WEAPONS_DETAILS[wType];
      if (!stats) return;

      if (waveRef.current.mode && waveRef.current.active) {
        waveRef.current.waveShots++;
      }

      SoundManager.playShoot(wType);

      player.gunHeat = Math.min(
        10,
        player.gunHeat + (wType === "uzi" ? 0.35 : 1),
      );

      // Increase recoil
      let recoilAdd = player.isRunning ? stats.recoil * 2 : stats.recoil;
      let maxRecoil = player.isRunning
        ? stats.maxRecoil * 1.5
        : stats.maxRecoil;

      if (mouse.rightDown && !player.isMoving) {
        recoilAdd = stats.recoil * 0.25;
        maxRecoil = stats.maxRecoil * 0.25;
      } else if (mouse.rightDown) {
        recoilAdd = stats.recoil * 0.5;
        maxRecoil = stats.maxRecoil * 0.5;
      }

      // Apply stability upgrade
      const wUpgrades = wType && (upgradesRef.current as any)[wType]
        ? (upgradesRef.current as any)[wType]
        : { damage: 0, fireRate: 0, stability: 0, accuracy: 0, capacity: 0, reloadSpeed: 0, range: 0 };
      const stabilityMod = 1.0 + wUpgrades.stability * 0.15;
      recoilAdd /= stabilityMod;
      maxRecoil /= stabilityMod;

      player.recoil = Math.min(maxRecoil, player.recoil + recoilAdd);

      const bTip = getBarrelTip(wType);
      const offsetX =
        Math.cos(player.angle) * bTip.x - Math.sin(player.angle) * bTip.y;
      const offsetY =
        Math.sin(player.angle) * bTip.x + Math.cos(player.angle) * bTip.y;

      const bulletCount = wType === "doze" ? 6 : 1;

      for (let bIdx = 0; bIdx < bulletCount; bIdx++) {
        const accuracyMod = 1.0 + wUpgrades.accuracy * 0.15;
        const weaponSpread = stats.spread / accuracyMod;
        const spread = (Math.random() - 0.5) * (player.recoil / accuracyMod + weaponSpread);

        const bSpeed =
          stats.bulletSpeed +
          (wType === "doze" ? (Math.random() - 0.5) * 180 : 0);
        const bulletVX = Math.cos(player.angle + spread) * bSpeed;
        const bulletVY = Math.sin(player.angle + spread) * bSpeed;

        const shootAngle = player.angle + spread;
        const latVel = -Math.sin(shootAngle) * player.vx + Math.cos(shootAngle) * player.vy;

        const equippedSkinId = inventoryRef.current.equippedSkins[wType];
        const skinDef = WEAPON_SKINS.find(s => s.id === equippedSkinId);
        const tColor = skinRef.current ? skinRef.current.colorMain : (skinDef?.themeColor || "#ff3c3c");

        bullets.push({
          x: player.x + offsetX,
          y: player.y + offsetY,
          z: wType === "basuca" ? 12 : 20,
          vx: bulletVX,
          vy: bulletVY,
          vz: wType === "basuca" ? 0 : -20 - Math.random() * 20,
          life: stats.range * (1.0 + wUpgrades.range * 0.35),
          isFury: player.furyTimer > 0,
          dmgMult: wType === "doze" ? 0.6 : wType === "rifle" ? 1.5 : 1.0,
          hitEntityIds: [],
          penetrationCount: wType === "rifle" ? 3 : 1,
          headshotsCount: 0,
          isRocket: wType === "basuca",
          weaponType: wType,
          lateralDrift: latVel * 0.95,
          themeColor: tColor,
        } as any);
      }

      // Eject Casing
      const isBasuca = wType === "basuca";
      const shellAngle =
        player.angle - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const shellSpeed = isBasuca ? 80 + Math.random() * 40 : 150 + Math.random() * 100;

      const ejectionX = 22;
      const ejectionY = -3;
      const shellOffsetX =
        Math.cos(player.angle) * ejectionX -
        Math.sin(player.angle) * ejectionY;
      const shellOffsetY =
        Math.sin(player.angle) * ejectionX +
        Math.cos(player.angle) * ejectionY;

      const equippedSkinId = inventoryRef.current.equippedSkins[wType];
      const skinDef = WEAPON_SKINS.find(s => s.id === equippedSkinId);
      const tColor = skinDef?.themeColor;

      pushShell({
        x: player.x + shellOffsetX,
        y: player.y + shellOffsetY,
        z: 10,
        vx: Math.cos(shellAngle) * shellSpeed,
        vy: Math.sin(shellAngle) * shellSpeed,
        vz: isBasuca ? 160 + Math.random() * 60 : 100 + Math.random() * 50,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: isBasuca ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 20,
        life: isBasuca ? 12 : 5, // Bazooka shells stay longer
        themeColor: tColor,
        isBazooka: isBasuca,
      });

      muzzleFlash = 1.0;

      const realPush = stats.kickback;
      const kickback =
        mouse.rightDown && !player.isMoving
          ? realPush * 0.35
          : mouse.rightDown
            ? realPush * 0.7
            : realPush;

      player.vx -= Math.cos(player.angle) * kickback * 5;
      player.vy -= Math.sin(player.angle) * kickback * 5;

      player.x -= Math.cos(player.angle) * (kickback * 0.2);
      player.y -= Math.sin(player.angle) * (kickback * 0.2);

      const smokeQty = wType === "basuca" ? 25 : wType === "doze" ? 10 : 5;
      for (let i = 0; i < smokeQty; i++) {
        const pAngle =
          player.angle + (Math.random() - 0.5) * (wType === "doze" ? 1.0 : wType === "basuca" ? 1.5 : 0.6);
        const pSpeed = Math.random() * (wType === "basuca" ? 450 : 250) + 50;
        particles.push({
          x: player.x + offsetX,
          y: player.y + offsetY,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          life: 0.15 + Math.random() * (wType === "basuca" ? 0.45 : 0.2),
          color:
            wType === "basuca"
              ? (Math.random() > 0.35 ? (Math.random() > 0.5 ? "#ff4500" : "#ff8c00") : "#ffffff")
              : (skinRef.current ? (Math.random() > 0.45 ? skinRef.current.colorMain : "#ffffff") : (Math.random() > 0.45 ? "#ffaa00" : "#ffffff")),
          size: Math.random() * (wType === "basuca" ? 6.5 : wType === "doze" ? 4 : 3) + 1,
        });
      }

      screenShakeStr =
        wType === "basuca"
          ? 95
          : wType === "rifle"
            ? 55
            : wType === "magnum"
              ? 35
              : wType === "doze"
                ? 38
                : wType === "gun"
                  ? 14
                  : 10;
    };

    const draw = (dt: number, time: number) => {
      const activeWeapon =
        inventoryRef.current.hotbar[inventoryRef.current.activeSlot];
      const activeStats = activeWeapon ? WEAPONS_DETAILS[activeWeapon] : null;
      const wUpgrades = activeWeapon && upgradesRef.current[activeWeapon]
        ? upgradesRef.current[activeWeapon]
        : { damage: 0, fireRate: 0, stability: 0, accuracy: 0, capacity: 0, reloadSpeed: 0, range: 0 };

      // Update Van Blur Vignette or Aim Depth-of-Field Overlay dynamically
      if (blurOverlayRef.current) {
        const isAiming = !player.isDead && !isShopOpenRef.current && ((mouse.rightDown && isAimEnabledRef.current) || (window as any).mobileAimActive || (window as any).mobileShootActive);
        if (isAiming) {
          const dprVal = canvas.width / window.innerWidth;
          const logicalW = canvas.width / dprVal;
          const logicalH = canvas.height / dprVal;
          const screenCenterX = logicalW / 2;
          const screenCenterY = logicalH / 2;
          
          // Player position on screen
          const playerScreenX = screenCenterX + (player.x - camera.x) * camera.zoom;
          const playerScreenY = screenCenterY + (player.y - camera.y) * camera.zoom;
          
          // Aim target position on screen
          let aimScreenX = playerScreenX + Math.cos(player.angle) * (180 * camera.zoom);
          let aimScreenY = playerScreenY + Math.sin(player.angle) * (180 * camera.zoom);
          
          if (mouse.clientX !== undefined && mouse.clientX !== 0) {
            aimScreenX = mouse.clientX;
            aimScreenY = mouse.clientY;
          }
          
          const blurVal = 2.0;
          blurOverlayRef.current.style.opacity = '1';
          blurOverlayRef.current.style.backdropFilter = `blur(${blurVal}px) brightness(0.65)`;
          
          // CSS Radial Mask: transparent at aim point, black (fully blurred) elsewhere
          const mask = `radial-gradient(circle 260px at ${aimScreenX}px ${aimScreenY}px, transparent 25%, rgba(0, 0, 0, 1) 90%)`;
          blurOverlayRef.current.style.maskImage = mask;
          blurOverlayRef.current.style.webkitMaskImage = mask;
        } else {
          const distToVan = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
          // Apply blur only if not in a cutscene and close to the Van
          if (distToVan < 450 && !cutsceneRef.current.active) {
            const factor = Math.max(0, 1 - (distToVan / 450));
            blurOverlayRef.current.style.opacity = (factor * 0.9).toString();
            blurOverlayRef.current.style.backdropFilter = `blur(${factor * 5}px)`;
            blurOverlayRef.current.style.maskImage = 'none';
            blurOverlayRef.current.style.webkitMaskImage = 'none';
          } else {
            blurOverlayRef.current.style.opacity = '0';
            blurOverlayRef.current.style.backdropFilter = 'blur(0px)';
            blurOverlayRef.current.style.maskImage = 'none';
            blurOverlayRef.current.style.webkitMaskImage = 'none';
          }
        }
      }

      // Clear Screen
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save(); // Save baseline clean state

      // High-DPI support: scale the rendering context and define logical dimensions
      const dpr = canvas.width / window.innerWidth;
      ctx.scale(dpr, dpr);
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.save(); // Save DPR-scaled state (no camera transformations)

      // Apply Camera and Screen Shake and Zoom
      ctx.translate(
        logicalWidth / 2 + screenShakeX,
        logicalHeight / 2 + screenShakeY,
      );
      let totalRotation = 0;
      if (screenShakeStr > 0) {
        totalRotation += Math.sin(Date.now() * 0.08) * screenShakeStr * 0.0006;
      }
      if (cinematicModeRef.current && camera.tilt) {
        totalRotation += camera.tilt;
      }
      if (totalRotation !== 0) {
        ctx.rotate(totalRotation);
      }
      
      ctx.scale(camera.zoom, camera.zoom);
      
      if (cinematicModeRef.current) {
        // Dynamic 3D diagonal tilt (compresses Y and rotates slightly to simulate semi-isometric depth)
        ctx.scale(1.0, 0.94);
        ctx.rotate(-0.02);
      }
      
      let swayX = 0;
      let swayY = 0;
      if (cinematicModeRef.current) {
        if (player.isMoving) {
          // Dynamic walking camera sway
          swayX = Math.sin(player.moveTimer * 9.5) * 5.0;
          swayY = Math.cos(player.moveTimer * 19.0) * 3.5;
        } else {
          // Handheld idle floating sway
          swayX = Math.sin(Date.now() * 0.0012) * 4.5;
          swayY = Math.cos(Date.now() * 0.0008) * 3.5;
        }
      }
      ctx.translate(-camera.x + swayX, -camera.y + swayY);

      // --- Draw Infinite Checkerboard ---
      const viewHalfW = (logicalWidth / 2) / Math.max(0.1, camera.zoom);
      const viewHalfH = (logicalHeight / 2) / Math.max(0.1, camera.zoom);
      const startX =
        Math.floor((camera.x - viewHalfW) / TILE_SIZE) * TILE_SIZE - TILE_SIZE;
      const endX =
        Math.floor((camera.x + viewHalfW) / TILE_SIZE) * TILE_SIZE + TILE_SIZE * 2;
      const startY =
        Math.floor((camera.y - viewHalfH) / TILE_SIZE) * TILE_SIZE - TILE_SIZE;
      const endY =
        Math.floor((camera.y + viewHalfH) / TILE_SIZE) * TILE_SIZE + TILE_SIZE * 2;

      const drawCullPadding = 400;
      const minDrawX = camera.x - viewHalfW - drawCullPadding;
      const maxDrawX = camera.x + viewHalfW + drawCullPadding;
      const minDrawY = camera.y - viewHalfH - drawCullPadding;
      const maxDrawY = camera.y + viewHalfH + drawCullPadding;

      for (let x = startX; x < endX; x += TILE_SIZE) {
        for (let y = startY; y < endY; y += TILE_SIZE) {
          if ((window as any).inTrainingMode) {
            // Check if tile center is inside the training arena
            const cx = x + TILE_SIZE / 2;
            const cy = y + TILE_SIZE / 2;
            const tileInArena = cx >= -5800 && cx <= -4200 && cy >= 4200 && cy <= 5800;
            if (tileInArena) {
              // Uniform professional dark concrete floor (no checkered grid pattern) - slightly lighter
              ctx.fillStyle = "#1b1b1e";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

              // Draw fine noise grain texture for concrete look
              ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
              const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
              for (let g = 0; g < 8; g++) {
                 const gx = x + Math.abs(Math.sin(seed + g) * (TILE_SIZE - 2));
                 const gy = y + Math.abs(Math.cos(seed + g * 2.5) * (TILE_SIZE - 2));
                 ctx.fillRect(gx, gy, 1.5, 1.5);
              }
            } else {
              // Outside arena = pitch black void
              ctx.fillStyle = "#08080c";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
          } else {
            // Procedural organic floor based on the current wave number (cenarios diferentes para cada onda)
            const wNum = wave || 1;
            let r = 34, g = 27, b = 20; // Default sand dunes
            let grainColor = "rgba(220, 180, 110, 0.04)";
            
            if (wNum === 3 || wNum === 4) {
              // Toxic Wasteland: Greenish mossy sand
              const ripple = Math.sin(x * 0.005 + y * 0.0025) * 5;
              r = Math.max(10, Math.floor(22 + ripple * 0.3));
              g = Math.max(18, Math.floor(38 + ripple * 0.5));
              b = Math.max(12, Math.floor(26 + ripple * 0.3));
              grainColor = "rgba(100, 200, 120, 0.06)";
            } else if (wNum === 5 || wNum === 6) {
              // Volcanic Scorched Ash: Dark charcoal grey with heat
              const ripple = Math.sin(x * 0.005 + y * 0.0025) * 4;
              r = Math.max(16, Math.floor(22 + ripple * 0.4));
              g = Math.max(12, Math.floor(18 + ripple * 0.3));
              b = Math.max(12, Math.floor(18 + ripple * 0.3));
              grainColor = "rgba(239, 68, 68, 0.05)"; // Red volcanic ash specks
            } else if (wNum === 7 || wNum === 8) {
              // Snowy Tundra: Ice-blue snow
              const ripple = Math.sin(x * 0.005 + y * 0.0025) * 5;
              r = Math.max(110, Math.floor(130 + ripple * 0.8));
              g = Math.max(130, Math.floor(150 + ripple * 0.8));
              b = Math.max(150, Math.floor(175 + ripple * 1.0));
              grainColor = "rgba(255, 255, 255, 0.09)"; // Pure white snow grains
            } else if (wNum >= 9) {
              // Blood Moon Abyss: Dark purple/crimson
              const ripple = Math.sin(x * 0.005 + y * 0.0025) * 6;
              r = Math.max(25, Math.floor(38 + ripple * 0.6));
              g = Math.max(8, Math.floor(14 + ripple * 0.2));
              b = Math.max(18, Math.floor(28 + ripple * 0.4));
              grainColor = "rgba(220, 38, 38, 0.07)"; // Blood red speckles
            } else {
              // Standard Desert Sand (Wave 1 & 2 or Default)
              const ripple = Math.sin(x * 0.005 + y * 0.0025) * 6;
              r = Math.max(18, Math.floor(34 + ripple * 0.5));
              g = Math.max(14, Math.floor(27 + ripple * 0.4));
              b = Math.max(10, Math.floor(20 + ripple * 0.3));
              grainColor = "rgba(220, 180, 110, 0.04)";
            }
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Draw pseudo-random sand grains that remain fixed to the ground
            ctx.fillStyle = grainColor;
            const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            const grainCount = 4;
            for (let gIdx = 0; gIdx < grainCount; gIdx++) {
               const gx = x + Math.abs(Math.sin(seed + gIdx) * (TILE_SIZE - 4));
               const gy = y + Math.abs(Math.cos(seed + gIdx * 2.5) * (TILE_SIZE - 4));
               ctx.fillRect(gx, gy, 1.2, 1.2);
            }
          }
        }
      }

      if ((window as any).inTrainingMode) {
        // Draw concrete barrier walls/warning stripes around training arena bounds
        ctx.save();
        // Thick concrete outer wall
        ctx.strokeStyle = "#55555c";
        ctx.lineWidth = 20;
        ctx.strokeRect(-5810, 4190, 1620, 1620);
        // Yellow warning dashed stripes
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 4;
        ctx.setLineDash([14, 10]);
        ctx.strokeRect(-5800, 4200, 1600, 1600);
        ctx.setLineDash([]);
        ctx.restore();
      }

      // --- Draw Activation Plate (Modo Livre only) ---
      if (!waveRef.current.mode) {
        ctx.save();
        ctx.translate(400, 400);
        
        // Plate border/base
        ctx.fillStyle = "rgba(30, 30, 35, 0.9)";
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner glowing core
        const corePulse = 1.0 + Math.sin(Date.now() / 180) * 0.12;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
        ctx.beginPath();
        ctx.arc(0, 0, 22 * corePulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = '900 10px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ATIVAR HORDA", 0, -5);
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText("[PISAR AQUI]", 0, 8);
        ctx.restore();
      }

      // --- Draw Blood Decals ---
      for (const decal of bloodDecals) {
        if (decal.x < minDrawX || decal.x > maxDrawX || decal.y < minDrawY || decal.y > maxDrawY) continue;
        ctx.save();
        ctx.translate(decal.x, decal.y);
        ctx.rotate(decal.angle);

        const t = Math.min(1.0, decal.timer / 60);
        // Richer, slightly darker red that oxidizes
        const r = Math.floor(130 + (50 - 130) * t);
        const g = Math.floor(0 + (20 - 0) * t);
        const b = Math.floor(10 + (25 - 10) * t);
        // Boost alpha
        const finalAlpha = Math.min(1.0, decal.alpha * 1.5);
        const colorStr = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;

        if (decal.type === "meat") {
          const mr = Math.floor(140 + (50 - 140) * t);
          ctx.fillStyle = `rgba(${mr}, ${g}, ${b}, ${finalAlpha})`;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(
              -decal.size / 2,
              -decal.size / 2,
              decal.size,
              decal.size,
              4,
            );
          } else {
            ctx.rect(-decal.size / 2, -decal.size / 2, decal.size, decal.size);
          }
          ctx.fill();
          ctx.fillStyle = `rgba(${Math.floor(mr * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, ${finalAlpha})`;
          ctx.fillRect(
            -decal.size / 4,
            -decal.size / 4,
            decal.size / 2,
            decal.size / 2,
          );
        } else if (decal.type === "charred") {
          // Draw dark grey/black ash craters with organic radiating ash marks
          const ashAlpha = decal.alpha * Math.max(0.2, 1.0 - t);
          const ashBase = Math.floor(25 + (45 - 25) * t); // fades to a slight dirt color as it cools
          ctx.fillStyle = `rgba(${ashBase}, ${ashBase}, ${ashBase}, ${ashAlpha})`;

          // Central dark ash burn ellipse
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            decal.size * 0.5 * decal.stretch,
            decal.size * 0.4,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();

          // Sub-ring for hot/charred soot
          ctx.fillStyle = `rgba(15, 15, 15, ${ashAlpha * 1.2})`;
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            decal.size * 0.25 * decal.stretch,
            decal.size * 0.2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else if (decal.type === "footprint") {
          ctx.fillStyle = decal.color || colorStr;
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            decal.size * 0.5 * decal.stretch,
            decal.size * 0.3,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else {
          ctx.fillStyle = colorStr;
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            decal.size * 0.5 * decal.stretch,
            decal.size * 0.5,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Draw Shell Decals (greyed out) ---
      for (const s of shellDecals) {
        if (s.x < minDrawX || s.x > maxDrawX || s.y < minDrawY || s.y > maxDrawY) continue;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const greyFactor = Math.min(1.0, s.timer / 10);
        if (s.isBazooka) {
          // Detailed large bazooka casing decal on the ground
          const baseGreen = 100 + (60 - 100) * greyFactor;
          const goldC = 218 + (80 - 218) * greyFactor;
          const redC = 220 + (80 - 220) * greyFactor;
          
          ctx.fillStyle = `rgba(${baseGreen}, ${baseGreen + 10}, ${baseGreen}, 0.7)`;
          ctx.fillRect(-16, -6, 32, 12);
          ctx.fillStyle = `rgba(${goldC}, ${goldC * 0.75}, ${goldC * 0.15}, 0.7)`;
          ctx.fillRect(-16, -6, 6, 12);
          ctx.fillStyle = `rgba(${redC}, ${redC * 0.15}, ${redC * 0.15}, 0.75)`;
          ctx.fillRect(8, -6, 4, 12);
        } else {
          const r = 220 + (100 - 220) * greyFactor;
          const g = 160 + (100 - 160) * greyFactor;
          const b = 50 + (100 - 50) * greyFactor;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
          ctx.fillRect(-10, -4, 20, 8);

          const rIn = 255 + (120 - 255) * greyFactor;
          const gIn = 255 + (120 - 255) * greyFactor;
          const bIn = 200 + (120 - 200) * greyFactor;
          ctx.fillStyle = `rgba(${rIn}, ${gIn}, ${bIn}, 0.5)`;
          ctx.fillRect(-9, -2.5, 16, 3);

          const rBack = 150 + (80 - 150) * greyFactor;
          const gBack = 100 + (80 - 100) * greyFactor;
          const bBack = 30 + (80 - 30) * greyFactor;
          ctx.fillStyle = `rgba(${rBack}, ${gBack}, ${bBack}, 0.8)`;
          ctx.fillRect(-10, -4, 4, 8);
        }

        ctx.restore();
      }

      // --- Dynamic Lighting (Floor Illumination) ---
      ctx.globalCompositeOperation = "screen";

      // Muzzle Flash Light
      if (muzzleFlash > 0) {
        const flashX = player.x + Math.cos(player.angle) * 55;
        const flashY = player.y + Math.sin(player.angle) * 55;
        const isDoze = activeWeapon === "doze";
        const flashSize = isDoze ? 550 : 400;
        const lightGrad = ctx.createRadialGradient(
          flashX,
          flashY,
          0,
          flashX,
          flashY,
          flashSize,
        );
        const flashHex = (skinRef.current ? skinRef.current.colorMain : "#ffb432").replace('#', '');
        const fr = parseInt(flashHex.substring(0,2), 16) || 255;
        const fg = parseInt(flashHex.substring(2,4), 16) || 180;
        const fb = parseInt(flashHex.substring(4,6), 16) || 50;

        lightGrad.addColorStop(0, `rgba(${fr}, ${fg}, ${fb}, ${(isDoze ? 0.65 : 0.4) * muzzleFlash})`);
        lightGrad.addColorStop(0.2, `rgba(${fr}, ${fg}, ${fb}, ${(isDoze ? 0.35 : 0.15) * muzzleFlash})`);
        lightGrad.addColorStop(1, `rgba(${fr}, ${fg}, ${fb}, 0)`);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(flashX - flashSize, flashY - flashSize, flashSize * 2, flashSize * 2);
      }

      // Bullets Light
      for (const b of bullets) {
        const isDoze = b.weaponType === "doze";
        if (b.dmgMult < 1.0 && !isDoze) continue; // Remove ground light for piercing bullets, but allow shotgun (doze)
        const radius = isDoze ? 120 : 150;
        const lightGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
        if (isDoze) {
          lightGrad.addColorStop(0, "rgba(255, 140, 30, 0.45)");
          lightGrad.addColorStop(0.3, "rgba(255, 80, 10, 0.15)");
          lightGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
        } else {
          let r = 255, g = 200, bl = 100;
          if (b.themeColor) {
             const hex = b.themeColor.replace('#', '');
             r = parseInt(hex.substring(0,2), 16) || 255;
             g = parseInt(hex.substring(2,4), 16) || 200;
             bl = parseInt(hex.substring(4,6), 16) || 100;
          }
          lightGrad.addColorStop(0, `rgba(${r}, ${g}, ${bl}, 0.4)`);
          lightGrad.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`);
        }
        ctx.fillStyle = lightGrad;
        ctx.fillRect(b.x - radius, b.y - radius, radius * 2, radius * 2);
      }

      // Explosion Flashes Light (Illuminating the area)
      for (const f of explosionFlashes) {
        const ratio = f.life / f.maxLife;
        const radius = f.size;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
        grad.addColorStop(0, `rgba(255, 240, 190, ${1.0 * ratio})`);
        grad.addColorStop(0.12, `rgba(255, 150, 40, ${0.85 * ratio})`);
        grad.addColorStop(0.4, `rgba(220, 80, 15, ${0.45 * ratio})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(f.x - radius, f.y - radius, radius * 2, radius * 2);
      }

      // --- Draw Health Orbs ---
      ctx.globalCompositeOperation = "screen";

      for (const orb of upgradeEnergyOrbs) {
        ctx.save();
        const baseAlpha = Math.min(1.0, orb.life);
        
        // Ground Shadow
        ctx.globalAlpha = baseAlpha * 0.45;
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        const shadowScale = orb.z !== undefined ? Math.max(0.2, 1.0 - orb.z / 60) : 1.0;
        ctx.arc(orb.x, orb.y, 4 * shadowScale, 0, Math.PI * 2);
        ctx.fill();

        // Floor glow (illumination)
        ctx.globalAlpha = baseAlpha * (0.6 + Math.sin(time * 5) * 0.2); // Pulsing floor glow
        const floorGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, 45 * shadowScale);
        floorGrad.addColorStop(0, "rgba(96, 165, 250, 0.4)");
        floorGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 45 * shadowScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Elevate the core of the orb by -orb.z
        ctx.translate(orb.x, orb.y - (orb.z || 0));
        ctx.globalAlpha = baseAlpha;
        
        // Glow
        ctx.shadowBlur = 20 + Math.sin(time * 8) * 5; // Pulsing glow
        ctx.shadowColor = "#3b82f6";
        
        // Inner core
        ctx.fillStyle = "#eff6ff"; // Brighter white/blue
        ctx.beginPath();
        ctx.arc(0, 0, 4 + Math.sin(time * 10) * 1, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = "#93c5fd"; // Brighter blue
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 7 + Math.cos(time * 8) * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      for (const orb of healthOrbs) {
        // Floor Glow
        const floorGrad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          75,
        );
        floorGrad.addColorStop(0, "rgba(255, 35, 35, 0.45)");
        floorGrad.addColorStop(0.5, "rgba(255, 35, 35, 0.15)");
        floorGrad.addColorStop(1, "rgba(255, 35, 35, 0)");
        ctx.beginPath();
        ctx.fillStyle = floorGrad;
        ctx.arc(orb.x, orb.y, 75, 0, Math.PI * 2);
        ctx.fill();

        // Float and pulse animation
        const hoverY = Math.sin((Date.now() + orb.x * 100) / 220) * 8;
        const pulse = 1 + Math.sin(Date.now() / 120) * 0.12;
        const rot = (Date.now() / 600) % (Math.PI * 2);

        // Shiny outer bubble/glowing orb
        ctx.beginPath();
        ctx.arc(orb.x, orb.y + hoverY, 15 * pulse, 0, Math.PI * 2);
        const orbGrad = ctx.createRadialGradient(
          orb.x - 4,
          orb.y + hoverY - 4,
          1,
          orb.x,
          orb.y + hoverY,
          15 * pulse,
        );
        orbGrad.addColorStop(0, "rgba(255, 220, 220, 0.95)");
        orbGrad.addColorStop(0.3, "rgba(255, 55, 55, 0.65)");
        orbGrad.addColorStop(0.7, "rgba(180, 5, 5, 0.35)");
        orbGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
        ctx.fillStyle = orbGrad;
        ctx.fill();

        // Draw a glowing cross (+ symbol) inside, spinning
        ctx.save();
        ctx.translate(orb.x, orb.y + hoverY);
        ctx.rotate(rot);
        ctx.fillStyle = "rgba(255, 240, 240, 0.95)";
        ctx.shadowColor = "rgba(255, 40, 40, 0.9)";
        ctx.shadowBlur = 10;
        ctx.fillRect(-7.5 * pulse, -2.2 * pulse, 15 * pulse, 4.4 * pulse); // Horizontal
        ctx.fillRect(-2.2 * pulse, -7.5 * pulse, 4.4 * pulse, 15 * pulse); // Vertical
        ctx.restore();

        // Tiny floating glitter particles around the orb
        for (let p = 0; p < 3; p++) {
          const px = orb.x + Math.sin(Date.now() / 350 + p * 2) * 19;
          const py = orb.y + hoverY + Math.cos(Date.now() / 250 + p * 1.5) * 19;
          ctx.beginPath();
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 230, 230, 0.85)";
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      // Draw Smoke Barrier (only outside training mode)
      if (!(window as any).inTrainingMode) {
        const mapSize = getMapSize();
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.96)";
        // Draw outer areas
        // Top
        ctx.fillRect(-mapSize - 1000, -mapSize - 1000, mapSize * 2 + 2000, 1000);
        // Bottom
        ctx.fillRect(-mapSize - 1000, mapSize, mapSize * 2 + 2000, 1000);
        // Left
        ctx.fillRect(-mapSize - 1000, -mapSize, 1000, mapSize * 2);
        // Right
        ctx.fillRect(mapSize, -mapSize, 1000, mapSize * 2);
        
        // Draw smoke border edge (glowing misty border)
        ctx.strokeStyle = "rgba(10, 10, 10, 0.9)";
        ctx.lineWidth = 40;
        ctx.strokeRect(-mapSize, -mapSize, mapSize * 2, mapSize * 2);
        
        // Add some random smoke puffs along the edges
        ctx.fillStyle = "rgba(5, 5, 5, 0.85)";
        for (let i = -mapSize; i <= mapSize; i += 120) {
          // Top edge
          ctx.beginPath(); ctx.arc(i + Math.sin(Date.now()/500 + i)*20, -mapSize + Math.cos(Date.now()/500 + i)*10, 60 + Math.sin(Date.now()/400 + i)*15, 0, Math.PI*2); ctx.fill();
          // Bottom edge
          ctx.beginPath(); ctx.arc(i + Math.sin(Date.now()/500 + i)*20, mapSize + Math.cos(Date.now()/500 + i)*10, 60 + Math.sin(Date.now()/400 + i)*15, 0, Math.PI*2); ctx.fill();
          // Left edge
          ctx.beginPath(); ctx.arc(-mapSize + Math.cos(Date.now()/500 + i)*10, i + Math.sin(Date.now()/500 + i)*20, 60 + Math.sin(Date.now()/400 + i)*15, 0, Math.PI*2); ctx.fill();
          // Right edge
          ctx.beginPath(); ctx.arc(mapSize + Math.cos(Date.now()/500 + i)*10, i + Math.sin(Date.now()/500 + i)*20, 60 + Math.sin(Date.now()/400 + i)*15, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      } else {
        // Training mode: draw border walls for the training arena
        ctx.save();
        const trMinX = -5800, trMaxX = -4200, trMinY = 4200, trMaxY = 5800;
        // Dark opaque borders around training area
        ctx.fillStyle = "rgba(0, 0, 0, 0.96)";
        ctx.fillRect(trMinX - 1000, trMinY - 1000, (trMaxX - trMinX) + 2000, 1000);
        ctx.fillRect(trMinX - 1000, trMaxY, (trMaxX - trMinX) + 2000, 1000);
        ctx.fillRect(trMinX - 1000, trMinY, 1000, trMaxY - trMinY);
        ctx.fillRect(trMaxX, trMinY, 1000, trMaxY - trMinY);
        // Warning stripes on edges
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(trMinX, trMinY, trMaxX - trMinX, trMaxY - trMinY);
        ctx.setLineDash([]);
        // Concrete wall look
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 8;
        ctx.strokeRect(trMinX - 4, trMinY - 4, (trMaxX - trMinX) + 8, (trMaxY - trMinY) + 8);
        ctx.restore();
      }

      // --- Draw Player Drop Shadow (Drawn before mannequins so it never renders on top of them) ---
      if (!player.isDead) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        
        const isAimingMode = !player.isDead && !isShopOpenRef.current && ((mouse.rightDown && isAimEnabledRef.current) || (window as any).mobileAimActive || (window as any).mobileShootActive);
        
        if (muzzleFlash > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.55 + (muzzleFlash * 0.35)})`;
          ctx.beginPath();
          ctx.ellipse(-5, 5, 23, 29, 0, 0, Math.PI * 2);
          ctx.fill();
          
          const shadowLength = 110 + muzzleFlash * 140;
          const shadowWidth = 28;
          const shadowGrad = ctx.createLinearGradient(0, 0, -shadowLength, 0);
          shadowGrad.addColorStop(0, `rgba(0, 0, 0, 0.85)`);
          shadowGrad.addColorStop(0.35, `rgba(0, 0, 0, 0.65)`);
          shadowGrad.addColorStop(0.7, `rgba(0, 0, 0, 0.3)`);
          shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(-10 - (shadowLength / 2), 2, shadowLength / 2, shadowWidth, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          ctx.beginPath();
          ctx.ellipse(-5, 5, 22, 28, 0, 0, Math.PI * 2);
          ctx.fill();
          
          const shadowLength = isAimingMode ? 70 : 50;
          const shadowWidth = 24;
          const shadowGrad = ctx.createLinearGradient(0, 0, -shadowLength, 0);
          shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
          shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
          shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(-10 - (shadowLength / 2), 2, shadowLength / 2, shadowWidth, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Draw Mannequins ---
      for (const m of mannequins) {
        if (m.isTrainingDummy && waveRef.current.mode) continue;
        if (m.x < minDrawX || m.x > maxDrawX || m.y < minDrawY || m.y > maxDrawY) continue;
        if (m.hp <= 0) {
          continue; // exploded
        }

        ctx.save();
        const isJumping = m.isJumping;
        const jumpProgress = m.jumpProgress || 0;
        const jumpHeight = isJumping ? Math.sin(jumpProgress * Math.PI) * 45 : 0;

        const isEmerging = (m as any).emergeTimer !== undefined && (m as any).emergeTimer > 0;
        const emergeProgress = isEmerging ? 1 - ((m as any).emergeTimer / ((m as any).emergeDuration || 1.8)) : 1.0;

        const baseScale = (m as any).isBigDummy ? 1.6 : (m.isBoss ? 1.6 : m.profile === "LENTO" ? 1.25 : m.profile === "SALTADOR" ? (isJumping ? 0.82 * (1.0 + jumpHeight / 90) : 0.82) : 1.0);
        const scale = baseScale * (isEmerging ? emergeProgress : 1.0);

        const trembleX = m.hitTime > 0 ? (Math.random() - 0.5) * 10 : 0;
        const trembleY = m.hitTime > 0 ? (Math.random() - 0.5) * 10 : 0;
        const emergeTrembleX = isEmerging ? (Math.random() - 0.5) * 5 * (1 - emergeProgress) : 0;
        const emergeTrembleY = isEmerging ? (Math.random() - 0.5) * 5 * (1 - emergeProgress) : 0;

        ctx.translate(m.x + trembleX + emergeTrembleX, m.y + trembleY + emergeTrembleY);

        // Tactical Indicators for Jumping Zombies (SALTADOR)
        if (m.profile === "SALTADOR" && ((m as any).isPreparingJump || isJumping)) {
          ctx.save();
          const pulse = Math.abs(Math.sin(Date.now() * 0.015));
          if ((m as any).isPreparingJump) {
            ctx.shadowColor = "rgba(255, 30, 30, 0.95)";
            ctx.shadowBlur = 8 + pulse * 6;
            ctx.fillStyle = `rgba(255, 30, 30, ${0.5 + pulse * 0.5})`;
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillText("▲ LEAP", 0, -42);
          } else if (isJumping) {
            ctx.shadowColor = "rgba(245, 158, 11, 0.9)";
            ctx.shadowBlur = 8;
            ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center";
            ctx.fillText("⚡ AIR", 0, -42 - jumpHeight);
          }
          ctx.restore();
        }

        ctx.rotate(m.angle);
        ctx.scale(scale, scale);

        // Draw cracked earth soil ring during emergence
        if (isEmerging) {
          ctx.fillStyle = "rgba(45, 30, 20, 0.75)";
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Target Outline
        if (m.focusLerp > 0) {
          ctx.shadowColor = m.isBoss
            ? "rgba(255, 50, 50, 0.8)"
            : "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 10 * m.focusLerp;
        }

        // Bobbing if moving
        const isMv = m.type === "patrol" && Math.hypot(m.vx, m.vy) > 5;
        const walkBobTime = isMv ? Date.now() / 100 : 0;
        const bobX = isMv ? Math.sin(walkBobTime) * 2 : 0;
        const shBobL = isMv ? Math.cos(walkBobTime + Math.PI) * 2 : 0;
        const shBobR = isMv ? Math.cos(walkBobTime) * 2 : 0;

        ctx.translate(bobX, 0);

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        const shadowSizeScale = isJumping ? Math.max(0.5, 1.0 - jumpHeight / 60) : 1.0;
        ctx.ellipse(-2, 4, 24 * shadowSizeScale, 30 * shadowSizeScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Translate vertically after shadow to simulate jump height
        if (isJumping) {
          ctx.translate(jumpHeight * 0.3, -jumpHeight);
        }

        let shBobL_atk = shBobL;
        let shBobR_atk = shBobR;
        let attachOffsetL = -2;
        let attachOffsetR = -2;

        if (m.attackTimer && m.attackTimer > 0) {
          const atkProgress = 1.0 - m.attackTimer; // Starts at 0, goes to 1
          if (atkProgress < 0.2) {
            // Reach out forward
            shBobL_atk += 15;
            shBobR_atk += 15;
            attachOffsetL += 8;
            attachOffsetR += 8;
          } else {
            // Retract
            shBobL_atk += 5;
            shBobR_atk += 5;
          }
        }

        // --- Draw White Outline Silhouette Contour Pass ---
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        const oW = 2.5; // Outline thickness

        // Shoulders & Arms outline
        if (m.attackTimer && m.attackTimer > 0) {
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(attachOffsetL - oW, -16 - 6 - oW, 20 + oW * 2, 12 + oW * 2, 5);
            ctx.roundRect(attachOffsetR - oW, 16 - 6 - oW, 20 + oW * 2, 12 + oW * 2, 5);
          } else {
            ctx.rect(attachOffsetL - oW, -16 - 6 - oW, 20 + oW * 2, 12 + oW * 2);
            ctx.rect(attachOffsetR - oW, 16 - 6 - oW, 20 + oW * 2, 12 + oW * 2);
          }
          ctx.fill();
        }

        ctx.beginPath();
        ctx.ellipse(attachOffsetL + shBobL_atk, -16, 12 + oW, 9 + oW, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(attachOffsetR + shBobR_atk, 16, 12 + oW, 9 + oW, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Torso body outline
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-12 - oW, -14 - oW, 24 + oW * 2, 28 + oW * 2, 5);
        } else {
          ctx.rect(-12 - oW, -14 - oW, 24 + oW * 2, 28 + oW * 2);
        }
        ctx.fill();

        // Head outline
        ctx.beginPath();
        ctx.arc(2, 0, 13 + oW, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        let armColor = "#1f2621";
        if (m.isTrainingDummy) armColor = m.hitTime > 0 ? "#ff4444" : "#ffffff";
        else if (m.attackTimer && m.attackTimer > 0) armColor = "#8a0303";
        else if (m.hitTime > 0) armColor = "#ffffff";
        else if (m.isBoss) armColor = "#301212";
        else if (m.profile === "DASHER") armColor = "#7e22ce";
        else if (m.profile === "ATIRADOR") armColor = "#b91c1c";
        else if (m.profile === "LENTO") armColor = "#0f2611";
        else if (m.profile === "SALTADOR") armColor = "#6e1d13";
        else if (m.profile === "FLANQUEADOR") armColor = "#361d3b";
        else if (m.profile === "CERCO") armColor = "#172733";
        ctx.fillStyle = armColor;

        if (m.attackTimer && m.attackTimer > 0) {
          // Sharp Claws extended
          ctx.beginPath();
          ctx.moveTo(attachOffsetL, -16);
          ctx.lineTo(attachOffsetL + 25 + shBobL_atk, -24); // pointed claw
          ctx.lineTo(attachOffsetL + 12, -8);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(attachOffsetR, 16);
          ctx.lineTo(attachOffsetR + 25 + shBobR_atk, 24);
          ctx.lineTo(attachOffsetR + 12, 8);
          ctx.fill();
        } else {
          // Normal but twisted arms
          ctx.beginPath();
          ctx.ellipse(attachOffsetL + shBobL_atk, -16, 14, 7, -Math.PI / 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(attachOffsetR + shBobR_atk, 16, 14, 7, Math.PI / 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Body (Sinister Anatomy / Mutated Torso)
        let bodyColor = "#171c18";
        if (m.isTrainingDummy) bodyColor = m.hitTime > 0 ? "#ff4444" : "#ffffff";
        else if (m.attackTimer && m.attackTimer > 0) bodyColor = "#520000";
        else if (m.hitTime > 0) bodyColor = "#ffffff";
        else if (m.isBoss) bodyColor = "#1a0808";
        else if (m.profile === "DASHER") bodyColor = "#581c87";
        else if (m.profile === "ATIRADOR") bodyColor = "#7f1d1d";
        else if (m.profile === "LENTO") bodyColor = "#0b1c0c";
        else if (m.profile === "SALTADOR") bodyColor = "#4d1008";
        else if (m.profile === "FLANQUEADOR") bodyColor = "#251229";
        else if (m.profile === "CERCO") bodyColor = "#0d1b24";
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = m.isBoss ? "#3d0000" : "#0d120e";
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Jagged mutated back
        ctx.moveTo(-15, -12);
        ctx.lineTo(-8, -18); // shoulder tumor
        ctx.lineTo(5, -14);
        ctx.lineTo(14, -6); // chest
        ctx.lineTo(14, 6);
        ctx.lineTo(5, 14);
        ctx.lineTo(-8, 18);
        ctx.lineTo(-15, 12);
        ctx.lineTo(-20, 0); // hunched spine protruding
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Head (Elongated / Creepy)
        ctx.beginPath();
        let headColor = "#111411";
        if (m.isTrainingDummy) headColor = m.hitTime > 0 ? "#ff4444" : "#ffffff";
        else if (m.attackTimer && m.attackTimer > 0) headColor = "#8a0303";
        else if (m.hitTime > 0) headColor = "#ffffff";
        else if (m.isBoss) headColor = "#240000";
        else if (m.profile === "DASHER") headColor = "#3b0764";
        else if (m.profile === "ATIRADOR") headColor = "#450a0a";
        else if (m.profile === "LENTO") headColor = "#061207";
        else if (m.profile === "SALTADOR") headColor = "#380a05";
        else if (m.profile === "FLANQUEADOR") headColor = "#160a1a";
        else if (m.profile === "CERCO") headColor = "#081014";
        ctx.fillStyle = headColor;
        ctx.ellipse(6, 0, m.isBoss ? 16 : 14, m.isBoss ? 11 : 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Eyes / Visor (Monstrous)
        const eyeColor =
          m.attackTimer && m.attackTimer > 0
            ? "#ffffff"
            : m.hitTime > 0
              ? "#ffffff"
              : m.isBoss
                ? "#ff0000"
                : "#ff3300";
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 10;

        if (!m.isTrainingDummy) {
          ctx.beginPath();
          ctx.arc(12, -4, m.isBoss ? 3 : 2, 0, Math.PI * 2); // Right eye
          ctx.arc(12, 4, m.isBoss ? 3 : 2, 0, Math.PI * 2);  // Left eye
          ctx.fill();
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#475569";
          ctx.beginPath();
          ctx.arc(11, -3, 1.5, 0, Math.PI * 2);
          ctx.arc(11, 3, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        if ((m.isBoss || m.hp > 100) && !m.isTrainingDummy) {
          // Extra eyes for boss/strong variants
          ctx.beginPath();
          ctx.arc(8, -8, 2, 0, Math.PI * 2);
          ctx.arc(8, 8, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0; // reset shadow
        ctx.restore();

        // Target Indicator & HP Bar
        if (m.isTrainingDummy || m.focusLerp > 0.01 || (m.hp < m.maxHp && m.hp > 0)) {
          ctx.save();
          ctx.translate(m.x, m.y);

          const barScale = 1.0 + (m.isTrainingDummy ? 0 : m.focusLerp * 0.3);
          ctx.scale(barScale, barScale);

          const hpRatio = Math.max(0, m.hp / m.maxHp);

          // Tactical Reticle (Centered)
          if (!m.isTrainingDummy && m.focusLerp > 0.01) {
            ctx.save();
            if (m.isHeadTargeted) {
              ctx.rotate(Date.now() * 0.003); // girar ao mirar na cabeca
            }
            ctx.strokeStyle = `rgba(244, 67, 54, ${m.focusLerp})`;
            ctx.lineWidth = 1.5;
            const baseSize = m.isBoss ? 36 : 24;
            const s = baseSize + (1 - m.focusLerp) * 20; // bracket size zooms in
            ctx.beginPath();
            ctx.moveTo(-s, -s + 8);
            ctx.lineTo(-s, -s);
            ctx.lineTo(-s + 8, -s);
            ctx.moveTo(s, -s + 8);
            ctx.lineTo(s, -s);
            ctx.lineTo(s - 8, -s);
            ctx.moveTo(-s, s - 8);
            ctx.lineTo(-s, s);
            ctx.lineTo(-s + 8, s);
            ctx.moveTo(s, s - 8);
            ctx.lineTo(s, s);
            ctx.lineTo(s - 8, s);
            ctx.stroke();
            ctx.restore();
          }

          // Offset for HP Bar
          const animOffset = m.isTrainingDummy ? 0 : -20 * m.focusLerp;
          ctx.translate(0, animOffset);

          const uiAlpha = m.isTrainingDummy ? 0.95 : Math.max(0.5, m.focusLerp);
          ctx.globalAlpha = uiAlpha;

          const xOffset = 0;
          const yOffset = -55;

          if (m.isTrainingDummy) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("MANEQUIM", xOffset, yOffset - 22);
          } else if (m.focusLerp > 0.15 || m.isBoss) {
            ctx.fillStyle = m.isBoss ? "#ff3333" : "rgba(0, 255, 255, 0.9)";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            const name = m.isBoss ? "JUGGERNAUT_CLASS" : "INFECTED_TGT_MKIV";
            ctx.fillText(name, xOffset, yOffset - 22);
          }
          if (m.isTrainingDummy || m.focusLerp > 0.05) {
            ctx.font = "8px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            const hpText = m.isTrainingDummy ? `HP: ${Math.floor(m.hp)}/${m.maxHp}` : `HP: ${Math.floor(hpRatio * 100)}%`;
            ctx.fillText(hpText, xOffset, yOffset - 12);
            
            // Draw sleek segmented HP bar
            const barW = 32;
            const barH = 3;
            const segments = 8;
            const segW = (barW / segments) - 1;
            const startX = xOffset - barW / 2;
            const startY = yOffset - 8;
            
            for (let i = 0; i < segments; i++) {
              const segRatio = (i + 1) / segments;
              if (hpRatio >= segRatio || (hpRatio > 0 && i === 0)) {
                ctx.fillStyle = m.isTrainingDummy ? "#ffffff" : (m.isBoss ? "#ff3333" : "#00e5ff");
                ctx.shadowColor = m.isTrainingDummy ? "#ffffff" : (m.isBoss ? "#ff3333" : "#00e5ff");
                ctx.shadowBlur = 4;
              } else {
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.shadowBlur = 0;
              }
              ctx.fillRect(startX + i * (segW + 1), startY, segW, barH);
            }
            ctx.shadowBlur = 0;
          }
          ctx.textAlign = "left";
          ctx.restore();
        }

        // Draw Warning Indicator for Shooter Zombie
        if (m.profile === "ATIRADOR" && m.hp > 0 && !(m as any).emergeTimer) {
          const shootTimer = (m as any).shootTimer || 0;
          if (shootTimer <= 0.8) {
            ctx.save();
            ctx.translate(m.x, m.y);
            // Dynamic rapid flashing / scaling
            const flash = Math.floor(Date.now() / 100) % 2 === 0;
            const scale = 1.0 + Math.sin(Date.now() * 0.025) * 0.2;
            ctx.scale(scale, scale);
            
            ctx.fillStyle = flash ? "#ff3333" : "#ffaa00";
            ctx.shadowColor = flash ? "#ff3333" : "#ffaa00";
            ctx.shadowBlur = 15;
            ctx.font = "bold 26px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText("?", 0, -42);
            ctx.restore();
          }
        }
      }

      // --- Draw Gibs ---
      for (const g of gibs) {
        if (g.x < minDrawX || g.x > maxDrawX || g.y < minDrawY || g.y > maxDrawY) continue;
        
        // Draw 3D shadow on the ground for gibs
        if (g.z > 0) {
          ctx.save();
          // Shift shadow diagonally based on height (z) to simulate overhead sun light direction
          ctx.translate(g.x + g.z * 0.18, g.y + g.z * 0.18);
          // Scale down shadow as the chunk flies higher
          const shadowScale = Math.max(0.2, 1.0 - g.z / 450);
          ctx.scale(shadowScale, shadowScale);
          ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
          ctx.beginPath();
          ctx.arc(0, 0, g.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        
        ctx.save();
        ctx.translate(g.x, g.y - g.z);
        ctx.rotate(g.angle);
        
        // Add cinematic bloom/motion glow around flesh chunks in the air
        if (g.z > 5) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = "rgba(220, 20, 20, 0.9)";
        }
        
        ctx.fillStyle = "#7a0000";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-g.size / 2, -g.size / 2, g.size, g.size, 4);
        } else {
          ctx.rect(-g.size / 2, -g.size / 2, g.size, g.size);
        }
        ctx.fill();
        ctx.fillStyle = "#4a0000";
        ctx.fillRect(-g.size / 4, -g.size / 4, g.size / 2, g.size / 2);
        ctx.restore();
      }

      // --- Draw Blood Drops ---
      for (const d of bloodDrops) {
        if (d.x < minDrawX || d.x > maxDrawX || d.y < minDrawY || d.y > maxDrawY) continue;
        
        // Draw 3D shadow on the ground for airborne blood drops
        if (d.z > 0) {
          ctx.save();
          ctx.translate(d.x + d.z * 0.15, d.y + d.z * 0.15);
          const shadowScale = Math.max(0.15, 1.0 - d.z / 350);
          ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
          ctx.beginPath();
          ctx.arc(0, 0, d.size * 0.7 * shadowScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        
        ctx.save();
        ctx.translate(d.x, d.y - d.z);
        
        // Dynamic motion stretch for flying blood drops
        const speed = Math.hypot(d.vx, d.vy);
        if (speed > 100) {
          const moveAngle = Math.atan2(d.vy, d.vx);
          ctx.rotate(moveAngle);
          const stretch = 1.0 + speed * 0.0035;
          ctx.scale(stretch, 1.0);
        }
        
        // Bloom glow
        if (d.z > 5) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(255, 30, 30, 0.85)";
        }
        
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(0, 0, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

        // --- Draw Shell Remnants (Airborne) ---
        for (const s of shells) {
          if (s.isBazooka) {
            // Bazooka Shell Shadow
            if (s.z > 0) {
              ctx.save();
              ctx.translate(s.x, s.y);
              ctx.rotate(s.angle);
              ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
              ctx.fillRect(-16, -6, 32, 12);
              ctx.restore();
            }
            
            // Bazooka Shell Body
            ctx.save();
            ctx.translate(s.x, s.y - s.z);
            ctx.rotate(s.angle);
            
            const alpha = s.life > 1 ? 1 : s.life;
            
            // Army green shell body
            ctx.fillStyle = `rgba(100, 110, 100, ${alpha})`;
            ctx.fillRect(-16, -6, 32, 12);
            
            // Brass/Gold bottom cap
            ctx.fillStyle = `rgba(218, 165, 32, ${alpha})`;
            ctx.fillRect(-16, -6, 6, 12);
            
            // Yellow middle ring
            ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.fillRect(-2, -6, 4, 12);
            
            // Red tip warning stripe
            ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
            ctx.fillRect(8, -6, 4, 12);
            
            // Specular highlights
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
            ctx.fillRect(-16, -4, 32, 2);
            
            ctx.restore();
          } else {
            // Standard Shell Rendering
            if (s.z > 0) {
              ctx.save();
              ctx.translate(s.x, s.y);
              ctx.rotate(s.angle);
              ctx.fillStyle = `rgba(0, 0, 0, 0.4)`;
              ctx.fillRect(-8, -4, 16, 8);
              ctx.restore();
            }
            ctx.save();
            ctx.translate(s.x, s.y - s.z);
            ctx.rotate(s.angle);
            let mainC = `rgba(220, 160, 50, ${s.life > 1 ? 1 : s.life})`;
            if (s.isKicked) {
              const greyVal = 100;
              mainC = `rgba(${greyVal}, ${greyVal}, ${greyVal}, ${s.life > 1 ? 1 : s.life})`;
            } else if (s.themeColor) {
               const hex = s.themeColor.replace('#', '');
               const r = parseInt(hex.substring(0,2), 16);
               const g = parseInt(hex.substring(2,4), 16);
               const b = parseInt(hex.substring(4,6), 16);
               mainC = `rgba(${r}, ${g}, ${b}, ${s.life > 1 ? 1 : s.life})`;
            }
            ctx.fillStyle = mainC;
            ctx.fillRect(-10, -4, 20, 8);
            
            if (s.isKicked) {
              ctx.fillStyle = `rgba(140, 140, 140, ${s.life > 1 ? 0.6 : s.life * 0.6})`;
            } else {
              ctx.fillStyle = `rgba(255, 255, 200, ${s.life > 1 ? 0.6 : s.life * 0.6})`;
            }
            ctx.fillRect(-9, -2.5, 16, 3);
            
            if (s.isKicked) {
              ctx.fillStyle = `rgba(80, 80, 80, ${s.life > 1 ? 1 : s.life})`;
            } else {
              ctx.fillStyle = `rgba(150, 100, 30, ${s.life > 1 ? 1 : s.life})`;
            }
            ctx.fillRect(-10, -4, 4, 8);
            ctx.restore();
          }
        }

      // --- Draw Van (Loja) ---
      const vanDist = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
      
      if (!(window as any).inTrainingMode) {
        // --- Draw Van Headlights (Faróis Dinâmicos em World Space) ---
        if (vanState !== "OUT") {
          let lightAlpha = 0.85;
          if (vanState === "PARKED") {
            if (cutsceneRef.current.active) {
              if (cutsceneRef.current.phase === "PLAYER_DESCENDING") {
                lightAlpha = Math.max(0, 0.85 - cutsceneRef.current.playerJumpProgress);
              } else if (cutsceneRef.current.phase === "PLAYER_LOADING_WEAPON" || cutsceneRef.current.phase === "INTRO_SCREEN_FADE" || cutsceneRef.current.phase === "FADING_GAME_IN" || cutsceneRef.current.phase === "KOMBI_LEAVING") {
                lightAlpha = 0.0;
              }
            }
          }
          
          if (lightAlpha > 0) {
            // Apply a subtle dynamic flicker (simulating a loose connection / engine alternator vibration)
            const flicker = 1.0 + Math.sin(Date.now() * 0.06) * 0.06 + (Math.random() - 0.5) * 0.04;
            lightAlpha *= flicker;

            // Headlight source coordinate offsets based on van orientation
            const frontDist = 135;
            const sideDist = 32;
            const fx = VAN_X + Math.cos(vanAngle) * frontDist;
            const fy = VAN_Y + Math.sin(vanAngle) * frontDist;
            const px = Math.cos(vanAngle + Math.PI/2);
            const py = Math.sin(vanAngle + Math.PI/2);

            // 1. Draw projected volumetric shadow of the player if they stand in the headlight beam
            const dx = player.x - fx;
            const dy = player.y - fy;
            const dist = Math.hypot(dx, dy);
            if (dist < 420 && dist > 15) {
              const angleToPlayer = Math.atan2(dy, dx);
              let diffAngle = Math.abs(angleToPlayer - vanAngle);
              while (diffAngle > Math.PI) diffAngle = Math.abs(diffAngle - Math.PI * 2);

              if (diffAngle < 0.45) { // within the light cone spread
                ctx.save();
                ctx.globalCompositeOperation = "source-over"; // draw shadow on top of light/floor

                const r = 13; // player collision radius
                const nx = -dy / dist;
                const ny = dx / dist;

                // Player tangent borders relative to light source
                const p1x = player.x + nx * r;
                const p1y = player.y + ny * r;
                const p2x = player.x - nx * r;
                const p2y = player.y - ny * r;

                // Extrude shadow points outward away from the headlights
                const shadowLen = 500;
                const q1x = p1x + (p1x - fx) / dist * shadowLen;
                const q1y = p1y + (p1y - fy) / dist * shadowLen;
                const q2x = p2x + (p2x - fx) / dist * shadowLen;
                const q2y = p2y + (p2y - fy) / dist * shadowLen;

                // Build soft fading shadow projection
                const shadowGrad = ctx.createLinearGradient(
                  player.x,
                  player.y,
                  player.x + (player.x - fx) / dist * 300,
                  player.y + (player.y - fy) / dist * 300
                );
                shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
                shadowGrad.addColorStop(0.4, "rgba(0, 0, 0, 0.35)");
                shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

                ctx.fillStyle = shadowGrad;
                ctx.beginPath();
                ctx.moveTo(p1x, p1y);
                ctx.lineTo(p2x, p2y);
                ctx.lineTo(q2x, q2y);
                ctx.lineTo(q1x, q1y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
              }
            }

            // 2. Draw Headlight beams (Additive blending)
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            
            const drawHeadlight = (lx: number, ly: number) => {
              const beamLength = 480;
              
              // A. Draw wide, soft volumetric air scattering (illuminating the dusty air)
              ctx.save();
              ctx.shadowBlur = 40;
              ctx.shadowColor = `rgba(255, 248, 205, ${lightAlpha * 0.15})`;
              const hazeGrad = ctx.createRadialGradient(lx, ly, 20, lx + Math.cos(vanAngle) * beamLength * 0.65, ly + Math.sin(vanAngle) * beamLength * 0.65, beamLength * 0.65);
              hazeGrad.addColorStop(0, `rgba(255, 248, 205, ${lightAlpha * 0.22})`);
              hazeGrad.addColorStop(0.25, `rgba(255, 240, 190, ${lightAlpha * 0.10})`);
              hazeGrad.addColorStop(0.6, `rgba(255, 240, 190, ${lightAlpha * 0.03})`);
              hazeGrad.addColorStop(1, "rgba(255, 240, 190, 0)");
              
              ctx.fillStyle = hazeGrad;
              ctx.beginPath();
              ctx.moveTo(lx, ly);
              const hazeHalfAngle = 0.55; // Wide angle for dust scattering
              ctx.arc(
                lx,
                ly,
                beamLength * 1.1,
                vanAngle - hazeHalfAngle,
                vanAngle + hazeHalfAngle
              );
              ctx.closePath();
              ctx.fill();
              ctx.restore();

              // B. Draw normal medium projection beam
              const medGrad = ctx.createRadialGradient(lx, ly, 10, lx + Math.cos(vanAngle) * beamLength * 0.7, ly + Math.sin(vanAngle) * beamLength * 0.7, beamLength * 0.5);
              medGrad.addColorStop(0, `rgba(255, 253, 225, ${lightAlpha * 0.5})`);
              medGrad.addColorStop(0.2, `rgba(255, 248, 205, ${lightAlpha * 0.3})`);
              medGrad.addColorStop(0.6, `rgba(255, 240, 190, ${lightAlpha * 0.08})`);
              medGrad.addColorStop(1, "rgba(255, 240, 190, 0)");
              
              ctx.fillStyle = medGrad;
              ctx.beginPath();
              ctx.moveTo(lx, ly);
              const coneHalfAngle = 0.32;
              ctx.arc(
                lx,
                ly,
                beamLength,
                vanAngle - coneHalfAngle,
                vanAngle + coneHalfAngle
              );
              ctx.closePath();
              ctx.fill();

              // C. Draw bright narrow core spotlight
              const coreGrad = ctx.createRadialGradient(lx, ly, 5, lx + Math.cos(vanAngle) * beamLength * 0.4, ly + Math.sin(vanAngle) * beamLength * 0.4, beamLength * 0.3);
              coreGrad.addColorStop(0, `rgba(255, 255, 240, ${lightAlpha * 0.85})`);
              coreGrad.addColorStop(0.3, `rgba(255, 253, 225, ${lightAlpha * 0.4})`);
              coreGrad.addColorStop(1, "rgba(255, 253, 225, 0)");
              
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.moveTo(lx, ly);
              const coreHalfAngle = 0.16;
              ctx.arc(
                lx,
                ly,
                beamLength * 0.8,
                vanAngle - coreHalfAngle,
                vanAngle + coreHalfAngle
              );
              ctx.closePath();
              ctx.fill();
            };
            
            drawHeadlight(fx + px * sideDist, fy + py * sideDist);
            drawHeadlight(fx - px * sideDist, fy - py * sideDist);

            // 3. Draw floaty dust specks catching the light beams (Cinematic overlay)
            ctx.fillStyle = `rgba(255, 254, 230, ${lightAlpha * 0.5})`;
            for (let d = 0; d < 30; d++) {
              const angleOffset = (d * 23) % 360;
              const distOffset = (d * 59) % 340;
              const timeFactor = Date.now() * 0.0004;
              
              // Drift the dust specks slowly using sine/cosine waves
              const dustAngle = vanAngle + (Math.sin(timeFactor + angleOffset) * 0.28);
              const dustDist = 30 + distOffset + (Math.cos(timeFactor * 0.7 + d) * 15);
              
              const dustX = fx + Math.cos(dustAngle) * dustDist;
              const dustY = fy + Math.sin(dustAngle) * dustDist;
              
              // Oscar-like dust light catching effect
              const size = (0.6 + Math.abs(Math.sin(timeFactor + d)) * 1.6) * Math.max(0.1, 1 - dustDist / 400);
              
              ctx.beginPath();
              ctx.arc(dustX, dustY, size, 0, Math.PI * 2);
              ctx.fill();
            }
            
            ctx.restore();
          }
        }

        ctx.save();
        ctx.translate(VAN_X, VAN_Y);
        ctx.rotate(vanAngle - Math.PI / 2);
        
        // Trembling effect
        if (Math.random() > 0.5) {
           ctx.translate((Math.random()-0.5)*1.5, (Math.random()-0.5)*1.5);
        }
        
        if (loadedVanImage && loadedVanImage.complete) {
           const aspect = loadedVanImage.naturalHeight / loadedVanImage.naturalWidth;
           const vW = 280;
           const vH = vW * aspect;
           ctx.shadowColor = "rgba(0,0,0,0.8)";
           ctx.shadowBlur = 20;
           ctx.drawImage(loadedVanImage, -vW/2, -vH/2, vW, vH);
           ctx.shadowBlur = 0;
        }
        
        // Draw Smoke (simple particles rising from the back: y = +40)
        ctx.fillStyle = `rgba(150, 150, 150, ${Math.sin(Date.now()/200)*0.2 + 0.3})`;
        ctx.beginPath();
        ctx.arc(40 + Math.sin(Date.now()/300)*8, 20 - (Date.now()/20)%40, 10 + (Date.now()/20)%25, 0, Math.PI*2);
        ctx.fill();
        
        // Draw UI interaction if close
        if (vanDist < VAN_RADIUS + 50 && (!waveRef.current.mode || vanState === "PARKED")) {
          ctx.translate(0, -60);
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 2;
          ctx.beginPath();
          const boxWidth = !waveRef.current.mode ? 180 : 90;
          const boxX = -boxWidth / 2;
          if (ctx.roundRect) {
             ctx.roundRect(boxX, -15, boxWidth, 25, 5);
          } else {
             ctx.rect(boxX, -15, boxWidth, 25);
          }
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = "#facc15";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          const promptText = !waveRef.current.mode ? "LOJA [E] | MODO TREINO [T]" : "LOJA [E]";
          ctx.fillText(promptText, 0, 2);
        }
        ctx.restore();
      }

      // --- Draw Bullets (with glowing trails) ---
      for (const b of bullets) {
        const isDoze = b.weaponType === "doze";
        const isHoming = (b as any).isHoming;

        if (isHoming) {
          // 1. Draw Shadow on the floor under the projectile (source-over blending, transparent black)
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
          ctx.beginPath();
          // Shadow gets smaller as the sphere floats higher
          const shadowScale = Math.max(0.3, 1.0 - (b.z || 0) / 60);
          const shadowSize = (8 + Math.sin(time * 8) * 1.5) * shadowScale;
          ctx.ellipse(b.x, b.y, shadowSize, shadowSize * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 2. Draw Floating Homing Plasma Ball (screen blending, offset vertically by -b.z)
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.shadowColor = "rgba(255, 30, 30, 0.9)";
          ctx.shadowBlur = 20 + Math.random() * 8;
          
          // Outer red energy sphere with pulsing size
          ctx.beginPath();
          ctx.arc(b.x, b.y - (b.z || 0), 11 + Math.sin(time * 10) * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 20, 20, 0.95)";
          ctx.fill();
          
          // Glowing inner white core
          ctx.beginPath();
          ctx.arc(b.x, b.y - (b.z || 0), 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          
          ctx.restore();
          continue;
        }

        if (b.dmgMult < 1.0 && !isDoze) {
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.globalCompositeOperation = "screen";
        }
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        const tailLength = b.isFury ? 0.08 : isDoze ? 0.07 : 0.05;
        ctx.lineTo(b.x - b.vx * tailLength, b.y - b.vy * tailLength);

        let bulletColor =
          isDoze
            ? "rgba(255, 140, 30, 0.95)"
            : b.dmgMult < 1.0
              ? "rgba(120, 120, 120, 0.8)"
              : b.isFury
                ? "rgba(255, 30, 30, 0.9)"
                : "rgba(255, 60, 60, 0.8)";
        if (b.themeColor) {
           const hex = b.themeColor.replace('#', '');
           const r = parseInt(hex.substring(0,2), 16);
           const g = parseInt(hex.substring(2,4), 16);
           const bl = parseInt(hex.substring(4,6), 16);
           bulletColor = `rgba(${r}, ${g}, ${bl}, 0.9)`;
        }
        ctx.strokeStyle = bulletColor;
        ctx.lineWidth = (b.isFury ? 8 : isDoze ? 5.5 : 5) * Math.max(0.3, b.dmgMult);
        ctx.stroke();

        // Inner hot core
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(
          b.x - b.vx * (tailLength * 0.5),
          b.y - b.vy * (tailLength * 0.5),
        );
        const coreColor =
          isDoze
            ? "rgba(255, 245, 200, 0.95)"
            : b.dmgMult < 1.0 ? "rgba(200, 200, 200, 0.9)" : "#ffffff";
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = (b.isFury ? 4 : isDoze ? 2.5 : 2) * Math.max(0.3, b.dmgMult);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      // --- Draw Particles ---
      ctx.globalCompositeOperation = "screen";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        if (p.isSmoke) {
          ctx.globalCompositeOperation = "source-over";
          // Much more transparent smoke
          ctx.globalAlpha = Math.max(0, p.life * 0.25);
        } else {
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = p.life * 5 > 1 ? 1 : p.life * 5;
        }
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      ctx.globalCompositeOperation = "source-over";

      // --- Draw Fury Souls ---
      ctx.globalCompositeOperation = "screen";
      for (const s of furySouls) {
        const speed = Math.hypot(s.vx, s.vy);
        const stretch = Math.max(1, speed / 250);
        const angle = Math.atan2(s.vy, s.vx);

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(angle);
        
        ctx.shadowColor = "rgba(255, 50, 0, 1)";
        ctx.shadowBlur = 30 + Math.random() * 10;

        // Glowing streak tail
        ctx.beginPath();
        ctx.ellipse(-10 * stretch, 0, 18 * stretch, 7 + Math.random() * 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 70, 0, 0.7)";
        ctx.fill();

        // Energy Core
        ctx.beginPath();
        ctx.arc(0, 0, 7 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Secondary inner core (intense heat)
        ctx.beginPath();
        ctx.arc(-3 * stretch, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 100, 0.9)";
        ctx.fill();

        // Sparkles
        if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.arc(-20 * stretch - Math.random() * 10, (Math.random() - 0.5) * 15, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
            ctx.fill();
        }

        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";

      // --- Draw Roll Afterimage Ghosts ---
      if (rollGhosts.length > 0) {
        const gMain = skinRef.current ? skinRef.current.colorMain : "#2d4c22";
        for (let i = rollGhosts.length - 1; i >= 0; i--) {
          const g = rollGhosts[i];
          const decaySpeed = g.isBlue ? 1.8 : 3.5;
          g.alpha -= dt * decaySpeed;
          if (g.alpha <= 0) { rollGhosts.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = g.alpha * 0.75;
          ctx.translate(g.x, g.y);
          ctx.rotate(g.angle);
          
          if (g.isBlue) {
            // Neon glow effect matching player's current skin color
            ctx.shadowBlur = 25;
            ctx.shadowColor = gMain;
            ctx.fillStyle = gMain + "88"; // opacity
            ctx.strokeStyle = gMain + "bb";
            ctx.lineWidth = 2.5;

            // Draw Torso Silhouette
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-15, -16, 26, 32, 6);
            } else {
              ctx.rect(-15, -16, 26, 32);
            }
            ctx.fill();
            ctx.stroke();

            // Draw Shoulders/Arms Silhouette
            ctx.beginPath();
            ctx.ellipse(-2, -16, 14, 9, -Math.PI / 6, 0, Math.PI * 2);
            ctx.ellipse(-2, 16, 14, 9, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw Head Silhouette
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Zombie orange dash trail
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#f97316";
            ctx.fillStyle = "rgba(249, 115, 22, 0.75)";
            
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#1a1a1a";
            ctx.beginPath();
            ctx.arc(12, 0, 10, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // --- Draw Dust Particles ---
      if (dustParticles.length > 0) {
        ctx.save();
        for (const dp of dustParticles) {
          const lifeRatio = dp.life / dp.maxLife;
          ctx.globalAlpha = lifeRatio * 0.7;
          if (dp.size < 5) {
             ctx.fillStyle = "rgba(40, 30, 20, 0.9)";
          } else {
             ctx.fillStyle = `rgba(130, 115, 95, ${0.4 + lifeRatio * 0.4})`;
          }
          ctx.beginPath();
          const renderSize = dp.size < 5 ? dp.size : dp.size * (2 - lifeRatio);
          ctx.arc(dp.x, dp.y, renderSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Draw Player ---
      if (!player.isDead && (!cutsceneRef.current.active || 
          cutsceneRef.current.phase === "PLAYER_DESCENDING" || 
          cutsceneRef.current.phase === "PLAYER_LOADING_WEAPON" || 
          cutsceneRef.current.phase === "INTRO_SCREEN_FADE" || 
          cutsceneRef.current.phase === "FADING_GAME_IN" || 
          cutsceneRef.current.phase === "KOMBI_LEAVING")) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        // Cinematic Cutscene Descending body bobbing (no spin jump)
        if (cutsceneRef.current.active && cutsceneRef.current.phase === "PLAYER_DESCENDING") {
          const progress = cutsceneRef.current.playerJumpProgress;
          const bob = Math.sin(progress * Math.PI * 6) * 1.5;
          ctx.translate(0, bob);
        }

        // Draw blue shield bubble if invincibility shield is active
        if ((player as any).shieldTimer && (player as any).shieldTimer > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, 36, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
          ctx.lineWidth = 3 + Math.sin(Date.now() * 0.018) * 1.5;
          ctx.fillStyle = "rgba(59, 130, 246, 0.12)";
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#3b82f6";
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Draw Mobile Aim Arrow
        const isAimingOrShooting = (window as any).mobileAimActive || (window as any).mobileShootActive;
        if ((isMobileRef.current || showMobileControlsRef.current) && isAimingOrShooting) {
          ctx.save();
          ctx.translate(65, 0);
          
          const pulse = 1.0 + Math.sin(Date.now() * 0.015) * 0.12;
          ctx.scale(pulse, pulse);
          
          ctx.shadowColor = "rgba(239, 68, 68, 0.95)";
          ctx.shadowBlur = 10;
          
          ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
          ctx.lineWidth = 2.8;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          
          ctx.beginPath();
          ctx.moveTo(-8, -6);
          ctx.lineTo(2, 0);
          ctx.lineTo(-8, 6);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-2, -6);
          ctx.lineTo(8, 0);
          ctx.lineTo(-2, 6);
          ctx.stroke();
          
          ctx.restore();
        }

        const activeWeapon =
          inventoryRef.current.hotbar[inventoryRef.current.activeSlot];
        const hasGun = !!activeWeapon;

        // Idle Breathing Scale
        let breathScale = 1.0;
        if (player.idleTimer > 1) {
          breathScale = 1.0 + Math.sin(player.idleTimer * 2) * 0.02;
        }
        if (player.healthGlowTimer > 0) {
          // Satisfying pulsate animation when healing!
          breathScale = 1.0 + Math.sin(player.healthGlowTimer * Math.PI * 2) * 0.08;
        }
        ctx.scale(breathScale, breathScale);

        // Animation parameters
        const gunDrop = player.gunDropLerp;
        const walkBobTime = player.isMoving ? player.moveTimer * 12 : 0;

        const dropMoveX = gunDrop * -30;
        const dropMoveY = gunDrop * 18; // slightly inwards
        const dropRot = gunDrop * 2.0; // point gun entirely back

        const bobWalkX = player.isMoving
          ? Math.sin(walkBobTime) * (player.isRunning ? 8 : 4)
          : 0;
        const bobWalkY = player.isMoving
          ? Math.cos(walkBobTime * 2) * (player.isRunning ? 4 : 2)
          : 0;
        const swayRot = player.isMoving
          ? Math.sin(walkBobTime) * (player.isRunning ? 0.3 : 0.1)
          : 0;

        let gunAnimX = bobWalkX + dropMoveX;
        let gunAnimY = bobWalkY + dropMoveY;
        let gunAnimRot = swayRot + dropRot;

        if (player.isReloading && hasGun && activeWeapon) {
          const stats = WEAPONS_DETAILS[activeWeapon];
          const rTime = stats ? stats.reloadTime : 2.5;
          const rP = 1.0 - player.reloadTimer / rTime; // 0 to 1
          gunAnimRot -= Math.sin(rP * Math.PI) * 1.5;
          gunAnimX -= Math.sin(rP * Math.PI) * 15;
          gunAnimY += Math.sin(rP * Math.PI) * 5;
        }

        const shL_X =
          0 + (player.isMoving ? Math.cos(walkBobTime + Math.PI) * 2 : 0);
        const shL_Y =
          -16 + (player.isMoving ? Math.sin(walkBobTime + Math.PI) * 2 : 0);

        const shR_X = 0 + (player.isMoving ? Math.cos(walkBobTime) * 2 : 0);
        const shR_Y = 16 + (player.isMoving ? Math.sin(walkBobTime) * 2 : 0);

        // Hand L base position: 28, -6
        // Hand R base position: 10, 8
        // Right hand is the pivot point for rotation approx
        const pivotX = 10;
        const pivotY = 8;

        const rotatePoint = (
          px: number,
          py: number,
          cx: number,
          cy: number,
          angle: number,
        ) => {
          const s = Math.sin(angle);
          const c = Math.cos(angle);
          px -= cx;
          py -= cy;
          return { x: px * c - py * s + cx, y: px * s + py * c + cy };
        };

        let gripLeftX = 28;
        let gripLeftY = -6;
        if (activeWeapon === "pistola" || activeWeapon === "magnum" || activeWeapon === "uzi") {
          gripLeftX = 6;
          gripLeftY = -14;
        } else if (activeWeapon === "rifle") {
          gripLeftX = 38;
          gripLeftY = -4;
        } else if (activeWeapon === "basuca") {
          gripLeftX = 32;
          gripLeftY = -6;
        } else if (activeWeapon === "doze") {
          gripLeftX = 24;
          gripLeftY = -5;
        }

        const hL = hasGun
          ? rotatePoint(gripLeftX, gripLeftY, pivotX, pivotY, gunAnimRot)
          : { x: shL_X + 15, y: shL_Y + 4 };
        const handL_X = hasGun
          ? hL.x + gunAnimX
          : hL.x + Math.sin(walkBobTime) * 5;
        const handL_Y = hasGun ? hL.y + gunAnimY : hL.y;

        const hR = hasGun
          ? rotatePoint(10, 8, pivotX, pivotY, gunAnimRot)
          : { x: shR_X + 15, y: shR_Y - 4 };
        const handR_X = hasGun
          ? hR.x + gunAnimX
          : hR.x - Math.sin(walkBobTime) * 5;
        const handR_Y = hasGun ? hR.y + gunAnimY : hR.y;

        const sMain = skinRef.current ? skinRef.current.colorMain : "#2d4c22";
        const sDark = skinRef.current ? skinRef.current.colorDark : "#1e3317";
        const sSkin = skinRef.current ? skinRef.current.colorSkin : "#151515";

        // Player drop shadow is drawn earlier (before mannequins) so it does not render on top of their bodies
        ctx.save();
        ctx.restore();

        if (player.isRolling) {
           let progress = 1 - (player.rollTimer / (player.rollDuration || 1));
           if (progress < 0) progress = 0;
           if (progress > 1) progress = 1;

           // Only jump up/down + squish, NO rotation spin
           const jumpHeight = Math.max(0, Math.sin(progress * Math.PI) * 38);
           const squishX = 1.0 + Math.sin(progress * Math.PI) * 0.4;
           const squishY = 1.0 - Math.sin(progress * Math.PI) * 0.25;

           ctx.translate(0, -jumpHeight);
           ctx.scale(squishX, squishY);

           // Draw dynamic motion blur speed trails and glow when rolling/dashing
           ctx.save();
           ctx.shadowBlur = 28;
           ctx.shadowColor = sMain;
           
           // Motion blur shape 1 (semi-transparent player theme color)
           ctx.fillStyle = sMain + "4d"; // ~30% opacity
           ctx.beginPath();
           ctx.arc(-18, 0, 12, 0, Math.PI * 2);
           ctx.fill();
           
           // Motion blur shape 2
           ctx.fillStyle = sMain + "26"; // ~15% opacity
           ctx.beginPath();
           ctx.arc(-36, 0, 9, 0, Math.PI * 2);
           ctx.fill();
           
           // Speed lines stretching backward
           ctx.strokeStyle = sMain + "80"; // ~50% opacity
           ctx.lineWidth = 3;
           ctx.beginPath();
           ctx.moveTo(-15, -6);
           ctx.lineTo(-50, -6);
           ctx.moveTo(-15, 6);
           ctx.lineTo(-50, 6);
           ctx.stroke();
           
           ctx.restore();
        }

        // --- Draw Small Joint Straps on Shoulders ---
        ctx.save();
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(shL_X, shL_Y, 7, 0, Math.PI * 2);
        ctx.arc(shR_X, shR_Y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = sDark;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // --- Draw Thicker Tactical Arms ---
        ctx.save();
        ctx.strokeStyle = sMain;
        ctx.lineWidth = 13; // Thicker arms for better visibility
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Left Arm
        ctx.beginPath();
        ctx.moveTo(shL_X, shL_Y);
        ctx.lineTo(handL_X, handL_Y);
        ctx.stroke();
        
        ctx.strokeStyle = sDark;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Right Arm
        ctx.strokeStyle = sMain;
        ctx.lineWidth = 13;
        ctx.beginPath();
        ctx.moveTo(shR_X, shR_Y);
        ctx.lineTo(handR_X, handR_Y);
        ctx.stroke();
        
        ctx.strokeStyle = sDark;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        // --- Draw Tactical Elbow Pads ---
        ctx.save();
        ctx.fillStyle = "#111827"; // Dark tactical pads
        ctx.strokeStyle = sDark;
        ctx.lineWidth = 1.5;
        
        // Left Elbow Pad (midway)
        const midLX = (shL_X + handL_X) / 2;
        const midLY = (shL_Y + handL_Y) / 2;
        ctx.beginPath();
        ctx.arc(midLX, midLY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Elbow Pad
        const midRX = (shR_X + handR_X) / 2;
        const midRY = (shR_Y + handR_Y) / 2;
        ctx.beginPath();
        ctx.arc(midRX, midRY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Body (Torso Kevlar Vest with realistic details)
        ctx.save();
        ctx.fillStyle = sDark;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-16, -17, 28, 34, 8);
        } else {
          ctx.rect(-16, -17, 28, 34);
        }
        ctx.fill();
        ctx.restore();

        // Tactical Kevlar Ribbing & Straps
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-16, -9); ctx.lineTo(12, -9);
        ctx.moveTo(-16, -1); ctx.lineTo(12, -1);
        ctx.moveTo(-16, 7);  ctx.lineTo(12, 7);
        ctx.stroke();

        // Center Armor Plate Overlay
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-8, -12, 14, 24, 4);
        } else {
          ctx.rect(-8, -12, 14, 24);
        }
        ctx.fill();

        // Radio antenna and wires on back
        ctx.strokeStyle = "#09090b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-24, 18);
        ctx.stroke();

        // Tactical Pouches (3D shaded)
        ctx.fillStyle = sMain;
        ctx.fillRect(-14, -13, 5, 8); // Pouch 1
        ctx.fillStyle = "#111827";
        ctx.fillRect(-14, -13, 5, 2); // Pouch strap
        
        ctx.fillStyle = sMain;
        ctx.fillRect(-14, 5, 5, 8); // Pouch 2
        ctx.fillStyle = "#111827";
        ctx.fillRect(-14, 5, 5, 2); // Pouch strap

        // Head / Helmet
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#1f2937"; // Dark tactical helmet
        ctx.fill();

        // Helmet details
        ctx.beginPath();
        ctx.arc(0, 0, 12, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.fillStyle = "#111827"; // Helmet shadow/rim
        ctx.fill();

        // Goggles / Visor
        ctx.beginPath();
        ctx.arc(2, 0, 12, -Math.PI / 4, Math.PI / 4);
        ctx.lineTo(8, 0);
        ctx.fillStyle = "#10b981"; // Night vision / tactical green glow
        ctx.fill();

        if (hasGun) {
          // Gun & Hands Group
          ctx.save();
          ctx.translate(gunAnimX, gunAnimY);
          ctx.translate(pivotX, pivotY);
          ctx.rotate(gunAnimRot);
          ctx.translate(-pivotX, -pivotY);

            if (activeWeapon === "minigun") {
              // Draw dynamic ammo belt linking player back to gun
              ctx.save();
              ctx.strokeStyle = "#a1a1aa"; // Zinc
              ctx.lineWidth = 5;
              ctx.lineCap = "round";
              
              ctx.beginPath();
              // Back of the player approx
              ctx.moveTo(-8, 0); 
              
              // Control point for gravity curve
              const cpX = pivotX - 8;
              const cpY = pivotY + 16 + Math.sin(Date.now() * 0.008) * 4;
              
              // End at the weapon side
              const endX = pivotX + 15;
              const endY = pivotY + 4;
              
              ctx.quadraticCurveTo(cpX, cpY, endX, endY);
              ctx.stroke();

              // Draw bullet notches along the belt
              ctx.strokeStyle = "#fbbf24"; // Gold
              ctx.lineWidth = 2.5;
              ctx.setLineDash([2, 5]); 
              ctx.stroke();
              ctx.restore();
            }

            // Draw using loaded PNG if available
            const equippedSkinId = inventoryRef.current.equippedSkins[activeWeapon];
            const skinImg = equippedSkinId ? loadedSkinImages[equippedSkinId] : null;
            const img = skinImg || loadedWeaponImages[activeWeapon];
            const hasImg = img && img.complete && img.naturalWidth > 0;

            if (hasImg) {
              ctx.save();
              const cfg = WEAPON_RENDER_CONFIG[activeWeapon] || { width: 40, height: 15, x: 8, y: -7, rotation: 0 };
              ctx.translate(cfg.x, cfg.y);
              ctx.rotate(cfg.rotation);
              const aspect = img.naturalHeight / img.naturalWidth;
              const drawHeight = cfg.width * aspect;
              
              // Permitir scaling com anti-aliasing para armas HD
              ctx.imageSmoothingEnabled = true;
              ctx.drawImage(img, 0, -drawHeight / 2, cfg.width, drawHeight);
              ctx.imageSmoothingEnabled = true;
              
              ctx.restore();

              // Render laser sight for sniper rifle or if the tactical laser is toggled ON
              if (activeWeapon === "rifle" || player.isLaserOn) {
                ctx.save();
                ctx.globalCompositeOperation = "screen";

                const bTip = getBarrelTip(activeWeapon);
                const barrelLocalX = bTip.x;
                const barrelLocalY = bTip.y;
                const rotBarrel = rotatePoint(barrelLocalX, barrelLocalY, pivotX, pivotY, gunAnimRot);
                const barrelWorldX = player.x + Math.cos(player.angle) * (rotBarrel.x + gunAnimX) - Math.sin(player.angle) * (rotBarrel.y + gunAnimY);
                const barrelWorldY = player.y + Math.sin(player.angle) * (rotBarrel.x + gunAnimX) + Math.cos(player.angle) * (rotBarrel.y + gunAnimY);

                // Laser pointer straight ahead from barrel
                const laserAngle = player.angle + gunAnimRot;
                const ndx = Math.cos(laserAngle);
                const ndy = Math.sin(laserAngle);
                let closestT = 2000;

                for (const m of mannequins) {
                  if (m.hp > 0) {
                    const vx = m.x - barrelWorldX;
                    const vy = m.y - barrelWorldY;
                    const projT = vx * ndx + vy * ndy;
                    if (projT > 0 && projT < closestT) {
                      const r = m.isBoss ? 45 : 25;
                      const perpDist = Math.hypot(vx - projT * ndx, vy - projT * ndy);
                      if (perpDist < r) {
                        const offset = Math.sqrt(r * r - perpDist * perpDist);
                        const intersectT = Math.max(0, projT - offset);
                        if (intersectT < closestT) {
                          closestT = intersectT;
                        }
                      }
                    }
                  }
                }
                const laserTargetX = barrelWorldX + ndx * closestT;
                const laserTargetY = barrelWorldY + ndy * closestT;

                const tx = laserTargetX - player.x;
                const ty = laserTargetY - player.y;
                const cosPA = Math.cos(-player.angle);
                const sinPA = Math.sin(-player.angle);
                const unRotPX = tx * cosPA - ty * sinPA;
                const unRotPY = tx * sinPA + ty * cosPA;
                const unAnimX = unRotPX - gunAnimX;
                const unAnimY = unRotPY - gunAnimY;
                const localTarget = rotatePoint(unAnimX, unAnimY, pivotX, pivotY, -gunAnimRot);

                ctx.beginPath();
                ctx.moveTo(barrelLocalX, barrelLocalY);
                ctx.lineTo(localTarget.x, localTarget.y);
                ctx.strokeStyle = "rgba(255, 0, 0, 0.15)";
                ctx.lineWidth = 4.0;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(barrelLocalX, barrelLocalY);
                ctx.lineTo(localTarget.x, localTarget.y);
                ctx.strokeStyle = "rgba(255, 10, 10, 0.45)";
                ctx.lineWidth = 1.8;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(barrelLocalX, barrelLocalY);
                ctx.lineTo(localTarget.x, localTarget.y);
                ctx.strokeStyle = "rgba(255, 200, 200, 0.95)";
                ctx.lineWidth = 0.6;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(localTarget.x, localTarget.y, 5.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 0, 0, 0.35)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(localTarget.x, localTarget.y, 3.0, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 50, 50, 0.85)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(localTarget.x, localTarget.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.restore();
              }
            } else {
            // Gun Outline & Body (Fallback)
            const currentWepColor = activeWeapon && WEAPONS_DETAILS[activeWeapon] ? WEAPONS_DETAILS[activeWeapon].color : "#ffffff";
            ctx.strokeStyle = currentWepColor;
            ctx.lineWidth = 2.0;
            ctx.lineJoin = "round";
            ctx.beginPath();

            if (activeWeapon === "pistola") {
              ctx.rect(8, -2, 22, 5);
              ctx.stroke();

              ctx.fillStyle = "#333";
              ctx.fillRect(8, -2, 22, 5);
              ctx.fillStyle = "#1e241c";
              ctx.fillRect(8, 0, 6, 8);
              ctx.fillStyle = "#f59e0b";
              ctx.fillRect(16, 2, 4, 3);
            } else if (activeWeapon === "uzi") {
              ctx.rect(6, -3.5, 26, 7);
              ctx.stroke();

              ctx.fillStyle = "#1f2937";
              ctx.fillRect(6, -3.5, 26, 7);
              ctx.fillStyle = "#111827";
              ctx.fillRect(10, -2, 10, 5);
              ctx.fillStyle = "#0f172a";
              ctx.fillRect(13, 2, 4.5, 11);
            } else if (activeWeapon === "doze") {
              ctx.rect(8, -3.5, 46, 7);
              ctx.stroke();

              ctx.fillStyle = "#78350f";
              ctx.fillRect(8, -3, 14, 6.5);
              ctx.fillRect(5, 0, 5, 7);
              ctx.fillStyle = "#4b5563";
              ctx.fillRect(22, -3.5, 10, 7);
              ctx.fillStyle = "#92400e";
              ctx.fillRect(32, -3.5, 10, 6.5);
              ctx.fillStyle = "#111827";
              ctx.fillRect(42, -2.5, 12, 5);
            } else if (activeWeapon === "basuca") {
              ctx.rect(2, -7.5, 62, 15);
              ctx.stroke();

              ctx.fillStyle = "#14532d";
              ctx.fillRect(2, -6.5, 62, 13);
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(2, -7.5, 5, 15);
              ctx.fillRect(59, -7.5, 5, 15);

              ctx.fillStyle = "#0f172a";
              ctx.beginPath();
              ctx.moveTo(2, -4);
              ctx.lineTo(-4, -8);
              ctx.lineTo(-4, 8);
              ctx.lineTo(2, 4);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = "#facc15";
              ctx.beginPath();
              ctx.arc(64, 0, 5, -Math.PI / 2, Math.PI / 2);
              ctx.fill();
              ctx.fillStyle = "#ef4444";
              ctx.fillRect(64, -5, 1.5, 10);
            } else if (activeWeapon === "rifle") {
              ctx.rect(8, -4, 64, 8);
              ctx.stroke();

              ctx.fillStyle = "#18181b";
              ctx.fillRect(8, -3, 24, 6);
              ctx.fillStyle = "#09090b";
              ctx.fillRect(16, -7.5, 16, 3.5);
              ctx.fillRect(19, -9, 2, 2.5);
              ctx.fillRect(29, -9, 2, 2.5);
              ctx.fillStyle = "#374151";
              ctx.fillRect(32, -3, 8, 6.5);
              ctx.fillStyle = "#64748b";
              ctx.fillRect(40, -1.5, 28, 3.5);
              ctx.fillStyle = "#09090b";
              ctx.fillRect(68, -3, 4, 6);

              // Laser Sight
              ctx.save();
              ctx.globalCompositeOperation = "screen";

              const barrelLocalX = 72;
              const barrelLocalY = 0;
              const rotBarrel = rotatePoint(barrelLocalX, barrelLocalY, pivotX, pivotY, gunAnimRot);
              const barrelWorldX = player.x + Math.cos(player.angle) * (rotBarrel.x + gunAnimX) - Math.sin(player.angle) * (rotBarrel.y + gunAnimY);
              const barrelWorldY = player.y + Math.sin(player.angle) * (rotBarrel.x + gunAnimX) + Math.cos(player.angle) * (rotBarrel.y + gunAnimY);

              let laserTargetX = worldMouseX;
              let laserTargetY = worldMouseY;

              const dxBeam = worldMouseX - barrelWorldX;
              const dyBeam = worldMouseY - barrelWorldY;
              const beamDist = Math.hypot(dxBeam, dyBeam);

              if (beamDist > 1) {
                const ndx = dxBeam / beamDist;
                const ndy = dyBeam / beamDist;
                let closestT = beamDist;

                for (const m of mannequins) {
                  if (m.hp > 0) {
                    const vx = m.x - barrelWorldX;
                    const vy = m.y - barrelWorldY;
                    const projT = vx * ndx + vy * ndy;
                    if (projT > 0 && projT < closestT) {
                      const r = m.isBoss ? 45 : 25;
                      const perpDist = Math.hypot(vx - projT * ndx, vy - projT * ndy);
                      if (perpDist < r) {
                        const offset = Math.sqrt(r * r - perpDist * perpDist);
                        const intersectT = Math.max(0, projT - offset);
                        if (intersectT < closestT) {
                          closestT = intersectT;
                        }
                      }
                    }
                  }
                }
                laserTargetX = barrelWorldX + ndx * closestT;
                laserTargetY = barrelWorldY + ndy * closestT;
              }

              const tx = laserTargetX - player.x;
              const ty = laserTargetY - player.y;
              const cosPA = Math.cos(-player.angle);
              const sinPA = Math.sin(-player.angle);
              const unRotPX = tx * cosPA - ty * sinPA;
              const unRotPY = tx * sinPA + ty * cosPA;
              const unAnimX = unRotPX - gunAnimX;
              const unAnimY = unRotPY - gunAnimY;
              const localTarget = rotatePoint(unAnimX, unAnimY, pivotX, pivotY, -gunAnimRot);

              ctx.beginPath();
              ctx.moveTo(72, 0);
              ctx.lineTo(localTarget.x, localTarget.y);
              ctx.strokeStyle = "rgba(255, 0, 0, 0.15)";
              ctx.lineWidth = 4.0;
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(72, 0);
              ctx.lineTo(localTarget.x, localTarget.y);
              ctx.strokeStyle = "rgba(255, 10, 10, 0.45)";
              ctx.lineWidth = 1.8;
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(72, 0);
              ctx.lineTo(localTarget.x, localTarget.y);
              ctx.strokeStyle = "rgba(255, 200, 200, 0.95)";
              ctx.lineWidth = 0.6;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(localTarget.x, localTarget.y, 5.5, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255, 0, 0, 0.35)";
              ctx.fill();

              ctx.beginPath();
              ctx.arc(localTarget.x, localTarget.y, 3.0, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255, 50, 50, 0.85)";
              ctx.fill();

              ctx.beginPath();
              ctx.arc(localTarget.x, localTarget.y, 1.2, 0, Math.PI * 2);
              ctx.fillStyle = "#ffffff";
              ctx.fill();

              ctx.restore();
            } else {
              ctx.rect(8, -2.5, 48, 7);
              ctx.stroke();

              ctx.fillStyle = "#111";
              ctx.fillRect(8, -1.5, 45, 5);
              ctx.fillStyle = "#222";
              ctx.fillRect(8, -3, 14, 8);
              ctx.fillStyle = "#050505";
              ctx.fillRect(22, -3, 12, 8);
              ctx.fillRect(48, -2.5, 8, 7);
            }
          }

          // Left Hand (Tactical Glove)
          ctx.save();
          ctx.beginPath();
          ctx.arc(gripLeftX, gripLeftY, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#1e293b"; // Dark Kevlar glove
          ctx.fill();
          // Knuckle reinforcement plate matching sMain theme
          ctx.beginPath();
          ctx.arc(gripLeftX, gripLeftY, 3, 0, Math.PI * 2);
          ctx.fillStyle = sMain;
          ctx.fill();
          ctx.restore();

          // Right Hand (Tactical Glove on trigger)
          ctx.save();
          ctx.beginPath();
          ctx.arc(10, 8, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(10, 8, 3, 0, Math.PI * 2);
          ctx.fillStyle = sMain;
          ctx.fill();
          ctx.restore();

          ctx.restore();
        } else {
          // Just draw hands swinging (Tactical Gloves)
          ctx.save();
          ctx.beginPath();
          ctx.arc(handL_X, handL_Y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(handL_X, handL_Y, 3, 0, Math.PI * 2);
          ctx.fillStyle = sMain;
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.arc(handR_X, handR_Y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(handR_X, handR_Y, 3, 0, Math.PI * 2);
          ctx.fillStyle = sMain;
          ctx.fill();
          ctx.restore();
        }

        // --- Draw Premium Spec-Ops Tactical Helmet ---
        ctx.save();
        const hBobX = -2 + (player.isMoving ? Math.cos(walkBobTime) * 1.5 : 0);
        
        // Helmet Drop Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.arc(hBobX + 2, 2.5, 14, 0, Math.PI * 2);
        ctx.fill();

        // 1. Helmet Base Shell (sleek, angular combat helmet shape)
        ctx.fillStyle = "#1e293b"; // Tactical dark slate
        ctx.beginPath();
        ctx.moveTo(hBobX - 12, -10);
        ctx.lineTo(hBobX + 8, -10);
        ctx.lineTo(hBobX + 13, -4);
        ctx.lineTo(hBobX + 13, 4);
        ctx.lineTo(hBobX + 8, 10);
        ctx.lineTo(hBobX - 12, 10);
        ctx.lineTo(hBobX - 15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // 2. Center reinforcement ridge (strip running front-to-back)
        ctx.fillStyle = sMain;
        ctx.fillRect(hBobX - 14, -3, 22, 6);

        // 3. Cybernetic Glowing Visor (V-shaped or sleek horizontal bar matching theme color)
        ctx.beginPath();
        ctx.moveTo(hBobX + 4, -8);
        ctx.lineTo(hBobX + 12, -4);
        ctx.lineTo(hBobX + 12, 4);
        ctx.lineTo(hBobX + 4, 8);
        ctx.lineTo(hBobX + 6, 0);
        ctx.closePath();
        ctx.fillStyle = sMain; // Visor glows with active skin color!
        ctx.shadowBlur = 12;
        ctx.shadowColor = sMain;
        ctx.fill();
        
        // Visor glass reflection
        ctx.beginPath();
        ctx.moveTo(hBobX + 7, -6);
        ctx.lineTo(hBobX + 11, -3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // 4. Tactical Side Comms modules
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(hBobX - 6, -12, 5, 2);
        ctx.fillRect(hBobX - 6, 10, 5, 2);

        ctx.restore();

        // Player Blood Overlay
        if (player.bloodAmount && player.bloodAmount > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 0, 0, ${player.bloodAmount * 0.7})`;
          ctx.fill();

          // Random blood droplets fixed to body
          // We use pseudo-random based on player id/always same seed so it doesnt flicker
          for (let b = 0; b < 5; b++) {
            ctx.beginPath();
            const bx = Math.sin(b * 123) * 10;
            const by = Math.cos(b * 321) * 10;
            ctx.arc(bx, by, 2 + Math.sin(b) * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 0, 0, ${player.bloodAmount * 0.9})`;
            ctx.fill();
          }
        }

        // Muzzle Flash Effect (Visual fire)
        if (muzzleFlash > 0) {
          ctx.save();
          ctx.translate(gunAnimX, gunAnimY);
          ctx.translate(pivotX, pivotY);
          ctx.rotate(gunAnimRot);
          ctx.translate(-pivotX, -pivotY);

          const bTip = getBarrelTip(activeWeapon || "gun");
          ctx.translate(bTip.x, bTip.y); // Move to tip of gun

          const isDoze = activeWeapon === "doze";
          ctx.beginPath();
          const flashLen = (isDoze ? 80 : 50) * muzzleFlash + Math.random() * 20;
          const flashSpread = isDoze ? 28 : 14;
          ctx.moveTo(0, -5);
          ctx.lineTo(flashLen * 0.45, -flashSpread * muzzleFlash);
          ctx.lineTo(flashLen, 0);
          ctx.lineTo(flashLen * 0.45, flashSpread * muzzleFlash);
          ctx.lineTo(0, 5);
          ctx.fillStyle = isDoze ? "rgba(255, 120, 30, 0.95)" : "rgba(255, 230, 150, 0.9)";
          ctx.fill();

          // Side jets of fire for shotgun
          if (isDoze) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(flashLen * 0.4, -22 * muzzleFlash);
            ctx.lineTo(flashLen * 0.5, -28 * muzzleFlash);
            ctx.lineTo(flashLen * 0.2, -5 * muzzleFlash);
            ctx.fillStyle = "rgba(255, 100, 10, 0.8)";
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(flashLen * 0.4, 22 * muzzleFlash);
            ctx.lineTo(flashLen * 0.5, 28 * muzzleFlash);
            ctx.lineTo(flashLen * 0.2, 5 * muzzleFlash);
            ctx.fillStyle = "rgba(255, 100, 10, 0.8)";
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(0, 0, (isDoze ? 18 : 12) * muzzleFlash, 0, Math.PI * 2);
          ctx.fillStyle = isDoze ? "#ffddaa" : "#fff";
          ctx.fill();

          ctx.restore();
        }

        // Flashing animation when collecting life energies
        if (player.healthGlowTimer > 0) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const flashAlpha = Math.sin(player.healthGlowTimer * Math.PI * 14) * 0.4 + 0.6;
          
          // Expanding glowing shockwave ring
          const waveRadius = 15 + (0.6 - player.healthGlowTimer) * 75;
          ctx.strokeStyle = `rgba(50, 255, 120, ${player.healthGlowTimer * 1.6})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Torso/Helmet neon overlay
          ctx.fillStyle = `rgba(50, 255, 120, ${0.55 * flashAlpha * player.healthGlowTimer})`;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();

          // Rising green health crosses (+ symbols) that spiral around the player
          const numCrosses = 4;
          for (let c = 0; c < numCrosses; c++) {
            const progress = (player.healthGlowTimer * 2.5 + c * 0.25) % 1.0;
            const radius = 16 + progress * 24;
            const angle = c * (Math.PI * 2 / numCrosses) + player.healthGlowTimer * 3.5;
            const cx = Math.cos(angle) * radius;
            const cy = Math.sin(angle) * radius - progress * 25; // float upwards
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = `rgba(52, 211, 153, ${1.0 - progress})`;
            ctx.fillRect(-5, -1.8, 10, 3.6);
            ctx.fillRect(-1.8, -5, 3.6, 10);
            ctx.restore();
          }

          ctx.restore();
        }

        ctx.restore(); // Restore from player transformations
      } // close if (!player.isDead)

      // --- Draw Speech Bubble above player ---
      if (player.speechTimer > 0 && player.speechText && !player.isDead && (!cutsceneRef.current.active || cutsceneRef.current.phase === "KOMBI_LEAVING")) {
        ctx.save();
        ctx.translate(player.x, player.y - 72);
        
        ctx.font = "bold 13px 'JetBrains Mono', monospace";
        const textWidth = ctx.measureText(player.speechText).width;
        const paddingX = 14;
        const paddingY = 8;
        const bubbleWidth = textWidth + paddingX * 2;
        const bubbleHeight = 16 + paddingY * 2;
        
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = "rgba(12, 10, 9, 0.95)";
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.8;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-bubbleWidth / 2, -bubbleHeight - 8, bubbleWidth, bubbleHeight, 6);
        } else {
          ctx.rect(-bubbleWidth / 2, -bubbleHeight - 8, bubbleWidth, bubbleHeight);
        }
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "rgba(12, 10, 9, 0.95)";
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(6, -8);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "#eab308";
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(0, 0);
        ctx.lineTo(6, -8);
        ctx.stroke();
        
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.speechText, 0, -bubbleHeight / 2 - 8);
        
        ctx.restore();
      }

      // --- Draw Reloading Indicator above player ---
      if (player.isReloading && !player.isDead && player.reloadTimer > 0) {
        ctx.save();
        ctx.translate(player.x, player.y - 60);

        const rP = 1.0 - player.reloadTimer / 2.5;

        // Background ring
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Progress ring
        ctx.beginPath();
        ctx.arc(0, 0, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rP);
        ctx.strokeStyle = "#ffbb00";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Inner spinning cross
        ctx.rotate(rP * Math.PI * 4);
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // --- Draw Damage Texts ---
      for (const t of damageTexts) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.globalAlpha = t.life;
        ctx.textAlign = "center";

        // Training dummy hit: ultra-cinematic floating number
        if ((t as any).isTrainingDummy) {
          const lifeRatio = t.life; // 1.0 = fresh, 0 = gone
          const scale = 0.75 + Math.sin(lifeRatio * Math.PI) * 0.5; // pop in, then fade
          ctx.scale(scale, scale);

          const isCritHit = t.type === "crit";
          const isHeadshot = typeof t.value === "string";

          if (isHeadshot) {
            // Headshot label on mannequin: dramatic red glow
            ctx.font = 'bold 14px "JetBrains Mono", monospace';
            ctx.shadowColor = "#ff0040";
            ctx.shadowBlur = 22;
            ctx.fillStyle = "#ff4060";
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000";
            ctx.strokeText(`${t.value}`, 0, 0);
            ctx.fillText(`${t.value}`, 0, 0);
          } else if (isCritHit) {
            // Critical hit on dummy: big orange pop with intense glow
            ctx.font = 'bold 22px "JetBrains Mono", monospace';
            ctx.shadowColor = "#f97316";
            ctx.shadowBlur = 28;
            ctx.fillStyle = "#fdba74";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#7c2d12";
            ctx.strokeText(`${t.value}`, 0, 0);
            ctx.fillText(`${t.value}`, 0, 0);
          } else {
            // Regular hit on dummy: sleek white/cyan floating number
            ctx.font = 'bold 16px "JetBrains Mono", monospace';
            ctx.shadowColor = "#22d3ee";
            ctx.shadowBlur = 14;
            ctx.fillStyle = "#e0f2fe";
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#0c4a6e";
            ctx.strokeText(`-${t.value}`, 0, 0);
            ctx.fillText(`-${t.value}`, 0, 0);
          }
          ctx.shadowBlur = 0;

        } else if (t.type === "heal") {
          ctx.font = '900 32px "Helvetica Neue", Arial, sans-serif';
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#330000";
          ctx.strokeText(`+${t.value}`, 0, 0);
          ctx.fillStyle = "#ff4444";
          ctx.fillText(`+${t.value}`, 0, 0);
        } else if (t.type === "player_damage") {
          ctx.font = '900 28px "JetBrains Mono", monospace';
          const s = 1.0 + Math.sin(t.life * Math.PI) * 0.3;
          ctx.scale(s, s);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#000000";
          ctx.strokeText(`-${t.value}`, 0, 0);
          ctx.fillStyle = "#ff2222";
          ctx.fillText(`-${t.value}`, 0, 0);
        } else if (t.type === "crit") {
          ctx.font = '900 32px "JetBrains Mono", monospace';
          const s = 1.0 + Math.sin(t.life * Math.PI) * 0.5;
          ctx.scale(s, s);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#000000";
          ctx.strokeText(`${t.value}`, 0, 0);
          const tC = t.themeColor || "#ff0000";
          ctx.shadowColor = tC;
          ctx.shadowBlur = 15;
          ctx.fillStyle = tC;
          ctx.fillText(`${t.value}`, 0, 0);
          ctx.shadowBlur = 0;
        } else {
          ctx.font = '900 32px "Helvetica Neue", Arial, sans-serif';
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#000000";
          ctx.strokeText(`-${t.value}`, 0, 0);
          ctx.fillStyle = t.themeColor || "#ff2222";
          ctx.fillText(`-${t.value}`, 0, 0);
        }
        ctx.restore();
      }
      ctx.restore(); // Restore from camera transformations

      // --- Tactical Approaching Van Indicator (UI Space) ---
      if (!player.isDead) {
        const halfW = (logicalWidth / 2) / Math.max(0.1, camera.zoom);
        const halfH = (logicalHeight / 2) / Math.max(0.1, camera.zoom);
        const dx = VAN_X - camera.x;
        const dy = VAN_Y - camera.y;
        const margin = 65;
        const isOffscreen =
          dx < -halfW + margin ||
          dx > halfW - margin ||
          dy < -halfH + margin ||
          dy > halfH - margin;

        if (isOffscreen) {
          const dist = Math.hypot(VAN_X - player.x, VAN_Y - player.y);
          
          let tX = Infinity;
          if (dx > 0) tX = (halfW - margin) / dx;
          else if (dx < 0) tX = (-halfW + margin) / dx;

          let tY = Infinity;
          if (dy > 0) tY = (halfH - margin) / dy;
          else if (dy < 0) tY = (-halfH + margin) / dy;

          const t = Math.min(tX, tY);
          const screenX = logicalWidth / 2 + (dx * t) * camera.zoom;
          const screenY = logicalHeight / 2 + (dy * t) * camera.zoom;
          const angle = Math.atan2(dy, dx);

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(angle);

          // Pulsing
          const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.12;
          ctx.scale(pulse, pulse);

          ctx.shadowColor = "rgba(16, 185, 129, 0.9)";
          ctx.shadowBlur = 10;

          // Stylized Emerald bracket
          ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, 0, 20, -Math.PI / 3.2, Math.PI / 3.2);
          ctx.stroke();

          // Home base director arrow
          ctx.beginPath();
          ctx.moveTo(8, -5);
          ctx.lineTo(16, 0);
          ctx.lineTo(8, 5);
          ctx.stroke();

          ctx.restore();

          // Text label
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
          ctx.shadowBlur = 5;
          ctx.font = "black 9px monospace";
          ctx.fillStyle = "#10b981";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const textYOffset = screenY > logicalHeight - 50 ? -26 : 28;
          ctx.fillText(`⛟ BASE: ${Math.floor(dist)}m`, 0, textYOffset);
          ctx.restore();
        }
      }

      // --- Tactical Approaching Zombies Indicators (UI Space) ---
      if (!player.isDead) {
        const halfW = (logicalWidth / 2) / Math.max(0.1, camera.zoom);
        const halfH = (logicalHeight / 2) / Math.max(0.1, camera.zoom);

        // Filter, sort and limit off-screen threats to prevent HUD cluttering
        const offscreenThreats = mannequins
          .filter(m => m.hp > 0)
          .map(m => {
            const dx = m.x - camera.x;
            const dy = m.y - camera.y;
            const isOffscreen =
              dx < -halfW + 65 ||
              dx > halfW - 65 ||
              dy < -halfH + 65 ||
              dy > halfH - 65;
            const dist = Math.hypot(m.x - player.x, m.y - player.y);
            return { m, dx, dy, isOffscreen, dist };
          })
          .filter(t => t.isOffscreen && t.dist > 250 && t.dist < 1200);

        // Sort: Bosses first, then closest enemies
        offscreenThreats.sort((a, b) => {
          if (a.m.isBoss && !b.m.isBoss) return -1;
          if (!a.m.isBoss && b.m.isBoss) return 1;
          return a.dist - b.dist;
        });

        // Limit to top 5 threats
        const threatsToDraw = offscreenThreats.slice(0, 5);

        for (const threat of threatsToDraw) {
          const m = threat.m;
          const dx = threat.dx;
          const dy = threat.dy;
          const dist = threat.dist;
          const margin = 65;

          // Fade out when very close, and don't render when too far to minimize screen clutter
          let opacity = 0;
          if (dist < 450) {
            // "e quando vai se aproximando vai sumindo" - fades out as they approach very close
            opacity = ((dist - 250) / 200) * 0.95;
          } else if (dist > 900) {
            // Fade out softly when far away
            opacity = (1.0 - (dist - 900) / 300) * 0.95;
          } else {
            opacity = 0.95;
          }

          if (opacity > 0.01) {
            // Intersect vector to find point on edge of screen
            let tX = Infinity;
            if (dx > 0) tX = (halfW - margin) / dx;
            else if (dx < 0) tX = (-halfW + margin) / dx;

            let tY = Infinity;
            if (dy > 0) tY = (halfH - margin) / dy;
            else if (dy < 0) tY = (-halfH + margin) / dy;

            const t = Math.min(tX, tY);

            // Calculate final screen coordinates
            const screenX = logicalWidth / 2 + (dx * t) * camera.zoom;
            const screenY = logicalHeight / 2 + (dy * t) * camera.zoom;

            const angle = Math.atan2(dy, dx);

            const isBoss = m.isBoss;
            const accentColorStr = isBoss ? "251, 191, 36" : "255, 30, 30"; // Vibrant bold yellow and saturated tactical solid red

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(angle);

            // Immersive pulsating animation (satisfactory high-frequency tactical alert pulse)
            const pulseTime = Date.now() * 0.012 + (m.x * 0.05);
            const pulse = 1.0 + (Math.sin(pulseTime) * 0.16);
            ctx.scale(pulse, pulse);

            // Holographic shadow neon glow (boosted brightness)
            ctx.shadowColor = `rgba(${accentColorStr}, 0.95)`;
            ctx.shadowBlur = 10;

            // Outer radar feedback indicator ring
            ctx.strokeStyle = `rgba(${accentColorStr}, ${opacity * 0.55})`;
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0.7 * Math.PI, 1.3 * Math.PI);
            ctx.stroke();

            // Double glowing chevron sweeping/sliding along threat axis
            const slideOffset = (Date.now() * 0.02 + m.x) % 5 - 2.5;

            ctx.beginPath();
            ctx.moveTo(-9 + slideOffset, -4);
            ctx.lineTo(-4 + slideOffset, 0);
            ctx.lineTo(-9 + slideOffset, 4);
            ctx.strokeStyle = `rgba(${accentColorStr}, ${opacity * 0.85})`;
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            // Main primary sharp director pointer
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.lineTo(4, 0);
            ctx.lineTo(-2, 6);
            ctx.strokeStyle = `rgba(${accentColorStr}, ${opacity})`;
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            // Tactical dot
            ctx.beginPath();
            ctx.arc(-14, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${accentColorStr}, ${opacity * 0.8})`;
            ctx.fill();

            ctx.restore(); // Exit rotated angle context

            // Draw upright text info strictly facing the user (comfortably legible)
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.shadowColor = `rgba(${accentColorStr}, 0.8)`;
            ctx.shadowBlur = 5;

            ctx.font = "black 8px monospace";
            ctx.fillStyle = `rgba(${accentColorStr}, ${opacity * 0.95})`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textYOffset = screenY > logicalHeight - 50 ? -22 : 24;
            const distText = `${Math.floor(dist)}m`;
            ctx.fillText(isBoss ? "⚠ JUGGERNAUT" : distText, 0, textYOffset);

            ctx.restore();
          }
        }
      }

      if (playerDamageFlash > 0 || (!player.isDead && player.hp < 30)) {
        ctx.save();
        let pulseAlpha = playerDamageFlash > 0 ? playerDamageFlash * 0.6 : 0;

        if (!player.isDead && player.hp < 30) {
          const lowHpPulse = (Math.sin(Date.now() * 0.005) * 0.5 + 0.5) * 0.4;
          pulseAlpha = Math.max(pulseAlpha, lowHpPulse);
        }

        const grd = ctx.createRadialGradient(
          logicalWidth / 2,
          logicalHeight / 2,
          Math.max(logicalWidth, logicalHeight) * 0.3,
          logicalWidth / 2,
          logicalHeight / 2,
          Math.max(logicalWidth, logicalHeight) * 0.7,
        );
        grd.addColorStop(0, "rgba(255, 0, 0, 0)");
        grd.addColorStop(1, `rgba(255, 0, 0, ${pulseAlpha})`);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        ctx.restore();
      }

      // --- Draw Custom Crosshair (UI Space) ---
      if (isCrosshairEnabledRef.current) {
        let isTargetingAny = mannequins.some((m) => m.isTargeted && m.hp > 0);
        let isTargetingHead = mannequins.some(
          (m) => m.isHeadTargeted && m.hp > 0,
        );
        let hitScale = player.hitMarkerTime > 0 ? 0.6 : 1.0;
        if (mouse.rightDown) hitScale *= 0.6; // Shrink slightly when aiming

        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.scale(hitScale, hitScale);

        const actWeapon = inventoryRef.current.hotbar[inventoryRef.current.activeSlot];
        const eqSkin = actWeapon ? inventoryRef.current.equippedSkins[actWeapon] : null;
        const sDef = WEAPON_SKINS.find(s => s.id === eqSkin);
        const themeH = sDef?.themeColor || "#ff0000";
        const themeC = sDef?.themeColor || "rgba(255,255,255,0.7)";

        if (isTargetingHead) {
          ctx.fillStyle = themeH;
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = isTargetingAny ? themeH : themeC;
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (isTargetingAny) {
            ctx.rotate(Math.PI / 4);
          }
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.moveTo(-15, 0);
          ctx.lineTo(-5, 0);
          ctx.moveTo(15, 0);
          ctx.lineTo(5, 0);
          ctx.moveTo(0, -15);
          ctx.lineTo(0, -5);
          ctx.moveTo(0, 15);
          ctx.lineTo(0, 5);
          ctx.stroke();
        }

        // Hitmarker indicator
        if (player.hitMarkerTime > 0) {
          ctx.strokeStyle = themeH;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-12, -12);
          ctx.lineTo(-6, -6);
          ctx.moveTo(12, 12);
          ctx.lineTo(6, 6);
          ctx.moveTo(-12, 12);
          ctx.lineTo(-6, 6);
          ctx.moveTo(12, -12);
          ctx.lineTo(6, -6);
          ctx.stroke();
        }

        // Small center dot
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = isTargetingAny || mouse.rightDown ? "#f44336" : "#ffffff";
        ctx.fill();
        ctx.restore();
      }

      // Draw Soft Ambient Vignette & Cinematic Letterboxes for Cinematic Mode (Soft dark edges, movie aspect ratio)
      if (cinematicModeRef.current) {
        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = Math.max(canvas.width, canvas.height) * 0.72;
        const innerRadius = Math.min(canvas.width, canvas.height) * 0.18;
        
        // Dynamic intensity breathing
        const pulse = Math.sin(time * 0.8) * 0.04;
        const alpha = 0.58 + pulse;
        
        const grad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        grad.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad.addColorStop(0.4, `rgba(10, 15, 22, ${alpha * 0.25})`); // Cinematic cool steel color grading
        grad.addColorStop(0.75, `rgba(0, 0, 0, ${alpha * 0.65})`);
        grad.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Soft Movie-like Widescreen Letterboxes (solid edge frame with feathered inner transition)
        const barHeight = canvas.height * 0.085;
        const solidHeight = barHeight * 0.65;
        const featherHeight = barHeight - solidHeight;
        
        // Top Letterbox
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, solidHeight);
        
        const topGrad = ctx.createLinearGradient(0, solidHeight, 0, barHeight);
        topGrad.addColorStop(0, "#000000");
        topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, solidHeight, canvas.width, featherHeight);
        
        // Bottom Letterbox
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, canvas.height - solidHeight, canvas.width, solidHeight);
        
        const bottomGrad = ctx.createLinearGradient(0, canvas.height - solidHeight, 0, canvas.height - barHeight);
        bottomGrad.addColorStop(0, "#000000");
        bottomGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, featherHeight);
        ctx.restore();
      }

      // --- Draw Tactical Radar ---
      if (!cutsceneRef.current.active && !(window as any).isHudHiddenActive) {
      ctx.save();
       const radarSize = 80; // smaller (to prevent cluttering)
      // Better placement: Top Middle of the screen (as requested)
      const radarX = logicalWidth / 2;
      const radarY = radarSize / 2 + 20; // 20px padding from top
      const radarScale = 0.04; // Scale world down to radar

      // Check if we have the smoothed UI object for matching sway/lag
      const hudOffset = (window as any).smoothedHud || { tx: 0, ty: 0 };
      
      // Dynamic sway positioning matching the camera & UI panels
      ctx.translate(radarX + hudOffset.tx * 0.85, radarY + hudOffset.ty * 0.85);

      // Radar Background (Futuristic Neon Grid style - more transparent)
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(4, 8, 12, 0.20)"; // more transparent background
      ctx.fill();
      
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.20)"; // more transparent border
      ctx.shadowColor = "rgba(0, 229, 255, 0.15)"; // more transparent glow
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Radar grid lines (Rings)
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)"; // more transparent grid ring
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Crosshairs in radar
      ctx.beginPath();
      ctx.moveTo(-radarSize / 2, 0);
      ctx.lineTo(radarSize / 2, 0);
      ctx.moveTo(0, -radarSize / 2);
      ctx.lineTo(0, radarSize / 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.10)"; // more transparent crosshair
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Radar Sweep Scan Effect
      const sweepAngle = (time * 1.6) % (Math.PI * 2);
      if (ctx.createConicGradient) {
        const sweepGrad = ctx.createConicGradient(sweepAngle, 0, 0);
        sweepGrad.addColorStop(0, "rgba(0, 229, 255, 0.06)"); // more transparent sweep
        sweepGrad.addColorStop(0.12, "rgba(0, 229, 255, 0.01)");
        sweepGrad.addColorStop(0.4, "rgba(0, 229, 255, 0)");
        sweepGrad.addColorStop(0.9, "rgba(0, 229, 255, 0)");
        sweepGrad.addColorStop(1, "rgba(0, 229, 255, 0.06)");

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = sweepGrad;
        ctx.fill();
        ctx.restore();
      }

      // Draw sweeping ray line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAngle) * (radarSize / 2), Math.sin(sweepAngle) * (radarSize / 2));
      ctx.strokeStyle = "rgba(0, 229, 255, 0.18)"; // more transparent sweep line
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // Draw Entities
      // Clip to circular radar
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
      ctx.clip();

      for (const m of mannequins) {
        if (m.hp > 0) {
          const dx = (m.x - player.x) * radarScale;
          const dy = (m.y - player.y) * radarScale;
          if (Math.hypot(dx, dy) < radarSize / 2 + 10) {
            // Angle to entity
            const angleToDot = Math.atan2(dy, dx);
            // Calculate sweep angular difference for trailing persistence fade
            let diff = (sweepAngle - angleToDot) % (Math.PI * 2);
            if (diff < 0) diff += Math.PI * 2;

            // Fade dot intensity depending on when sweep last passed it
            const dotAlpha = Math.max(0.12, 1.0 - (diff / (Math.PI * 2)));

            ctx.beginPath();
            ctx.arc(dx, dy, m.isBoss ? 5.5 : 3.2, 0, Math.PI * 2);
            ctx.fillStyle = m.isBoss ? `rgba(255, 17, 0, ${dotAlpha})` : `rgba(244, 67, 54, ${dotAlpha})`;
            ctx.fill();
            if (m.isBoss && dotAlpha > 0.6) {
              ctx.shadowColor = "#ff1100";
              ctx.shadowBlur = 5;
              ctx.strokeStyle = `rgba(255, 255, 255, ${dotAlpha * 0.8})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw Van (Base) on Radar
      const vanDx = (VAN_X - player.x) * radarScale;
      const vanDy = (VAN_Y - player.y) * radarScale;
      if (Math.hypot(vanDx, vanDy) < radarSize / 2 + 10) {
        const vanAngle = Math.atan2(vanDy, vanDx);
        let vanDiff = (sweepAngle - vanAngle) % (Math.PI * 2);
        if (vanDiff < 0) vanDiff += Math.PI * 2;
        const vanAlpha = Math.max(0.2, 1.0 - (vanDiff / (Math.PI * 2)));

        ctx.save();
        ctx.translate(vanDx, vanDy);
        
        ctx.fillStyle = `rgba(16, 185, 129, ${vanAlpha})`; // base green
        ctx.strokeStyle = `rgba(255, 255, 255, ${vanAlpha})`;
        ctx.lineWidth = 1.0;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 6 * vanAlpha;
        
        ctx.beginPath();
        // Base / house shape icon
        ctx.moveTo(-5, 4);
        ctx.lineTo(-5, -1);
        ctx.lineTo(0, -6);
        ctx.lineTo(5, -1);
        ctx.lineTo(5, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Player center (Always bright neon cyan)
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00e5ff";
      ctx.fill();
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Player facing cone (fades slightly)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 50, player.angle - 0.4, player.angle + 0.4);
      ctx.fillStyle = "rgba(0, 229, 255, 0.22)";
      ctx.fill();

      ctx.restore();
      }

      // --- Draw Idle Dots ---
      if (!player.isDead && player.idleTimer > 3.0) {
        ctx.save();
        // Translate based on true screen coordinates of player
        const screenX = logicalWidth / 2 + (player.x - camera.x) * camera.zoom;
        const screenY = logicalHeight / 2 + (player.y - camera.y) * camera.zoom;
        ctx.translate(screenX, screenY - 55 * camera.zoom);

        const bounce = Math.sin(player.idleTimer * 2) * 3;
        ctx.translate(0, bounce);

        const numDots = Math.floor((player.idleTimer - 3.0) * 1.5) % 4;
        let dotStr = "";
        for (let i = 0; i < numDots; i++) dotStr += ".";

        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(dotStr, 0, 0);
        ctx.restore();
      }

      ctx.restore(); // Restore baseline clean state (from the outer ctx.save() at start of draw)

      // Near edge camera darkening vignette (Fog of war) — skip in training mode
      if (!(window as any).inTrainingMode) {
        const borderSize = getMapSize();
        const edgeDistLeft = player.x - (-borderSize);
        const edgeDistRight = borderSize - player.x;
        const edgeDistTop = player.y - (-borderSize);
        const edgeDistBottom = borderSize - player.y;
        const closestEdge = Math.min(edgeDistLeft, edgeDistRight, edgeDistTop, edgeDistBottom);
        if (closestEdge < 350) {
          const edgeGlow = Math.max(0, 1.0 - closestEdge / 350);
          ctx.save();
          ctx.fillStyle = `rgba(0, 0, 0, ${edgeGlow * 0.95})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = `rgba(239, 68, 68, ${edgeGlow * 0.75})`;
          ctx.font = '900 13px "JetBrains Mono", monospace';
          ctx.textAlign = "center";
          ctx.fillText("FUMAÇA VENENOSA - RETORNE AO CENTRO DO MAPA", canvas.width / 2, canvas.height - 100);
          ctx.restore();
        }
      }

      // Draw screen-space drifting dark desert dust/fog particles
      if (gameState === "GAME" || gameState === "UPGRADE_SCREEN") {
        if (dustRef.current.length === 0) {
          for (let i = 0; i < 30; i++) {
            dustRef.current.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              size: Math.random() * 100 + 60,
              speed: Math.random() * 30 + 15,
              alpha: Math.random() * 0.06 + 0.02,
            });
          }
        }
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (const d of dustRef.current) {
          d.x += d.speed * dt;
          if (d.x > canvas.width + d.size) {
            d.x = -d.size;
            d.y = Math.random() * canvas.height;
          }
          const dustGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size);
          dustGrad.addColorStop(0, `rgba(220, 180, 130, ${d.alpha})`);
          dustGrad.addColorStop(0.4, `rgba(220, 180, 130, ${d.alpha * 0.4})`);
          dustGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = dustGrad;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Cinematic Mode Permanent Letterbox removed as requested

      // Draw Cinematic Wave Intro Overlay
      if (waveRef.current.mode && waveRef.current.introTimer > 0) {
        const timer = waveRef.current.introTimer;
        // Fade in from 3.0 to 2.5, hold, then fade out from 0.5 to 0.0
        let alpha = 1.0;
        if (timer > 2.5) {
          alpha = (3.0 - timer) / 0.5;
        } else if (timer < 0.5) {
          alpha = timer / 0.5;
        }
        
        ctx.save();
        
        // 1. Darken screen with solid pitch black (fades out only at the final 0.6s to hide cleaning/spawning)
        const bgAlpha = timer < 0.6 ? (timer / 0.6) : 1.0;
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw red glowing ambient vignette on top
        const vignetteGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
        vignetteGrad.addColorStop(0, `rgba(50, 10, 10, ${alpha * 0.4})`);
        vignetteGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Draw cinematic black bars (letterbox)
        const barHeight = canvas.height * 0.15;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, barHeight);
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
        
        // Horizontal glowing divider line
        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.65})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const progress = (3.0 - timer) / 3.0; // 0 to 1
        const lineW = canvas.width * Math.min(1.0, progress * 2.2);
        ctx.moveTo(canvas.width / 2 - lineW / 2, canvas.height / 2 - 25);
        ctx.lineTo(canvas.width / 2 + lineW / 2, canvas.height / 2 - 25);
        ctx.moveTo(canvas.width / 2 - lineW / 2, canvas.height / 2 + 35);
        ctx.lineTo(canvas.width / 2 + lineW / 2, canvas.height / 2 + 35);
        ctx.stroke();
        
        // 3. Draw text with scaling animation
        const text = waveRef.current.introText || "";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const scale = 1.0 + Math.max(0, timer - 0.5) * 0.08;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 + 5);
        ctx.scale(scale, scale);
        
        ctx.font = '900 46px "Outfit", "Inter", sans-serif';
        ctx.shadowColor = "rgba(220, 38, 38, 0.95)";
        ctx.shadowBlur = 25;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(text, 0, 0);
        ctx.restore();
        
        // Subtext
        ctx.shadowBlur = 0;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.85})`;
        ctx.fillText("SOBREVIVA ÀS HORDAS DE INIMIGOS", canvas.width / 2, canvas.height / 2 + 65);
        
        ctx.restore();
      }

      // Update dynamic UI states (via DOM)
      if (!(window as any).cachedHudElements) {
        (window as any).cachedHudElements = {};
      }
      const getHUDElement = (id: string): HTMLElement | null => {
        let el = (window as any).cachedHudElements[id];
        if (!el) {
          el = document.getElementById(id);
          if (el) {
            (window as any).cachedHudElements[id] = el;
          }
        }
        return el;
      };

      const uiKillCountEl = getHUDElement("ui-kill-count");
      if (uiKillCountEl) {
        uiKillCountEl.innerText = String(player.kills);
      }
      const uiAmmoEl = getHUDElement("ui-ammo-count");
      if (uiAmmoEl) {
        uiAmmoEl.innerText = String(player.ammo).padStart(2, "0");
      }
      const uiAmmoMaxEl = getHUDElement("ui-ammo-max");
      if (uiAmmoMaxEl) {
        uiAmmoMaxEl.innerText = String(player.maxAmmo);
      }
      
      // Update ammo weapon image visibility & shaking/gray states
      const weaponIds = ["pistola", "gun", "uzi", "doze", "basuca", "rifle", "magnum", "minigun"];
      weaponIds.forEach((wId) => {
        const imgEl = getHUDElement(`ui-ammo-weapon-${wId}`);
        if (imgEl) {
          if (activeWeapon === wId) {
            imgEl.style.display = "block";
            // Shake effect on fire
            if (time - lastShotTime < 100) {
              const rx = (Math.random() - 0.5) * 8;
              const ry = (Math.random() - 0.5) * 8;
              imgEl.style.transform = `translate(${rx}px, ${ry}px) scale(1.12)`;
            } else {
              imgEl.style.transform = "translate(0,0) scale(1)";
            }
            // Gray filter if reloading
            if (player.isReloading) {
              imgEl.style.filter = "grayscale(100%) opacity(40%)";
            } else {
              imgEl.style.filter = "none";
            }
          } else {
            imgEl.style.display = "none";
          }
        }
      });

      const uiReloadOverlay = getHUDElement("ui-ammo-reload-overlay");
      if (uiReloadOverlay) {
        if (player.isReloading && activeStats) {
          uiReloadOverlay.style.opacity = "1";
          const progress = 1 - (player.reloadTimer / (activeStats.reloadTime / (1.0 + wUpgrades.reloadSpeed * 0.15)));
          const fillEl = getHUDElement("ui-ammo-reload-fill");
          if (fillEl) {
            fillEl.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
          }
        } else {
          uiReloadOverlay.style.opacity = "0";
        }
      }

      if ((window as any).hotbarVisibleTimer === undefined) { (window as any).hotbarVisibleTimer = 0; }
      if ((window as any).hotbarVisibleTimer > 0) {
        (window as any).hotbarVisibleTimer -= dt;
      }

      const uiHotbarEl = getHUDElement("ui-hotbar");
      if (uiHotbarEl) {
        if ((window as any).hotbarVisibleTimer > 0) {
          uiHotbarEl.style.opacity = "1.0";
        } else if (player.gunHeat > 2 || player.hitMarkerTime > 0) {
          uiHotbarEl.style.opacity = "0.2";
        } else {
          uiHotbarEl.style.opacity = "1.0";
        }
      }
      const uiPlayerHpText = getHUDElement("ui-player-hp-text");
      const uiPlayerHpFill = getHUDElement("ui-player-hp-fill");
      const uiPlayerHpBar = getHUDElement("ui-player-hp-bar");
      if (uiPlayerHpText && uiPlayerHpFill) {
        uiPlayerHpText.innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
        uiPlayerHpFill.style.width = `${Math.max(0, player.hp / player.maxHp) * 100}%`;
        if (uiPlayerHpBar) {
          const baseWidth = 140;
          const maxWidth = 320;
          const hpRatio = (player.maxHp - 50) / 450;
          const currentWidth = baseWidth + Math.max(0, Math.min(1, hpRatio)) * (maxWidth - baseWidth);
          uiPlayerHpBar.style.width = `${currentWidth}px`;
        }

        const uiPlayerRollFill = getHUDElement("ui-player-roll-fill");
        if (uiPlayerRollFill) {
          const readyRatio = Math.max(0, 1 - player.rollCooldown / 2.0);
          uiPlayerRollFill.style.width = `${readyRatio * 100}%`;
          if (readyRatio >= 1.0) {
            uiPlayerRollFill.style.backgroundColor = "rgba(255,255,255,0.8)";
          } else {
            uiPlayerRollFill.style.backgroundColor = "rgba(100,100,100,0.5)";
          }
        }

        const uiPlayerStaminaFill = getHUDElement("ui-player-stamina-fill");
        const uiPlayerStaminaBar = getHUDElement("ui-player-stamina-bar");
        if (uiPlayerStaminaFill) {
          const ratio = Math.max(0, player.stamina / player.staminaMax);
          uiPlayerStaminaFill.style.width = `${ratio * 100}%`;
          if (player.staminaExhausted) {
            uiPlayerStaminaFill.style.backgroundColor = "rgba(220,50,50,0.8)";
          } else {
            uiPlayerStaminaFill.style.backgroundColor = "rgba(60,200,100,0.8)";
          }
          const radarStamina = getHUDElement("ui-radar-replacement-stamina");
          if (radarStamina) {
            radarStamina.innerText = `${Math.round(player.stamina)}/${Math.round(player.staminaMax)}`;
          }
          if (uiPlayerStaminaBar) {
            const baseStaminaWidth = 100;
            const maxStaminaWidth = 200;
            const staminaRatio = (player.staminaMax - 100) / 100;
            const currentStaminaWidth = baseStaminaWidth + Math.max(0, Math.min(1, staminaRatio)) * (maxStaminaWidth - baseStaminaWidth);
            uiPlayerStaminaBar.style.width = `${currentStaminaWidth}px`;
          }
        }

        // Smooth blood screen based on HP
        const blurLayer = getHUDElement("blur-layer");
        if (blurLayer) {
          const damageRatio = 1 - player.hp / player.maxHp;
          let blurVal = damageRatio * 0.8;
          if (player.healthGlowTimer > 0) {
            blurLayer.style.background =
              "radial-gradient(circle at center, transparent 40%, rgba(255,20,20,0.4) 100%)";
            blurLayer.style.backgroundColor = "transparent";
            blurLayer.style.mixBlendMode = "screen";
            blurVal = player.healthGlowTimer * 1.5;
          } else if (player.furyTimer > 0) {
            blurLayer.style.background =
              "radial-gradient(circle at center, transparent 60%, rgba(255,10,10,0.3) 100%)";
            blurLayer.style.backgroundColor = "transparent";
            blurLayer.style.mixBlendMode = "screen";
            blurVal = 0.6 + Math.sin(Date.now() / 150) * 0.15;
          } else {
            blurLayer.style.background =
              "radial-gradient(circle at center, transparent 70%, rgba(127,10,10,0.8) 100%)";
            blurLayer.style.backgroundColor = "transparent";
            blurLayer.style.mixBlendMode = "multiply";
            blurVal = damageRatio * 0.8;
          }
          blurLayer.style.opacity = String(blurVal);
        }
      }
      const uiAmmoPanel = getHUDElement("ui-ammo-panel");
      if (uiAmmoPanel) {
        if (mouse.down && player.ammo > 0 && !player.isReloading) {
          uiAmmoPanel.style.opacity = "0.3";
        } else {
          uiAmmoPanel.style.opacity = "1.0";
        }
      }

      const uiReloadEl = getHUDElement("ui-reload-status");
      if (uiReloadEl) {
        if (player.isReloading) {
          uiReloadEl.innerText = "RELOADING...";
          uiReloadEl.className =
            "text-xs tracking-widest font-mono text-amber-400 animate-pulse";
        } else if (player.ammo <= 5) {
          uiReloadEl.innerText = "LOW AMMO";
          uiReloadEl.className =
            "text-xs tracking-widest font-mono text-red-500 animate-pulse";
        } else {
          uiReloadEl.innerText = "SYSTEM READY";
          uiReloadEl.className =
            "text-xs tracking-widest font-mono text-emerald-400 opacity-80";
        }
      }
      const uiFuryFill = getHUDElement("ui-fury-fill");
      const uiFuryGlow = getHUDElement("ui-fury-glow");
      const uiFuryContainer = getHUDElement("ui-fury-container");

      if (uiFuryFill && uiFuryContainer) {
        if (player.furyTimer > 0) {
          uiFuryFill.style.width = `${(player.furyTimer / 8) * 100}%`;
          uiFuryFill.className =
            "h-full bg-red-600 transition-none shadow-[0_0_25px_rgba(255,0,0,1)] relative";
          uiFuryContainer.style.boxShadow = "0 0 35px rgba(255, 0, 0, 0.7)";
          uiFuryContainer.style.borderColor = "rgba(255, 50, 0, 1)";
          if (uiFuryGlow) uiFuryGlow.style.opacity = "1";
        } else {
          const furyProgress = player.furyKills / 100;
          uiFuryFill.style.width = `${furyProgress * 100}%`;
          if (furyProgress > 0.8) {
            // Pulsate if almost full
            const pulse = 0.5 + Math.sin(Date.now() / 100) * 0.5;
            uiFuryFill.className =
              "h-full bg-orange-500 transition-all duration-300 relative";
            uiFuryFill.style.boxShadow = `0 0 ${15 + pulse * 25}px rgba(255, 100, 0, 0.9)`;
            uiFuryContainer.style.borderColor = `rgba(255, 150, 0, ${0.5 + pulse * 0.5})`;
            if (uiFuryGlow) uiFuryGlow.style.opacity = String(pulse);
          } else {
            uiFuryFill.className =
              "h-full bg-white/60 transition-all duration-300 relative";
            uiFuryFill.style.boxShadow = "none";
            uiFuryContainer.style.borderColor = "rgba(255, 255, 255, 0.1)";
            uiFuryContainer.style.boxShadow = "none";
            if (uiFuryGlow) uiFuryGlow.style.opacity = "0";
          }
        }
      }

      const uiProfileBox = getHUDElement("ui-profile-box");
      const uiProfileLetter = getHUDElement("ui-profile-letter");
      if (uiProfileBox && uiProfileLetter) {
        if (player.furyTimer > 0) {
          uiProfileBox.className =
            "relative w-16 h-16 bg-red-950 border-2 border-red-500 flex-shrink-0 grid place-items-center shadow-[0_0_15px_rgba(255,0,0,0.8)]";
          uiProfileLetter.className =
            "text-3xl font-bold font-mono text-white opacity-100 mix-blend-screen tracking-tighter";
          const gx = (Math.random() - 0.5) * 6;
          const gy = (Math.random() - 0.5) * 6;
          uiProfileLetter.style.transform = `translate(${gx}px, ${gy}px)`;
        } else if (player.healthGlowTimer > 0) {
          uiProfileBox.className =
            "relative w-16 h-16 bg-black border-2 border-red-400 flex-shrink-0 grid place-items-center";
          uiProfileLetter.className =
            "text-3xl font-bold font-mono text-red-400 opacity-90 mix-blend-screen tracking-tighter";
          uiProfileLetter.style.transform = `scale(${1 + player.healthGlowTimer * 0.3})`;
        } else {
          uiProfileBox.className =
            "relative w-16 h-16 bg-black border border-red-500/30 flex-shrink-0 grid place-items-center";
          uiProfileLetter.className =
            "text-3xl font-bold font-mono text-red-600 opacity-80 mix-blend-screen tracking-tighter";
          uiProfileLetter.style.transform = "translate(0px, 0px) scale(1)";
        }
      }

      // --- Cinematic UI/UX Sway & Parallax (Alive in Synchrony with Professional Camera) ---
      // Cache DOM elements to avoid document.getElementById queries on every frame (massively increases performance and fluidity)
      if (!(window as any).cachedHudElements) {
        (window as any).cachedHudElements = {
          leftStack: document.getElementById("ui-hud-left-stack"),
          rightPanel: document.getElementById("ui-hud-right-panel"),
          hotbar: document.getElementById("ui-hotbar"),
          btnSettings: document.getElementById("ui-btn-settings"),
          btnBackMenu: document.getElementById("ui-btn-back-menu")
        };
      }
      const cached = (window as any).cachedHudElements;
      if (!cached.leftStack) cached.leftStack = document.getElementById("ui-hud-left-stack");
      if (!cached.rightPanel) cached.rightPanel = document.getElementById("ui-hud-right-panel");
      if (!cached.hotbar) cached.hotbar = document.getElementById("ui-hotbar");
      if (!cached.btnSettings) cached.btnSettings = document.getElementById("ui-btn-settings");
      if (!cached.btnBackMenu) cached.btnBackMenu = document.getElementById("ui-btn-back-menu");

      const uiLeftStack = cached.leftStack;
      const uiRightPanel = cached.rightPanel;
      const uiHotbar = cached.hotbar;
      const uiBtnSettings = cached.btnSettings;
      const uiBtnBackMenu = cached.btnBackMenu;

      // Initialize persistent smoothed values (lerp filter) to fully remove any jitter/shaking
      if (!(window as any).smoothedHud) {
        (window as any).smoothedHud = { tx: 0, ty: 0, rotX: 0, rotY: 0, rz: 0 };
      }
      const sHud = (window as any).smoothedHud;

      let targetTx = 0;
      let targetTy = 0;
      let targetRotX = 0;
      let targetRotY = 0;
      let targetRz = 0;

      if (cinematicModeRef.current) {
        // Normalized mouse screen coordinates (-1 to 1)
        const normX = (mouse.x - canvas.width / 2) / (canvas.width / 2 || 1);
        const normY = (mouse.y - canvas.height / 2) / (canvas.height / 2 || 1);

        // Slow cinematic breathing sway (low frequency, smooth amplitude)
        const swayX = Math.sin(time * 1.35) * 1.8;
        const swayY = Math.cos(time * 1.05) * 1.4;

        // Inertial lag relative to player movement speed (smoother weight to avoid twitching)
        const lagX = -(player.vx || 0) * 0.012;
        const lagY = -(player.vy || 0) * 0.012;

        // Camera tilt contribution (subtle opposite tilt)
        const tiltDeg = (camera.tilt || 0) * (180 / Math.PI) * 0.35;

        // Combined targets
        targetTx = normX * 8 + swayX + lagX;
        targetTy = normY * 6 + swayY + lagY;
        targetRz = -normX * 0.8 + tiltDeg;

        // Elegant 3D perspective rotation yaw (Y) & pitch (X)
        targetRotY = normX * 6;
        targetRotX = -normY * 4;
      }

      // Dynamic interpolation factor (smooth lerp step)
      const hudLerpSpeed = cinematicModeRef.current ? 4.5 * dt : 12.0 * dt;
      const hudLerpFactor = Math.min(1.0, hudLerpSpeed);

      sHud.tx += (targetTx - sHud.tx) * hudLerpFactor;
      sHud.ty += (targetTy - sHud.ty) * hudLerpFactor;
      sHud.rz += (targetRz - sHud.rz) * hudLerpFactor;
      sHud.rotX += (targetRotX - sHud.rotX) * hudLerpFactor;
      sHud.rotY += (targetRotY - sHud.rotY) * hudLerpFactor;

      if (cinematicModeRef.current) {
        const transformHUD = `translate3d(${sHud.tx}px, ${sHud.ty}px, 0) rotateX(${sHud.rotX}deg) rotateY(${sHud.rotY}deg) rotateZ(${sHud.rz}deg)`;
        const transformHotbar = `translate3d(calc(-50% + ${sHud.tx}px), ${sHud.ty}px, 0) rotateX(${sHud.rotX}deg) rotateY(${sHud.rotY}deg) rotateZ(${sHud.rz}deg)`;

        // Apply styles smoothly without redundant DOM mutations
        if (uiLeftStack) {
          if (uiLeftStack.style.transformStyle !== "preserve-3d") {
            uiLeftStack.style.transformStyle = "preserve-3d";
            uiLeftStack.style.perspective = "800px";
            uiLeftStack.style.transition = "opacity 0.5s ease-in-out, scale 0.5s ease-in-out";
          }
          uiLeftStack.style.transform = transformHUD;
        }
        if (uiRightPanel) {
          if (uiRightPanel.style.transformStyle !== "preserve-3d") {
            uiRightPanel.style.transformStyle = "preserve-3d";
            uiRightPanel.style.perspective = "800px";
            uiRightPanel.style.transition = "opacity 0.5s ease-in-out, scale 0.5s ease-in-out";
          }
          uiRightPanel.style.transform = transformHUD;
        }
        if (uiHotbar) {
          if (uiHotbar.style.transformStyle !== "preserve-3d") {
            uiHotbar.style.transformStyle = "preserve-3d";
            uiHotbar.style.perspective = "800px";
            uiHotbar.style.transition = "opacity 0.5s ease-in-out, scale 0.5s ease-in-out";
          }
          uiHotbar.style.transform = transformHotbar;
        }
        if (uiBtnSettings) {
          if (uiBtnSettings.style.transition !== "opacity 0.5s ease-in-out, scale 0.5s ease-in-out") {
            uiBtnSettings.style.transition = "opacity 0.5s ease-in-out, scale 0.5s ease-in-out";
          }
          uiBtnSettings.style.transform = transformHUD;
        }
        if (uiBtnBackMenu) {
          if (uiBtnBackMenu.style.transition !== "opacity 0.5s ease-in-out, scale 0.5s ease-in-out") {
            uiBtnBackMenu.style.transition = "opacity 0.5s ease-in-out, scale 0.5s ease-in-out";
          }
          uiBtnBackMenu.style.transform = transformHUD;
        }
      } else {
        // Reset to normal flat/static behavior only if transform is not empty
        if (uiLeftStack && uiLeftStack.style.transform !== "") {
          uiLeftStack.style.transition = "";
          uiLeftStack.style.transform = "";
          uiLeftStack.style.transformStyle = "";
          uiLeftStack.style.perspective = "";
        }
        if (uiRightPanel && uiRightPanel.style.transform !== "") {
          uiRightPanel.style.transition = "";
          uiRightPanel.style.transform = "";
          uiRightPanel.style.transformStyle = "";
          uiRightPanel.style.perspective = "";
        }
        if (uiHotbar && uiHotbar.style.transform !== "translate(-50%, 0)") {
          uiHotbar.style.transition = "";
          uiHotbar.style.transform = "translate(-50%, 0)";
          uiHotbar.style.transformStyle = "";
          uiHotbar.style.perspective = "";
        }
        if (uiBtnSettings && uiBtnSettings.style.transform !== "") {
          uiBtnSettings.style.transition = "";
          uiBtnSettings.style.transform = "";
        }
        if (uiBtnBackMenu && uiBtnBackMenu.style.transform !== "") {
          uiBtnBackMenu.style.transition = "";
          uiBtnBackMenu.style.transform = "";
        }
      }
      // Update death screen
      const deathScreen = document.getElementById("death-screen");
      if (deathScreen) {
        if (player.isDead) {
          deathScreen.style.display = "flex";
          deathScreen.style.opacity = "1";
          deathScreen.style.pointerEvents = "auto";
        } else {
          deathScreen.style.opacity = "0";
          deathScreen.style.pointerEvents = "none";
          deathScreen.style.display = "none";
        }
      }

      // Draw Cinematic Black Overlay
      if (cutsceneRef.current.active && cutsceneRef.current.overlayAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${cutsceneRef.current.overlayAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // --- Render Training Transition Overlay ---
      if ((window as any).trainingTransitionActive) {
        const tr = window as any;
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${tr.trainingTransitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (tr.trainingTransitionState === "ON_HOLD") {
          // Draw "TREINAMENTO" title text
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = '900 48px "Outfit", "Inter", sans-serif';
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
          ctx.shadowBlur = 30;
          ctx.fillText("TREINAMENTO", canvas.width / 2, canvas.height / 2 - 10);
          
          ctx.shadowBlur = 0;
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillStyle = "#facc15"; // Yellow subtitle
          ctx.fillText("PREPARANDO ÁREA DE TIRO... ALVOS DETECTADOS", canvas.width / 2, canvas.height / 2 + 35);
        }
        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);
  const isAnyMenuOpen = isShopOpen || isOutfitsOpen || isInventoryOpen || selectedBackpackSlot !== null || isSettingsOpen || gameState === "MENU" || gameState === "DEAD";
  const uiColor = skinRef.current?.colorMain || "#dc2626";

  return (
    <div style={{ touchAction: "none", userSelect: "none" }} className={`fixed inset-0 w-full h-full bg-black overflow-hidden font-['Helvetica_Neue',Arial,sans-serif] text-white ${isAnyMenuOpen ? 'cursor-default' : 'cursor-none'}`}>
      {/* Cinematic Tilt-Shift Blur Viewport Borders */}
      <div 
        ref={topBlurRef} 
        className="absolute top-0 left-0 right-0 z-[5] pointer-events-none transition-all duration-300 ease-out" 
        style={{ height: '0vh', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
      />
      <div 
        ref={bottomBlurRef} 
        className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none transition-all duration-300 ease-out" 
        style={{ height: '0vh', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)', maskImage: 'linear-gradient(to top, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)' }}
      />
      <canvas
        ref={canvasRef}
        className="block absolute inset-0 z-0 h-full w-full transition-all duration-700 ease-in-out"
        style={{
          filter: cinematicMode
            ? "saturate(1.42) contrast(1.15) brightness(1.03) sepia(0.03)"
            : "none"
        }}
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu disrupting aim
      />
      <div ref={blurOverlayRef} className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-75" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.85) 100%)', opacity: 0 }}></div>

      <div
        id="blur-layer"
        className="absolute inset-0 z-[15] pointer-events-none bg-red-900/40 mix-blend-multiply transition-opacity duration-300"
        style={{ opacity: 0 }}
      ></div>

      <div
        id="death-screen"
        className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-1000 gap-4"
        style={{ opacity: 0, pointerEvents: "none", display: "none" }}
      >
        <h1
          id="death-title"
          className="text-3xl md:text-4xl text-center font-black text-red-700 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-2 animate-pulse"
        >
          Seu Corpo Foi Devorado
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
          <button
            onClick={() => {
              if (isWaveMode) {
                startWavesMode();
              }
              (window as any).respawnTriggered = true;
            }}
            className="px-8 py-3 bg-red-950/60 border border-red-700 text-red-200 font-mono tracking-widest uppercase hover:bg-red-900 hover:scale-105 transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.2)] w-60 text-center rounded-lg"
          >
            Recomeçar (Wave 1)
          </button>
          
          <button
            onClick={() => {
              if ((window as any).triggerAdRevive) {
                (window as any).triggerAdRevive();
              }
            }}
            className="px-8 py-3 bg-amber-600 border border-amber-500 text-black font-mono font-black tracking-widest uppercase hover:bg-amber-400 hover:scale-105 transition-all text-xs cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] w-60 text-center rounded-lg flex items-center justify-center gap-1.5"
          >
            <span>📺 Reviver com Anúncio</span>
          </button>

          <button
            onClick={() => {
              const deathScreen = document.getElementById("death-screen");
              if (deathScreen) {
                deathScreen.style.opacity = "0";
                deathScreen.style.pointerEvents = "none";
                deathScreen.style.display = "none";
              }
              (window as any).inTrainingMode = false;
              (window as any).trainingTransitionActive = false;
              setInTrainingMode(false);
              setCredits(globalCredits);
              setGameState("MENU");
            }}
            className="px-8 py-3 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono tracking-widest uppercase hover:bg-zinc-800 hover:scale-105 transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] w-60 text-center rounded-lg"
          >
            Voltar para o Menu
          </button>
        </div>
      </div>

      {gameState === "LOADING" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 font-mono text-white pointer-events-auto select-none p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_2px,#000_2px,#000_4px)] animate-scan" />
          
          <div className="relative flex flex-col items-center max-w-md w-full gap-8 z-10">
            <div className="absolute -top-6 -left-6 w-4 h-4 border-t-2 border-l-2 border-amber-500/50" />
            <div className="absolute -top-6 -right-6 w-4 h-4 border-t-2 border-r-2 border-amber-500/50" />
            <div className="absolute -bottom-6 -left-6 w-4 h-4 border-b-2 border-l-2 border-amber-500/50" />
            <div className="absolute -bottom-6 -right-6 w-4 h-4 border-b-2 border-r-2 border-amber-500/50" />

            <div className="text-center">
              <h2 className="text-xs tracking-[0.3em] text-zinc-500 font-black uppercase mb-1">INSERÇÃO EM ANDAMENTO</h2>
              <h1 className="text-2xl font-black uppercase tracking-[0.15em] text-white">OPERADOR {skinRef.current?.name.toUpperCase()}</h1>
            </div>

            <div className="w-24 h-24 border border-zinc-800 rounded-full relative flex items-center justify-center bg-black/40 shadow-inner">
              <div className="absolute inset-2 border border-dashed border-zinc-900 rounded-full" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-amber-500/10 to-transparent animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-sm font-black text-amber-500 animate-pulse">{loadingProgress}%</span>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 tracking-wider">
                <span>{loadingText}</span>
                <span className="text-amber-500 font-mono">SYSTEM: OK</span>
              </div>
              
              <div className="w-full h-2 bg-zinc-900 border border-zinc-800 rounded-full p-[2px] overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-150 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === "MENU" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center menu-brick-bg pointer-events-auto overflow-hidden">
          {/* Cinematic dark intro overlay */}
          <div 
            className="absolute inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: introFadeOut ? 0 : 1, pointerEvents: introFadeOut ? "none" : "auto" }}
          />
          {/* Slideshow background images */}
          {menuWallpapers.map((url, idx) => {
            const isActive = currentBgIndex === idx;
            const isPrev = prevBgIndex === idx;
            const isVisible = isActive || isPrev;
            return (
              <div
                key={url}
                className="absolute inset-0 transition-all duration-[2000ms] ease-in-out bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: `url("${url}")`,
                  opacity: isActive ? 0.75 : 0,
                  transform: isActive ? "scale(1.05)" : "scale(1.0)",
                  visibility: isVisible ? "visible" : "hidden",
                  zIndex: isActive ? 2 : 1,
                }}
              />
            );
          })}
          {/* Subtle dark vignette overlay */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />

          {showInitialTips ? (
            isLoadingProtocol ? (
              /* Render premium protocol initialization scanner - transparent floating container */
              <div className="relative z-20 w-full max-w-[520px] px-10 py-12 flex flex-col items-center justify-center select-none text-center gap-7 animate-in fade-in zoom-in-95 duration-500">
                {/* Holographic scanner spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[4px] border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                  <div className="absolute inset-2 rounded-full border-[2.5px] border-r-red-400/40 border-t-transparent border-b-transparent border-l-transparent animate-spin-reverse duration-1000" />
                  <div className="absolute inset-4 rounded-full border border-dashed border-red-500/30 animate-pulse" />
                  <span className="text-[13px] font-mono font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">{protocolProgress}%</span>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-[15px] font-mono font-black uppercase tracking-[0.35em] text-red-500 drop-shadow-[0_2px_10px_rgba(0,0,0,1)] animate-pulse">
                    INICIANDO PROTOCOLO
                  </h2>
                  <span className="text-[9.5px] font-mono font-black tracking-[0.2em] text-zinc-200 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                    ESTABELECENDO CONEXÃO DE ENTRADA SEGURA...
                  </span>
                </div>
                
                {/* Futuristic mini progress bar */}
                <div className="w-56 h-[4.5px] bg-black/60 rounded-full overflow-hidden border border-zinc-900/60 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.9)] transition-all duration-150"
                    style={{ width: `${protocolProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Render minimal loading tips view - transparent, floating, no black box behind text! */
              <div className="relative z-20 w-full max-w-[750px] px-8 flex flex-col items-center justify-between min-h-[420px] select-none">
                {/* Top simulation status */}
                <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-zinc-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    Lifeless Land
                  </h2>
                  <div className="h-[2px] w-28 bg-red-600 mx-auto mt-3 shadow-[0_0_8px_#dc2626]" />
                </div>

                {/* Game Tip text - styled with high visibility and clean drop shadow, NO solid black background box */}
                <div 
                  key={currentTipIndex}
                  onClick={() => {
                    setCurrentTipIndex((prev) => (prev + 1) % GAMEPLAY_TIPS.length);
                    SoundManager.playSound("click", 0.6);
                  }}
                  className="w-full flex flex-col items-center gap-3.5 cursor-pointer animate-tip-in select-none p-6 md:p-8 rounded-xl hover:scale-[1.01] transition-transform max-w-[720px]"
                >
                  <span className="text-[10px] font-mono tracking-[0.45em] text-amber-500 font-black uppercase flex items-center gap-1.5 drop-shadow-[0_1.5px_4px_rgba(0,0,0,1)]">
                    💡 DICA DE SOBREVIVÊNCIA
                  </span>
                  <p className="text-white text-[16px] md:text-[19px] font-black tracking-wide text-center leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,1)] max-w-[620px]">
                    "{GAMEPLAY_TIPS[currentTipIndex].text}"
                  </p>
                  <span className="text-[8.5px] font-mono text-zinc-400/70 uppercase tracking-widest mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
                    ( clique na tela para alternar dica )
                  </span>
                </div>

                {/* Bottom Skip / Enter Button - Minimalist and Clean */}
                <div className="w-full flex flex-col items-center">
                  <button
                     onClick={() => {
                       startTypewriterTransition();
                     }}
                     className="py-2.5 px-8 rounded-full border border-white/10 hover:border-white/30 text-white/60 hover:text-white bg-transparent transition-all duration-300 font-mono text-[10.5px] tracking-[0.25em] uppercase cursor-pointer hover:scale-102 flex items-center justify-center gap-2"
                  >
                     PULAR ➔
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Render actual menu content - Sleek Left Aligned Layout */
            <div className="absolute inset-0 z-20 flex items-center justify-start pl-12 md:pl-20 select-none">
              {/* Music Mute Toggle Button in Top Right */}
              <button
                onClick={() => {
                  const isMutedNow = SoundManager.toggleMute();
                  setMusicMuted(isMutedNow);
                  SoundManager.playSound("click", 0.6);
                }}
                className="absolute top-8 right-8 z-[60] p-3 rounded-full border border-white/10 hover:border-white/30 bg-black/45 hover:bg-black/75 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105 flex items-center justify-center shadow-lg"
                title={musicMuted ? "Ligar música" : "Desligar música"}
              >
                {musicMuted ? (
                  /* Muted Speaker Icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12A3 3 0 0 0 9 9z" />
                  </svg>
                ) : (
                  /* Playing Speaker Icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-pulse">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
              {/* Left Vignette Backdrop for Menu Content legibility */}
              <div className="absolute inset-y-0 left-0 w-[550px] bg-gradient-to-r from-black/95 via-black/80 to-transparent pointer-events-none z-10" />

              {/* Minimalist Vertical Content Panel */}
              <div className="relative z-20 flex flex-col items-start w-full max-w-[400px] gap-6 animate-in slide-in-from-left-12 duration-700">
                
                {/* Clean minimal title header - Left Aligned */}
                <div className="relative text-left select-none animate-in fade-in slide-in-from-left duration-700">
                  <h1 className="text-5xl md:text-6xl font-black uppercase tracking-wider flex justify-start gap-4">
                    <span className="menu-title-survival !text-white tracking-[0.1em]" style={{ textShadow: "0 0 20px rgba(239,68,68,0.4), 2px 2px 0px #000" }}>LIFELESS LAND</span>
                  </h1>
                  <p className="text-[10px] font-mono tracking-[0.45em] text-red-500 font-black uppercase mt-1.5">
                    SIMULADOR DE COMBATE
                  </p>
                  <div className="h-[2px] w-24 bg-red-600 mt-3.5 shadow-[0_0_10px_#dc2626]" />
                </div>

                {/* Sleek minimalist button menu list */}
                <div className="flex flex-col gap-3.5 w-full">
                   {/* 1. Waves Mode Button (Campanha) */}
                   <button
                      onClick={() => {
                        setIsOutfitsOpen(true);
                        setIsShopOpen(false);
                        waveRef.current.mode = true; // Set waveRef.current.mode to true!
                        SoundManager.playSound("click", 1.0);
                      }}
                      onMouseEnter={() => {
                        setHoveredMenuBtn("wave_mode");
                        SoundManager.playSound("click", 0.12);
                      }}
                      onMouseLeave={() => setHoveredMenuBtn(null)}
                      className="group relative w-full py-4 px-6 rounded-lg bg-red-950/20 border border-red-500/20 hover:border-red-500/80 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] text-left transition-all duration-300 cursor-pointer flex items-center gap-4.5 overflow-hidden"
                   >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="w-10 h-10 rounded-full border border-red-500/40 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-red-500/80 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400 group-hover:text-red-200 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]">
                          <path d="M12 18v-9m-3 9v-7.5m6 7.5V11m-9 7V13m12 5V14.5" />
                          <path d="M6 11.5a2 2 0 0 1 4 0M9 10.5a2 2 0 0 1 4 0M12 9a2 2 0 0 1 4 0M15 11a2 2 0 0 1 4 0" />
                          <path d="M4 21c2.5-1.5 5.5-1.5 8 0s5.5 1.5 8 0" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[15px] font-black uppercase tracking-wider text-neutral-100 font-mono">ENTRAR NA ONDA</span>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider uppercase">SELECIONAR OPERADOR E SOBREVIVER</span>
                      </div>
                   </button>
 
                   {/* 2. Free Sandbox Mode Button */}
                   <button
                      onClick={() => {
                        upgradesRef.current = {
                          pistola: freshWeaponUpgrades(),
                          gun: freshWeaponUpgrades(),
                          uzi: freshWeaponUpgrades(),
                          doze: freshWeaponUpgrades(),
                          basuca: freshWeaponUpgrades(),
                          rifle: freshWeaponUpgrades(),
                          magnum: freshWeaponUpgrades(),
                          minigun: freshWeaponUpgrades(),
                        };
                        setUpgrades(JSON.parse(JSON.stringify(upgradesRef.current)));
                        charUpgradesRef.current = initialCharUpgrades();
                        setCharUpgrades(initialCharUpgrades());
 
                        inventoryRef.current = {
                          hotbar: ["gun", null, null, null, null],
                          hotbarAmmo: [200, 0, 0, 0, 0],
                          backpack: Array(16).fill(null),
                          activeSlot: 0,
                          selectedItem: null,
                          equippedSkins: {},
                          purchasedSkins: [],
                        };
 
                        setIsShopOpen(false);
                        setIsInventoryOpen(false);
                        setIsOutfitsOpen(false);
                        setCredits(999999999);
 
                        vanState = "PARKED";
                        VAN_X = 0;
                        VAN_Y = -350;
                        vanTargetX = 0;
                        vanTargetY = -350;
 
                        waveRef.current.mode = false;
                        setIsWaveMode(false);
                        (window as any).clearZombiesOnStart = true;
                        (window as any).freeModeSpawningEnabled = false;
                        setGameState("PLAYING");
                        SoundManager.playSound("click", 1.0);
                      }}
                      onMouseEnter={() => {
                        setHoveredMenuBtn("sandbox_mode");
                        SoundManager.playSound("click", 0.12);
                      }}
                      onMouseLeave={() => setHoveredMenuBtn(null)}
                      className="group relative w-full py-4 px-6 rounded-lg bg-zinc-950/20 border border-zinc-750/30 hover:border-zinc-400 hover:bg-zinc-500/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left transition-all duration-300 cursor-pointer flex items-center gap-4.5 overflow-hidden"
                   >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="w-10 h-10 rounded-full border border-zinc-500/40 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-zinc-400 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-200 group-hover:text-white group-hover:scale-110 transition-transform">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 2v20M2 12h20M12 12m-3 0a3 3 0 1 1 6 0 3 3 0 1 1-6 0" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[15px] font-black uppercase tracking-wider text-neutral-200 font-mono">MODO TESTE</span>
                        <span className="text-[8px] text-zinc-450 font-mono tracking-wider uppercase">TREINO E CRÉDITOS ILIMITADOS</span>
                      </div>
                   </button>
 
                   {/* 3. Row: Shop and Outfits side-by-side */}
                   <div className="flex gap-3 w-full">
                     {/* Weapon Shop Button (Loja) */}
                     <button
                        onClick={() => {
                          setShopTab("skins");
                          setIsShopOpen(true);
                          setIsOutfitsOpen(false);
                          SoundManager.playSound("click", 1.0);
                        }}
                        onMouseEnter={() => {
                          setHoveredMenuBtn("shop");
                          SoundManager.playSound("click", 0.12);
                        }}
                        onMouseLeave={() => setHoveredMenuBtn(null)}
                        className="group relative flex-1 py-3 px-4 rounded-lg bg-amber-950/10 border border-amber-500/25 hover:border-amber-500 hover:bg-amber-500/5 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden"
                     >
                        <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-amber-450 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400 group-hover:text-amber-200 group-hover:scale-110 transition-transform">
                            <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                        </div>
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-[13px] font-black uppercase tracking-wider text-neutral-200 font-mono">LOJA</span>
                          <span className="text-[7.5px] text-neutral-500 font-mono uppercase">ARMAS & SKINS</span>
                        </div>
                     </button>
 
                     {/* Outfits Button (Trajes) */}
                     <button
                        onClick={() => {
                          setIsOutfitsOpen(true);
                          setIsShopOpen(false);
                          SoundManager.playSound("click", 1.0);
                        }}
                        onMouseEnter={() => {
                          setHoveredMenuBtn("character");
                          SoundManager.playSound("click", 0.12);
                        }}
                        onMouseLeave={() => setHoveredMenuBtn(null)}
                        className="group relative flex-1 py-3 px-4 rounded-lg bg-zinc-950/20 border border-zinc-800/60 hover:border-zinc-500 hover:bg-zinc-500/5 transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden"
                     >
                        <div className="w-8 h-8 rounded-full border border-zinc-700/40 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-zinc-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-transform">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-[13px] font-black uppercase tracking-wider text-neutral-200 font-mono">PERSONAGEM</span>
                          <span className="text-[7.5px] text-neutral-500 font-mono uppercase">CUSTOMIZAR</span>
                        </div>
                     </button>
                   </div>
 
                   {/* Highlighted Gameplay Tips Button */}
                   <button
                      onClick={() => {
                        setGameplayTipsOpen(true);
                        SoundManager.playSound("click", 1.0);
                      }}
                      onMouseEnter={() => {
                        setHoveredMenuBtn("tips");
                        SoundManager.playSound("click", 0.12);
                      }}
                      onMouseLeave={() => setHoveredMenuBtn(null)}
                      className="group relative w-full py-3 px-5 bg-gradient-to-r from-amber-600/10 to-amber-500/5 border border-amber-500/25 text-amber-200 hover:border-amber-400 hover:from-amber-500/15 hover:to-amber-500/5 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 rounded-lg flex items-center gap-4 cursor-pointer"
                   >
                      <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-amber-400 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400 group-hover:text-amber-200 group-hover:scale-110 transition-transform">
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                          <path d="M9 18h6M10 22h4" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start leading-tight text-left">
                        <span className="text-[13px] font-black uppercase tracking-wider text-amber-400 font-mono">Dicas de Jogabilidade</span>
                        <span className="text-[8px] text-amber-500/60 font-mono uppercase tracking-wider">Como jogar, comprar upgrades e ondas</span>
                      </div>
                   </button>
 
                   {/* Bestiary Button */}
                   <button
                      onClick={() => {
                        setIsBestiaryOpen(true);
                        SoundManager.playSound("click", 1.0);
                      }}
                      onMouseEnter={() => {
                        setHoveredMenuBtn("bestiary");
                        SoundManager.playSound("click", 0.12);
                      }}
                      onMouseLeave={() => setHoveredMenuBtn(null)}
                      className="group relative w-full py-3.5 px-5 bg-zinc-950/20 border border-zinc-800/40 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-500/5 transition-all duration-300 rounded-lg flex items-center gap-4 cursor-pointer"
                   >
                      <div className="w-8 h-8 rounded-full border border-zinc-700/50 flex items-center justify-center bg-black/60 flex-shrink-0 group-hover:border-zinc-500 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-transform">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col items-start leading-tight text-left">
                        <span className="text-[13px] font-black uppercase tracking-wider text-zinc-200 font-mono">ARQUIVOS ZUMBI</span>
                        <span className="text-[7.5px] text-zinc-500 font-mono uppercase">CATÁLOGO DE MUTAÇÕES</span>
                      </div>
                   </button>
                </div>
              </div>

              {/* Right Side Hover Info Panel */}
              <div className="absolute top-1/2 right-12 md:right-24 -translate-y-1/2 z-20 w-[340px] md:w-[410px] pointer-events-none select-none text-left flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300 bg-black/75 border border-zinc-900/60 p-6 rounded-2xl backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
                {hoveredMenuBtn ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full shadow-[0_0_8px_#ef4444]" />
                      <span className="text-[10px] font-mono tracking-[0.25em] text-red-500 font-bold uppercase">
                        {hoverInfo[hoveredMenuBtn].subtitle}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider font-mono">
                      {hoverInfo[hoveredMenuBtn].title}
                    </h2>
                    
                    {/* Minimalist Cinematic separator line with dot */}
                    <div className="flex items-center gap-2 w-full my-1">
                      <div className="h-[1px] bg-gradient-to-r from-red-500/50 to-transparent flex-1" />
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </div>
                    
                    <p className="text-[12px] md:text-[13px] font-mono text-zinc-400 leading-relaxed font-semibold">
                      {hoverInfo[hoveredMenuBtn].desc}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col gap-1.5 opacity-25">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                      AGUARDANDO INSTRUÇÕES...
                    </span>
                    <p className="text-[11px] font-mono text-zinc-600">
                      Passe o cursor sobre as opções do simulador para obter relatórios de campo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bestiary Modal */}
      {isBestiaryOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-auto select-none p-4 font-mono">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl relative flex gap-8">
            <button 
              onClick={() => {
                if (selectedBestiaryZombie) setSelectedBestiaryZombie(null);
                else setIsBestiaryOpen(false);
                SoundManager.playSound("click", 1.0);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            {!selectedBestiaryZombie ? (
              <div className="w-full flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest border-b border-zinc-800 pb-4 w-full text-center">Arquivos Zumbi</h2>
                <p className="text-zinc-500 text-sm mb-8">Elimine ameaças no submundo para desbloquear seus relatórios confidenciais.</p>
                <div className="flex gap-6 justify-center flex-wrap">
                  {[
                    { id: 'comum', name: 'Zumbi Comum', img: '/zombies/comum.png' },
                    { id: 'atirador', name: 'Mutante Atirador', img: '/zombies/atirador.png' },
                    { id: 'dasher', name: 'Ameaça Dasher', img: '/zombies/dasher.png' }
                  ].map(z => {
                    const unlocked = localStorage.getItem(`mns_unlocked_${z.id}`) === 'true';
                    return (
                      <div 
                        key={z.id}
                        onClick={() => unlocked && setSelectedBestiaryZombie(z.id)}
                        className={`flex flex-col items-center w-48 p-4 rounded-xl border transition-all ${unlocked ? 'border-zinc-700 bg-zinc-900 cursor-pointer hover:border-red-500 hover:bg-zinc-800' : 'border-zinc-900 bg-black/50 opacity-40 cursor-not-allowed'}`}
                      >
                        <img src={z.img} className={`w-32 h-32 object-contain mb-4 ${unlocked ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'grayscale brightness-0'}`} />
                        <span className="text-sm font-bold uppercase tracking-wider text-white">{unlocked ? z.name : 'DESCONHECIDO'}</span>
                        {!unlocked && <span className="text-[10px] text-zinc-500 mt-2">ALVO NÃO ELIMINADO</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full flex gap-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-1/2 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <img src={`/zombies/${selectedBestiaryZombie}.png`} className="w-full h-auto max-h-[400px] object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
                </div>
                <div className="w-1/2 flex flex-col justify-center">
                  <h3 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-tighter">
                    {selectedBestiaryZombie === 'comum' ? 'Zumbi Comum' : selectedBestiaryZombie === 'atirador' ? 'Mutante Atirador' : 'Ameaça Dasher'}
                  </h3>
                  <div className="h-0.5 w-16 bg-red-600 mb-6" />
                  
                  <div className="flex flex-col gap-4 text-zinc-300 text-sm leading-relaxed">
                    {selectedBestiaryZombie === 'comum' ? (
                      <>
                        <p><strong>Classificação:</strong> Ameaça Baixa/Média (Em Bando)</p>
                        <p>Os habitantes originais do submundo. Expostos à toxina atmosférica durante o primeiro vazamento no setor 7. Seu tecido muscular apodreceu, mas o sistema nervoso foi hiper-estimulado, tornando-os caçadores agressivos e implacáveis, movidos apenas pelo instinto de consumo de biomassa fresca.</p>
                      </>
                    ) : selectedBestiaryZombie === 'atirador' ? (
                      <>
                        <p><strong>Classificação:</strong> Ameaça Alta (Ataque à Distância)</p>
                        <p>Uma anomalia mutante. Trabalhadores da refinaria que ingeriram diretamente os cristais vermelhos sintéticos. O corpo deles condensa o cristal na corrente sanguínea, permitindo que disparem densas esferas de energia volátil pelos poros e extremidades. São covardes em combate corpo a corpo, mantendo distância para disparar rajadas letais.</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Classificação:</strong> Ameaça Crítica (Extrema Velocidade)</p>
                        <p>Predadores alfa corrompidos pela variação roxa do patógeno. Esta cepa alterou a biologia do hospedeiro, injetando adrenalina pura ininterruptamente. O resultado é um monstro ágil e frenético, capaz de desviar de disparos de fogo no ar e de utilizar investidas mortais (Dashes) em frações de segundo para destroçar qualquer agente distraído.</p>
                      </>
                    )}
                  </div>
                  <button onClick={() => setSelectedBestiaryZombie(null)} className="mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg uppercase tracking-widest text-xs transition-colors border border-zinc-700">VOLTAR AO CATÁLOGO</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Gameplay Tips Manual Modal */}
      {gameplayTipsOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
          <div className="bg-[#0c0a09] border border-zinc-800 rounded-xl max-w-[650px] w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-left relative">
            <button 
              onClick={() => {
                setGameplayTipsOpen(false);
                SoundManager.playSound("click", 0.7);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:scale-110 transition-all cursor-pointer font-bold text-lg p-2"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3.5 border-b border-zinc-800 pb-4">
              <span className="text-3xl">💡</span>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-neutral-100">Manual de Jogabilidade</h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Aprenda a Sobreviver em A Lenda</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-5 overflow-y-auto max-h-[55vh] pr-2 scrollbar-thin">
              {/* Tab 1: Como Jogar */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg">
                <h3 className="text-xs font-black text-red-500 uppercase tracking-wider mb-2">🎮 Controles & Movimentação</h3>
                <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                  Use as teclas <span className="font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-white text-[11px]">W, A, S, D</span> para se mover pelo deserto. Mire usando o cursor do mouse e atire com o <span className="text-neutral-100 font-bold">Botão Esquerdo</span>. Pressione <span className="font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-white text-[11px]">R</span> para recarregar. Use <span className="font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-white text-[11px]">Shift</span> ou <span className="font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-white text-[11px]">Espaço</span> para realizar uma rolagem tática de esquiva.
                </p>
              </div>

              {/* Tab 2: A Kombi & Loja de Armas */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-2">🚐 Loja de Armas (A Kombi)</h3>
                <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                  No início de cada partida, a Kombi te deixa no local de combate. Ela permanece estacionada no centro do mapa e serve como sua loja. Aproxime-se dela e pressione <span className="font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-white text-[11px]">E</span> para abrir o catálogo. Compre Pistolas Pesadas, Uzis, Doze, Rifles de Assalto ou a Bazuca de alto dano, além de reabastecer sua munição.
                </p>
              </div>

              {/* Tab 3: Aprimoramentos */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg">
                <h3 className="text-xs font-black text-sky-500 uppercase tracking-wider mb-2">🧬 Aprimoramentos de Personagem</h3>
                <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                  Na aba 'PERSONAGEM' do menu inicial, acesse a sub-aba de 'Aprimoramentos' para gastar seus créditos ganhos nas ondas de zumbis. Compre aprimoramentos permanentes de Vida Máxima, Capacidade de Pente, Dano Extra das Armas, Velocidade de Corrida e alcance do Radar para aumentar a força de todos os seus agentes de forma definitiva.
                </p>
              </div>

              {/* Tab 4: Ondas & Perigos */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg">
                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2">💀 Ondas Progressivas & Gás Tóxico</h3>
                <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                  A cada onda completada, a horda de zumbis fica mais veloz, agressiva e resistente. Fique atento às ondas de chefões, onde surgirão zumbis gigantes (Juggernauts). Evite se afastar muito em direção às bordas do mapa: uma névoa ácida venenosa verde cerca o mapa e causará dano contínuo caso você saia do perímetro central seguro.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setGameplayTipsOpen(false);
                SoundManager.playSound("click", 0.7);
              }}
              className="menu-btn-concrete w-full py-3.5 px-5 rounded-lg text-center font-black uppercase tracking-wider text-xs cursor-pointer mt-2"
            >
              Entendido, Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* Cinematic Typewriter Transition Overlay */}
      {isTypingActive && (
        <div 
          className="fixed inset-0 z-[120] bg-[#020202] flex flex-col items-center justify-center pointer-events-auto transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: typingScreenFade ? 0 : 1 }}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center max-w-[85vw]">
            <div 
              className="flex flex-wrap items-center justify-center font-mono text-xl md:text-3xl font-black text-red-550 tracking-[0.2em] transition-opacity duration-700 ease-in-out drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]"
              style={{ opacity: typingTextFade ? 0 : 1, color: "#ef4444" }}
            >
              <span>{typingText}</span>
              {!typingTextFade && (
                <span className="w-2.5 h-6 md:h-8 bg-red-500 ml-1.5 animate-pulse" />
              )}
            </div>
            
            {/* Dramatic subtext that fades in slowly */}
            {typingText.length >= 10 && (
              <span 
                className="text-[9px] md:text-[10px] font-mono tracking-[0.35em] text-zinc-650 uppercase animate-in fade-in duration-1000 mt-2"
                style={{ opacity: typingTextFade ? 0 : 0.6, color: "#71717a" }}
              >
                O SUBMUNDO AGUARDA SEU RETORNO...
              </span>
            )}
          </div>

          {/* Skip button */}
          {!typingScreenFade && (
            <button
              onClick={skipTypewriter}
              className="absolute bottom-10 right-10 text-zinc-650 hover:text-white font-mono text-[9.5px] uppercase tracking-widest border border-zinc-800 hover:border-zinc-500 px-4 py-2 rounded-full bg-black/40 hover:bg-black/80 transition-all duration-300 cursor-pointer hover:scale-102"
            >
              PULAR ➔
            </button>
          )}
        </div>
      )}

      {gameState === "PLAYING" && (
      <div className="absolute inset-0 z-20 pointer-events-none p-4 sm:p-6 md:p-8 flex flex-col justify-between">
            {/* Cinematic Van Focus Overlay */}
        <div 
          id="cinematic-van-overlay"
          className="pointer-events-none fixed inset-0 z-[-1] transition-opacity duration-100"
          style={{
            opacity: 0,
            backdropFilter: "blur(6px) brightness(0.7)",
            maskImage: "radial-gradient(circle at center, transparent 20%, black 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, transparent 20%, black 80%)"
          }}
        />


        {/* Wave Stats & Cleaning Menu */}
        {waveRef.current.mode && waveIntervalTime > 0 && (
          isWavePanelMinimized ? (
            /* Minimized Sleek Pill Notification */
            <div 
              onClick={() => setIsWavePanelMinimized(false)}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 border border-amber-500/35 p-2 px-4 rounded-xl flex items-center gap-3 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-amber-500/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all text-white font-mono text-[9px] animate-[slideIn_0.3s_ease-out] select-none pointer-events-auto whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-black tracking-wider uppercase text-zinc-400">ONDA {waveRef.current.current} CONCLUÍDA</span>
              <span className="text-amber-500 font-extrabold">PRÓXIMA EM: {waveIntervalTime}s</span>
              <span className="text-[7.5px] text-zinc-550 underline font-bold uppercase tracking-widest pl-2 border-l border-zinc-900 hover:text-zinc-300">DETALHES</span>
            </div>
          ) : (
            /* Expanded Sleek Central Panel - Minimalist Floating Holographic Report */
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none select-none flex flex-col items-center justify-center gap-6 text-center w-[360px] text-zinc-400 font-mono transition-all duration-700 animate-[fadeIn_0.5s_ease-out]">
              <span className="text-zinc-500 font-bold tracking-[0.5em] text-[9px] uppercase animate-pulse">RELATÓRIO DE COMBATE</span>
              <span className="text-2xl font-black text-zinc-300 tracking-[0.3em] uppercase border-y border-zinc-800/40 py-2.5 w-full text-center">ONDA {waveRef.current.current}</span>
              
              <div className="flex flex-col gap-1.5 w-full mt-2 text-[10px] tracking-wider text-zinc-500">
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>TEMPO ONDA:</span>
                  <span className="text-zinc-400 font-bold">{waveRef.current.lastWaveTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>DANO CAUSADO:</span>
                  <span className="text-zinc-400 font-bold">{waveRef.current.lastWaveDamage} HP</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>DISPAROS EFETUADOS:</span>
                  <span className="text-zinc-400 font-bold">{waveRef.current.lastWaveShots}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>PRECISÃO TÁTICA:</span>
                  <span className="text-zinc-400 font-bold">
                    {waveRef.current.lastWaveShots > 0 
                      ? Math.round((waveRef.current.lastWaveHits / waveRef.current.lastWaveShots) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>ACERTOS NA CABEÇA:</span>
                  <span className="text-zinc-400 font-bold">{waveRef.current.lastWaveHeadshots}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-900/30">
                  <span>CRÉDITOS RECEBIDOS:</span>
                  <span className="text-amber-600/80 font-bold">+${waveRef.current.lastWaveCreditsEarned}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 mt-4">
                <span className="text-[7.5px] text-zinc-650 uppercase tracking-widest font-black">Próxima Onda em</span>
                <span className="text-lg font-black text-zinc-400 animate-pulse">{waveIntervalTime}s</span>
              </div>
            </div>
          )
        )}

        {/* Top Header Tactical Element */}
        <div className={`flex justify-between items-start w-full transition-all duration-700 ${cutscene.active ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-90'}`}>
          <div className="flex gap-2 md:gap-3 pointer-events-none items-stretch">
            {/* Eye Icon (Hide HUD toggle) */}
            <button
              onClick={() => setIsHudHidden(!isHudHidden)}
              className="pointer-events-auto flex items-center justify-center bg-black/85 hover:bg-black border border-white/10 text-white rounded-br-xl p-2.5 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 relative group h-10 md:h-12 w-10 md:w-12 shrink-0 self-start z-[55] cursor-pointer"
              style={{ borderColor: uiColor, boxShadow: `0 0 15px ${uiColor}20` }}
              title={isHudHidden ? "Mostrar Interface" : "Ocultar Interface"}
            >
              {isHudHidden ? (
                <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: uiColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>

            {/* Left Stack for Vitals + Ammo HUD */}
            <div id="ui-hud-left-stack" className={`flex flex-col gap-1.5 items-start transition-all duration-500 ${isHudHidden ? 'opacity-0 pointer-events-none translate-x-[-20px] scale-95' : 'opacity-100 scale-100'}`}>
              <div className="flex gap-2 md:gap-3 items-stretch">
                {/* Player Info Top Left */}
                <div
                  id="ui-player-main-box"
                  className="flex items-stretch gap-3 bg-black/80 backdrop-blur-md p-2 pr-4 md:pr-6 border-l-[4px] rounded-br-xl relative overflow-hidden transition-all duration-300"
                  style={{ borderColor: uiColor, boxShadow: `0 0 20px ${uiColor}30`, backgroundImage: `linear-gradient(to right, ${uiColor}40, transparent)` }}
                >
                  {/* Scanline overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_2px,#000_2px,#000_4px)]" />
                  <div
                    id="ui-profile-box"
                    className="relative w-10 h-10 md:w-12 md:h-12 bg-black border flex-shrink-0 grid place-items-center overflow-hidden"
                    style={{ borderColor: `${uiColor}50` }}
                  >
                    {skinRef.current?.imgUrl ? (
                      <img src={skinRef.current.imgUrl} className="w-full h-full object-cover filter saturate-150 contrast-125" alt="profile" style={{ imageRendering: "pixelated" }} />
                    ) : (
                      <span
                        id="ui-profile-letter"
                        className="text-xl md:text-2xl font-bold font-mono opacity-80 mix-blend-screen tracking-tighter"
                        style={{ color: uiColor }}
                      >
                        K
                      </span>
                    )}
                    <div className="absolute inset-0 pointer-events-none border" style={{ borderColor: `${uiColor}20` }} />
                  </div>

                  <div className="flex flex-col flex-1 min-w-[140px] md:min-w-[180px] justify-center relative z-10">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[9px] md:text-[10px] tracking-[0.2em] font-bold text-white uppercase drop-shadow">
                        CMDR KELVIN
                      </span>
                      <span className="text-[8px] md:text-[9px] font-mono text-white/50 tracking-wider">
                        VITALS:{" "}
                        <span
                          id="ui-player-hp-text"
                          className="font-bold ml-1 drop-shadow-md"
                          style={{ color: uiColor }}
                        >
                          100/100
                        </span>
                      </span>
                    </div>

                    <div id="ui-player-hp-bar" className="h-1.5 md:h-2 w-[140px] bg-black/80 skew-x-[-15deg] overflow-hidden p-[1px] mb-1 shadow-inner relative border" style={{ borderColor: `${uiColor}40`, transition: "width 0.3s ease-out" }}>
                      <div className="absolute inset-0" style={{ backgroundColor: `${uiColor}30` }} />
                      <div
                        id="ui-player-hp-fill"
                        className="relative h-full transition-all duration-300 border-r"
                        style={{ width: "100%", backgroundColor: uiColor, borderColor: uiColor, boxShadow: `0 0 8px ${uiColor}` }}
                      />
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="text-[8px] text-white/40 tracking-[0.3em] uppercase">
                        FURY
                      </span>
                      <div
                        id="ui-fury-container"
                        className="h-1 md:h-1.5 flex-1 bg-black/80 border border-white/10 skew-x-[-15deg] overflow-visible"
                        title="Fury Meter relative"
                      >
                        <div
                          id="ui-fury-fill"
                          className="h-full bg-amber-500 transition-all duration-300 relative"
                          style={{ width: "0%" }}
                        >
                          <div
                            id="ui-fury-glow"
                            className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 transition-opacity"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[8px] text-white/40 tracking-[0.3em] uppercase">
                        DODGE
                      </span>
                      <div className="h-1 md:h-1.5 flex-1 bg-black/80 border border-white/10 skew-x-[-15deg] overflow-hidden">
                         <div
                            id="ui-player-roll-fill"
                            className="h-full transition-all duration-100"
                            style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.8)" }}
                         />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[8px] text-white/40 tracking-[0.3em] uppercase">
                        STMN
                      </span>
                      <div id="ui-player-stamina-bar" className="h-1 md:h-1.5 w-[100px] bg-black/80 border border-white/10 skew-x-[-15deg] overflow-hidden" style={{ transition: "width 0.3s ease-out" }}>
                         <div
                            id="ui-player-stamina-fill"
                            className="h-full transition-all duration-100"
                            style={{ width: "100%", backgroundColor: "rgba(60,200,100,0.8)" }}
                         />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactical Kill Counter */}
                <div className="flex flex-col justify-center items-center bg-black/80 backdrop-blur-md border border-white/10 border-b-[3px] rounded-br-xl p-1.5 px-3 md:px-4 shadow-lg" style={{ borderBottomColor: `${uiColor}90` }}>
                  <span className="text-[7px] tracking-[0.2em] font-bold text-white/30 uppercase mb-0.5">
                    KILLS
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      id="ui-kill-count"
                      className="text-xl md:text-2xl font-mono font-bold leading-none"
                      style={{ color: uiColor, filter: `drop-shadow(0 0 6px ${uiColor})` }}
                    >
                      0
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Weapon & Ammo Panel (Moved under vitals) */}
              <div className="flex flex-col gap-1 items-start mt-1 z-45">
                <div
                  id="ui-ammo-panel"
                  className="flex items-center gap-3 pointer-events-none select-none transition-opacity duration-200 bg-black/80 backdrop-blur-md p-1.5 px-3 border border-white/10 border-l-[3px] rounded-r-xl shadow-lg"
                  style={{ borderColor: uiColor }}
                >
                  <div className="relative w-20 h-8 flex items-center justify-center">
                    {[
                      { id: "pistola" },
                      { id: "gun" },
                      { id: "uzi" },
                      { id: "doze" },
                      { id: "basuca" },
                      { id: "rifle" },
                      { id: "magnum" }
                    ].map((w) => {
                      const themeColor = WEAPONS_DETAILS[w.id]?.color || "#fff";
                      return (
                        <div
                          key={w.id}
                          id={`ui-ammo-weapon-${w.id}`}
                          style={{ display: "none" }}
                          className="transition-all duration-75 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        >
                          <RenderWeaponIcon type={w.id} color={themeColor} isHudLarge={true} />
                        </div>
                      );
                    })}

                    {/* Reloading Overlay with Progress Bar */}
                    <div 
                      id="ui-ammo-reload-overlay"
                      style={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-[1px] rounded border border-amber-500/20 px-2 transition-opacity duration-200"
                    >
                      <span className="text-[6.5px] font-mono font-bold text-amber-500 tracking-[0.1em] uppercase mb-0.5">RECARREGANDO</span>
                      <div className="w-full h-0.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                        <div 
                          id="ui-ammo-reload-fill"
                          className="h-full bg-amber-500"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-[1px] h-6 bg-white/10" />

                  <div className="text-2xl font-black font-mono tracking-tighter flex items-baseline text-white">
                    <span id="ui-ammo-count" className="text-white">200</span>
                    <span className="text-sm text-white/30 font-light mx-0.5 transform rotate-[15deg]">/</span>
                    <span id="ui-ammo-max" className="text-xs text-white/40 font-bold">200</span>
                  </div>
                </div>

                {/* Backpack button relocated right beneath the Active Weapon/Ammo Panel */}
                <motion.button
                  id="btn-toggle-backpack"
                  onClick={() => {
                    setIsInventoryOpen(!isInventoryOpen);
                    setIsShopOpen(false);
                    setIsOutfitsOpen(false);
                  }}
                  animate={animateBackpack ? {
                    scale: [1, 1.25, 0.9, 1.15, 0.95, 1],
                    rotate: [0, -10, 10, -5, 5, 0],
                    borderColor: ["rgba(251,191,36,0.2)", "rgba(251,191,36,1)", "rgba(251,191,36,0.2)"],
                    backgroundColor: ["rgba(0,0,0,0.4)", "rgba(251,191,36,0.25)", "rgba(0,0,0,0.4)"]
                  } : {}}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`px-3 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded-r-lg backdrop-blur-md border-l-[3px] transition-colors flex items-center justify-center gap-1.5 relative pointer-events-auto mt-0.5 shadow-md ${
                    isInventoryOpen
                      ? "border-amber-500 text-amber-400 bg-amber-900/40"
                      : "border-white/20 text-white/60 bg-black/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <motion.span
                    animate={animateBackpack ? {
                      scale: [1, 1.4, 0.8, 1.2, 1],
                      color: ["#ffffff", "#fbbf24", "#ffffff"]
                    } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex items-center shrink-0"
                  >
                    {backpackImgUrl ? (
                      <img src={backpackImgUrl} alt="mochila" className="w-5 h-5 object-contain filter drop-shadow-[0_0_2px_#10b981]" />
                    ) : (
                      <Backpack className="w-3.5 h-3.5" />
                    )}
                  </motion.span>
                  <span>MOCHILA</span>

                  <AnimatePresence>
                    {animateBackpack && (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 border border-amber-400 rounded pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            {/* Removed HUD controls to prevent clutter, now inside backpack */}
          </div>
          <div /> {/* Radar is drawn by canvas on the right */}
        </div>
      </div>
      )}

      {isShopOpen && (
          <div className="absolute inset-0 z-[60] pointer-events-auto flex items-center justify-center bg-black/65 backdrop-blur-md">
            {inspectingItem && (
              <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-xl p-8" onClick={() => setInspectingItem(null)}>
                <motion.div 
                  initial={{ scale: 0.5, y: 50, opacity: 0 }} 
                  animate={{ scale: 1.8, y: 0, opacity: 1 }} 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative flex items-center justify-center w-full h-full pointer-events-none"
                >
                   {inspectingItem.type === "weapon" ? (
                      <div className="filter drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]">
                         <RenderWeaponBlueprint type={inspectingItem.id} color={WEAPONS_DETAILS[inspectingItem.id].color} />
                      </div>
                   ) : (
                      <img src={WEAPON_SKINS.find(s => s.id === inspectingItem.id)?.url} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]" style={{ imageRendering: "pixelated" }} />
                   )}
                </motion.div>
                <div className="absolute bottom-10 z-[70] flex gap-4">
                   <button onClick={(e) => { e.stopPropagation(); setInspectingItem(null); }} className="px-6 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-sm tracking-widest rounded hover:bg-zinc-800 transition-colors cursor-pointer">
                     FECHAR (ESC)
                   </button>
                </div>
              </div>
            )}
<div className="bg-zinc-950/98 border border-zinc-900 rounded-3xl p-6 w-[860px] max-w-[95vw] h-[585px] max-h-[90vh] shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative flex flex-col overflow-hidden">
              {/* Header with pill tabs */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-900 shrink-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span className="text-[10px] font-mono tracking-[0.22em] text-zinc-400 font-black uppercase">
                      {gameState === "MENU" ? "LOJA DE SKINS EXCLUSIVAS" : "REDE DE SUPRIMENTOS"}
                    </span>
                  </div>
                  <div className="flex bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-0.5 gap-1.5">
                    {gameState !== "MENU" ? (
                      <>
                        <button
                          onClick={() => setShopTab("weapons")}
                          className={`px-5 py-1 text-[9px] font-mono font-bold tracking-widest rounded transition-all cursor-pointer ${
                            shopTab === "weapons"
                              ? "bg-amber-600/10 border border-amber-500/40 text-amber-400 shadow-inner"
                              : "border border-transparent text-zinc-500 hover:text-zinc-350"
                          }`}
                        >
                          ARMAS
                        </button>
                        <button
                          onClick={() => setShopTab("upgrades")}
                          className={`px-5 py-1 text-[9px] font-mono font-bold tracking-widest rounded transition-all cursor-pointer ${
                            shopTab === "upgrades"
                              ? "bg-amber-600/10 border border-amber-500/40 text-amber-400 shadow-inner"
                              : "border border-transparent text-zinc-500 hover:text-zinc-350"
                          }`}
                        >
                          MELHORIAS ARMAS
                        </button>
                        <button
                          onClick={() => setShopTab("character")}
                          className={`px-5 py-1 text-[9px] font-mono font-bold tracking-widest rounded transition-all cursor-pointer ${
                            shopTab === "character"
                              ? "bg-amber-600/10 border border-amber-500/40 text-amber-400 shadow-inner"
                              : "border border-transparent text-zinc-500 hover:text-zinc-350"
                          }`}
                        >
                          MELHORIAS PERSONAGEM
                        </button>
                        <button
                          onClick={() => setShopTab("skins")}
                          className={`px-5 py-1 text-[9px] font-mono font-bold tracking-widest rounded transition-all cursor-pointer ${
                            shopTab === "skins"
                              ? "bg-amber-600/10 border border-amber-500/40 text-amber-400 shadow-inner"
                              : "border border-transparent text-zinc-500 hover:text-zinc-350"
                          }`}
                        >
                          SKINS
                        </button>
                      </>
                    ) : (
                      <button
                        className="px-5 py-1 text-[9px] font-mono font-bold tracking-widest rounded bg-amber-600/10 border border-amber-500/40 text-amber-400 shadow-inner"
                      >
                        SKINS DE ARMAS
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsShopOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Credits banner */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 px-5 mb-4 flex justify-between items-center relative overflow-hidden shadow-inner shrink-0">
                <span className="text-[10px] font-mono tracking-[0.18em] text-zinc-500 font-bold">
                  CRÉDITOS ARMAMENTO
                </span>
                <span className="text-lg font-mono font-black text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.22)]">
                  {credits.toLocaleString()} Cr
                </span>
              </div>

              {/* Split Main Grid */}
              <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                {shopTab === "weapons" && (
                  <>
                    {/* Weapons list column */}
                    <div className="col-span-5 flex flex-col gap-2 pr-1 h-full overflow-y-auto custom-scrollbar">
                      {Object.values(WEAPONS_DETAILS).map((weapon) => {
                        const isPaid = purchasedWeaponIds.includes(weapon.id);
                        const isSelected = selectedShopWeaponId === weapon.id;
                        
                        return (
                          <button
                            key={weapon.id}
                            onClick={() => {
                              setSelectedShopWeaponId(weapon.id);
                              setSelectedShopSkinId(null);
                              SoundManager.playSound("click", 0.9);
                            }}
                            onMouseEnter={() => SoundManager.playSound("click", 0.12)}
                            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between relative transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.015] active:scale-[0.985] ${
                              isSelected
                                ? "border-amber-600/60 bg-zinc-900/40"
                                : "border-zinc-900 bg-black/45 hover:bg-zinc-900/10 hover:border-zinc-800"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                            )}
                            <div className="flex flex-col gap-1 z-10">
                              <span
                                className={`text-[10.5px] font-black tracking-widest uppercase truncate ${isSelected ? "text-amber-500" : "text-zinc-300"}`}
                              >
                                {weapon.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[8.5px] font-mono mt-0.5">
                                <span className="text-zinc-600">CUSTO</span>
                                <span className="text-zinc-400 font-bold">
                                  {weapon.cost} Cr
                                </span>
                              </div>
                            </div>
                            
                            {/* Weapon silhouette / icon on the right side of button */}
                            <div className="flex items-center gap-3">
                              {isPaid && (
                                <span className="text-[7px] font-mono font-bold text-zinc-350 border border-zinc-800 bg-zinc-900/40 px-1.5 py-0.5 rounded shrink-0">
                                  ✓ OK
                                </span>
                              )}
                              <div className="h-8 w-14 flex items-center justify-center opacity-30 group-hover:opacity-60">
                                <RenderWeaponIcon type={weapon.id} color={isSelected ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.2)"} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right column details */}
                    <div className="col-span-7 flex flex-col border-l border-zinc-900 pl-4 h-full relative justify-between overflow-y-auto pr-1 custom-scrollbar">
                      {(() => {
                        const stats =
                          WEAPONS_DETAILS[selectedShopWeaponId || "pistola"];
                        if (!stats) return null;
                        const isPaid = purchasedWeaponIds.includes(stats.id);
                        
                        // Define all skins for this weapon, prepending the default/standard blueprint skin
                        const weaponSkins = WEAPON_SKINS.filter(s => s.weapon === stats.id);
                        const allSkins = [
                          { id: "default", name: "Estilo Padrão", url: null, isDefault: true, themeColor: stats.color },
                          ...weaponSkins
                        ];
                        
                        const clampedIndex = Math.abs(selectedShopSkinIndex) % allSkins.length;
                        const activeSkin = allSkins[clampedIndex];
                        const isEquipped = activeSkin.isDefault
                          ? !inventoryRef.current.equippedSkins[stats.id]
                          : inventoryRef.current.equippedSkins[stats.id] === activeSkin.id;

                        return (
                          <div className="flex flex-col gap-3 h-full select-none">
                            {/* LARGE PREVIEW AREA WITH DYNAMIC INTERACTIVE ZOOM */}
                            <div 
                              onClick={() => {
                                setShopZoomed(prev => !prev);
                                SoundManager.playSound("click", 0.7);
                              }}
                              className="relative shrink-0 w-full h-[180px] bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-zoom-in group select-none transition-all duration-300"
                              style={{
                                backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 0)",
                                backgroundSize: "16px 16px"
                              }}
                            >
                              {/* Corner Indicators */}
                              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-zinc-800" />
                              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-zinc-800" />
                              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-zinc-800" />
                              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-zinc-800" />

                              {/* Subtle axis helper lines */}
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-full h-[1px] bg-white/[0.01]" />
                                <div className="h-full w-[1px] bg-white/[0.01] absolute" />
                              </div>
                              
                              {/* Weapon blueprint with scale that shifts between 1.75x and 3.1x on zoom */}
                              <div 
                                className="transition-all duration-500 ease-out"
                                style={{
                                  transform: shopZoomed ? "scale(3.1)" : "scale(1.75)",
                                  filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
                                }}
                              >
                                <RenderWeaponBlueprint type={stats.id} color={stats.color} />
                              </div>

                              {/* Zoom info label */}
                              <div className="absolute bottom-3 right-3 bg-black/60 border border-zinc-900 px-2 py-0.5 rounded text-[7px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none group-hover:text-zinc-300 transition-colors">
                                {shopZoomed ? "Clique para Reduzir [ - ]" : "Clique para Ampliar [ + ]"}
                              </div>
                            </div>

                            {/* DETAILS & ACTIONS */}
                            <div className="flex-1 flex flex-col shrink-0 justify-between gap-3 mt-1">
                              <div className="flex justify-between items-end">
                                <h4 className="text-[17px] font-black tracking-widest text-white uppercase">{stats.name}</h4>
                                <span className="text-[12px] font-mono text-amber-500 font-bold">{stats.cost} Cr</span>
                              </div>

                              {/* COMPACT STATS ROW */}
                              <div className="flex justify-between items-center bg-black/40 border border-zinc-900 rounded-lg p-2.5 px-4 text-[11px] font-mono text-zinc-400 shrink-0">
                                <div className="flex gap-2 items-center">
                                  <span>DMG</span><span className="text-zinc-200 font-bold">{stats.damage}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <span>SPD</span><span className="text-zinc-200 font-bold">{stats.fireRate}s</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <span>MAG</span><span className="text-zinc-200 font-bold">{stats.ammoMax}</span>
                                </div>
                              </div>

                              {/* WEAPON ACQUISITION BUTTON */}
                              <div className="shrink-0 mt-1">
                                {!isPaid ? (
                                  <button
                                    onClick={() => {
                                      purchaseWeapon(stats.id);
                                      SoundManager.playSound("click", 1.0);
                                    }}
                                    disabled={!(!waveRef.current.mode || credits >= stats.cost)}
                                    className={`w-full py-3 rounded-xl font-mono text-[10px] font-black tracking-widest uppercase transition-all shadow-lg cursor-pointer ${
                                      (!waveRef.current.mode || credits >= stats.cost)
                                        ? "bg-zinc-100 hover:bg-white text-black shadow-white/10"
                                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800/50"
                                    }`}
                                  >
                                    {!waveRef.current.mode ? "ADQUIRIR [GRÁTIS]" : `ADQUIRIR [${stats.cost} Cr]`}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const success = deliverToBackpack(stats.id);
                                      const msgEl = document.getElementById("shop-msg");
                                      if (success) {
                                        SoundManager.playSound("click", 1.0);
                                        if (msgEl) { msgEl.innerText = "EQUIPADO!"; setTimeout(() => { if (msgEl) msgEl.innerText = ""; }, 1500); }
                                      } else {
                                        if (msgEl) { msgEl.innerText = "MOCHILA CHEIA!"; setTimeout(() => { if (msgEl) msgEl.innerText = ""; }, 1500); }
                                      }
                                    }}
                                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-amber-500 font-mono text-[10.5px] font-black tracking-widest uppercase rounded-xl transition-all border border-zinc-800 cursor-pointer"
                                  >
                                    Equipar Arma
                                  </button>
                                )}
                                <div id="shop-msg" className="text-center font-mono text-[8px] text-amber-500 font-bold mt-1 h-2 shrink-0"></div>
                              </div>
                            </div>

                            {/* BIG SKIN CAROUSEL */}
                            <div className="border-t border-zinc-900 pt-3 shrink-0 flex flex-col gap-2">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[8px] font-mono tracking-widest text-zinc-500 font-bold uppercase">SKINS</span>
                                <span className="text-[8px] font-mono text-zinc-500 font-bold">{clampedIndex + 1} / {allSkins.length}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* Left arrow */}
                                <button
                                  onClick={() => {
                                    setSelectedShopSkinIndex(prev => (prev - 1 + allSkins.length) % allSkins.length);
                                    SoundManager.playSound("click", 0.6);
                                  }}
                                  onMouseEnter={() => SoundManager.playSound("click", 0.1)}
                                  className="w-10 h-[90px] rounded-lg bg-zinc-900/50 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white transition-all cursor-pointer flex items-center justify-center font-bold text-lg shrink-0"
                                >
                                  ◀
                                </button>

                                {/* Middle skin preview */}
                                <div className="flex-1 h-[90px] bg-black/60 border border-zinc-900 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                  {activeSkin.isDefault ? (
                                    <div className="transform scale-[1.0] opacity-40 filter grayscale transition-transform duration-300 group-hover:scale-[1.12]">
                                      <RenderWeaponBlueprint type={stats.id} color="#666" />
                                    </div>
                                  ) : (
                                    <img src={activeSkin.url || ""} alt={activeSkin.name} className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-[1.12]" style={{ imageRendering: "pixelated" }} />
                                  )}
                                </div>

                                {/* Right arrow */}
                                <button
                                  onClick={() => {
                                    setSelectedShopSkinIndex(prev => (prev + 1) % allSkins.length);
                                    SoundManager.playSound("click", 0.6);
                                  }}
                                  onMouseEnter={() => SoundManager.playSound("click", 0.1)}
                                  className="w-10 h-[90px] rounded-lg bg-zinc-900/50 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white transition-all cursor-pointer flex items-center justify-center font-bold text-lg shrink-0"
                                >
                                  ▶
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1 px-1">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{activeSkin.name}</span>
                                
                                <button
                                  onClick={() => {
                                    if (activeSkin.isDefault) {
                                      delete inventoryRef.current.equippedSkins[stats.id];
                                    } else {
                                      if (!inventoryRef.current.purchasedSkins.includes(activeSkin.id)) {
                                        const cost = activeSkin.cost || 120;
                                        if (credits >= cost) {
                                          setCredits(prev => prev - cost);
                                          inventoryRef.current.purchasedSkins.push(activeSkin.id);
                                          inventoryRef.current.equippedSkins[stats.id] = activeSkin.id;
                                        } else {
                                          alert(`Créditos insuficientes para comprar esta skin (${cost} Cr necessárias).`);
                                        }
                                      } else {
                                        inventoryRef.current.equippedSkins[stats.id] = activeSkin.id;
                                      }
                                    }
                                    updateInv();
                                  }}
                                  className={`px-4 py-1.5 rounded-lg font-mono text-[9px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                                    isEquipped
                                      ? "bg-zinc-800 border border-zinc-600 text-amber-500"
                                      : !activeSkin.isDefault && !inventoryRef.current.purchasedSkins.includes(activeSkin.id)
                                        ? "bg-amber-600 hover:bg-amber-500 text-black shadow-md"
                                        : "bg-zinc-100 hover:bg-white text-black"
                                  }`}
                                >
                                  {isEquipped
                                    ? "EQUIPADO"
                                    : !activeSkin.isDefault && !inventoryRef.current.purchasedSkins.includes(activeSkin.id)
                                      ? `COMPRAR [${activeSkin.cost || 120} Cr]`
                                      : "USAR SKIN"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}

                {shopTab === "upgrades" && (
                  <div className="col-span-12 flex flex-col gap-3 h-[400px] overflow-y-auto custom-scrollbar relative p-1">
                    {/* Weapons list for upgrades */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1">
                      {[
                        { id: "pistola", name: "Pistola Tática" },
                        { id: "gun", name: "M4 Carbine" },
                        { id: "uzi", name: "Micro Uzi" },
                        { id: "doze", name: "Pump Shotgun" },
                        { id: "basuca", name: "RPG-7 Rocket" },
                        { id: "rifle", name: "Sniper Bolt" },
                        { id: "magnum", name: "Magnum .357" }
                      ].map((w) => {
                        const stats = WEAPONS_DETAILS[w.id];
                        const isOwned = purchasedWeaponIds.includes(w.id);
                        const themeColor = stats?.color || "#fff";
                        return (
                          <button
                            key={w.id}
                            disabled={!isOwned}
                            onClick={() => setSelectedWeaponForUpgrade(w.id)}
                            className={`p-3 border rounded-xl flex flex-col items-start gap-1 relative overflow-hidden transition-all ${
                              !isOwned
                                ? "border-zinc-900 bg-zinc-950 opacity-40 cursor-not-allowed"
                                : selectedWeaponForUpgrade === w.id
                                  ? "border-amber-500/80 bg-zinc-900/40 text-amber-400"
                                  : "border-zinc-850 bg-black/40 text-zinc-400 hover:bg-zinc-900/10 cursor-pointer"
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider">{w.name}</span>
                            <span className="text-[8px] font-mono opacity-60">
                              {isOwned ? "DESBLOQUEADA" : "BLOQUEADA"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Weapon Specific Upgrades Modal overlay */}
                    {selectedWeaponForUpgrade && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-3xl animate-in fade-in duration-300">
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-[560px] max-w-[95vw] shadow-[0_25px_70px_rgba(0,0,0,0.98)] flex flex-col gap-4 relative overflow-hidden">
                          {/* Corner brackets */}
                          <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-zinc-800" />
                          <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-zinc-800" />
                          <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-zinc-800" />
                          <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-zinc-800" />
                          
                          {/* Close button */}
                          <button 
                            onClick={() => setSelectedWeaponForUpgrade(null)}
                            className="absolute top-4 right-4 text-zinc-550 hover:text-white transition-all font-mono text-[9px] tracking-widest bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            ✕ FECHAR
                          </button>

                          {/* Weapon details header */}
                          <div className="flex items-center gap-4 border-b border-zinc-900 pb-3 mb-1 z-10">
                            <div className="w-14 h-14 flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-xl shrink-0 shadow-inner">
                              <RenderWeaponIcon type={selectedWeaponForUpgrade} color={WEAPONS_DETAILS[selectedWeaponForUpgrade]?.color} />
                            </div>
                            <div>
                              <h3 className="text-xs font-black text-white tracking-widest uppercase mb-0.5">
                                {WEAPONS_DETAILS[selectedWeaponForUpgrade]?.name}
                              </h3>
                              <p className="text-[8px] text-zinc-500 font-mono tracking-wider">UPGRADE SYSTEM / LABORATÓRIO DE BALÍSTICA</p>
                            </div>
                          </div>

                          {/* Upgrades grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1.5 z-10">
                            {[
                              { key: "damage", name: "Dano Físico", desc: "Aumenta a potência dos projéteis em 15% por nível." },
                              { key: "fireRate", name: "Velocidade de Disparo", desc: "Aumenta a cadência de tiro em 12% por nível." },
                              { key: "stability", name: "Estabilidade do Coice", desc: "Reduz o recuo/coice da arma em 15% por nível." },
                              { key: "accuracy", name: "Precisão dos Disparos", desc: "Reduz a dispersão dos projéteis em 15% por nível." },
                              { key: "capacity", name: "Capacidade do Carregador", desc: "Aumenta a munição máxima em 15% por nível." },
                              { key: "reloadSpeed", name: "Velocidade de Recarga", desc: "Reduz o tempo de recarga em 15% por nível." },
                              { key: "range", name: "Alcance Efetivo", desc: "Aumenta o alcance e vida útil do projétil em 15% por nível." },
                              { key: "scopeVision", name: "Visão e Mira", desc: "Aumenta o campo de visão e alcance da mira em 15% por nível." },
                            ].map((item) => {
                              const weaponUpgrades = upgrades[selectedWeaponForUpgrade] || { damage: 0, fireRate: 0, stability: 0, accuracy: 0, capacity: 0, reloadSpeed: 0, range: 0, scopeVision: 0 };
                              const lvl = weaponUpgrades[item.key] || 0;
                              const isMax = lvl >= 5;
                              const cost = isMax ? 0 : Math.round(75 * Math.pow(2.85, lvl));
                              
                              return (
                                <div key={item.key} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:border-zinc-850 hover:bg-zinc-900/10">
                                  <div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-zinc-200 text-[9.5px] font-black font-mono tracking-wider uppercase">{item.name}</span>
                                      <span className="text-[8px] font-mono font-black text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">
                                        {isMax ? "MÁX" : `LVL ${lvl}/5`}
                                      </span>
                                    </div>
                                    <p className="text-[7.5px] text-zinc-500 mt-1 leading-relaxed font-sans">{item.desc}</p>
                                  </div>
                                  
                                  {/* Segmented tactile progress bars */}
                                  <div className="flex gap-1.5 my-0.5">
                                    {[1, 2, 3, 4, 5].map((idx) => (
                                      <div
                                        key={idx}
                                        className={`h-1.5 flex-1 rounded-sm transition-all ${
                                          idx <= lvl 
                                            ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                                            : "bg-zinc-900 border border-zinc-950"
                                        }`}
                                      />
                                    ))}
                                  </div>

                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => {
                                        if (isMax) return;
                                        const isFreeMode = !waveRef.current.mode;
                                        if (isFreeMode || credits >= cost) {
                                          if (!isFreeMode) {
                                            setCredits(prev => prev - cost);
                                          }
                                          const newLvl = lvl + 1;
                                          const updatedWeaponUpgrades = { ...weaponUpgrades, [item.key]: newLvl };
                                          upgradesRef.current[selectedWeaponForUpgrade] = updatedWeaponUpgrades;
                                          setUpgrades(prev => ({ ...prev, [selectedWeaponForUpgrade]: updatedWeaponUpgrades }));
                                          SoundManager.playSound("heart", 0.85);
                                        }
                                      }}
                                      disabled={isMax || (!(!waveRef.current.mode || credits >= cost))}
                                      className={`flex-1 py-1.5 font-mono text-[8px] font-black tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
                                        isMax
                                          ? "bg-zinc-900 text-zinc-650 cursor-not-allowed"
                                          : (!waveRef.current.mode || credits >= cost)
                                            ? "bg-amber-600 text-black hover:bg-amber-500 shadow-md"
                                            : "bg-zinc-950 border border-zinc-900/60 text-zinc-600 cursor-not-allowed"
                                      }`}
                                    >
                                      {isMax ? "COMPLETO" : `${!waveRef.current.mode ? "GRÁTIS" : `${cost} Cr`}`}
                                    </button>
                                    
                                    {!isMax && (
                                      <button
                                        onClick={() => {
                                          setAdAlertOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 text-amber-500 border border-amber-500/25 hover:border-amber-500/65 rounded-lg transition-all cursor-pointer font-mono text-[8px] font-black flex items-center justify-center gap-1 shrink-0"
                                        title="Melhorar Grátis assistindo um anúncio"
                                      >
                                        📺 AD
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {shopTab === "character" && (
                  <div className="col-span-12 flex flex-col gap-3 h-[400px] overflow-y-auto custom-scrollbar relative p-1">
                    {/* Character Upgrade List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-1">
                      {[
                        { key: "maxHp", name: "Vida Máxima", desc: "Aumenta a saúde máxima do jogador em +20 por nível.", icon: "❤" },
                        { key: "staminaMax", name: "Estamina / Energia", desc: "Aumenta a capacidade de estamina máxima do jogador em +20 por nível.", icon: "⚡" },
                        { key: "speed", name: "Velocidade de Movimento", desc: "Aumenta a velocidade de caminhada e corrida em 8% por nível.", icon: "👟" }
                      ].map((item) => {
                        const lvl = charUpgrades[item.key] || 0;
                        const isMax = lvl >= 5;
                        const cost = isMax ? 0 : Math.round(80 * Math.pow(2.4, lvl));
                        const isFreeMode = !waveRef.current.mode;

                        return (
                          <div
                            key={item.key}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-zinc-800 shadow-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black font-mono tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
                                  <span className="text-amber-500 text-xs">{item.icon}</span>
                                  {item.name}
                                </span>
                                <p className="text-[7.5px] text-zinc-555 leading-relaxed font-sans mt-0.5">{item.desc}</p>
                              </div>
                              <span className="text-[8px] font-mono font-black text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30 shrink-0">
                                {isMax ? "MÁX" : `LVL ${lvl}/5`}
                              </span>
                            </div>

                            {/* Tactile segmented progress bars */}
                            <div className="flex gap-1.5 my-1">
                              {[1, 2, 3, 4, 5].map((idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 flex-1 rounded-sm transition-all ${
                                    idx <= lvl
                                      ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                      : "bg-zinc-900 border border-zinc-950"
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                if (isMax) return;
                                if (isFreeMode || credits >= cost) {
                                  if (!isFreeMode) {
                                    setCredits(prev => prev - cost);
                                  }
                                  const newLvl = lvl + 1;
                                  charUpgradesRef.current[item.key] = newLvl;
                                  setCharUpgrades(prev => ({ ...prev, [item.key]: newLvl }));
                                  SoundManager.playSound("heart", 0.95);
                                }
                              }}
                              disabled={isMax || (!isFreeMode && credits < cost)}
                              className={`w-full py-2 font-mono text-[8px] font-black tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
                                isMax
                                  ? "bg-zinc-900 text-zinc-650 cursor-not-allowed"
                                  : (isFreeMode || credits >= cost)
                                    ? "bg-amber-600 text-black hover:bg-amber-500 shadow-md"
                                    : "bg-zinc-950 border border-zinc-900/60 text-zinc-600 cursor-not-allowed"
                              }`}
                            >
                              {isMax ? "COMPLETO" : `${isFreeMode ? "GRÁTIS" : `${cost} Cr`}`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {shopTab === "skins" && (
                  <div className="col-span-12 grid grid-cols-12 gap-4 h-[400px] overflow-hidden">
                    {/* Left: Skin list grouped by weapon */}
                    <div className="col-span-5 flex flex-col gap-1 pr-1 h-full overflow-y-auto custom-scrollbar">
                      {Object.values(WEAPONS_DETAILS).map((w) => {
                        const weaponSkins = WEAPON_SKINS.filter(s => s.weapon === w.id);
                        if (weaponSkins.length === 0) return null;
                        return (
                          <div key={w.id} className="mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5 px-1">
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: w.color }} />
                              <span className="text-[7px] font-mono text-zinc-500 font-bold uppercase tracking-[0.2em]">{w.name}</span>
                              <div className="flex-1 h-px bg-zinc-900" />
                              <span className="text-[7px] font-mono text-zinc-700">{weaponSkins.length}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {weaponSkins.map((skin) => {
                                const isOwned = inventoryRef.current.purchasedSkins.includes(skin.id);
                                const isEquipped = inventoryRef.current.equippedSkins[w.id] === skin.id;
                                const isSelected = selectedShopSkinId === skin.id;
                                return (
                                  <button
                                    key={skin.id}
                                    onClick={() => {
                                      setSelectedShopWeaponId(w.id);
                                      setSelectedShopSkinId(skin.id);
                                    }}
                                    className={`w-full p-2 rounded-lg border text-left flex items-center gap-2.5 relative transition-all cursor-pointer group ${
                                      isSelected
                                        ? "border-zinc-700 bg-zinc-900/60"
                                        : "border-transparent bg-transparent hover:bg-zinc-900/30"
                                    }`}
                                  >
                                    {isSelected && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ backgroundColor: skin.themeColor }} />}
                                    <div className="w-9 h-9 flex items-center justify-center bg-zinc-950/60 rounded-lg border border-zinc-900/40 shrink-0 overflow-hidden">
                                      <img src={skin.url} className="max-w-[85%] max-h-[85%] object-contain" style={{ imageRendering: "pixelated" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className={`text-[9px] font-black tracking-wider uppercase truncate ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>{skin.name}</span>
                                        {isEquipped && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {isOwned ? (
                                          <span className="text-[7px] font-mono text-emerald-500/80 font-bold">{isEquipped ? "EQUIPADA" : "POSSUÍDA"}</span>
                                        ) : (
                                          <span className="text-[7px] font-mono text-zinc-500 font-bold">{skin.cost} Cr</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Preview & Actions */}
                    <div className="col-span-7 flex flex-col border-l border-zinc-900/50 pl-4 h-full relative justify-between">
                      {(() => {
                        const skin = WEAPON_SKINS.find(s => s.id === selectedShopSkinId);
                        if (!skin) {
                          return (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-40">
                              <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-800 flex items-center justify-center">
                                <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 13.5V6.75A2.25 2.25 0 0015.75 4.5h-13.5A2.25 2.25 0 000 6.75v10.5A2.25 2.25 0 002.25 19.5h15.5" /></svg>
                              </div>
                              <span className="text-zinc-600 font-mono text-[8px] tracking-widest uppercase">Selecione uma skin</span>
                            </div>
                          );
                        }

                        const wDetails = WEAPONS_DETAILS[skin.weapon];
                        const isOwned = inventoryRef.current.purchasedSkins.includes(skin.id);
                        const isEquipped = inventoryRef.current.equippedSkins[skin.weapon] === skin.id;
                        const skinCost = skin.cost || 120;

                        return (
                          <div className="flex flex-col h-full">
                            {/* Preview */}
                            <div
                              className="relative w-full h-[200px] bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer group"
                              onClick={() => setInspectingItem({ type: "skin", id: skin.id })}
                            >
                              <div className="absolute inset-0 opacity-[0.04]" style={{
                                backgroundImage: `radial-gradient(circle at 50% 50%, ${skin.themeColor} 0%, transparent 65%)`
                              }} />
                              <div className="absolute top-2.5 right-2.5 text-[7px] font-mono text-zinc-600 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                ZOOM
                              </div>
                              <img
                                src={skin.url}
                                alt={skin.name}
                                className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-110"
                                style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 20px ${skin.themeColor}30)` }}
                              />
                            </div>

                            {/* Info */}
                            <div className="flex items-center justify-between mt-3 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.themeColor }} />
                                <h4 className="text-[13px] font-black tracking-widest text-white uppercase">{skin.name}</h4>
                              </div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">{wDetails.name}</span>
                            </div>

                            {/* Price + Action */}
                            <div className="flex items-center gap-2 mt-auto pt-2">
                              {!isOwned && (
                                <span className="text-[11px] font-mono font-black text-amber-500">{skinCost} Cr</span>
                              )}
                              <button
                                onClick={() => {
                                  if (!isOwned) {
                                    if (credits >= skinCost) {
                                      setCredits(prev => prev - skinCost);
                                      inventoryRef.current.purchasedSkins.push(skin.id);
                                      inventoryRef.current.equippedSkins[skin.weapon] = skin.id;
                                      SoundManager.playSound("click", 1.0);
                                    } else {
                                      alert("Créditos insuficientes.");
                                    }
                                  } else {
                                    if (isEquipped) {
                                      delete inventoryRef.current.equippedSkins[skin.weapon];
                                    } else {
                                      inventoryRef.current.equippedSkins[skin.weapon] = skin.id;
                                    }
                                  }
                                  updateInv();
                                }}
                                className={`flex-1 py-2.5 font-mono text-[9px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer ${
                                  isEquipped
                                    ? "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
                                    : !isOwned
                                      ? "bg-white text-black hover:bg-zinc-200"
                                      : "bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800"
                                }`}
                              >
                                {isEquipped ? "DESEQUIPAR" : !isOwned ? `COMPRAR — ${skinCost} Cr` : "EQUIPAR"}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === FULLSCREEN CHARACTER SHOWCASE === */}
        {isOutfitsOpen && (() => {
          const activeId = hoveredCampfireChar || viewingCampfireChar;
          const activeBio = CAMPFIRE_BIOS[activeId] || CAMPFIRE_BIOS.red;
          const isEquipped = selectedSkinId === activeBio.skinId;
          const charOrder = ["red", "purple", "orange", "blue"];

          const charPng = `/lendas/personagens/sem-fundo-${
            activeId === "red" ? "lider brank" : 
            activeId === "purple" ? "Sniper mexicano" : 
            activeId === "orange" ? "nier o bazuqueiro" : 
            "bluer louco"
          }.png`;

          const accentColor = 
            activeId === "red" ? "#ef4444" :
            activeId === "purple" ? "#a855f7" :
            activeId === "orange" ? "#f59e0b" :
            "#3b82f6";

          const accentGlow = 
            activeId === "red" ? "rgba(239,68,68,0.5)" :
            activeId === "purple" ? "rgba(168,85,247,0.5)" :
            activeId === "orange" ? "rgba(245,158,11,0.5)" :
            "rgba(59,130,246,0.5)";

          return (
            <div className="fixed inset-0 z-[60] pointer-events-auto animate-in fade-in duration-300" style={{ background: "#050505" }}>
              
              {/* Animated background gradient based on character color */}
              <div className="absolute inset-0 transition-all duration-700" style={{
                background: `radial-gradient(ellipse at 15% 50%, ${accentGlow} 0%, transparent 60%), radial-gradient(ellipse at 85% 50%, rgba(0,0,0,0.6) 0%, transparent 70%), #050505`
              }} />

              {/* Subtle scan lines effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)"
              }} />

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOutfitsOpen(false);
                  setHoveredCampfireChar(null);
                }}
                className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-red-600/80 border border-white/10 hover:border-red-500 rounded-full text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer hover:scale-110 backdrop-blur-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* Main Content Pane: Left-aligned info + Center character + Right vertical selector */}
              <div className="absolute inset-0 z-20 flex items-center justify-between pl-12 md:pl-20 pr-12">
                
                {/* Left Side: Info Panel (takes 35%) */}
                <div className="w-[380px] h-full flex flex-col justify-center z-30 relative pointer-events-auto text-left">
                  <div className="flex flex-col gap-4.5 animate-in fade-in slide-in-from-left-4 duration-500" key={activeBio.skinId}>
                    
                    {/* Header dossier details inside the info card */}
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-12 rounded-full" style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
                      <div>
                        <span className="text-[9px] font-mono tracking-[0.4em] text-zinc-500 uppercase block">DOSSIÊ OPERACIONAL</span>
                        <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white block mt-0.5">
                          {activeBio.name}
                        </h1>
                        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-400 mt-1 block font-bold">{activeBio.role}</span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent w-full" />

                    {/* Bio Paragraph */}
                    <p className="text-zinc-400 text-[12.5px] leading-relaxed font-semibold font-mono">
                      {activeBio.lore}
                    </p>

                    <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent w-full" />

                    {/* Operational Parameters / Stats */}
                    <div className="flex flex-col gap-3 font-mono">
                      <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-500 uppercase font-black">PARÂMETROS DE CAMPO</span>
                      
                      <div className="space-y-3">
                        {/* Resistance */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">RESISTÊNCIA</span>
                          <span className="text-emerald-400 font-black" style={{ textShadow: "0 0 10px rgba(16,185,129,0.3)" }}>
                            {activeBio.resistencia}
                          </span>
                        </div>
                        {/* Speed */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">VELOCIDADE</span>
                          <span className="text-sky-400 font-black" style={{ textShadow: "0 0 10px rgba(56,189,248,0.3)" }}>
                            {activeBio.velocidade}
                          </span>
                        </div>
                        {/* Damage */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">PODER DE FOGO</span>
                          <span className="text-amber-400 font-black" style={{ textShadow: "0 0 10px rgba(245,158,11,0.3)" }}>
                            {activeBio.dano}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent w-full" />

                    {/* Preferred Weapon */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-black">ARMA PREFERIDA</span>
                      <span className="text-zinc-200 text-[11px] uppercase tracking-wider font-mono font-black border border-white/10 px-2 py-0.5 rounded bg-white/5">
                        {activeBio.preferredWeapon}
                      </span>
                    </div>

                    <div className="h-[2px] bg-gradient-to-r from-white/10 to-transparent w-full mt-1" />

                    {/* Confirmation Button */}
                    {isEquipped ? (
                      <button
                        onClick={() => {
                          setIsOutfitsOpen(false);
                          setHoveredCampfireChar(null);
                          if (!waveRef.current.mode) return;
                          startLoadingScreen();
                        }}
                        className="w-full py-3.5 bg-zinc-100 hover:bg-white text-black font-black text-center rounded-lg uppercase tracking-widest transition-all cursor-pointer text-xs font-mono shadow-lg hover:shadow-white/10"
                      >
                        INICIAR OPERAÇÃO ➔
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSkinId(activeBio.skinId);
                          const matchingSkin = availableSkins.find(s => s.id === activeBio.skinId);
                          if (matchingSkin) {
                            skinRef.current = matchingSkin;
                          }
                          SoundManager.playSound("heart", 1.0);
                        }}
                        className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 border text-zinc-200 font-black text-center rounded-lg uppercase tracking-widest transition-all cursor-pointer text-xs font-mono"
                        style={{ borderColor: `${accentColor}44`, color: accentColor }}
                      >
                        VINCULAR OPERADOR
                      </button>
                    )}
                  </div>
                </div>

                {/* Center / Background: Big Character render */}
                <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden z-10">
                  {/* Ground/Ambient glow */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] rounded-full" style={{
                    background: `radial-gradient(ellipse, ${accentGlow} 0%, transparent 70%)`,
                    filter: "blur(50px)"
                  }} />
                  
                  {/* Image */}
                  <img
                    key={activeId}
                    src={charPng}
                    className="relative animate-in fade-in slide-in-from-bottom-6 duration-500"
                    style={{
                      height: "100vh",
                      maxHeight: "100vh",
                      width: "auto",
                      objectFit: "contain",
                      objectPosition: "bottom center",
                      transform: "scale(1.22) translateY(5%)",
                      transformOrigin: "bottom center",
                      filter: `drop-shadow(0 0 50px ${accentGlow}) drop-shadow(0 0 20px ${accentGlow})`,
                      transition: "filter 0.5s ease, transform 0.5s ease"
                    }}
                  />
                </div>

                {/* Right Side: Vertical Operator Select Cards */}
                <div className="w-[280px] h-full flex flex-col justify-center items-end z-30 relative pointer-events-auto pr-4 gap-4">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase font-black mb-2 block text-right w-full">
                    SELECIONAR OPERADOR
                  </span>
                  <div className="flex flex-col gap-3">
                    {charOrder.map((id) => {
                      const isActive = id === activeId;
                      const thumbPng = `/lendas/personagens/sem-fundo-${
                        id === "red" ? "lider brank" : 
                        id === "purple" ? "Sniper mexicano" : 
                        id === "orange" ? "nier o bazuqueiro" : 
                        "bluer louco"
                      }.png`;
                      const thumbColor = 
                        id === "red" ? "#ef4444" :
                        id === "purple" ? "#a855f7" :
                        id === "orange" ? "#f59e0b" :
                        "#3b82f6";
                      const thumbName = CAMPFIRE_BIOS[id]?.name || "";
                      const thumbRole = CAMPFIRE_BIOS[id]?.role || "";

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setViewingCampfireChar(id);
                            setHoveredCampfireChar(null);
                            SoundManager.playSound("click", 0.9);
                          }}
                          onMouseEnter={() => {
                            setHoveredCampfireChar(id);
                            SoundManager.playSound("click", 0.12);
                          }}
                          onMouseLeave={() => setHoveredCampfireChar(null)}
                          className="relative flex items-center justify-between w-[240px] h-[68px] rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group text-left px-4"
                          style={{
                            borderColor: isActive ? thumbColor : "rgba(255,255,255,0.08)",
                            background: isActive 
                              ? `linear-gradient(90deg, ${thumbColor}22 0%, rgba(0,0,0,0.85) 100%)` 
                              : "rgba(0,0,0,0.55)",
                            transform: isActive ? "translateX(-12px)" : "none",
                            boxShadow: isActive ? `0 0 25px ${thumbColor}22` : "none"
                          }}
                        >
                          {/* Glow indicator line on the left border */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: thumbColor }} />
                          )}

                          <div className="flex flex-col gap-0.5">
                            <span 
                              className="text-[12px] font-mono uppercase tracking-wider font-bold transition-all duration-300"
                              style={{ color: isActive ? thumbColor : "rgba(255,255,255,0.6)" }}
                            >
                              {thumbName}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                              {thumbRole}
                            </span>
                          </div>

                          {/* Small Thumbnail rendering on the right inside card */}
                          <div className="w-[52px] h-[52px] rounded-lg overflow-hidden flex items-end justify-center bg-black/40 border border-white/5 flex-shrink-0 group-hover:border-white/10 transition-colors">
                            <img 
                              src={thumbPng} 
                              className="h-[95%] w-auto object-contain object-bottom transition-all duration-300"
                              style={{ filter: isActive ? "none" : "brightness(0.4) grayscale(0.3)" }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Inventory Overlay */}
        {isInventoryOpen && (
          <div className="absolute top-[100px] left-6 z-50 pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 w-[650px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
              <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 animate-pulse rounded-sm shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <span className="text-xs font-mono tracking-[0.2em] text-white/50">
                    MOCHILA TÁTICA
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-amber-500">
                    SEGURO
                  </div>
                  <button
                    onClick={() => setIsInventoryOpen(false)}
                    className="text-white/40 hover:text-white transition-colors p-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                {/* Left Side: Slots */}
                <div className="col-span-6 flex flex-col justify-between">
                  <div className="grid grid-cols-4 gap-3">
                    {inventoryRef.current.backpack.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => toggleToHotbar(i)}
                        draggable={!!item}
                        onDragStart={(e) => handleDragStart(e, "backpack", i)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, "backpack", i)}
                        className={`aspect-square bg-black/80 border ${selectedBackpackSlot === i ? "border-amber-500" : "border-white/5"} rounded-lg flex flex-col p-1.5 shadow-inner hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer relative group`}
                      >
                        <div className="absolute top-1 left-1.5 text-[8px] font-mono text-white/20 font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="absolute top-1.5 right-1.5 w-1 h-1 border border-white/10 group-hover:border-amber-500/30 transition-colors" />

                        {item && WEAPONS_DETAILS[item] ? (
                          (() => {
                            const equippedSkinId = inventoryRef.current.equippedSkins[item];
                            const skinDef = equippedSkinId ? WEAPON_SKINS.find(s => s.id === equippedSkinId) : null;
                            const wColor = skinDef ? skinDef.themeColor : WEAPONS_DETAILS[item].color;
                            return (
                              <div className="flex-1 w-full flex flex-col items-center justify-between mt-2 py-0.5 scale-100 transition-all text-center group-hover:scale-110">
                                <div 
                                  className="flex-1 flex items-center justify-center min-h-[35px] max-h-[40px] w-full mt-2 filter drop-shadow-[0_0_8px_var(--weapon-glow)] transform scale-[1.35]" 
                                  style={{ '--weapon-glow': wColor + "77" } as any}
                                >
                                  <RenderWeaponIcon type={item} color={wColor} skinUrl={skinDef?.url} />
                                </div>
                                <span
                                  className="text-[8px] font-mono tracking-tight font-black uppercase px-1.5 py-0.5 rounded-sm line-clamp-1 w-[110%] text-center mt-3 bg-black/80 border border-white/5 shadow-md"
                                  style={{ color: wColor }}
                                >
                                  {WEAPONS_DETAILS[item].name}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex-1 w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] rounded-sm mt-3 border border-white/5" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-3">
                    <div className="text-[9px] font-mono text-white/30 tracking-widest text-center">
                      STORAGE CAPACITY:{" "}
                      {inventoryRef.current.backpack.filter((x) => x).length}/16
                      UNITS
                    </div>
                  </div>
                </div>

                {/* Right Side: Details & Skins */}
                <div className="col-span-6 flex flex-col border-l border-white/5 pl-5">
                  {selectedBackpackSlot !== null &&
                    inventoryRef.current.backpack[selectedBackpackSlot] &&
                    WEAPONS_DETAILS[
                      inventoryRef.current.backpack[selectedBackpackSlot]!
                    ] ? (
                    (() => {
                      const stats =
                        WEAPONS_DETAILS[
                          inventoryRef.current.backpack[selectedBackpackSlot]!
                        ];
                      return (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-amber-500 font-black text-[16px] tracking-widest uppercase">
                              {stats.name}
                            </span>
                            <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleToHotbar(selectedBackpackSlot);
                               }}
                               className="text-[10.5px] font-mono font-black bg-zinc-100 hover:bg-white text-black px-2.5 py-1 rounded transition-colors"
                            >
                              EQUIPAR ARMA
                            </button>
                          </div>
                          <p className="text-[12px] text-zinc-400 font-mono font-medium mb-3 leading-relaxed">
                            {stats.desc}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11.5px] font-mono mb-4">
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">DANO</span>
                              <span className="text-white/90">{stats.damage}</span>
                            </div>
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">DISP</span>
                              <span className="text-amber-500 font-bold">
                                {stats.fireRate}s
                              </span>
                            </div>
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">PENTE</span>
                              <span className="text-white/90">{stats.ammoMax}</span>
                            </div>
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">REC</span>
                              <span className="text-white/90">
                                {stats.reloadTime}s
                              </span>
                            </div>
                          </div>

                          {/* Skin Selector */}
                          {(() => {
                            const wSkins = WEAPON_SKINS.filter(s => s.weapon === stats.id);
                            if (wSkins.length === 0) return null;
                            const ownedSkins = wSkins.filter(s => inventoryRef.current.purchasedSkins.includes(s.id));
                            if (ownedSkins.length === 0) return (
                                <div className="border-t border-zinc-800 pt-3 flex-1 flex items-center justify-center text-[9px] text-white/30 text-center font-mono">
                                  NENHUMA SKIN ADQUIRIDA
                                </div>
                            );
                            return (
                              <div className="border-t border-zinc-900 pt-3 flex-1 flex flex-col">
                                <span className="text-[10.5px] font-mono text-zinc-400 mb-2 block font-bold tracking-wider">SKINS ADQUIRIDAS:</span>
                                <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1 max-h-[160px]">
                                  {ownedSkins.map(skin => {
                                    const isEquipped = inventoryRef.current.equippedSkins[stats.id] === skin.id;
                                    return (
                                      <button
                                        key={skin.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isEquipped) {
                                            delete inventoryRef.current.equippedSkins[stats.id];
                                          } else {
                                            inventoryRef.current.equippedSkins[stats.id] = skin.id;
                                          }
                                          updateInv();
                                        }}
                                        className={`flex flex-col items-center gap-1 p-2 rounded border transition-colors relative overflow-hidden group ${isEquipped ? "border-amber-500 bg-amber-500/10 shadow-[0_0_8px_rgba(251,191,36,0.2)]" : "border-white/10 bg-black/40 hover:bg-white/5"}`}
                                      >
                                        <div className="w-full h-12 flex items-center justify-center p-1 relative z-10">
                                          <img src={skin.url} className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_4px_rgba(251,191,36,0.3)] transform group-hover:scale-110 transition-transform" style={{imageRendering: "pixelated"}} />
                                        </div>
                                        <span className={`text-[8px] font-mono uppercase font-bold text-center w-full mt-1 relative z-10 ${isEquipped ? "text-amber-500 drop-shadow-md" : "text-white/60"}`}>
                                          {isEquipped ? "EQUIPADA" : skin.name}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] font-mono text-white/20 text-center p-4 border border-white/5 rounded-lg border-dashed">
                      SELECIONE UMA ARMA DA MOCHILA PARA VER DETALHES E EQUIPAR SKINS
                    </div>
                  )}
                </div>
              {/* Backpack Utility Footer Strip - AI, Loja, Trajes buttons inside backpack */}
              <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-white/5 items-center justify-end col-span-12 pointer-events-auto">
                <span className="text-[8px] font-mono text-white/30 mr-auto tracking-widest uppercase">CONTROLES ADICIONAIS:</span>
                
                <button
                  id="btn-toggle-ai"
                  className="px-3 py-1.5 border border-zinc-800 text-zinc-350 text-[9px] md:text-[10px] font-bold tracking-widest bg-zinc-900/40 hover:bg-zinc-900/80 rounded backdrop-blur-md border-l-[3px] cursor-pointer"
                >
                  AI: PATROL
                </button>

                <button
                  onClick={() => {
                    if (waveRef.current.mode && vanState !== "PARKED") {
                      alert("A Kombi da Loja não está no mapa no momento! Conclua ondas para ela aparecer.");
                      return;
                    }
                    SoundManager.playSound("horn", 0.6);
                    setIsShopOpen(!isShopOpen);
                    setIsInventoryOpen(false);
                    setIsOutfitsOpen(false);
                  }}
                  className={`px-3 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded backdrop-blur-md border-l-[3px] cursor-pointer transition-colors flex items-center justify-center min-w-[65px] ${
                    isShopOpen
                      ? "border-red-500 text-red-400 bg-red-900/40"
                      : "border-white/20 text-white/60 bg-black/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  LOJA
                </button>

                <button
                  onClick={() => {
                    setIsOutfitsOpen(!isOutfitsOpen);
                    setIsShopOpen(false);
                    setIsInventoryOpen(false);
                  }}
                  className={`px-3 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded backdrop-blur-md border-l-[3px] cursor-pointer transition-colors flex items-center justify-center min-w-[65px] ${
                    isOutfitsOpen
                      ? "border-blue-500 text-blue-400 bg-blue-900/40"
                      : "border-white/20 text-white/60 bg-black/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  TRAJES
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        <div
          id="ui-hotbar"
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-all duration-500 flex flex-col items-stretch gap-2 ${isHudHidden ? 'opacity-0 pointer-events-none translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
        >
          {/* Wave Progress Bar above Hotbar */}
          {(!cutscene.active) && (
            <div className="w-[300px] sm:w-[340px] self-center flex flex-col items-stretch font-mono select-none px-1 animate-in fade-in duration-300 mb-2.5">
              <div className="flex justify-between items-baseline text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  <span className="text-amber-500">ONDA {waveRef.current.current}</span>
                </div>
                <span className="text-red-500 font-extrabold text-[11px] shadow-[0_0_8px_rgba(239,68,68,0.8)] tracking-wide bg-black/40 px-2 py-0.5 rounded border border-red-900/30">
                  RESTANTES: {waveRemainingZombies} / {waveRef.current.zombiesTotal || 15}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden mt-1 p-[1px] relative shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 shadow-[0_0_8px_rgba(239,68,68,0.75)] transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(0, Math.min(100, (waveRemainingZombies / (waveRef.current.zombiesTotal || 15)) * 100))}%` }}
                />
              </div>
            </div>
          )}

          <div className={`flex gap-2 justify-center transition-all duration-500 ${cutscene.active ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
            {inventoryRef.current.hotbar.map((item, i) => {
              const isActive = i === inventoryRef.current.activeSlot;
              const equippedSkinId = item ? inventoryRef.current.equippedSkins[item] : null;
              const skinDef = equippedSkinId ? WEAPON_SKINS.find(s => s.id === equippedSkinId) : null;
              const slotWeaponColor = item && WEAPONS_DETAILS[item] ? (skinDef ? skinDef.themeColor : WEAPONS_DETAILS[item].color) : "#10b981";
              
              return (
                <div
                  key={i}
                  onClick={() => toggleToBackpack(i)}
                  draggable={!!item}
                  onDragStart={(e) => handleDragStart(e, "hotbar", i)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "hotbar", i)}
                  className={`w-14 h-14 border flex flex-col p-1.5 shadow-inner hover:bg-white/10 transition-all cursor-pointer relative group skew-x-[-15deg] ${isActive ? 'scale-110 z-10 -translate-y-2' : 'scale-100 bg-black/80 hover:-translate-y-1'}`}
                  style={{
                    borderColor: isActive ? slotWeaponColor : "rgba(255, 255, 255, 0.1)",
                    borderRightWidth: isActive ? "3px" : "1px",
                    boxShadow: isActive ? `0 10px 20px rgba(0,0,0,0.8), 0 0 25px ${slotWeaponColor}99, inset 0 0 15px ${slotWeaponColor}40` : "0 4px 6px rgba(0,0,0,0.5)",
                    backgroundColor: isActive ? "rgba(15,15,15,0.95)" : "rgba(0,0,0,0.85)",
                    borderRadius: "4px"
                  }}
                >
                  {/* Skew-corrected inside container */}
                  <div className="w-full h-full flex flex-col justify-between skew-x-[15deg]">
                    <div className="flex justify-between items-center w-full">
                      <span
                        className={`text-[9px] font-mono font-extrabold transition-colors ${isActive ? 'text-white' : ''}`}
                        style={{
                          color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                          textShadow: isActive ? `0 0 5px ${slotWeaponColor}` : "none"
                        }}
                      >
                        0{i + 1}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: slotWeaponColor }} />
                      )}
                    </div>

                    {item && WEAPONS_DETAILS[item] ? (
                      (() => {
                        const equippedSkinId = inventoryRef.current.equippedSkins[item];
                        const skinDef = equippedSkinId ? WEAPON_SKINS.find(s => s.id === equippedSkinId) : null;
                        const wColor = skinDef ? skinDef.themeColor : WEAPONS_DETAILS[item].color;
                        return (
                          <div 
                            className="flex-1 w-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_var(--wglow)]" 
                            style={{ '--wglow': wColor + "66" } as any}
                          >
                            <RenderWeaponIcon type={item} color={wColor} skinUrl={skinDef?.url} />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] rounded-sm mt-2 border border-white/5" />
                    )}
                  </div>

                  {/* Un-equip tooltip or selection animation */}
                  {item && isInventoryOpen && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white text-[8px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Store in Backpack
                    </div>
                  )}
                  {item &&
                    !isInventoryOpen &&
                    weaponInfoActive > 0 &&
                    i === inventoryRef.current.activeSlot && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div 
                          className="bg-black/90 border text-[10px] font-mono px-3 py-1.5 rounded flex flex-col items-center"
                          style={{
                            borderColor: slotWeaponColor + "80",
                            color: slotWeaponColor,
                            boxShadow: `0 0 10px ${slotWeaponColor}33`
                          }}
                        >
                          <span className="font-bold text-white mb-0.5">
                            {WEAPONS_DETAILS[item]?.name || "M4 ASSAULT RIFLE"}
                          </span>
                          <div className="flex gap-2 opacity-80 text-[8px]">
                            <span>
                              DMG: {WEAPONS_DETAILS[item]?.damage || 15}
                            </span>
                            <span>
                              SPD: {WEAPONS_DETAILS[item]?.fireRate || 0.12}s
                            </span>
                          </div>
                        </div>
                        <div 
                          className="w-px h-3"
                          style={{ backgroundColor: slotWeaponColor + "80" }}
                        ></div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings Gear Button */}
        <div
          id="ui-btn-settings"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`absolute top-[30px] right-[210px] z-[45] pointer-events-auto bg-black/80 border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:bg-white/5 h-12 w-12 rounded-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95 duration-500 ${isHudHidden ? 'opacity-0 pointer-events-none translate-y-[-10px]' : 'opacity-100'}`}
          title="Configurações de Mira"
        >
          <Settings 
            className="w-5 h-5 text-white/50 group-hover:text-emerald-400 group-hover:rotate-90 transition-transform duration-500" 
          />
        </div>

        {/* Return to Menu option has been moved inside Settings Modal */}

        {/* Tactical Top-Right HUD Panel */}
        <div id="ui-hud-right-panel" className={`absolute top-[30px] right-[30px] z-[45] pointer-events-none flex flex-col items-end gap-2 transition-all duration-500 ${isHudHidden ? 'opacity-0 translate-y-[-10px]' : 'opacity-100'}`}>
          {/* Energy - Blue, prominent, in front */}
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-cyan-500/20 rounded-md px-3 py-1.5 shadow-[0_0_12px_rgba(0,229,255,0.1)]">
            <span className="text-cyan-400 text-[10px] leading-none">⚡</span>
            <span id="ui-radar-replacement-stamina" className="text-sm font-mono font-black text-cyan-400 tabular-nums tracking-tight" style={{ textShadow: "0 0 8px rgba(0,229,255,0.4)" }}>
              100/100
            </span>
          </div>
          {/* Credits - minimalist, just numbers */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/5 rounded-md px-3 py-1 shadow-inner">
            <span className="text-[8px] text-amber-500/60 font-mono">$</span>
            <span className="text-[13px] font-mono font-black text-amber-500 tabular-nums tracking-tight">
              {credits.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sliding Holographic Settings Panel -> Centralized Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-[400px] bg-black/95 border border-emerald-500/30 rounded-xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)] flex flex-col gap-4 relative"
              >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse rounded-full shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-mono font-black tracking-[0.2em] text-white/50 uppercase">
                    CONFIGURAÇÃO DE COMBATE
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sensibilidade Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/40 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Sensibilidade da Mira
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                    {aimSensitivity.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/20 font-bold font-mono">LENTO</span>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={aimSensitivity}
                    onChange={(e) => setAimSensitivity(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-ew-resize focus:outline-none"
                  />
                  <span className="text-[10px] text-white/20 font-bold font-mono">RÁPIDO</span>
                </div>
              </div>

              {/* Toggle controls */}
              <div className="flex flex-col gap-2.5">
                {/* Aim/ADS Zoom Toggle */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2.5 rounded-lg hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wide text-white uppercase">
                      MIRA DE ZOOM TÁTICO
                    </span>
                    <span className="text-[8px] font-mono text-white/30 lowercase">
                      permite zoom (ads) no botão direito
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAimEnabled(!isAimEnabled)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center relative ${
                      isAimEnabled ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                      animate={{ x: isAimEnabled ? 18 : 0 }}
                    />
                  </button>
                </div>

                {/* Reticulo Center Crosshair Toggle */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2.5 rounded-lg hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wide text-white uppercase">
                      RETÍCULO DA MIRA
                    </span>
                    <span className="text-[8px] font-mono text-white/30 lowercase">
                      mostra indicador do crosshair na tela
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCrosshairEnabled(!isCrosshairEnabled)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center relative ${
                      isCrosshairEnabled ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                      animate={{ x: isCrosshairEnabled ? 18 : 0 }}
                    />
                  </button>
                </div>

                {/* Mobile Controls Toggle */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2.5 rounded-lg hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wide text-white uppercase">
                      CONTROLES VIRTUAIS
                    </span>
                    <span className="text-[8px] font-mono text-white/30 lowercase">
                      exibe controles para dispositivos móveis
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMobileControls(!showMobileControls)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center relative ${
                      showMobileControls ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                      animate={{ x: showMobileControls ? 18 : 0 }}
                    />
                  </button>
                </div>

                {/* Advanced Settings Divider */}
                <div className="flex items-center gap-2 border-t border-white/5 pt-2 mt-1">
                  <span className="text-[9px] font-mono font-black tracking-[0.2em] text-white/40 uppercase">
                    GORE & PERFORMANCE
                  </span>
                </div>

                {/* Gore Selector */}
                <div className="flex flex-col gap-1 bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                  <span className="text-[8.5px] font-mono font-bold text-white/60 tracking-wider uppercase">NÍVEL DE GORE</span>
                  <div className="grid grid-cols-3 gap-1 mt-1 font-mono text-[8px] font-bold">
                    {(["full", "reduced", "off"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGoreLevel(g);
                          if (g === "off" && (window as any).clearDecalsAndShells) {
                            (window as any).clearDecalsAndShells();
                          }
                        }}
                        className={`py-1 rounded border transition-all cursor-pointer ${
                          goreLevel === g
                            ? "bg-red-900 border-red-700 text-white"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        {g === "full" ? "COMPLETO" : g === "reduced" ? "REDUZIDO" : "DESAT."}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shell Casings Selector */}
                <div className="flex flex-col gap-1 bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                  <span className="text-[8.5px] font-mono font-bold text-white/60 tracking-wider uppercase">CÁPSULAS DE BALA</span>
                  <div className="grid grid-cols-4 gap-1 mt-1 font-mono text-[7.5px] font-bold">
                    {(["permanent", "temporary", "simplified", "off"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setShellLevel(s);
                          if (s === "off" && (window as any).clearDecalsAndShells) {
                            (window as any).clearDecalsAndShells();
                          }
                        }}
                        className={`py-1 rounded border transition-all cursor-pointer ${
                          shellLevel === s
                            ? "bg-emerald-900 border-emerald-700 text-white"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        {s === "permanent" ? "PERM." : s === "temporary" ? "TEMP." : s === "simplified" ? "SIMPL." : "DESAT."}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cinematic Mode Toggle */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2.5 rounded-lg hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wide text-white uppercase">
                      CÂMERA CINEMATOGRÁFICA
                    </span>
                    <span className="text-[8px] font-mono text-white/30 lowercase">
                      movimentos e balanço mais suaves
                    </span>
                  </div>
                  <button
                    onClick={() => setCinematicMode(!cinematicMode)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center relative ${
                      cinematicMode ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                      animate={{ x: cinematicMode ? 18 : 0 }}
                    />
                  </button>
                </div>
              </div>

              {/* Return to Menu Button inside Settings Modal */}
              <div className="border-t border-white/5 pt-3.5 flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (isWaveMode) {
                      setCredits(Math.max(0, credits - 500));
                    }
                    (window as any).inTrainingMode = false;
                    (window as any).trainingTransitionActive = false;
                    setInTrainingMode(false);
                    setIsSettingsOpen(false);
                    setGameState("MENU");
                  }}
                  className="w-full py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-400 font-mono text-[9px] tracking-widest uppercase font-bold rounded-lg cursor-pointer transition-all active:scale-[0.98] text-center"
                  title={isWaveMode ? "Abandonar Onda (Perde $ e Volta ao Menu)" : "Voltar ao Menu"}
                >
                  {isWaveMode ? "Voltar ao Menu (Abandonar)" : "Voltar ao Menu"}
                </button>
                
                <div className="flex justify-between items-center text-[8px] font-mono text-white/25 tracking-wider">
                  <span>SYSTEM PARAMETERS: REGULAR</span>
                  <span>v1.2-ALPHA</span>
                </div>
              </div>
            </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Mobile Controls Overlay */}
      {gameState === "PLAYING" && (isMobile || showMobileControls) && !cutscene.active && !isHudHidden && (
        <div className="absolute inset-0 z-30 pointer-events-none select-none">
          {/* Movement Joystick Area (Left Side) */}
          <div 
            className="absolute bottom-8 left-8 w-32 h-32 bg-black/60 border border-white/5 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          >
            {/* Minimalist Tick Marks */}
            <div className="absolute top-2 w-0.5 h-1.5 bg-white/10" />
            <div className="absolute bottom-2 w-0.5 h-1.5 bg-white/10" />
            <div className="absolute left-2 h-0.5 w-1.5 bg-white/10" />
            <div className="absolute right-2 h-0.5 w-1.5 bg-white/10" />
            <div className="absolute w-24 h-24 border border-white/5 rounded-full pointer-events-none" />

            {joystickStart && (
              <div 
                className="absolute w-12 h-12 bg-zinc-800 border-2 border-white/10 rounded-full flex items-center justify-center pointer-events-none shadow-sm"
                style={{
                  transform: `translate(${Math.min(30, Math.max(-30, (joystickCurrent?.x ?? 0) - joystickStart.x))}px, ${Math.min(30, Math.max(-30, (joystickCurrent?.y ?? 0) - joystickStart.y))}px)`
                }}
              />
            )}
          </div>

          {/* Action Buttons Area (Right Side - Compact and tactical) */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-4 items-end pointer-events-auto">
            {/* Dodge/Roll Button */}
            <button
              onTouchStart={() => {
                (window as any).mobileRollTrigger = true;
              }}
              className="w-14 h-14 rounded-full bg-black/60 border border-white/10 text-zinc-300 font-mono text-xs font-black flex flex-col items-center justify-center gap-0.5 backdrop-blur-md active:scale-90 active:bg-zinc-800 transition-all select-none pointer-events-auto"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M20 20A10 10 0 1 0 4 20" />
                <path d="M20 13V20H13" />
              </svg>
            </button>

            <div className="flex gap-4 items-end">
              {/* Aim/ADS Joystick Button */}
              <div
                onTouchStart={handleAdsJoystickStart}
                onTouchMove={handleAdsJoystickMove}
                onTouchEnd={handleAdsJoystickEnd}
                className="w-20 h-20 rounded-full bg-black/60 border border-amber-500/20 flex flex-col items-center justify-center active:scale-95 transition-all pointer-events-auto select-none backdrop-blur-md relative"
              >
                {/* Tactical Reticle Marks */}
                <div className="absolute top-1.5 w-0.5 h-1.5 bg-amber-500/20" />
                <div className="absolute bottom-1.5 w-0.5 h-1.5 bg-amber-500/20" />
                <div className="absolute left-1.5 h-0.5 w-1.5 bg-amber-500/20" />
                <div className="absolute right-1.5 h-0.5 w-1.5 bg-amber-500/20" />

                {adsJoystickStart && (
                  <div
                    className="absolute w-10 h-10 bg-zinc-800 border border-amber-500/30 rounded-full flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `translate(${Math.min(22, Math.max(-22, (adsJoystickCurrent?.x ?? 0) - adsJoystickStart.x))}px, ${Math.min(22, Math.max(-22, (adsJoystickCurrent?.y ?? 0) - adsJoystickStart.y))}px)`
                    }}
                  />
                )}
                {!adsJoystickStart && (
                  <span className="text-[9px] font-mono font-black text-amber-500/50 tracking-widest uppercase pointer-events-none">MIRA</span>
                )}
              </div>

              {/* Fire/Shoot Joystick Button */}
              <div
                onTouchStart={handleAimStart}
                onTouchMove={handleAimMove}
                onTouchEnd={handleAimEnd}
                className="w-24 h-24 rounded-full bg-black/60 border border-red-500/20 flex flex-col items-center justify-center active:scale-95 transition-all pointer-events-auto select-none backdrop-blur-md relative"
              >
                {/* Tactical Reticle Marks */}
                <div className="absolute top-2 w-0.5 h-2 bg-red-500/20" />
                <div className="absolute bottom-2 w-0.5 h-2 bg-red-500/20" />
                <div className="absolute left-2 h-0.5 w-2 bg-red-500/20" />
                <div className="absolute right-2 h-0.5 w-2 bg-red-500/20" />

                {aimJoystickStart && (
                  <div
                    className="absolute w-12 h-12 bg-zinc-800 border border-red-500/30 rounded-full flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `translate(${Math.min(25, Math.max(-25, (aimJoystickCurrent?.x ?? 0) - aimJoystickStart.x))}px, ${Math.min(25, Math.max(-25, (aimJoystickCurrent?.y ?? 0) - aimJoystickStart.y))}px)`
                    }}
                  />
                )}
                {!aimJoystickStart && (
                  <span className="text-[11px] font-mono font-black text-red-500/50 tracking-widest uppercase pointer-events-none">FOGO</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Unavailable Warning Alert */}
      {adAlertOpen && (
        <div className="absolute inset-0 z-[220] flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-auto select-none">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-[380px] max-w-[90vw] text-center flex flex-col items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-[40px] bg-amber-500/10" />
            <div className="w-12 h-12 rounded-full bg-amber-550/15 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 z-10">
              📺
            </div>
            <div className="z-10">
              <h3 className="text-zinc-200 text-xs font-black font-mono tracking-widest uppercase mb-2">VÍDEO INDISPONÍVEL</h3>
              <p className="text-[9.5px] text-zinc-500 leading-relaxed font-mono">
                Os anúncios em vídeo estão desabilitados no ambiente de testes local.<br/><br/>
                Esta funcionalidade estará totalmente integrada com o SDK de anúncios oficial na versão de lançamento da <strong>Google Play Store</strong>.
              </p>
            </div>
            <button 
              onClick={() => setAdAlertOpen(false)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-mono text-[9px] font-black tracking-widest uppercase rounded-lg cursor-pointer transition-colors shadow-lg shadow-amber-950/20 active:scale-95"
            >
              OK, ENTENDI
            </button>
          </div>
        </div>
      )}

      {/* Simulated Ad Player Overlay */}
      {activeAd && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-lg select-none pointer-events-auto">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 w-[450px] max-w-[90vw] shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col items-center">
            {/* Animated backdrop light glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-[90px] bg-gradient-to-br from-amber-500/20 to-transparent animate-pulse" />
            
            {/* Ad Header */}
            <div className="w-full flex justify-between items-center mb-6 z-10 border-b border-zinc-900 pb-3">
              <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase font-black">
                ANÚNCIO PATROCINADO
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-550 bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded-full">
                {adFinished ? "CONCLUÍDO" : `CONTINUAR EM: ${adTimer}s`}
              </span>
            </div>

            {/* Fake Ad Body Container */}
            <div className={`w-full bg-gradient-to-b ${FAKE_ADS[fakeAdIndex].bgColor} border border-zinc-900 rounded-2xl p-5 flex flex-col items-center text-center gap-4 relative z-10 min-h-[200px] justify-center`}>
              {/* Fake logo representation */}
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-3xl shadow-lg shadow-black/40 scale-100 transition-all select-none">
                {fakeAdIndex === 0 ? "💰" : fakeAdIndex === 1 ? "🛡️" : "🐯"}
              </div>

              <div>
                <h3 className="text-sm font-black text-white tracking-widest uppercase mb-1">
                  {FAKE_ADS[fakeAdIndex].title}
                </h3>
                <p className="text-[9.5px] text-amber-500 font-bold font-mono tracking-wide uppercase mb-2">
                  {FAKE_ADS[fakeAdIndex].tagline}
                </p>
                <p className="text-[8.5px] text-zinc-400 font-mono tracking-normal leading-relaxed">
                  {FAKE_ADS[fakeAdIndex].desc}
                </p>
              </div>

              <button className="px-5 py-2.5 bg-white text-black font-mono font-bold text-[9px] tracking-widest uppercase rounded-lg hover:scale-105 transition-all shadow-xl active:scale-95 cursor-pointer">
                {FAKE_ADS[fakeAdIndex].action}
              </button>
            </div>

            {/* Ad Footer / Claim Action */}
            <div className="w-full mt-6 z-10 flex flex-col items-center gap-3">
              {/* Fake Progress Bar */}
              {!adFinished && (
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    style={{ width: `${((4 - adTimer) / 4) * 100}%` }}
                  />
                </div>
              )}

              {adFinished ? (
                <button
                  onClick={() => {
                    const rewardCb = activeAd.onComplete;
                    setActiveAd(null);
                    rewardCb();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-98 cursor-pointer text-center animate-bounce"
                >
                  {activeAd.type === "revive" ? "REVIVER JOGADOR!" : "RESGATAR MELHORIA GRÁTIS!"}
                </button>
              ) : (
                <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest animate-pulse">
                  AGUARDE O FIM DO VÍDEO PARA RESGATAR...
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
