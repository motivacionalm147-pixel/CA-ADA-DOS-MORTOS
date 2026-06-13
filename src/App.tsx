import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Backpack, Settings, Eye, Sliders, X } from "lucide-react";

declare global {
  interface Window {
    respawnTriggered: boolean;
    selectedSkinMain: string;
    selectedSkinDark: string;
    selectedSkinHands: string;
  }
}

const availableSkins = [
  {
    id: "red",
    colorMain: "#dc2626",
    colorDark: "#991b1b",
    colorSkin: "#fca5a5",
    name: "Vermelho",
    desc: "Soldado Raivoso",
    imgUrl: "/8-bit_pixel_art_profile_picture_202606090141 (1).jpeg"
  },
  {
    id: "purple",
    colorMain: "#9333ea",
    colorDark: "#6b21a8",
    colorSkin: "#e9d5ff",
    name: "Aria",
    desc: "Ágil e letal (Mulher)",
    imgUrl: "/8-bit_pixel_art_profile_picture_202606090141 (3).jpeg"
  },
  {
    id: "orange",
    colorMain: "#f97316",
    colorDark: "#c2410c",
    colorSkin: "#fdba74",
    name: "Ignis",
    desc: "Especialista Explosivo",
    imgUrl: "/8-bit_pixel_art_profile_picture_202606090141 (2).jpeg"
  },
  {
    id: "blue",
    colorMain: "#2563eb",
    colorDark: "#1d4ed8",
    colorSkin: "#bfdbfe",
    name: "Sentinela",
    desc: "Veterano Tático",
    imgUrl: "/8-bit_pixel_art_profile_picture_202606090141.jpeg"
  },
];

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  private zombies: HTMLAudioElement | null = null;
  private motor: HTMLAudioElement | null = null;
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== "undefined") {
      this.music = new Audio("/sounds/musica fundo.mp3");
      this.music.loop = true;
      this.music.volume = 0.25;

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
    return this.ctx;
  }

  public playSound(name: string, volume: number = 0.5) {
    this.initContext();
    const original = this.sounds[name];
    if (original) {
      const clone = original.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(e => console.log("Audio play failed", e));
      clone.onended = () => {
        clone.remove();
      };
    }
  }

  public startBGMusic() {
    this.initContext();
    if (this.music) {
      this.music.play().catch(e => console.log("Music failed", e));
    }
    if (this.zombies) {
      this.zombies.play().catch(e => console.log("Zombie ambient failed", e));
    }
    if (this.motor) {
      this.motor.play().catch(e => console.log("Motor ambient failed", e));
    }
  }

  public stopBGMusic() {
    if (this.music) this.music.pause();
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
      this.motor.volume = Math.max(0, Math.min(0.9, vol));
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

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

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
    noiseNode.stop(time + 1.5);
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
    cost: 0,
    color: "#34d399",
  },
  pistola: {
    id: "pistola",
    name: "TACTICAL PISTOL",
    desc: "Pistola semi-automática de alta precisão armada com uma única mão.",
    damage: 38,
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
    cost: 15,
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
    cost: 30,
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
    cost: 50,
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
    cost: 90,
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
    cost: 75,
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
    cost: 45,
    color: "#e2e8f0",
  },
};

export const getBarrelTip = (wType: string) => {
  if (wType === "pistola") return { x: 48, y: -6 };
  if (wType === "magnum") return { x: 52, y: -6 };
  if (wType === "uzi") return { x: 56, y: -7 };
  if (wType === "doze") return { x: 94, y: -6 };
  if (wType === "basuca") return { x: 125, y: -12 };
  if (wType === "rifle") return { x: 131, y: -10 };
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
};

export const WEAPON_SKINS = [
  { id: "m4_azulao", weapon: "gun", name: "Azulão", url: "/skins/sem-fundo-m4 azulao.png", themeColor: "#3b82f6" },
  { id: "m4_dourada", weapon: "gun", name: "Dourada", url: "/skins/sem-fundo-m4 dourada.png", themeColor: "#d4af37" },
  { id: "m4_roxada", weapon: "gun", name: "Roxada", url: "/skins/sem-fundo-m4 roxada.png", themeColor: "#a855f7" },
  { id: "m4_vermelhada", weapon: "gun", name: "Vermelhada", url: "/skins/sem-fundo-m4 vermelhada.png", themeColor: "#ef4444" },
  { id: "sniper_8bit", weapon: "rifle", name: "8-Bit", url: "/skins/sem-fundo-8-bit_2D_pixel_art_sniper_202606082343 (1).png", themeColor: "#22d3ee" },
  { id: "sniper_congelada", weapon: "rifle", name: "Congelada", url: "/skins/sem-fundo-sniper congelada.png", themeColor: "#60a5fa" },
  { id: "sniper_eradoouro", weapon: "rifle", name: "Era de Ouro", url: "/skins/sem-fundo-sniper era de ouro.png", themeColor: "#fbbf24" },
  { id: "sniper_lava", weapon: "rifle", name: "Lava", url: "/skins/sem-fundo-sniper lava.png", themeColor: "#f97316" },
  { id: "sniper_roxada", weapon: "rifle", name: "Roxada", url: "/skins/sem-fundo-sniper roxada.png", themeColor: "#9333ea" },
  { id: "doze_padrao", weapon: "doze", name: "Dose Padrão", url: "/dose padrao.png", themeColor: "#fcd34d" },
  { id: "doze_cromada", weapon: "doze", name: "Dose Cromada", url: "/dose cromada.png", themeColor: "#fbbf24" },
  { id: "doze_platinado", weapon: "doze", name: "Dose Platinado", url: "/dose platinado.png", themeColor: "#e2e8f0" },
  { id: "doze_roxada", weapon: "doze", name: "Dose Roxada", url: "/dose roxado.png", themeColor: "#a855f7" },
  { id: "doze_magman", weapon: "doze", name: "Dose Magman", url: "/dose magman (2).png", themeColor: "#ef4444" },
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
  pistola: { width: 44, height: 24, x: 4, y: -6, rotation: 0 },
  uzi: { width: 56, height: 28, x: 0, y: -7, rotation: 0 },
  doze: { width: 96, height: 24, x: -2, y: -6, rotation: 0 },
  basuca: { width: 140, height: 48, x: -15, y: -12, rotation: 0 },
  rifle: { width: 136, height: 40, x: -5, y: -10, rotation: 0 },
  magnum: { width: 48, height: 26, x: 4, y: -6, rotation: 0 },
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"MENU" | "PLAYING">("MENU");
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
      SoundManager.startBGMusic();
    } else {
      SoundManager.stopBGMusic();
    }
    return () => {
      window.onerror = null;
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
  const [shopTab, setShopTab] = useState<"weapons" | "upgrades" | "skins">("weapons");
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>("damage");

  // Advanced settings
  const [goreLevel, setGoreLevel] = useState<"full" | "reduced" | "off">("full");
  const goreLevelRef = useRef<"full" | "reduced" | "off">("full");
  useEffect(() => { goreLevelRef.current = goreLevel; }, [goreLevel]);

  const [shellLevel, setShellLevel] = useState<"permanent" | "temporary" | "simplified" | "off">("temporary");
  const shellLevelRef = useRef<"permanent" | "temporary" | "simplified" | "off">("temporary");
  useEffect(() => { shellLevelRef.current = shellLevel; }, [shellLevel]);

  const [cinematicMode, setCinematicMode] = useState<boolean>(false);
  const cinematicModeRef = useRef<boolean>(false);
  useEffect(() => { cinematicModeRef.current = cinematicMode; }, [cinematicMode]);


  // Wave state for React HUD rendering
  const [wave, setWave] = useState(0); 
  const [waveActive, setWaveActive] = useState(false);
  const [waveRemainingZombies, setWaveRemainingZombies] = useState(0);
  const [waveIntervalTime, setWaveIntervalTime] = useState(0);
  const [waveIntroText, setWaveIntroText] = useState<string | null>(null);

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

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setJoystickStart({ x: touch.clientX, y: touch.clientY });
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickStart) return;
    const touch = e.touches[0];
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

  const handleJoystickEnd = () => {
    setJoystickStart(null);
    setJoystickCurrent(null);
    (window as any).mobileJoystick = { dx: 0, dy: 0 };
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

  const [credits, setCredits] = useState(150);
  const [purchasedWeaponIds, setPurchasedWeaponIds] = useState<string[]>([
    "gun",
  ]);
  const [selectedShopWeaponId, setSelectedShopWeaponId] = useState<string>("pistola");
  const [selectedShopSkinId, setSelectedShopSkinId] = useState<string | null>(null);
  const [weaponInfoActive, setWeaponInfoActive] = useState<number>(0);
  const [selectedBackpackSlot, setSelectedBackpackSlot] = useState<
    number | null
  >(null);
  const [selectedSkinId, setSelectedSkinId] = useState("red");
  const skinRef = useRef(availableSkins[0]);

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
  const [isAimEnabled, setIsAimEnabled] = useState(true);
  const [isCrosshairEnabled, setIsCrosshairEnabled] = useState(true);
  const [aimSensitivity, setAimSensitivity] = useState(1.0);

  const isAimEnabledRef = useRef(true);
  const isCrosshairEnabledRef = useRef(true);
  const aimSensitivityRef = useRef(1.0);

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
    // (This avoids random zombies surrounding player on waves mode start)
    // We can't access mannequins directly here since it is defined in the useEffect.
    // So we can trigger a flag (window as any).clearZombiesOnStart = true;
    (window as any).clearZombiesOnStart = true;

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
  };

  const deliverToBackpack = (weaponId: string) => {
    const inv = inventoryRef.current;
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

    const player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
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
      stamina: 100,
      staminaMax: 100,
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
      x: number; y: number; angle: number; alpha: number; scale: number; isBlue?: boolean;
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
      
      const earnedCredits = m.isBoss ? 75 : 15;
      setCredits((prev) => prev + earnedCredits);
      if (waveRef.current.mode && waveRef.current.active) {
        waveRef.current.waveCreditsEarned += earnedCredits;
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

          // Enter 30s countdown interval
          waveRef.current.intervalTimer = 30.0;
          setWaveIntervalTime(30);

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
      profile?: "AGRESSIVO" | "FLANQUEADOR" | "CERCO" | "SALTADOR" | "LENTO";
      jumpCooldown?: number;
      isJumping?: boolean;
      jumpProgress?: number;
      jumpStartX?: number;
      jumpStartY?: number;
      jumpTargetX?: number;
      jumpTargetY?: number;
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

    const damageTexts: {
      x: number;
      y: number;
      value: number | string;
      life: number;
      vx: number;
      vy: number;
      type?: "damage" | "heal" | "crit" | "player_damage";
      themeColor?: string;
    }[] = [];

    let camera = { x: 0, y: 0, zoom: 1, baseZoom: 1 };
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
      const dpr = window.devicePixelRatio || 1;
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
      if (camera.baseZoom < 0.3) camera.baseZoom = 0.3;
      if (camera.baseZoom > 2.0) camera.baseZoom = 2.0;
    };

    let initialTouchDist = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = camera.baseZoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / initialTouchDist;
        camera.baseZoom = initialZoom * factor;
        if (camera.baseZoom < 0.3) camera.baseZoom = 0.3;
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
      const dpr = window.devicePixelRatio || 1;
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
            
            // Set all existing mannequins to 0 HP at start of active wave
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
              
              let profile: "AGRESSIVO" | "FLANQUEADOR" | "CERCO" | "SALTADOR" | "LENTO" = "AGRESSIVO";
              const r = Math.random();
              
              if (wNum <= 5) {
                profile = r < 0.8 ? "AGRESSIVO" : "LENTO";
                hpMult = 0.6 + wNum * 0.15;
                speedMult = 1.05 + wNum * 0.05;
              } else if (wNum <= 7) {
                if (r < 0.4) profile = "AGRESSIVO";
                else if (r < 0.65) profile = "FLANQUEADOR";
                else if (r < 0.85) profile = "CERCO";
                else profile = "LENTO";
                hpMult = 1.0 + wNum * 0.12;
                speedMult = 1.15 + wNum * 0.04;
              } else {
                if (r < 0.25) profile = "AGRESSIVO";
                else if (r < 0.50) profile = "FLANQUEADOR";
                else if (r < 0.75) profile = "CERCO";
                else if (r < 0.90) profile = "SALTADOR";
                else profile = "LENTO";
                hpMult = 1.2 + wNum * 0.15;
                speedMult = 1.25 + wNum * 0.04;
              }

              let baseHp = 100;
              if (profile === "LENTO") baseHp = 220;
              else if (profile === "SALTADOR") baseHp = 75;

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
      const vanVolume = Math.max(0, 1 - vanDist / 700) * 0.85;
      SoundManager.setMotorVolume(vanVolume);

      // Trigger horn when player gets close to the van (only once per approach)
      const isNearVan = vanDist < VAN_RADIUS + 80;
      if (isNearVan && !(player as any).wasNearVan && !player.isDead) {
        SoundManager.playSound("horn", 0.7);
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

      let dx = 0;
      let dy = 0;
      if (!player.isDead && !player.isRolling) {
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

      if (!player.isDead && !player.isRolling && keys.space && player.rollCooldown <= 0 && (dx !== 0 || dy !== 0) && player.stamina > 20 && !player.staminaExhausted) {
        player.isRolling = true;
        player.stamina -= 25; // Cost of dodge roll
        if (player.stamina <= 0) {
           player.stamina = 0;
           player.staminaExhausted = true;
        }
        player.rollWasRunning = player.isRunning;
        player.rollDuration = player.isRunning ? 0.52 : 0.65;
        player.rollTimer = player.rollDuration;
        player.rollCooldown = 2.0; 
        
        const len = Math.hypot(dx, dy);
        player.rollDirectionX = dx / len;
        player.rollDirectionY = dy / len;
        
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

          // Spawn afterimage ghosts (only when was running, max 4)
          if (player.rollWasRunning && rollGhosts.length < 4) {
            const ghostInterval = 0.12;
            const ghostPhase = Math.floor(progress / ghostInterval);
            const prevPhase = Math.floor((progress - dt / player.rollDuration) / ghostInterval);
            if (ghostPhase !== prevPhase) {
              rollGhosts.push({
                x: player.x,
                y: player.y,
                angle: player.angle,
                alpha: 0.4,
                scale: 1.0,
              });
            }
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
        const targetVx = (dx / len) * PLAYER_SPEED * speedMult;
        const targetVy = (dy / len) * PLAYER_SPEED * speedMult;

        player.vx += (targetVx - player.vx) * 15 * dt;
        player.vy += (targetVy - player.vy) * 15 * dt;

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        player.stepDist += Math.hypot(player.vx * dt, player.vy * dt);

        for (const decal of bloodDecals) {
          if (decal.type !== "footprint" && decal.type !== "meat") {
            const dist = Math.hypot(player.x - decal.x, player.y - decal.y);
            if (dist < decal.size) {
              player.bloodiness = Math.min(1.0, player.bloodiness + 0.05);
            }
          }
        }

        if (player.stepDist > 30) {
          player.stepDist = 0;
          player.leftFoot = !player.leftFoot;
          if (player.bloodiness > 0) {
            const footOffsetX = player.leftFoot ? -8 : 8;
            const moveAngle = Math.atan2(player.vy, player.vx);
            pushBloodDecal({
              x: player.x + Math.cos(moveAngle + Math.PI / 2) * footOffsetX,
              y: player.y + Math.sin(moveAngle + Math.PI / 2) * footOffsetX,
              size: 7,
              alpha: player.bloodiness * 0.6,
              angle: moveAngle,
              stretch: 1.5,
              type: "footprint",
              timer: 0,
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
      const currentMapSize = getMapSize();
      if (player.x < -currentMapSize) player.x = -currentMapSize;
      if (player.x > currentMapSize) player.x = currentMapSize;
      if (player.y < -currentMapSize) player.y = -currentMapSize;
      if (player.y > currentMapSize) player.y = currentMapSize;

      // Free Mode Activation Plate Detection
      if (!waveRef.current.mode) {
        const distToPlate = Math.hypot(player.x - 400, player.y - 400);
        if (distToPlate < 55) {
          if (!(player as any).onPlate) {
            (player as any).onPlate = true;
            SoundManager.playSound("horn", 0.7); // Alert sound
            
            // Spawn 4 zombies around the plate
            let spawned = 0;
            for (const m of mannequins) {
              if (m.hp <= 0 && spawned < 4) {
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
      const pDistVan = Math.hypot(player.x - VAN_X, player.y - VAN_Y);
      if (pDistVan < VAN_RADIUS) {
          const angle = Math.atan2(player.y - VAN_Y, player.x - VAN_X);
          player.x = VAN_X + Math.cos(angle) * VAN_RADIUS;
          player.y = VAN_Y + Math.sin(angle) * VAN_RADIUS;
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

      if (isShopOpenRef.current) {
        targetCamX = VAN_X;
        targetCamY = VAN_Y;
        targetZoom = 1.6;
      } else if (mouse.rightDown && isAimEnabledRef.current) {
        // Displace camera towards the world mouse position but with a professional distance clamp
        const dx = worldMouseX - player.x;
        const dy = worldMouseY - player.y;
        const dist = Math.hypot(dx, dy);
        
        const weight = activeWeapon === "rifle" ? 0.70 : 0.50; // Sniper scopes further out
        const maxDist = activeWeapon === "rifle" ? 350 : 180; // Clamp camera displacement to professional range
        const targetOffset = Math.min(dist * weight, maxDist);
        
        const angle = Math.atan2(dy, dx);
        targetCamX = player.x + Math.cos(angle) * targetOffset;
        targetCamY = player.y + Math.sin(angle) * targetOffset;
        
        targetZoom =
          activeWeapon === "rifle"
            ? Math.max(0.65, camera.baseZoom - 0.2)
            : Math.min(2.5, camera.baseZoom + 0.4);
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
        const leanOffset = activeWeapon === "rifle" ? 100 : 50;
        targetCamX += Math.cos(player.angle) * leanOffset;
        targetCamY += Math.sin(player.angle) * leanOffset;
      }

      const camLerpSpeed = cinematicModeRef.current ? 2.2 : 5.0;
      camera.x += (targetCamX - camera.x) * camLerpSpeed * dt;
      camera.y += (targetCamY - camera.y) * camLerpSpeed * dt;
      camera.zoom += (targetZoom - camera.zoom) * 5 * dt;

      // 3. Update Aiming Angle
      const screenCenterX = logicalWidth / 2;
      const screenCenterY = logicalHeight / 2;
      // Adjusting mouse vector relative to player's screen position, accounting for zoom
      const playerScreenX = screenCenterX + (player.x - camera.x) * camera.zoom;
      const playerScreenY = screenCenterY + (player.y - camera.y) * camera.zoom;

      const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (
        mouse.down ||
        (mouse.rightDown && isAimEnabledRef.current) ||
        muzzleFlash > 0 ||
        player.isReloading
      ) {
        let aimed = false;
        if (isMobileDevice || mobShoot || mobAim) {
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
          player.angle = Math.atan2(
            virtualMouseY - playerScreenY,
            virtualMouseX - playerScreenX,
          );
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
        // Safe check for shooting - block if rolling
        if (mouse.down && player.ammo > 0 && activeStats && player.isRolling === false) {
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
          player.isRolling === false
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
        }

        // Damage Player Logic
        if (m.attackTimer && m.attackTimer > 0) m.attackTimer -= dt;

        if (m.hp > 0 && !player.isDead && (!(m as any).emergeTimer || (m as any).emergeTimer <= 0)) {
          const playerDist = Math.hypot(m.x - player.x, m.y - player.y);
          const attackRange = m.isBoss ? 60 : 35;

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
          if (!waveRef.current.mode && (window as any).freeModeSpawningEnabled) {
            m.deadTime += dt;
            if (m.deadTime > 3) {
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
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;
        const gravityStrength = b.weaponType === "rifle" ? 10 : 300;
        b.vz -= gravityStrength * dt; // gravity
        b.life -= dt;

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
              const baseDmg = (b.isFury ? customStatsDmg * 2.5 : customStatsDmg) * (1.0 + bUpgrades.damage * 0.15);
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

                // Extra head explode gore & brain matter!
                for (let i = 0; i < 40; i++) {
                  pushBloodDrop({
                    x: m.x,
                    y: m.y,
                    z: 20 + Math.random() * 15,
                    vx: (Math.random() - 0.5) * 1800,
                    vy: (Math.random() - 0.5) * 1800,
                    vz: 350 + Math.random() * 500,
                    size: 2.5 + Math.random() * 3.5,
                    color: Math.random() > 0.3 ? "#ff0000" : "#2e0000",
                  });
                }
                
                // Bone/Skull fragments
                for (let i = 0; i < 6; i++) {
                  pushGib({
                    x: m.x,
                    y: m.y,
                    z: 25,
                    vx: (Math.random() - 0.5) * 800,
                    vy: (Math.random() - 0.5) * 800,
                    vz: 200 + Math.random() * 400,
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 40,
                    size: 6 + Math.random() * 8,
                    life: 2 + Math.random() * 3,
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
          shellDecals.push({
            x: s.x,
            y: s.y,
            angle: s.angle,
            timer: s.isKicked ? 10 : 0,
            isBazooka: s.isBazooka,
            isKicked: s.isKicked,
            themeColor: s.themeColor,
          });
          if (shellDecals.length > 500) shellDecals.shift();
          shells.splice(i, 1);
        }
      }

      // --- Player Shell Decals Collision (Kicking ground casings) ---
      for (let i = shellDecals.length - 1; i >= 0; i--) {
        const sd = shellDecals[i];
        const dist = Math.hypot(player.x - sd.x, player.y - sd.y);
        const collRadius = sd.isBazooka ? 36 : 26; // Bazooka casing is larger
        if (dist < collRadius) {
          // Convert back to active bouncing shell
          const kickAngle = Math.atan2(sd.y - player.y, sd.x - player.x) + (Math.random() - 0.5) * 0.7;
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
      screenShakeStr = Math.max(screenShakeStr, 40);
      SoundManager.playExplosion();

      // 2. Damage all mannequins within explosion radius
      const radius = 220;
      const baseDamage = 350 * (1.0 + (upgradesRef.current.basuca?.damage || 0) * 0.15);

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

        const equippedSkinId = inventoryRef.current.equippedSkins[wType];
        const skinDef = WEAPON_SKINS.find(s => s.id === equippedSkinId);
        const tColor = skinDef?.themeColor;

        bullets.push({
          x: player.x + offsetX,
          y: player.y + offsetY,
          z: wType === "basuca" ? 12 : 20,
          vx: bulletVX,
          vy: bulletVY,
          vz: wType === "basuca" ? 0 : -20 - Math.random() * 20,
          life: stats.range * (1.0 + wUpgrades.range * 0.15),
          isFury: player.furyTimer > 0,
          dmgMult: wType === "doze" ? 0.6 : wType === "rifle" ? 1.5 : 1.0,
          hitEntityIds: [],
          penetrationCount: wType === "rifle" ? 3 : 1,
          headshotsCount: 0,
          isRocket: wType === "basuca",
          weaponType: wType,
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
              : (Math.random() > 0.45 ? "#ffaa00" : "#ffffff"),
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

      // Clear Screen
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save(); // Save baseline clean state

      // High-DPI support: scale the rendering context and define logical dimensions
      const dpr = window.devicePixelRatio || 1;
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
      if (screenShakeStr > 0) {
        ctx.rotate(Math.sin(Date.now() * 0.08) * screenShakeStr * 0.0006);
      }
      ctx.scale(camera.zoom, camera.zoom);
      
      let swayX = 0;
      let swayY = 0;
      if (cinematicModeRef.current && player.isMoving) {
        swayX = Math.sin(player.moveTimer * 9) * 3.5;
        swayY = Math.cos(player.moveTimer * 18) * 2.5;
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
          const isBlack =
            (Math.floor(x / TILE_SIZE) + Math.floor(y / TILE_SIZE)) % 2 === 0;
          ctx.fillStyle = isBlack ? "#030303" : "#080808"; // Darkened for cinematic lighting
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          
          // Subtle grid line to make it look technical and premium
          ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
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
          ctx.fillStyle = colorStr;
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
        lightGrad.addColorStop(0, `rgba(255, 180, 50, ${(isDoze ? 0.65 : 0.4) * muzzleFlash})`);
        lightGrad.addColorStop(
          0.2,
          `rgba(255, 100, 20, ${(isDoze ? 0.35 : 0.15) * muzzleFlash})`,
        );
        lightGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
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
          lightGrad.addColorStop(0, "rgba(255, 200, 100, 0.4)");
          lightGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
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

      // Draw Smoke Barrier
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

      // --- Draw Mannequins ---
      for (const m of mannequins) {
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

        const baseScale = m.isBoss ? 1.6 : m.profile === "LENTO" ? 1.25 : m.profile === "SALTADOR" ? (isJumping ? 0.82 * (1.0 + jumpHeight / 90) : 0.82) : 1.0;
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

        // Shoulders & Arms (Mutated/Jagged)
        // Shoulders & Arms (Mutated/Jagged)
        let armColor = "#1f2621";
        if (m.attackTimer && m.attackTimer > 0) armColor = "#8a0303";
        else if (m.hitTime > 0) armColor = "#ffffff";
        else if (m.isBoss) armColor = "#301212";
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
        if (m.attackTimer && m.attackTimer > 0) bodyColor = "#520000";
        else if (m.hitTime > 0) bodyColor = "#ffffff";
        else if (m.isBoss) bodyColor = "#1a0808";
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
        if (m.attackTimer && m.attackTimer > 0) headColor = "#8a0303";
        else if (m.hitTime > 0) headColor = "#ffffff";
        else if (m.isBoss) headColor = "#240000";
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

        ctx.beginPath();
        ctx.arc(12, -4, m.isBoss ? 3 : 2, 0, Math.PI * 2); // Right eye
        ctx.arc(12, 4, m.isBoss ? 3 : 2, 0, Math.PI * 2);  // Left eye
        ctx.fill();

        if (m.isBoss || m.hp > 100) {
          // Extra eyes for boss/strong variants
          ctx.beginPath();
          ctx.arc(8, -8, 2, 0, Math.PI * 2);
          ctx.arc(8, 8, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0; // reset shadow
        ctx.restore();

        // Target Indicator & HP Bar
        if (m.focusLerp > 0.01 || (m.hp < m.maxHp && m.hp > 0)) {
          ctx.save();
          ctx.translate(m.x, m.y);

          const barScale = 1.0 + m.focusLerp * 0.3;
          ctx.scale(barScale, barScale);

          const hpRatio = m.isBoss ? 1 : Math.max(0, m.hp / m.maxHp);

          // Tactical Reticle (Centered)
          if (m.focusLerp > 0.01) {
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
          const animOffset = -20 * m.focusLerp;
          ctx.translate(0, animOffset);

          const uiAlpha = Math.max(0.5, m.focusLerp);
          ctx.globalAlpha = uiAlpha;

          const xOffset = 0;
          const yOffset = -55;

          if (m.focusLerp > 0.15 || m.isBoss) {
            ctx.fillStyle = m.isBoss ? "#ff3333" : "rgba(0, 255, 255, 0.9)";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            const name = m.isBoss ? "JUGGERNAUT_CLASS" : "INFECTED_TGT_MKIV";
            ctx.fillText(name, xOffset, yOffset - 22);
          }
          if (m.focusLerp > 0.05) {
            ctx.font = "8px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            const hpText = `HP: ${Math.floor(hpRatio * 100)}%`;
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
                ctx.fillStyle = m.isBoss ? "#ff3333" : "#00e5ff";
                ctx.shadowColor = m.isBoss ? "#ff3333" : "#00e5ff";
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
      }

      // --- Draw Gibs ---
      for (const g of gibs) {
        if (g.x < minDrawX || g.x > maxDrawX || g.y < minDrawY || g.y > maxDrawY) continue;
        if (g.z > 0) {
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          ctx.arc(0, 0, g.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.save();
        ctx.translate(g.x, g.y - g.z);
        ctx.rotate(g.angle);
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
        ctx.save();
        ctx.translate(d.x, d.y - d.z);
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
      
      ctx.save();
      ctx.translate(VAN_X, VAN_Y);
      ctx.rotate(vanAngle + Math.PI / 2);
      
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
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
           ctx.roundRect(-45, -15, 90, 25, 5);
        } else {
           ctx.rect(-45, -15, 90, 25);
        }
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("LOJA [E]", 0, 2);
      }
      ctx.restore();

      // --- Draw Bullets (with glowing trails) ---
      for (const b of bullets) {
        const isDoze = b.weaponType === "doze";
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
          g.alpha -= dt * (g.isBlue ? 4.5 : 3.0);
          if (g.alpha <= 0) { rollGhosts.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = g.alpha * 0.35;
          ctx.translate(g.x, g.y);
          ctx.rotate(g.angle);
          
          if (g.isBlue) {
            ctx.fillStyle = "#3b82f6"; // Blue ghost trail!
          } else {
            ctx.fillStyle = gMain;
          }
          
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.arc(12, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // --- Draw Dust Particles ---
      if (dustParticles.length > 0) {
        ctx.save();
        for (const dp of dustParticles) {
          const lifeRatio = dp.life / dp.maxLife;
          ctx.globalAlpha = lifeRatio * 0.7; // Mais visivel
          // Cores mistas: se a size for pequena e rocha escura, se for grande e fumaca
          if (dp.size < 5) {
             ctx.fillStyle = "rgba(40, 30, 20, 0.9)"; // Pedrinhas/Sujeira escura
          } else {
             ctx.fillStyle = `rgba(130, 115, 95, ${0.4 + lifeRatio * 0.4})`; // Fumaca/Poeira
          }
          ctx.beginPath();
          // Expande com o tempo se for poeira, diminui se for pedra
          const renderSize = dp.size < 5 ? dp.size : dp.size * (2 - lifeRatio);
          ctx.arc(dp.x, dp.y, renderSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Draw Player ---
      if (!player.isDead) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

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

        // Shadow
        ctx.beginPath();
        ctx.ellipse(-5, 5, 22, 28, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        if (player.isRolling) {
           let progress = 1 - (player.rollTimer / (player.rollDuration || 1));
           if (progress < 0) progress = 0;
           if (progress > 1) progress = 1;

           const rollAngle = progress * Math.PI * 2;
           const jumpHeight = Math.max(0, Math.sin(progress * Math.PI) * 38);
           const rollScale = Math.max(0.1, 1.0 + Math.sin(progress * Math.PI) * 0.35);

           ctx.translate(0, -jumpHeight);
           
           ctx.rotate(rollAngle);
           ctx.scale(rollScale, rollScale);
        }

        // Left Shoulder/Arm
        ctx.fillStyle = sMain;
        ctx.beginPath();
        ctx.ellipse(shL_X, shL_Y, 14, 9, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Right Shoulder/Arm
        ctx.beginPath();
        ctx.ellipse(shR_X, shR_Y, 14, 9, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Arms connecting shoulders to hands
        ctx.strokeStyle = sMain;
        ctx.lineWidth = 10;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(shL_X, shL_Y);
        ctx.lineTo(handL_X, handL_Y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shR_X, shR_Y);
        ctx.lineTo(handR_X, handR_Y);
        ctx.stroke();

        // Body (Torso Vest)
        ctx.fillStyle = sDark;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-15, -16, 26, 32, 6);
        } else {
          ctx.rect(-15, -16, 26, 32);
        }
        ctx.fill();

        // Tactical Vest Details
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-8, -12, 12, 24); // Center plate
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(-8, -8, 12, 2); // Webbing
        ctx.fillRect(-8, -2, 12, 2);
        ctx.fillRect(-8, 4, 12, 2);
        ctx.fillStyle = sMain;
        ctx.fillRect(-12, -14, 4, 10); // Pouches
        ctx.fillRect(-12, 4, 4, 10);

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

              // Render laser sight ONLY for the rifle
              if (activeWeapon === "rifle") {
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

          // Left Hand (holding barrel dynamically)
          ctx.beginPath();
          ctx.arc(gripLeftX, gripLeftY, 5, 0, Math.PI * 2);
          ctx.fillStyle = sSkin;
          ctx.fill();

          // Right Hand (on trigger)
          ctx.beginPath();
          ctx.arc(10, 8, 5, 0, Math.PI * 2);
          ctx.fillStyle = sSkin;
          ctx.fill();

          ctx.restore();
        } else {
          // Just draw hands swinging
          ctx.beginPath();
          ctx.arc(handL_X, handL_Y, 5, 0, Math.PI * 2);
          ctx.fillStyle = sSkin;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(handR_X, handR_Y, 5, 0, Math.PI * 2);
          ctx.fillStyle = sSkin;
          ctx.fill();
        }

        // Head (Helmet)
        ctx.beginPath();
        ctx.arc(
          -2 + (player.isMoving ? Math.cos(walkBobTime) * 1.5 : 0),
          0,
          13,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = sMain;
        ctx.fill();
        // Helmet rim
        ctx.beginPath();
        ctx.arc(
          -2 + (player.isMoving ? Math.cos(walkBobTime) * 1.5 : 0),
          0,
          13,
          -Math.PI / 2,
          Math.PI / 2,
        );
        ctx.lineWidth = 3;
        ctx.strokeStyle = sDark;
        ctx.stroke();
        // Goggles
        ctx.beginPath();
        ctx.arc(
          1 + (player.isMoving ? Math.cos(walkBobTime) * 1.5 : 0),
          0,
          11,
          -Math.PI / 3.5,
          Math.PI / 3.5,
        );
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#050505";
        ctx.stroke();

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
        ctx.lineWidth = 5;

        if (t.type === "heal") {
          ctx.font = '900 32px "Helvetica Neue", Arial, sans-serif';
          ctx.strokeStyle = "#330000";
          ctx.strokeText(`+${t.value}`, 0, 0);
          ctx.fillStyle = "#ff4444";
          ctx.fillText(`+${t.value}`, 0, 0);
        } else if (t.type === "player_damage") {
          ctx.font = '900 28px "JetBrains Mono", monospace';
          const s = 1.0 + Math.sin(t.life * Math.PI) * 0.3;
          ctx.scale(s, s);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 5;
          ctx.strokeText(`-${t.value}`, 0, 0);
          ctx.fillStyle = "#ff2222";
          ctx.fillText(`-${t.value}`, 0, 0);
        } else if (t.type === "crit") {
          ctx.font = '900 32px "JetBrains Mono", monospace';
          const s = 1.0 + Math.sin(t.life * Math.PI) * 0.5;
          ctx.scale(s, s);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 5;
          ctx.strokeText(`${t.value}`, 0, 0);
          const tC = t.themeColor || "#ff0000";
          ctx.shadowColor = tC;
          ctx.shadowBlur = 15;
          ctx.fillStyle = tC;
          ctx.fillText(`${t.value}`, 0, 0);
          ctx.shadowBlur = 0;
        } else {
          ctx.font = '900 32px "Helvetica Neue", Arial, sans-serif';
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

      // --- Draw Tactical Radar ---
      ctx.save();
      const radarSize = 160;
      const radarX = logicalWidth - radarSize / 2 - 30;
      const radarY = radarSize / 2 + 30; // 30px padding from top
      const radarScale = 0.04; // Scale world down to radar

      ctx.translate(radarX, radarY);

      // Radar Background
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(5, 10, 8, 0.85)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.7)";
      ctx.stroke();

      // Radar grid lines
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshairs in radar
      ctx.beginPath();
      ctx.moveTo(-radarSize / 2, 0);
      ctx.lineTo(radarSize / 2, 0);
      ctx.moveTo(0, -radarSize / 2);
      ctx.lineTo(0, radarSize / 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
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
            ctx.beginPath();
            ctx.arc(dx, dy, m.isBoss ? 6 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = m.isBoss ? "#ff1100" : "#f44336";
            ctx.fill();
          }
        }
      }

      // Draw Van (Base) on Radar
      const vanDx = (VAN_X - player.x) * radarScale;
      const vanDy = (VAN_Y - player.y) * radarScale;
      if (Math.hypot(vanDx, vanDy) < radarSize / 2 + 10) {
        ctx.save();
        ctx.translate(vanDx, vanDy);
        
        ctx.fillStyle = "#10b981"; // base green
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.0;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 6;
        
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

      // Draw Player center
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00e5ff";
      ctx.fill();
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Player facing cone
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 60, player.angle - 0.4, player.angle + 0.4);
      ctx.fillStyle = "rgba(0, 229, 255, 0.3)";
      ctx.fill();

      ctx.restore();

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

      // Near edge camera darkening vignette (Fog of war)
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
        
        // 1. Darken screen
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Draw cinematic black bars (letterbox)
        const barHeight = canvas.height * 0.15;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, barHeight);
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
        
        // 3. Draw text
        const text = waveRef.current.introText || "";
        ctx.font = '900 64px "Outfit", "Inter", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Text glow
        ctx.shadowColor = "rgba(220, 38, 38, 0.8)";
        ctx.shadowBlur = 35;
        ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
        
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Subtext
        ctx.shadowBlur = 0;
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.fillText("SOBREVIVA ÀS HORDAS DE INIMIGOS", canvas.width / 2, canvas.height / 2 + 65);
        
        ctx.restore();
      }

      // Update dynamic UI states (via DOM)
      const uiKillCountEl = document.getElementById("ui-kill-count");
      if (uiKillCountEl) {
        uiKillCountEl.innerText = String(player.kills);
      }
      const uiAmmoEl = document.getElementById("ui-ammo-count");
      if (uiAmmoEl) {
        uiAmmoEl.innerText = String(player.ammo).padStart(2, "0");
      }
      const uiAmmoMaxEl = document.getElementById("ui-ammo-max");
      if (uiAmmoMaxEl) {
        uiAmmoMaxEl.innerText = String(player.maxAmmo);
      }
      
      // Update ammo weapon image visibility & shaking/gray states
      const weaponIds = ["pistola", "gun", "uzi", "doze", "basuca", "rifle", "magnum"];
      weaponIds.forEach((wId) => {
        const imgEl = document.getElementById(`ui-ammo-weapon-${wId}`);
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

      const uiReloadOverlay = document.getElementById("ui-ammo-reload-overlay");
      if (uiReloadOverlay) {
        if (player.isReloading && activeStats) {
          uiReloadOverlay.style.opacity = "1";
          const progress = 1 - (player.reloadTimer / (activeStats.reloadTime / (1.0 + wUpgrades.reloadSpeed * 0.15)));
          const fillEl = document.getElementById("ui-ammo-reload-fill");
          if (fillEl) {
            fillEl.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
          }
        } else {
          uiReloadOverlay.style.opacity = "0";
        }
      }

      const uiHotbarEl = document.getElementById("ui-hotbar");
      if (uiHotbarEl) {
        if (player.gunHeat > 2 || player.hitMarkerTime > 0) {
          uiHotbarEl.style.opacity = "0.2";
        } else {
          uiHotbarEl.style.opacity = "1.0";
        }
      }
      const uiPlayerHpText = document.getElementById("ui-player-hp-text");
      const uiPlayerHpFill = document.getElementById("ui-player-hp-fill");
      if (uiPlayerHpText && uiPlayerHpFill) {
        uiPlayerHpText.innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
        uiPlayerHpFill.style.width = `${Math.max(0, player.hp / player.maxHp) * 100}%`;

        const uiPlayerRollFill = document.getElementById("ui-player-roll-fill");
        if (uiPlayerRollFill) {
          const readyRatio = Math.max(0, 1 - player.rollCooldown / 2.0);
          uiPlayerRollFill.style.width = `${readyRatio * 100}%`;
          if (readyRatio >= 1.0) {
            uiPlayerRollFill.style.backgroundColor = "rgba(255,255,255,0.8)";
          } else {
            uiPlayerRollFill.style.backgroundColor = "rgba(100,100,100,0.5)";
          }
        }

        const uiPlayerStaminaFill = document.getElementById("ui-player-stamina-fill");
        if (uiPlayerStaminaFill) {
          const ratio = Math.max(0, player.stamina / player.staminaMax);
          uiPlayerStaminaFill.style.width = `${ratio * 100}%`;
          if (player.staminaExhausted) {
            uiPlayerStaminaFill.style.backgroundColor = "rgba(220,50,50,0.8)";
          } else {
            uiPlayerStaminaFill.style.backgroundColor = "rgba(60,200,100,0.8)";
          }
        }

        // Smooth blood screen based on HP
        const blurLayer = document.getElementById("blur-layer");
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
      const uiAmmoPanel = document.getElementById("ui-ammo-panel");
      if (uiAmmoPanel) {
        if (mouse.down && player.ammo > 0 && !player.isReloading) {
          uiAmmoPanel.style.opacity = "0.3";
        } else {
          uiAmmoPanel.style.opacity = "1.0";
        }
      }

      const uiReloadEl = document.getElementById("ui-reload-status");
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
      const uiFuryFill = document.getElementById("ui-fury-fill");
      const uiFuryGlow = document.getElementById("ui-fury-glow");
      const uiFuryContainer = document.getElementById("ui-fury-container");

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

      const uiProfileBox = document.getElementById("ui-profile-box");
      const uiProfileLetter = document.getElementById("ui-profile-letter");
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
    <div className={`fixed inset-0 w-full h-full bg-black overflow-hidden font-['Helvetica_Neue',Arial,sans-serif] text-white ${isAnyMenuOpen ? 'cursor-default' : 'cursor-none'}`}>
      <canvas
        ref={canvasRef}
        className="block absolute inset-0 z-0 h-full w-full"
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu disrupting aim
      />
      <div className="vignette z-10"></div>

      <div
        id="blur-layer"
        className="absolute inset-0 z-[15] pointer-events-none bg-red-900/40 mix-blend-multiply transition-opacity duration-300"
        style={{ opacity: 0 }}
      ></div>

      <div
        id="death-screen"
        className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-1000"
        style={{ opacity: 0, pointerEvents: "none", display: "none" }}
      >
        <h1
          id="death-title"
          className="text-3xl md:text-4xl text-center font-black text-red-700 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-6 animate-pulse"
        >
          Seu Corpo Foi Devorado
        </h1>
        <button
          onClick={() => {
            (window as any).respawnTriggered = true;
          }}
          className="px-8 py-3 bg-red-900 border-2 border-red-600 text-white font-mono tracking-widest uppercase hover:bg-red-700 hover:scale-105 transition-all text-sm cursor-crosshair shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          Renascer
        </button>
      </div>

      {gameState === "MENU" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-auto overflow-hidden">
          {/* Animated Tactical Cyber Grid Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center",
          }} />
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent pointer-events-none z-10 w-full h-[300%] animate-scan" style={{ mixBlendMode: "overlay" }} />

          {/* Corner Telemetries / Crosshairs (Simplified & Clean) */}
          <div className="absolute top-6 left-6 font-mono text-[9px] tracking-[0.2em] text-red-500/60 pointer-events-none select-none">
            [SYS_STATE // ONLINE]
          </div>
          
          <div className="absolute top-6 right-6 font-mono text-[9px] tracking-[0.2em] text-red-500/60 text-right pointer-events-none select-none">
            [ALERT // HIGH INFESTATION]
          </div>

          {/* Interactive Hologram Center Crosshair */}
          <div className="relative z-10 mb-4 opacity-70 flex items-center justify-center">
            <div className="w-16 h-16 border border-dashed border-red-700/40 rounded-full animate-spin" style={{ animationDuration: "20s" }} />
            <div className="absolute w-2 h-2 bg-red-600 rounded-full animate-ping" />
          </div>

          {/* Dynamic Header */}
          <div className="relative mb-10 text-center select-none z-10">
            <h1 className="text-6xl md:text-8xl font-black text-red-700 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(220,38,38,0.7)] relative">
              <span className="absolute -left-4 -top-2 text-[8px] font-mono font-bold tracking-[0.3em] text-red-500/50">[SYS_ACTIVE]</span>
              MANÍACO
            </h1>
            <p className="text-[10px] font-mono tracking-[0.4em] text-red-500/80 font-bold uppercase mt-2">
              SURVIVAL COMBAT SIMULATOR
            </p>
          </div>

          {/* Redesigned Monospaced Tactical Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm relative z-10 px-6">
             {/* Sandbox Mode Button */}
             <button
                onClick={() => {
                  // Reset upgrades to fresh values
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

                  // Reset inventory
                  inventoryRef.current = {
                    hotbar: ["gun", null, null, null, null],
                    hotbarAmmo: [200, 0, 0, 0, 0],
                    backpack: Array(16).fill(null),
                    activeSlot: 0,
                    selectedItem: null,
                    equippedSkins: {},
                    purchasedSkins: [],
                  };

                  // Clean overlays/menus
                  setIsShopOpen(false);
                  setIsInventoryOpen(false);
                  setIsOutfitsOpen(false);

                  // Infinite credits for Free Mode (Cenário Livre)
                  setCredits(999999999);

                  // Reset Van (Combi) position
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
                className="group relative py-3 bg-red-950/40 border border-red-800 text-white hover:bg-red-900/30 transition-all cursor-pointer rounded overflow-hidden flex flex-col items-center justify-center gap-0.5 shadow-[0_0_15px_rgba(220,38,38,0.15)]"
             >
                {/* Decorative corner ticks */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500 group-hover:scale-110 transition-transform" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500 group-hover:scale-110 transition-transform" />
                
                <span className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-red-400 group-hover:text-white transition-colors">
                  [ 01 ] MODO LIVRE
                </span>
                <span className="text-[8px] font-mono text-red-500/50 tracking-wider">
                  CRÉDITOS INFINITOS // COMBATE LIVRE
                </span>
             </button>

             {/* Weapon Shop Button */}
             <button
                onClick={() => {
                  setIsShopOpen(true);
                  setIsOutfitsOpen(false);
                  SoundManager.playSound("click", 1.0);
                }}
                className="group relative py-3 bg-zinc-950/50 border border-zinc-700 text-white hover:bg-zinc-800/40 transition-all cursor-pointer rounded overflow-hidden flex flex-col items-center justify-center gap-0.5"
             >
                {/* Decorative corner ticks */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-400" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-400" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-400" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-400" />
                
                <span className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-zinc-300 group-hover:text-white transition-colors">
                  [ 02 ] LOJA DE COMBATE
                </span>
                <span className="text-[8px] font-mono text-zinc-500 tracking-wider">
                  COMPRAR ARMAS, UPGRADES & SKINS
                </span>
             </button>

             {/* Outfits Button */}
             <button
                onClick={() => {
                  setIsOutfitsOpen(true);
                  setIsShopOpen(false);
                  SoundManager.playSound("click", 1.0);
                }}
                className="group relative py-3 bg-zinc-950/50 border border-zinc-700 text-white hover:bg-zinc-800/40 transition-all cursor-pointer rounded overflow-hidden flex flex-col items-center justify-center gap-0.5"
             >
                {/* Decorative corner ticks */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-400" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-400" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-400" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-400" />
                
                <span className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-zinc-300 group-hover:text-white transition-colors">
                  [ 03 ] TRAJES TÁTICOS
                </span>
                <span className="text-[8px] font-mono text-zinc-500 tracking-wider">
                  ESCOLHER APARÊNCIA DE AGENTE
                </span>
             </button>

             {/* Waves Mode Button */}
             <button
                onClick={() => {
                  startWavesMode();
                  SoundManager.playSound("click", 1.0);
                }}
                className="group relative py-3.5 bg-amber-950/30 border border-amber-600 text-amber-200 hover:bg-amber-800/20 hover:text-white transition-all cursor-pointer rounded overflow-hidden flex flex-col items-center justify-center gap-0.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
             >
                {/* Decorative corner ticks */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500 group-hover:scale-110 transition-transform" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500 group-hover:scale-110 transition-transform" />
                
                <span className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-amber-400 group-hover:text-amber-200 transition-colors">
                  [ 04 ] MODO ONDAS
                </span>
                <span className="text-[8px] font-mono text-amber-500/70 tracking-wider">
                  CAMPANHA DE SOBREVIVÊNCIA GRADUAL
                </span>
             </button>
          </div>
        </div>
      )}

      {gameState === "PLAYING" &&
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
        {/* Wave Mode HUD */}
        {waveRef.current.mode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2">
            {waveActive ? (
              <div className="bg-black/90 backdrop-blur-md border border-zinc-800 rounded-lg px-6 py-2 flex items-center gap-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-500 font-bold">ONDA</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{wave}</span>
                </div>
                <div className="w-[1px] h-6 bg-zinc-800" />
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-500 font-bold">ZUMBIS RESTANTES</span>
                  <span className="text-xl font-black text-red-500 font-mono">{waveRemainingZombies}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Wave Stats & Cleaning Menu */}
        {waveRef.current.mode && waveIntervalTime > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-4 bg-zinc-950/95 border-2 border-amber-600/30 p-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] text-center min-w-[360px] text-white font-mono transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
            <span className="text-emerald-400 font-extrabold tracking-[0.25em] text-[11px] uppercase animate-pulse">ONDA CONCLUÍDA</span>
            <span className="text-3xl font-black text-amber-500 -mt-2">ONDA {waveRef.current.current}</span>
            
            <div className="w-full h-[1px] bg-zinc-800 my-1" />
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 w-full text-[10px] text-zinc-400">
              <div className="flex justify-between">
                <span>TEMPO:</span>
                <span className="text-white font-bold">{waveRef.current.lastWaveTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>DANO TOTAL:</span>
                <span className="text-white font-bold">{waveRef.current.lastWaveDamage} HP</span>
              </div>
              <div className="flex justify-between">
                <span>DISPAROS:</span>
                <span className="text-white font-bold">{waveRef.current.lastWaveShots}</span>
              </div>
              <div className="flex justify-between">
                <span>PRECISÃO:</span>
                <span className="text-white font-bold">
                  {waveRef.current.lastWaveShots > 0 
                    ? Math.round((waveRef.current.lastWaveHits / waveRef.current.lastWaveShots) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>ACERTOS CABEÇA:</span>
                <span className="text-white font-bold">{waveRef.current.lastWaveHeadshots}</span>
              </div>
              <div className="flex justify-between">
                <span>CRÉDITOS:</span>
                <span className="text-emerald-400 font-bold">+${waveRef.current.lastWaveCreditsEarned}</span>
              </div>
            </div>
            
            <div className="w-full h-[1px] bg-zinc-800 my-1" />
            
            <div className="flex flex-col items-center w-full">
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Próxima Onda em</span>
              <span className="text-2xl font-black text-amber-500 mt-0.5">{waveIntervalTime}s</span>
            </div>
            
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={skipInterval}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-[9px] tracking-widest uppercase rounded transition-all cursor-pointer shadow-md"
              >
                PULAR INTERVALO
              </button>
              <button
                onClick={() => {
                  if ((window as any).clearDecalsAndShells) {
                    (window as any).clearDecalsAndShells();
                    const btn = document.getElementById("btn-clear-scene");
                    if (btn) {
                      btn.innerText = "CENÁRIO LIMPO!";
                      btn.style.color = "#10b981";
                      setTimeout(() => { 
                        btn.innerText = "LIMPAR SANGUE E CÁPSULAS"; 
                        btn.style.color = "#fecaca";
                      }, 1500);
                    }
                  }
                }}
                id="btn-clear-scene"
                className="w-full py-2 bg-red-950/40 hover:bg-red-900 border border-red-700/40 text-red-200 font-bold tracking-widest uppercase rounded transition-all cursor-pointer text-center text-[8px]"
              >
                LIMPAR SANGUE E CÁPSULAS
              </button>
            </div>
          </div>
        )}

        {/* Top Header Tactical Element */}
        <div className="flex justify-between items-start opacity-90 w-full">
          <div className="flex gap-2 md:gap-3 pointer-events-none items-stretch">
            {/* Left Stack for Vitals + Ammo HUD */}
            <div className="flex flex-col gap-1.5 items-start">
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

                    <div className="h-1.5 md:h-2 w-full bg-black/80 skew-x-[-15deg] overflow-hidden p-[1px] mb-1 shadow-inner relative border" style={{ borderColor: `${uiColor}40` }}>
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
                      <div className="h-1 md:h-1.5 flex-1 bg-black/80 border border-white/10 skew-x-[-15deg] overflow-hidden">
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
              <div
                id="ui-ammo-panel"
                className="flex items-center gap-3 pointer-events-none select-none z-45 transition-opacity duration-200 bg-black/80 backdrop-blur-md p-1.5 px-3 border border-white/10 border-l-[3px] rounded-r-xl shadow-lg mt-1"
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
            </div>

            <div className="flex flex-col justify-center gap-1.5 pl-1 md:pl-2 pointer-events-auto">
              <div className="flex gap-1.5">
                <button
                  id="btn-toggle-ai"
                  className="px-2.5 py-1.5 border border-emerald-500/50 text-emerald-400 text-[9px] md:text-[10px] font-bold tracking-widest bg-emerald-900/20 hover:bg-emerald-500/20 rounded backdrop-blur-md border-l-[3px]"
                >
                  AI: PATROL
                </button>
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
                  className={`px-2.5 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded backdrop-blur-md border-l-[3px] transition-colors flex items-center justify-center gap-1.5 relative min-w-[70px] md:min-w-[85px] ${
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
                    <Backpack className="w-3 h-3" />
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
                  className={`px-2.5 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded backdrop-blur-md border-l-[3px] transition-colors flex items-center justify-center min-w-[60px] md:min-w-[75px] ${
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
                  className={`px-2.5 py-1.5 border text-[9px] md:text-[10px] font-bold tracking-widest rounded backdrop-blur-md border-l-[3px] transition-colors flex items-center justify-center min-w-[60px] md:min-w-[75px] ${
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
          <div /> {/* Radar is drawn by canvas on the right */}
        </div>
      </div>
      }

      {/* Weapon Shop Overlay */}
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
            <div className="bg-zinc-950/98 backdrop-blur-md border border-zinc-900 rounded-xl p-6 w-[800px] max-w-[90vw] max-h-[90vh] shadow-2xl shadow-black relative flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                    <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 font-bold">
                      REDE DE SUPRIMENTOS
                    </span>
                  </div>
                  <div className="flex gap-2 border-l border-zinc-800 pl-4">
                    <button
                      onClick={() => setShopTab("weapons")}
                      className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider rounded transition-all cursor-pointer ${
                        shopTab === "weapons"
                          ? "bg-amber-600/20 border border-amber-500/50 text-amber-400"
                          : "border border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      ARMAS
                    </button>
                    <button
                      onClick={() => setShopTab("upgrades")}
                      className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider rounded transition-all cursor-pointer ${
                        shopTab === "upgrades"
                          ? "bg-amber-600/20 border border-amber-500/50 text-amber-400"
                          : "border border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      MELHORIAS
                    </button>
                    <button
                      onClick={() => setShopTab("skins")}
                      className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider rounded transition-all cursor-pointer ${
                        shopTab === "skins"
                          ? "bg-amber-600/20 border border-amber-500/50 text-amber-400"
                          : "border border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      SKINS
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setIsShopOpen(false)}
                  className="text-white/20 hover:text-white transition-colors p-1"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Credits indicator */}
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-2 px-3.5 mb-3 flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-wider text-zinc-500">
                  CRÉDITOS ARMAMENTO
                </span>
                <span className="text-base font-mono font-bold text-amber-500">
                  {credits} Cr
                </span>
              </div>

              {/* Split Main Grid */}
              <div className="grid grid-cols-12 gap-3">
                {shopTab === "weapons" && (
                  <>
                    <div className="col-span-5 flex flex-col gap-1.5 pr-0 h-[400px] overflow-y-auto custom-scrollbar">
                      {Object.values(WEAPONS_DETAILS).map((weapon) => {
                        const isPaid = purchasedWeaponIds.includes(weapon.id);
                        const isSelected = selectedShopWeaponId === weapon.id;
                        return (
                          <button
                            key={weapon.id}
                            onClick={() => {
                              setSelectedShopWeaponId(weapon.id);
                              setSelectedShopSkinId(null);
                            }}
                            className={`w-full p-2 rounded-lg border text-left flex flex-col relative transition-all ${
                              isSelected
                                ? "border-zinc-700 bg-zinc-900/60 shadow-inner"
                                : "border-zinc-900 bg-black/45 hover:bg-zinc-900/20"
                            }`}
                          >
                            <div className="flex justify-between items-start w-full gap-1">
                              <span
                                className={`text-[9.5px] font-bold tracking-wide uppercase truncate ${isSelected ? "text-amber-500" : "text-zinc-300"}`}
                              >
                                {weapon.name.split(" ")[0]}{" "}
                                {weapon.name.split(" ")[1] || ""}
                              </span>
                              {isPaid && (
                                <span className="text-[6.5px] font-mono font-bold text-emerald-550 border border-emerald-500/10 bg-emerald-950/20 px-1 rounded shrink-0">
                                  OK
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-0.5 w-full text-[8.5px] font-mono">
                              <span className="text-zinc-600">CUSTO</span>
                              <span className="text-zinc-400 font-bold">
                                {weapon.cost} Cr
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="col-span-7 flex flex-col justify-start border-l border-zinc-900 pl-3 h-[400px] overflow-y-auto custom-scrollbar relative">
                      {(() => {
                        const stats =
                          WEAPONS_DETAILS[selectedShopWeaponId || "pistola"];
                        if (!stats) return null;
                        const isPaid = purchasedWeaponIds.includes(stats.id);
                        const weaponSkins = WEAPON_SKINS.filter(s => s.weapon === stats.id);
                        const previewingSkin = selectedShopSkinId ? weaponSkins.find(s => s.id === selectedShopSkinId) : null;

                        return (
                          <div className="flex flex-col gap-3 h-full">
                            {/* LARGE PREVIEW AREA */}
                            <div className="relative shrink-0 w-full h-[150px] bg-black/60 border border-zinc-900 rounded-xl flex items-center justify-center overflow-hidden mb-1 group cursor-pointer" onClick={() => setInspectingItem(previewingSkin ? {type: "skin", id: previewingSkin.id} : {type: "weapon", id: stats.id})}>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />
                              <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                                {previewingSkin ? (
                                   <img src={previewingSkin.url} alt={previewingSkin.name} className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] transform group-hover:scale-125 transition-transform duration-500" style={{ imageRendering: "pixelated" }} />
                                ) : (
                                   <div className="filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] transform scale-150 group-hover:scale-[1.7] transition-transform duration-500">
                                     <RenderWeaponBlueprint type={stats.id} color={stats.color} />
                                   </div>
                                )}
                              </div>
                              <div className="absolute top-2 right-2 flex items-center gap-1.5 text-zinc-500 group-hover:text-amber-500 z-20 transition-all bg-black/60 px-2 py-1.5 rounded backdrop-blur-sm border border-zinc-800/50 group-hover:border-amber-500/50 shadow-lg group-hover:shadow-amber-500/20">
                                <span className="text-[7.5px] font-mono font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Visualizar</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </div>
                            </div>

                            {/* DETAILS & ACTIONS */}
                            <div className="flex-1 flex flex-col shrink-0">
                              <h4 className="text-[12.5px] font-bold tracking-wide text-white uppercase mb-1 drop-shadow-sm">
                                {previewingSkin ? <span className="text-amber-500">SKIN: {previewingSkin.name}</span> : stats.name}
                              </h4>
                              <p className="text-[9px] text-zinc-400 mb-2 leading-relaxed">
                                {previewingSkin ? `Camuflagem exlusiva para ${stats.name}. Adiciona efeitos visuais incríveis no modo de tiro.` : stats.desc}
                              </p>

                              {/* STATS */}
                              <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono bg-black/40 p-2 rounded border border-zinc-900/50 mb-3 shrink-0">
                                <div className="flex justify-between">
                                  <span className="text-zinc-600">DANO:</span>
                                  <span className="text-zinc-400">{stats.damage}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-600">VEL DISP:</span>
                                  <span className="text-zinc-400 font-bold">{stats.fireRate}s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-600">CAPAC.:</span>
                                  <span className="text-zinc-400">{stats.ammoMax} RD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-600">MANUSEIO:</span>
                                  <span className="text-zinc-400">{stats.handed === "one" ? "1 MÃO" : "2 MÃOS"}</span>
                                </div>
                              </div>

                              {/* ADQUIRIR BUTTON */}
                              {previewingSkin ? (
                                // SKINS BUTTON LOGIC
                                (() => {
                                   const isSkinPurchased = inventoryRef.current.purchasedSkins.includes(previewingSkin.id);
                                   if (!isSkinPurchased) {
                                      return (
                                        <button
                                          onClick={() => {
                                            if (isPaid) {
                                              inventoryRef.current.purchasedSkins.push(previewingSkin.id);
                                              updateInv();
                                            }
                                          }}
                                          disabled={!isPaid}
                                          className={`w-full py-1.5 rounded font-mono text-[9px] font-bold tracking-widest uppercase transition-all shadow-lg shrink-0 ${
                                            isPaid
                                              ? "bg-amber-600 text-black hover:bg-amber-500 shadow-amber-900/50"
                                              : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800/20"
                                          }`}
                                        >
                                          {isPaid ? "RESGATAR SKIN (GRÁTIS)" : "COMPRE A ARMA PRIMEIRO"}
                                        </button>
                                      )
                                   } else {
                                      return (
                                        <button
                                          onClick={() => {
                                            const isEquipped = inventoryRef.current.equippedSkins[stats.id] === previewingSkin.id;
                                            if (isEquipped) {
                                              delete inventoryRef.current.equippedSkins[stats.id];
                                            } else {
                                              inventoryRef.current.equippedSkins[stats.id] = previewingSkin.id;
                                            }
                                            updateInv();
                                          }}
                                          className="w-full py-1.5 shrink-0 bg-zinc-850 hover:bg-zinc-800 text-amber-500 font-mono text-[9px] font-bold tracking-widest uppercase rounded transition-all border border-amber-900/50 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                                        >
                                          {inventoryRef.current.equippedSkins[stats.id] === previewingSkin.id ? "DESEQUIPAR SKIN" : "EQUIPAR SKIN"}
                                        </button>
                                      )
                                   }
                                })()
                              ) : (
                                // WEAPON BUTTON LOGIC
                                !isPaid ? (
                                  <button
                                    onClick={() => purchaseWeapon(stats.id)}
                                    disabled={!(!waveRef.current.mode || credits >= stats.cost)}
                                    className={`w-full py-1.5 shrink-0 rounded font-mono text-[9px] font-bold tracking-widest uppercase transition-all shadow-lg ${
                                      (!waveRef.current.mode || credits >= stats.cost)
                                        ? "bg-emerald-600 text-black hover:bg-emerald-500 shadow-emerald-900/50"
                                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800/20"
                                    }`}
                                  >
                                    Adquirir Arma ({!waveRef.current.mode ? "GRÁTIS" : `${stats.cost} Cr`})
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const success = deliverToBackpack(stats.id);
                                      const msgEl = document.getElementById("shop-msg");
                                      if (success) {
                                        if (msgEl) { msgEl.innerText = "ENVIADO PARA MOCHILA!"; setTimeout(() => { if (msgEl) msgEl.innerText = ""; }, 1500); }
                                      } else {
                                        if (msgEl) { msgEl.innerText = "MOCHILA CHEIA!"; setTimeout(() => { if (msgEl) msgEl.innerText = ""; }, 1500); }
                                      }
                                    }}
                                    className="w-full py-1.5 shrink-0 bg-zinc-850 hover:bg-zinc-800 text-emerald-555 font-mono text-[9px] font-bold tracking-widest uppercase rounded transition-all border border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                  >
                                    Enviar p/ Mochila
                                  </button>
                                )
                              )}
                              <div id="shop-msg" className="text-center font-mono text-[8px] text-amber-500 font-bold mt-1 h-2 shrink-0"></div>
                            </div>

                            {/* SKINS LIST AT BOTTOM */}
                            <div className="border-t border-zinc-900 pt-2 shrink-0">
                                <h4 className="text-[9px] font-bold tracking-wide text-zinc-500 uppercase mb-1.5">
                                  {weaponSkins.length > 0 ? "CAMUFLAGENS DA ARMA" : "NENHUMA CAMUFLAGEM"}
                                </h4>
                                {weaponSkins.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                    <button 
                                       onClick={() => setSelectedShopSkinId(null)}
                                       className={`shrink-0 w-20 h-14 bg-black/40 border rounded-lg p-1 flex flex-col items-center justify-center transition-all ${!previewingSkin ? "border-emerald-500/50 bg-emerald-900/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "border-zinc-900 hover:border-zinc-700"}`}
                                    >
                                       <span className="text-[7.5px] font-mono font-bold text-zinc-400">PADRÃO</span>
                                    </button>
                                    {weaponSkins.map(skin => {
                                      const isViewingThis = selectedShopSkinId === skin.id;
                                      return (
                                        <button 
                                           key={skin.id}
                                           onClick={() => setSelectedShopSkinId(skin.id)}
                                           className={`shrink-0 w-24 h-14 bg-black/40 border rounded-lg p-1 flex items-center justify-center relative overflow-hidden transition-all group ${isViewingThis ? "border-amber-500/50 bg-amber-900/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]" : "border-zinc-900 hover:border-zinc-700"}`}
                                        >
                                           <img src={skin.url} alt={skin.name} className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_4px_rgba(251,191,36,0.3)] transform group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: "pixelated" }} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}

                {shopTab === "upgrades" && (
                  <div className="col-span-12 flex flex-col gap-3 h-[400px] overflow-y-auto custom-scrollbar relative">
                    {/* Weapons list for upgrades */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                      {[
                        { id: "pistola", name: "Pistola Tática" },
                        { id: "gun", name: "M4 Carbine" },
                        { id: "uzi", name: "Micro Uzi" },
                        { id: "doze", name: "Pump Shotgun" },
                        { id: "basuca", name: "RPG-7 Rocket" },
                        { id: "rifle", name: "Sniper Bolt" },
                        { id: "magnum", name: "Magnum .357" }
                      ].map((w) => {
                        const isOwned = purchasedWeaponIds.includes(w.id);
                        const details = WEAPONS_DETAILS[w.id];
                        const themeColor = details?.color || "#fff";
                        
                        return (
                          <div 
                            key={w.id}
                            onClick={() => {
                              if (isOwned) {
                                setSelectedWeaponForUpgrade(w.id);
                              }
                            }}
                            className={`relative border p-3 rounded-xl flex flex-col items-center justify-between gap-3 transition-all ${
                              isOwned 
                                ? "bg-zinc-950/80 border-zinc-800 hover:border-zinc-500 hover:-translate-y-0.5 cursor-pointer shadow-md" 
                                : "bg-zinc-950/20 border-zinc-950/40 opacity-40 filter grayscale cursor-not-allowed"
                            }`}
                            style={{
                              boxShadow: isOwned ? `0 4px 6px rgba(0,0,0,0.5), inset 0 0 10px ${themeColor}10` : "none"
                            }}
                          >
                            <div className="w-full flex justify-between items-center text-[8px] font-mono text-zinc-500">
                              <span>MODEL: {w.id.toUpperCase()}</span>
                              <span className={`font-bold ${isOwned ? "text-emerald-500" : "text-zinc-650"}`}>
                                {isOwned ? "ADQUIRIDA" : "BLOQUEADA"}
                              </span>
                            </div>

                            <div className="h-12 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                              <RenderWeaponIcon type={w.id} color={themeColor} />
                            </div>

                            <div className="text-center">
                              <div className="text-[10px] font-extrabold text-white tracking-wider uppercase">{w.name}</div>
                              <div className="text-[7.5px] font-mono text-zinc-500 mt-0.5">
                                {isOwned ? "CLIQUE PARA MELHORAR" : "REQUER COMPRA NA LOJA"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Weapon Specific Upgrades Modal overlay */}
                    {selectedWeaponForUpgrade && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-2xl animate-in fade-in duration-200">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 relative">
                          {/* Close button */}
                          <button 
                            onClick={() => setSelectedWeaponForUpgrade(null)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors font-mono text-xs p-1"
                          >
                            [X] FECHAR
                          </button>

                          {/* Weapon details header */}
                          <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-1">
                            <div className="w-12 h-12 flex items-center justify-center bg-zinc-900/50 border border-zinc-800/40 rounded-lg shrink-0">
                              <RenderWeaponIcon type={selectedWeaponForUpgrade} color={WEAPONS_DETAILS[selectedWeaponForUpgrade]?.color} />
                            </div>
                            <div>
                              <h3 className="text-xs font-black text-white tracking-widest uppercase">
                                {WEAPONS_DETAILS[selectedWeaponForUpgrade]?.name}
                              </h3>
                              <p className="text-[8px] text-zinc-500 font-mono tracking-wider">UPGRADE STATION / PARÂMETROS ESPECÍFICOS</p>
                            </div>
                          </div>

                          {/* Upgrades grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                            {[
                              { key: "damage", name: "Dano Físico", desc: "Aumenta a potência dos projéteis em 15% por nível." },
                              { key: "fireRate", name: "Velocidade de Disparo", desc: "Aumenta a cadência de tiro em 12% por nível." },
                              { key: "stability", name: "Estabilidade do Coice", desc: "Reduz o recuo/coice da arma em 15% por nível." },
                              { key: "accuracy", name: "Precisão dos Disparos", desc: "Reduz a dispersão dos projéteis em 15% por nível." },
                              { key: "capacity", name: "Capacidade do Carregador", desc: "Aumenta a munição máxima em 15% por nível." },
                              { key: "reloadSpeed", name: "Velocidade de Recarga", desc: "Reduz o tempo de recarga em 15% por nível." },
                              { key: "range", name: "Alcance Efetivo", desc: "Aumenta o alcance e vida útil do projétil em 15% por nível." },
                            ].map((item) => {
                              const weaponUpgrades = upgrades[selectedWeaponForUpgrade] || { damage: 0, fireRate: 0, stability: 0, accuracy: 0, capacity: 0, reloadSpeed: 0, range: 0 };
                              const lvl = weaponUpgrades[item.key] || 0;
                              const isMax = lvl >= 5;
                              const cost = isMax ? 0 : Math.round(50 * Math.pow(1.8, lvl));
                              
                              return (
                                <div key={item.key} className="bg-black/40 border border-zinc-900/60 rounded-xl p-2.5 flex flex-col justify-between gap-2">
                                  <div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-zinc-200 text-[9px] font-bold font-mono tracking-wider uppercase">{item.name}</span>
                                      <span className="text-[8px] font-mono font-bold text-amber-500 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30">
                                        {isMax ? "MÁX" : `${lvl}/5`}
                                      </span>
                                    </div>
                                    <p className="text-[7.5px] text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                  </div>
                                  
                                  {/* Progress bars */}
                                  <div className="flex gap-1 my-0.5">
                                    {[1, 2, 3, 4, 5].map((idx) => (
                                      <div
                                        key={idx}
                                        className={`h-1 flex-1 rounded-sm transition-all ${
                                          idx <= lvl ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" : "bg-zinc-900"
                                        }`}
                                      />
                                    ))}
                                  </div>

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
                                    className={`w-full py-1 font-mono text-[7.5px] font-bold tracking-widest uppercase transition-all rounded ${
                                      isMax
                                        ? "bg-zinc-900 text-zinc-650 cursor-not-allowed"
                                        : (!waveRef.current.mode || credits >= cost)
                                          ? "bg-amber-600 text-black hover:bg-amber-500 shadow-md cursor-pointer"
                                          : "bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed"
                                    }`}
                                  >
                                    {isMax ? "MÁXIMO" : `Melhorar (${!waveRef.current.mode ? "GRÁTIS" : `${cost} Cr`})`}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {shopTab === "skins" && (
                  <div className="col-span-12 flex flex-col items-center justify-center h-[400px] border border-dashed border-zinc-800 rounded-2xl bg-black/40">
                    <svg className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    <span className="text-zinc-500 font-mono text-[10px] tracking-[0.2em] font-bold uppercase mb-1">
                      SEÇÃO BLOQUEADA
                    </span>
                    <span className="text-zinc-600 text-[8px] max-w-xs text-center font-mono leading-relaxed">
                      Seção visual de Skins vazia para implementação futura.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outfits Overlay */}
        {isOutfitsOpen && (
          <div className="absolute inset-0 z-[60] pointer-events-auto flex items-center justify-center bg-black/65 backdrop-blur-md">
            <div className="bg-zinc-950/98 backdrop-blur-md border border-blue-900/30 rounded-xl p-6 w-[600px] max-w-[90vw] max-h-[90vh] shadow-2xl shadow-black relative flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-blue-400 font-bold">
                    SELECIONAR TRAJE TÁTICO
                  </span>
                </div>
                <button
                  onClick={() => setIsOutfitsOpen(false)}
                  className="text-white/20 hover:text-white transition-colors p-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 w-full max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                 {availableSkins.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setSelectedSkinId(skin.id)}
                    className={`relative group overflow-hidden h-28 rounded-lg border flex flex-col items-start justify-end p-3 transition-all ${selectedSkinId === skin.id ? "border-blue-500 bg-blue-950/20" : "border-white/5 bg-black/60 hover:bg-white/5 hover:border-white/20"}`}
                  >
                    {skin.imgUrl ? (
                      <img src={skin.imgUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity filter grayscale group-hover:grayscale-0" style={{ imageRendering: "pixelated" }} />
                    ) : null}
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-opacity -mr-10 -mt-10 ${selectedSkinId === skin.id ? "opacity-40" : "opacity-0 group-hover:opacity-20"}`}
                      style={{ backgroundColor: skin.colorMain }}
                    ></div>
                    {selectedSkinId === skin.id && (
                      <div className="absolute top-2 right-2 flex items-center justify-center text-blue-500 animate-pulse">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                    <div className="relative z-10 w-full text-left">
                      <h3 className={`text-xs font-black tracking-widest uppercase mb-0.5 transition-colors ${selectedSkinId === skin.id ? "text-blue-400" : "text-white"}`}>{skin.name}</h3>
                      <p className="text-[9px] text-white/50 tracking-wider font-mono truncate">{skin.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Overlay */}
        {isInventoryOpen && (
          <div className="absolute top-[100px] left-6 z-50 pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 w-[650px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
              <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 animate-pulse rounded-sm" />
                  <span className="text-xs font-mono tracking-[0.2em] text-white/50">
                    MOCHILA TÁTICA
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-emerald-500">
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
                        className={`aspect-square bg-black/80 border ${selectedBackpackSlot === i ? "border-emerald-500" : "border-white/5"} rounded-lg flex flex-col p-1.5 shadow-inner hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer relative group`}
                      >
                        <div className="absolute top-1 left-1.5 text-[8px] font-mono text-white/20 font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="absolute top-1.5 right-1.5 w-1 h-1 border border-white/10 group-hover:border-emerald-500/50 transition-colors" />

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
                            <span className="text-emerald-400 font-bold text-sm tracking-wide uppercase">
                              {stats.name}
                            </span>
                            <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleToHotbar(selectedBackpackSlot);
                               }}
                               className="text-[9px] font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-black px-2 py-1 rounded transition-colors"
                            >
                              EQUIPAR ARMA
                            </button>
                          </div>
                          <p className="text-[10px] text-white/60 mb-3 leading-relaxed">
                            {stats.desc}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4">
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">DANO</span>
                              <span className="text-white/90">{stats.damage}</span>
                            </div>
                            <div className="flex justify-between bg-black/40 px-2 py-1.5 rounded">
                              <span className="text-white/40">DISP</span>
                              <span className="text-emerald-400 font-bold">
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
                                <div className="border-t border-emerald-500/20 pt-3 flex-1 flex items-center justify-center text-[9px] text-white/30 text-center font-mono">
                                  NENHUMA SKIN ADQUIRIDA
                                </div>
                            );
                            return (
                              <div className="border-t border-emerald-500/20 pt-3 flex-1 flex flex-col">
                                <span className="text-[9px] font-mono text-emerald-500 mb-2 block font-bold tracking-wider">SKINS ADQUIRIDAS:</span>
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
              </div>
            </div>
          </div>
        )}

        <div
          id="ui-hotbar"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-opacity duration-300"
        >
          <div className="flex gap-2">
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

        {/* Settings Gear Button beside Radar */}
        <div
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="absolute top-[30px] right-[210px] z-[45] pointer-events-auto bg-black/80 border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:bg-white/5 h-12 w-12 rounded-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95"
          title="Configurações de Mira"
        >
          <Settings 
            className="w-5 h-5 text-white/50 group-hover:text-emerald-400 group-hover:rotate-90 transition-transform duration-500" 
          />
        </div>

        {/* Sliding Holographic Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-[30px] right-[275px] z-[45] pointer-events-auto w-[320px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-inner shadow-black/80 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-250"
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

              <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[8px] font-mono text-white/20 tracking-wider">
                <span>SYSTEM PARAMETERS: REGULAR</span>
                <span>v1.2-ALPHA</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Mobile Controls Overlay */}
      {gameState === "PLAYING" && (isMobile || showMobileControls) && (
        <div className="absolute inset-0 z-30 pointer-events-none select-none">
          {/* Movement Joystick Area (Left Side) */}
          <div 
            className="absolute bottom-12 left-12 w-40 h-40 bg-zinc-950/20 border border-white/5 rounded-full flex items-center justify-center pointer-events-auto"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          >
            {joystickStart && (
              <div 
                className="absolute w-20 h-20 bg-white/10 border border-white/30 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  transform: `translate(${Math.min(50, Math.max(-50, (joystickCurrent?.x ?? 0) - joystickStart.x))}px, ${Math.min(50, Math.max(-50, (joystickCurrent?.y ?? 0) - joystickStart.y))}px)`
                }}
              >
                <div className="w-8 h-8 bg-red-500/30 border border-red-500/60 rounded-full" />
              </div>
            )}
            {!joystickStart && (
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">MOVE</span>
              </div>
            )}
          </div>

          {/* Action Buttons Area (Right Side) */}
          <div className="absolute bottom-12 right-12 flex flex-col gap-4 items-end pointer-events-auto">
            {/* Dodge/Roll Button */}
            <button
              onTouchStart={() => {
                keys.space = true;
              }}
              onTouchEnd={() => {
                keys.space = false;
              }}
              className="w-16 h-16 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-400 font-mono text-xs font-black shadow-lg active:scale-90 active:bg-blue-900/65 flex items-center justify-center transition-all uppercase tracking-wider"
            >
              ROLL
            </button>

            <div className="flex gap-4">
              {/* Aim/ADS Toggle Button */}
              <button
                onTouchStart={() => {
                  (window as any).mobileAimActive = true;
                }}
                onTouchEnd={() => {
                  (window as any).mobileAimActive = false;
                }}
                className="w-16 h-16 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-400 font-mono text-xs font-black shadow-lg active:scale-90 active:bg-amber-900/65 flex items-center justify-center transition-all uppercase tracking-wider"
              >
                AIM
              </button>

              {/* Fire/Shoot Button */}
              <button
                onTouchStart={() => {
                  (window as any).mobileShootActive = true;
                }}
                onTouchEnd={() => {
                  (window as any).mobileShootActive = false;
                }}
                className="w-20 h-20 rounded-full bg-red-950/80 border border-red-500/40 text-red-500 font-mono text-sm font-black shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95 active:bg-red-900/70 flex items-center justify-center transition-all uppercase tracking-widest"
              >
                FIRE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
