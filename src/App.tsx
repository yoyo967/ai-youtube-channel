import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  FileCheck,
  Smartphone
} from 'lucide-react';

// ==========================================
// COLOR CONFIGURATION (MATCHING REQUIREMENT)
// ==========================================
// --bg: #07111f
// --panel: #0d1b2d
// --agent: #f4a340 (Amber)
// --cyan: #35d7ff
// --tool: #7590a8
// --error: #ef5b5b (Red)
// --warning: #ffd166 (Yellow)
// --success: #43d17a (Green)
// --text: #eef6ff
// --muted: #8fa5bb

const COLORS = {
  bg: '#07111f',
  panel: '#0d1b2d',
  agent: '#f4a340',
  cyan: '#35d7ff',
  tool: '#7590a8',
  error: '#ef5b5b',
  warning: '#ffd166',
  success: '#43d17a',
  text: '#eef6ff',
  muted: '#8fa5bb',
};

// ==========================================
// CUE POINTS & TIMELINE SEGMENTS
// ==========================================
interface CuePoint {
  time: number;
  id: string;
  title: string;
  germanTitle: string;
  voiceover: string;
  description: string;
}

const CUE_POINTS: CuePoint[] = [
  { 
    time: 0, 
    id: 'hook', 
    title: 'Hook & Goal', 
    germanTitle: 'Hook & Ziel',
    voiceover: 'Why does an AI agent sometimes repeat the exact same tool call?',
    description: 'Agent Core activated, task goal established at top. First request begins.'
  },
  { 
    time: 4, 
    id: 'tool-call-arrives', 
    title: 'First Tool Call', 
    germanTitle: 'Erster Tool-Aufruf',
    voiceover: 'You might think it is ignoring the result.',
    description: 'Request reaches Tool node. Tool node processes and activates.'
  },
  { 
    time: 8, 
    id: 'first-state', 
    title: 'First Response', 
    germanTitle: 'Erste Antwort',
    voiceover: 'But in reality, the agent may be receiving almost the same state after every attempt.',
    description: 'Incomplete/unchanged Red State block is returned to the agent.'
  },
  { 
    time: 13, 
    id: 'same-state', 
    title: 'Unchanged State', 
    germanTitle: 'Gleicher Zustand',
    voiceover: 'The model sees the goal, selects a tool, receives an unchanged state...',
    description: 'Identical overlay state compared. "NO NEW STATE" warning displays.'
  },
  { 
    time: 18, 
    id: 'retry', 
    title: 'Retry Action', 
    germanTitle: 'Erneuter Tool Call',
    voiceover: '...and decides to try again, repeating the exact request.',
    description: 'Agent triggers identical Tool request. Red "RETRY" label is visible.'
  },
  { 
    time: 23, 
    id: 'loop', 
    title: 'Loop Patterns', 
    germanTitle: 'Loop wird sichtbar',
    voiceover: 'Without new information, the execution loop continues indefinitely.',
    description: 'Second identical Red State returns. Circular loop path highlights.'
  },
  { 
    time: 28, 
    id: 'stop-condition', 
    title: 'Stop Gate Enforced', 
    germanTitle: 'Korrigierte Verarbeitung',
    voiceover: 'The agent is not stubborn or conscious. It is following the exact workflow it was given.',
    description: 'Loop halts. Yellow STOP CONDITION Gate is established to prevent infinite cycling.'
  },
  { 
    time: 33, 
    id: 'solution', 
    title: 'Updated State / Success', 
    germanTitle: 'Lösung',
    voiceover: 'The real fix is updated state, better tool feedback, and a defined exit condition.',
    description: 'Tool returns Green UPDATED STATE. Stop Gate opens, granting success exit path.'
  },
  { 
    time: 38, 
    id: 'final-hold', 
    title: 'Final Hold', 
    germanTitle: 'Finaler Hold',
    voiceover: 'Ensure correct validation to let agents finish successfully.',
    description: 'Stable final holds. TASK COMPLETE. Perfect for voiceover wrap.'
  }
];

const TOTAL_DURATION = 40; // Exact 40 seconds

// ==========================================
// EASING FUNCTION (CUBIC EASE IN OUT)
// ==========================================
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function App() {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'voiceover'>('voiceover');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setCurrentTime(0);
      } else if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        setIsRecordingMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Frame tick simulation
  useEffect(() => {
    if (isPlaying) {
      const tick = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = (now - lastTimeRef.current) / 1000;
          setCurrentTime(prev => {
            const next = prev + delta * playbackRate;
            if (next >= TOTAL_DURATION) {
              setIsPlaying(false);
              return TOTAL_DURATION;
            }
            return next;
          });
        }
        lastTimeRef.current = now;
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      lastTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackRate]);

  // Audio syntheziser trigger helper (for authentic high-fidelity UX clicks and bleeps)
  const playBeep = (freq: number, type: 'sine' | 'square' | 'triangle' = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Audio synthesizer error:', e);
    }
  };

  // Play audio trigger based on second marks
  const lastSecondRef = useRef<number>(-1);
  useEffect(() => {
    const floorSec = Math.floor(currentTime);
    if (floorSec !== lastSecondRef.current) {
      lastSecondRef.current = floorSec;
      
      // Emit trigger sounds on interesting cues
      if (floorSec === 0) {
        playBeep(440, 'triangle', 0.25); // Start chime
      } else if (floorSec === 4) {
        playBeep(659.25, 'sine', 0.15); // Request hit tool
      } else if (floorSec === 8) {
        playBeep(329.63, 'square', 0.2); // Error response sound
      } else if (floorSec === 13) {
        playBeep(220, 'square', 0.3); // Duplicate comparison error sound
      } else if (floorSec === 18) {
        playBeep(587.33, 'sine', 0.12); // Retry signal
      } else if (floorSec === 23) {
        playBeep(220, 'square', 0.4); // Loop alert
      } else if (floorSec === 28) {
        playBeep(392, 'triangle', 0.15); // Gate close yellow chime
      } else if (floorSec === 33) {
        playBeep(523.25, 'sine', 0.2); // Gate success release
      } else if (floorSec === 35) {
        playBeep(880, 'sine', 0.4); // Task complete double chime
        setTimeout(() => playBeep(1109.73, 'sine', 0.5), 150);
      }
    }
  }, [currentTime, soundEnabled]);

  // Current active Cue Point
  const currentCue = useMemo(() => {
    let active = CUE_POINTS[0];
    for (let i = CUE_POINTS.length - 1; i >= 0; i--) {
      if (currentTime >= CUE_POINTS[i].time) {
        active = CUE_POINTS[i];
        break;
      }
    }
    return active;
  }, [currentTime]);

  // ===================================================
  // COMPUTED ANIMATION PARAMS (Central render function)
  // ===================================================
  const anim = useMemo(() => {
    const t = currentTime;
    
    // 1. Agent Core Geometry & Pulse
    let agentScale = 1.0;
    let agentColor = COLORS.agent;
    let agentGlow = 'rgba(244, 163, 64, 0.25)';
    let agentSubtext = 'STANDBY';
    let agentOutlinePulse = false;

    if (t >= 0 && t < 4.0) {
      agentSubtext = 'GOAL ANALYSIS';
      // Pulse gently in early state
      if (t >= 0.5 && t < 2.0) {
        const p = (t - 0.5) / 1.5;
        const eased = easeInOutCubic(p);
        agentScale = 1.0 + Math.sin(eased * Math.PI) * 0.1;
        agentGlow = `rgba(244, 163, 64, ${0.25 + Math.sin(eased * Math.PI) * 0.35})`;
      }
    } else if (t >= 4.0 && t < 8.0) {
      agentSubtext = 'AWAITING REQ_01';
    } else if (t >= 8.0 && t < 13.0) {
      agentSubtext = 'INPUT RECEIVED';
      // Pulses red on arrival at 11.5
      if (t >= 11.0 && t < 12.8) {
        const p = (t - 11.0) / 1.8;
        const eased = easeInOutCubic(p);
        agentScale = 1.0 + Math.sin(eased * Math.PI) * 0.15;
        agentColor = COLORS.error; // error red
        agentGlow = `rgba(239, 91, 91, ${0.3 + Math.sin(eased * Math.PI) * 0.5})`;
        agentOutlinePulse = true;
      }
    } else if (t >= 13.0 && t < 18.0) {
      agentSubtext = 'VALIDATING STATE';
      agentColor = COLORS.error; // hold state red
      agentGlow = 'rgba(239, 91, 91, 0.25)';
    } else if (t >= 18.0 && t < 23.0) {
      agentSubtext = 'SUBMITTING RETRY';
      agentColor = COLORS.agent; // amber during retry triggers
      if (t >= 18.0 && t < 19.8) {
        const p = (t - 18.0) / 1.8;
        const eased = easeInOutCubic(p);
        agentScale = 1.0 + Math.sin(eased * Math.PI) * 0.12;
        agentGlow = `rgba(244, 163, 64, ${0.25 + Math.sin(eased * Math.PI) * 0.3})`;
      }
    } else if (t >= 23.0 && t < 28.0) {
      agentSubtext = 'STUCK IN LOOP';
      agentColor = COLORS.error;
      agentGlow = 'rgba(239, 91, 91, 0.4)';
      // Pulsing loop alert
      const loopPulse = (t - 23.0) % 1.5;
      const eased = easeInOutCubic(loopPulse / 1.5);
      agentScale = 1.0 + Math.sin(eased * Math.PI) * 0.08;
    } else if (t >= 28.0 && t < 33.0) {
      agentSubtext = 'RE-EVALUATING';
      agentColor = COLORS.warning; // Yellow/Warning state
      agentGlow = 'rgba(255, 209, 102, 0.25)';
    } else if (t >= 33.0 && t <= 40.0) {
      agentSubtext = 'STATE COMPLETED';
      agentColor = COLORS.success; // success green
      if (t >= 33.0 && t < 35.0) {
        const p = (t - 33.0) / 2.0;
        const eased = easeInOutCubic(p);
        agentScale = 1.0 + Math.sin(eased * Math.PI) * 0.18;
      }
      agentGlow = 'rgba(67, 209, 122, 0.45)';
    }

    // 2. Request dot flow paths
    // Request 1: t = 1.0 -> 4.0
    let req1Active = false;
    let req1Pos = 0;
    if (t >= 1.0 && t < 4.0) {
      req1Active = true;
      req1Pos = (t - 1.0) / 3.0; // linear flow
    }

    // Request 2 (Retry): t = 18.0 -> 20.5
    let req2Active = false;
    let req2Pos = 0;
    if (t >= 18.0 && t < 20.5) {
      req2Active = true;
      req2Pos = (t - 18.0) / 2.5;
    }

    // Request 3 (Solution check): t = 29.0 -> 30.5
    let req3Active = false;
    let req3Pos = 0;
    if (t >= 29.0 && t < 30.5) {
      req3Active = true;
      req3Pos = (t - 29.0) / 1.5;
    }

    // 3. Tool node activity states
    let toolScale = 1.0;
    let toolColor = COLORS.tool; // default steel blue
    let toolGlow = 'rgba(117, 144, 168, 0.2)';
    let toolStatus = 'STANDBY';

    if (t >= 4.0 && t < 5.5) {
      // Flashing active cyan for tool run 1
      const p = (t - 4.0) / 1.5;
      const eased = easeInOutCubic(p);
      toolScale = 1.0 + Math.sin(eased * Math.PI) * 0.15;
      toolColor = COLORS.cyan;
      toolGlow = `rgba(53, 215, 255, ${0.3 + Math.sin(eased * Math.PI) * 0.5})`;
      toolStatus = 'RUNNING...';
    } else if (t >= 5.5 && t < 8.0) {
      toolStatus = 'UPDATING STATE';
    } else if (t >= 20.5 && t < 22.0) {
      // Tool call 2
      const p = (t - 20.5) / 1.5;
      const eased = easeInOutCubic(p);
      toolScale = 1.0 + Math.sin(eased * Math.PI) * 0.15;
      toolColor = COLORS.cyan;
      toolGlow = `rgba(53, 215, 255, ${0.3 + Math.sin(eased * Math.PI) * 0.5})`;
      toolStatus = 'RUNNING RETRY...';
    } else if (t >= 22.0 && t < 23.0) {
      toolStatus = 'UPDATING STATE';
    } else if (t >= 30.5 && t < 32.2) {
      // Successful tool update
      const p = (t - 30.5) / 1.7;
      const eased = easeInOutCubic(p);
      toolScale = 1.0 + Math.sin(eased * Math.PI) * 0.18;
      toolColor = COLORS.success;
      toolGlow = `rgba(67, 209, 122, ${0.3 + Math.sin(eased * Math.PI) * 0.5})`;
      toolStatus = 'RETURNING FEEDBACK';
    } else if (t >= 32.2) {
      toolColor = COLORS.success;
      toolStatus = 'STRENGTHENED';
    }

    // 4. State blocks (Representing the returned values)
    // Response State 1 (Red/Incomplete): created at Tool (840) at 8.0, moves to Agent (240) at 11.5
    let state1Active = false;
    let state1Pos = 0;
    if (t >= 8.0 && t < 11.5) {
      state1Active = true;
      state1Pos = (t - 8.0) / 3.5;
    }
    let state1InAgent = (t >= 11.5 && t < 28.0);

    // Overlay State 1.5 (Fades directly inside agent at 13.0 to emphasize "NO NEW STATE")
    let state1_5Active = false;
    let state1_5Opacity = 0;
    if (t >= 13.0 && t < 18.0) {
      state1_5Active = true;
      state1_5Opacity = Math.min(1.0, (t - 13.0) / 1.2);
    }

    // Response State 2 (Second Red/Incomplete identical state): created at 23.0, moves to Agent at 26.5
    let state2Active = false;
    let state2Pos = 0;
    if (t >= 23.0 && t < 26.5) {
      state2Active = true;
      state2Pos = (t - 23.0) / 3.5;
    }
    let state2InAgent = (t >= 26.5 && t < 28.0);

    // Response State 3 (Green/Complete updated state): created at 31.0, moves to Agent at 33.5
    let state3Active = false;
    let state3Pos = 0;
    if (t >= 31.0 && t < 33.5) {
      state3Active = true;
      state3Pos = (t - 31.0) / 2.5;
    }
    let state3InAgent = (t >= 33.5);

    // 5. Middle Explanatory Overlay Labels
    let middleLabel = '';
    let middleLabelColor = COLORS.muted;
    let middleLabelOpacity = 0;

    if (t >= 1.0 && t < 3.8) {
      middleLabel = 'DISPATCHING REQ_01';
      middleLabelColor = COLORS.cyan;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 1.0) / 2.8) * Math.PI));
    } else if (t >= 8.5 && t < 11.2) {
      middleLabel = 'RETURNING SYSTEM STATE';
      middleLabelColor = COLORS.error;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 8.5) / 2.7) * Math.PI));
    } else if (t >= 13.0 && t < 17.5) {
      middleLabel = 'NO NEW STATE DETECTED';
      middleLabelColor = COLORS.error;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 13.0) / 4.5) * Math.PI));
    } else if (t >= 18.5 && t < 20.8) {
      middleLabel = 'SUBMITTING DUPLICATE CALL';
      middleLabelColor = COLORS.cyan;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 18.5) / 2.3) * Math.PI));
    } else if (t >= 23.2 && t < 27.5) {
      middleLabel = 'STUCK IN INFINITE LOOP';
      middleLabelColor = COLORS.error;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 23.2) / 4.3) * Math.PI));
    } else if (t >= 28.5 && t < 32.5) {
      middleLabel = 'ENFORCING EXIT LIMITS';
      middleLabelColor = COLORS.warning;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 28.5) / 4.0) * Math.PI));
    } else if (t >= 33.8 && t < 37.8) {
      middleLabel = 'TASK SATISFIED';
      middleLabelColor = COLORS.success;
      middleLabelOpacity = Math.min(1.0, Math.sin(((t - 33.8) / 4.0) * Math.PI));
    }

    // 6. Stop Gate Checkpoint Barrier (at x = 540, y = 820)
    let stopGateVisible = (t >= 28.0);
    let stopGateOpenProgress = 0; // 0 = closed, 1 = fully open
    if (t >= 33.0) {
      stopGateOpenProgress = Math.min(1.0, (t - 33.0) / 1.5);
    }

    // 7. Retry feedback path (The Loop)
    let retryPathOpacity = 0.08; // default subtle background line
    if (t >= 13.0 && t < 28.0) {
      retryPathOpacity = 0.75; // highlights red during active loop
    } else if (t >= 28.0) {
      retryPathOpacity = 0.12; // dimmed out
    }
    let retryLabelVisible = (t >= 13.0 && t < 28.0);

    // 8. Bottom Final Exit Path & Task Complete block
    let exitPathDrawProgress = 0;
    if (t >= 33.5) {
      exitPathDrawProgress = Math.min(1.0, (t - 33.5) / 1.5);
    }
    let exitBlockVisible = (t >= 34.5);
    let exitBlockGlow = 0;
    if (t >= 34.5) {
      exitBlockGlow = Math.min(1.0, (t - 34.5) / 1.5);
    }

    return {
      agentScale,
      agentColor,
      agentGlow,
      agentSubtext,
      agentOutlinePulse,
      toolScale,
      toolColor,
      toolGlow,
      toolStatus,
      req1Active,
      req1Pos,
      req2Active,
      req2Pos,
      req3Active,
      req3Pos,
      state1Active,
      state1Pos,
      state1InAgent,
      state1_5Active,
      state1_5Opacity,
      state2Active,
      state2Pos,
      state2InAgent,
      state3Active,
      state3Pos,
      state3InAgent,
      middleLabel,
      middleLabelColor,
      middleLabelOpacity,
      stopGateVisible,
      stopGateOpenProgress,
      retryPathOpacity,
      retryLabelVisible,
      exitPathDrawProgress,
      exitBlockVisible,
      exitBlockGlow,
    };
  }, [currentTime]);

  // Jump helper
  const jumpTo = (time: number) => {
    setCurrentTime(time);
    playBeep(523.25, 'sine', 0.08); // Jump indicator click
  };

  return (
    <div className="min-h-screen bg-[#030811] text-[#eef6ff] flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR CONTROLS (HIDDEN DURING RECORDING MODE) */}
      {/* ========================================================= */}
      {!isRecordingMode && (
        <div className="w-full md:w-96 bg-[#09101d] border-r border-[#1a2638] flex flex-col shrink-0 select-none overflow-y-auto">
          
          {/* Header & Logo */}
          <div className="p-5 border-b border-[#1a2638] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#f4a340] flex items-center justify-center text-[#07111f] font-bold text-sm tracking-tighter">
                AI
              </div>
              <div>
                <h1 className="font-semibold text-sm tracking-tight text-[#eef6ff]">
                  Agent Short Builder
                </h1>
                <p className="text-[10px] text-[#8fa5bb] tracking-wide uppercase">
                  Vite Deterministic Studio
                </p>
              </div>
            </div>
            
            {/* Audio Toggle */}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled 
                  ? 'bg-[#1e2f47] border-[#35d7ff] text-[#35d7ff]' 
                  : 'bg-[#0d1624] border-[#1e2e42] text-[#8fa5bb] hover:text-white'
              }`}
              title={soundEnabled ? "Mute Synthesizer" : "Enable Web-Audio Synth"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Quick Stats & Recording Toggles */}
          <div className="p-4 bg-[#0d1624] border-b border-[#1a2638]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium tracking-wide text-[#8fa5bb] uppercase">
                Screen Recording Mode
              </span>
              <span className="text-[10px] bg-[#ef5b5b]/10 text-[#ef5b5b] px-1.5 py-0.5 rounded font-mono">
                9:16 vertical
              </span>
            </div>
            
            <button
              onClick={() => {
                setIsRecordingMode(true);
                // Play quick sound signal
                playBeep(880, 'sine', 0.2);
              }}
              className="w-full py-2.5 px-4 bg-[#1a2638] hover:bg-[#25364e] border border-[#2c3d54] text-[#35d7ff] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            >
              <Smartphone size={14} />
              <span>Enter Capture Mode</span>
            </button>
            <p className="text-[10px] text-[#8fa5bb] mt-2 text-center">
              Press <kbd className="bg-[#1e2a3b] px-1 py-0.5 rounded text-white font-mono">ESC</kbd> or <kbd className="bg-[#1e2a3b] px-1 py-0.5 rounded text-white font-mono">H</kbd> to return anytime.
            </p>
          </div>

          {/* Main Scrubber Player */}
          <div className="p-5 border-b border-[#1a2638]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[#8fa5bb] font-mono tracking-wider">
                TIMELINE STATUS
              </span>
              <span className="text-sm font-mono font-bold text-[#35d7ff] tracking-tight">
                {currentTime.toFixed(1)}s <span className="text-[#8fa5bb]/60">/ {TOTAL_DURATION}.0s</span>
              </span>
            </div>

            {/* Scrubber slider */}
            <input 
              type="range"
              min={0}
              max={TOTAL_DURATION}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-[#121c2c] rounded-lg appearance-none cursor-pointer accent-[#35d7ff] focus:outline-none mb-4"
            />

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => jumpTo(0)}
                className="p-2.5 bg-[#0d1624] hover:bg-[#1a2638] border border-[#1e2e42] text-[#8fa5bb] hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isPlaying 
                    ? 'bg-[#ef5b5b] hover:bg-[#f26d6d] text-white' 
                    : 'bg-[#35d7ff] hover:bg-[#5cdfff] text-[#07111f]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={14} fill="currentColor" />
                    <span>PAUSE ANIMATION</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>PLAY SHORT</span>
                  </>
                )}
              </button>

              <button
                onClick={() => jumpTo(38)}
                className="p-2 bg-[#0d1624] hover:bg-[#1a2638] border border-[#1e2e42] text-[#8fa5bb] hover:text-white rounded-lg transition-colors text-xs font-mono"
                title="Jump to final frame hold"
              >
                Hold
              </button>
            </div>

            {/* Playback rate speed selector */}
            <div className="flex items-center gap-1.5 mt-3 justify-center">
              <span className="text-[10px] text-[#8fa5bb] uppercase mr-1">Speed:</span>
              {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playbackRate === rate 
                      ? 'bg-[#35d7ff]/20 text-[#35d7ff] font-semibold border border-[#35d7ff]/40' 
                      : 'bg-[#0d1624] text-[#8fa5bb] hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-[#1a2638] bg-[#0d1624] text-xs">
            <button 
              onClick={() => setActiveTab('voiceover')}
              className={`flex-1 py-3 text-center font-medium transition-colors border-b ${
                activeTab === 'voiceover' 
                  ? 'border-[#35d7ff] text-[#35d7ff] bg-[#09101d]' 
                  : 'border-transparent text-[#8fa5bb] hover:text-white'
              }`}
            >
              Voiceover Guide
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-center font-medium transition-colors border-b ${
                activeTab === 'info' 
                  ? 'border-[#35d7ff] text-[#35d7ff] bg-[#09101d]' 
                  : 'border-transparent text-[#8fa5bb] hover:text-white'
              }`}
            >
              Diagnostics
            </button>
          </div>

          {/* Sidebar Tab Panels */}
          <div className="flex-1 p-4">
            {activeTab === 'voiceover' ? (
              <div className="space-y-3.5">
                <div className="p-3 bg-[#111e2f] border border-[#1f324c] rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[#ffd166]">
                    <Sparkles size={13} />
                    <span>Live Script Teleprompter</span>
                  </div>
                  <p className="text-xs text-[#8fa5bb] leading-relaxed">
                    Read along with this script. The highlighted sentence matches the animation time exactly.
                  </p>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {CUE_POINTS.map((pt, idx) => {
                    const isActive = currentCue.id === pt.id;
                    return (
                      <div 
                        key={pt.id}
                        onClick={() => jumpTo(pt.time)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                          isActive 
                            ? 'bg-[#1b2a3d] border-[#35d7ff] text-white shadow-md shadow-black/30 scale-[1.01]' 
                            : 'bg-[#0b121f] border-[#152030] text-[#8fa5bb] hover:border-[#213247] hover:bg-[#0e1726]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono tracking-wider uppercase ${isActive ? 'text-[#35d7ff] font-bold' : 'text-[#8fa5bb]/60'}`}>
                            {pt.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-[#040912] px-1.5 py-0.5 rounded">
                            {pt.time}s
                          </span>
                        </div>
                        <p className={`text-xs ${isActive ? 'text-[#eef6ff] font-medium' : 'text-[#8fa5bb]'}`}>
                          &ldquo;{pt.voiceover}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#8fa5bb] tracking-wider uppercase">
                    ANIMATION STATE METRICS
                  </span>
                  <div className="bg-[#0b121f] rounded-lg p-3 space-y-2.5 border border-[#162131] font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8fa5bb]">Current Cue Point:</span>
                      <span className="text-[#35d7ff] font-bold">{currentCue.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8fa5bb]">Agent Status:</span>
                      <span style={{ color: anim.agentColor }} className="font-bold">
                        {anim.agentSubtext}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8fa5bb]">Tool Activity:</span>
                      <span style={{ color: anim.toolColor }} className="font-bold">
                        {anim.toolStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8fa5bb]">Gate Position:</span>
                      <span className={`${anim.stopGateVisible ? (anim.stopGateOpenProgress >= 1 ? 'text-[#43d17a]' : 'text-[#ffd166]') : 'text-slate-500'}`}>
                        {!anim.stopGateVisible ? 'NOT ACTIVE' : anim.stopGateOpenProgress >= 1 ? 'EXIT GRANTED' : 'STOP ENFORCED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8fa5bb]">Infinite Loop Danger:</span>
                      <span className={`${currentTime >= 13 && currentTime < 28 ? 'text-[#ef5b5b] font-bold animate-pulse' : 'text-[#8fa5bb]/50'}`}>
                        {currentTime >= 13 && currentTime < 28 ? 'DETECTED LOOP' : 'STABLE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#0d1624] border border-[#1e2e42] rounded-lg text-xs leading-relaxed text-[#8fa5bb]">
                  <span className="font-semibold text-white block mb-1">Hotkey Controls</span>
                  <ul className="space-y-1 text-[11px] list-disc list-inside">
                    <li><kbd className="bg-[#1b2636] px-1 py-0.5 rounded text-white font-mono text-[9px]">Spacebar</kbd> : Play / Pause</li>
                    <li><kbd className="bg-[#1b2636] px-1 py-0.5 rounded text-white font-mono text-[9px]">R</kbd> : Restart back to 0s</li>
                    <li><kbd className="bg-[#1b2636] px-1 py-0.5 rounded text-white font-mono text-[9px]">Esc / H</kbd> : Toggle Recording Mode</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 bg-[#050b14] border-t border-[#1a2638] text-[10px] text-[#8fa5bb] text-center">
            Designed for YT Shorts (9:16 Canvas) &middot; AI Studio
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RIGHT SIDE / MAIN VIEWPORT CONTAINER */}
      {/* ========================================================= */}
      <div className={`flex-1 flex flex-col items-center justify-center p-3 md:p-6 transition-all duration-300 relative ${
        isRecordingMode ? 'bg-[#000000] p-0' : 'bg-[#070e17]'
      }`}>
        
        {/* ESCAPE TRIGGER BUTTON FLOATING IN RECORDING MODE */}
        {isRecordingMode && (
          <button
            onClick={() => setIsRecordingMode(false)}
            className="absolute top-4 right-4 z-50 bg-[#0d1b2d]/90 hover:bg-[#1a2e48] border border-[#1d3149] hover:border-[#35d7ff] text-[#8fa5bb] hover:text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all select-none shadow-xl"
          >
            <EyeOff size={13} />
            <span>Show Editor Controls (ESC)</span>
          </button>
        )}

        {/* ========================================================= */}
        {/* VERTICAL STAGE CONTAINER (PROPORTIONAL 9:16 VIEWER) */}
        {/* ========================================================= */}
        <div 
          className="relative shadow-2xl transition-all duration-300 border border-[#111e30] aspect-[9/16] rounded-xl overflow-hidden max-h-[92vh] max-w-full"
          style={{ 
            backgroundColor: COLORS.bg,
            boxShadow: isRecordingMode ? 'none' : '0 25px 60px -15px rgba(0,0,0,0.8)',
            height: '100%',
            // We use standard scale constraints in CSS, but let aspect-ratio: 9/16 maintain sizing
          }}
        >
          
          {/* ========================================================= */}
          {/* MAIN DETERMINISTIC SVG CANVAS (1080 x 1920) */}
          {/* ========================================================= */}
          <svg 
            viewBox="0 0 1080 1920" 
            className="w-full h-full select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Defs block for gradients, shadows, patterns */}
            <defs>
              {/* Technical background grid pattern */}
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0e1b2f" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="1.5" fill="#1b2e4b" opacity="0.3" />
              </pattern>

              {/* Linear gradient definitions for glowing arrows */}
              <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#35d7ff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#35d7ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#35d7ff" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="red-glow" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef5b5b" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ef5b5b" stopOpacity="1" />
                <stop offset="100%" stopColor="#ef5b5b" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="green-glow" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#43d17a" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#43d17a" stopOpacity="1" />
                <stop offset="100%" stopColor="#43d17a" stopOpacity="0.2" />
              </linearGradient>

              {/* Glow filter definition for premium technical look */}
              <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glow-subtle" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Background Grid Cover */}
            <rect width="1080" height="1920" fill={COLORS.bg} />
            <rect width="1080" height="1920" fill="url(#grid)" />

            {/* Subtle aesthetic horizontal dividing guidelines */}
            <line x1="100" y1="260" x2="980" y2="260" stroke="#162944" strokeWidth="2" strokeDasharray="5,10" />
            <line x1="100" y1="820" x2="980" y2="820" stroke="#162944" strokeWidth="2" strokeDasharray="5,10" />
            <line x1="100" y1="1480" x2="980" y2="1480" stroke="#162944" strokeWidth="2" strokeDasharray="5,10" />

            {/* Vertical midline alignment guide */}
            <line x1="540" y1="100" x2="540" y2="1820" stroke="#162944" strokeWidth="1" strokeDasharray="4,15" opacity="0.6" />

            {/* ========================================================= */}
            {/* GOAL PANEL (TOP AREA) */}
            {/* ========================================================= */}
            <g transform="translate(540, 260)">
              {/* Backing panel */}
              <rect 
                x="-340" 
                y="-75" 
                width="680" 
                height="130" 
                rx="16" 
                fill={COLORS.panel} 
                stroke="#1c304a" 
                strokeWidth="3" 
              />
              {/* Colored status node (amber/cyan pulse in beginning, changes to green at 33) */}
              <circle 
                cx="-280" 
                cy="-10" 
                r="10" 
                fill={currentTime >= 33 ? COLORS.success : COLORS.agent} 
                className="animate-pulse"
              />
              
              {/* Label and goal text */}
              <text 
                x="-250" 
                y="-15" 
                fill={COLORS.muted} 
                fontSize="22" 
                fontWeight="700" 
                fontFamily="monospace" 
                letterSpacing="4"
              >
                GOAL ASSIGNMENT
              </text>
              <text 
                x="-250" 
                y="20" 
                fill={COLORS.text} 
                fontSize="32" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1"
              >
                GOAL: complete task
              </text>
            </g>

            {/* ========================================================= */}
            {/* DATA FLOW LINES (SVG PATH ANIMATIONS) */}
            {/* ========================================================= */}
            
            {/* STRAIGHT REQUEST PATH (Agent -> Tool) */}
            {/* From x=240, y=820 to x=840, y=820 */}
            <line 
              x1="240" 
              y1="820" 
              x2="840" 
              y2="820" 
              stroke="#13233a" 
              strokeWidth="10" 
              strokeLinecap="round" 
            />
            
            {/* Animated request glowing line overlay when requests are active */}
            {(anim.req1Active || anim.req2Active || anim.req3Active) && (
              <line 
                x1="240" 
                y1="820" 
                x2="840" 
                y2="820" 
                stroke={currentTime >= 29 ? COLORS.success : COLORS.cyan} 
                strokeWidth="10" 
                strokeLinecap="round"
                opacity="0.6"
              />
            )}

            {/* CYCLIC RETRY PATH (Tool -> underneath -> Agent) */}
            {/* Beautiful curving loop going from bottom of Tool, curving down to y=1100, then returning to bottom of Agent */}
            <path 
              d="M 840,860 C 840,1120 240,1120 240,860" 
              fill="none" 
              stroke={COLORS.error} 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeDasharray={currentTime >= 13 && currentTime < 28 ? "15, 10" : "none"}
              opacity={anim.retryPathOpacity}
              className={currentTime >= 13 && currentTime < 28 ? "animate-[dash_2s_linear_infinite]" : ""}
              style={{
                transition: 'opacity 0.5s ease',
              }}
            />

            {/* Highlighted curving flow overlay inside the retry path when active */}
            {currentTime >= 13 && currentTime < 28 && (
              <path 
                d="M 840,860 C 840,1120 240,1120 240,860" 
                fill="none" 
                stroke={COLORS.error} 
                strokeWidth="12" 
                strokeLinecap="round"
                opacity="0.6"
                filter="url(#glow-subtle)"
              />
            )}

            {/* ========================================================= */}
            {/* RETRY LABEL ON CURVING LOOP (RETRY MARKING) */}
            {/* ========================================================= */}
            {anim.retryLabelVisible && (
              <g transform="translate(540, 1060)" style={{ transition: 'opacity 0.4s' }}>
                <rect 
                  x="-110" 
                  y="-40" 
                  width="220" 
                  height="70" 
                  rx="10" 
                  fill={COLORS.panel} 
                  stroke={COLORS.error} 
                  strokeWidth="3" 
                />
                <text 
                  x="0" 
                  y="5" 
                  fill={COLORS.error} 
                  fontSize="24" 
                  fontWeight="800" 
                  fontFamily="monospace" 
                  letterSpacing="3" 
                  textAnchor="middle"
                >
                  RETRY
                </text>
              </g>
            )}

            {/* ========================================================= */}
            {/* EXIT SUCCESS GREEN PATH (Downwards) */}
            {/* ========================================================= */}
            {/* From bottom of Agent (240, 860) down to output box (540, 1480) */}
            <path 
              d="M 240,860 C 240,1320 540,1320 540,1410" 
              fill="none" 
              stroke="#13233a" 
              strokeWidth="10" 
              strokeLinecap="round" 
            />

            {anim.exitPathDrawProgress > 0 && (
              <path 
                d="M 240,860 C 240,1320 540,1320 540,1410" 
                fill="none" 
                stroke={COLORS.success} 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray="2000"
                strokeDashoffset={2000 - (anim.exitPathDrawProgress * 2000)}
                filter="url(#glow-subtle)"
              />
            )}

            {/* ========================================================= */}
            {/* DISPATCHED FLOW DOTS (DETERMINISTIC POSITIONING) */}
            {/* ========================================================= */}
            
            {/* Request Dot 1 */}
            {anim.req1Active && (
              <circle 
                cx={240 + (840 - 240) * anim.req1Pos} 
                cy="820" 
                r="18" 
                fill={COLORS.cyan} 
                filter="url(#glow-subtle)" 
              />
            )}

            {/* Request Dot 2 */}
            {anim.req2Active && (
              <circle 
                cx={240 + (840 - 240) * anim.req2Pos} 
                cy="820" 
                r="18" 
                fill={COLORS.cyan} 
                filter="url(#glow-subtle)" 
              />
            )}

            {/* Request Dot 3 */}
            {anim.req3Active && (
              <circle 
                cx={240 + (840 - 240) * anim.req3Pos} 
                cy="820" 
                r="18" 
                fill={COLORS.success} 
                filter="url(#glow-subtle)" 
              />
            )}

            {/* ========================================================= */}
            {/* TOOL NODE (STEEL BLUE TERMINAL CAP) */}
            {/* ========================================================= */}
            <g transform="translate(840, 820)" style={{ transition: 'all 0.3s' }}>
              
              {/* Outer pulsing shadow glow ring */}
              <circle 
                cx="0" 
                cy="0" 
                r="110" 
                fill="none" 
                stroke={anim.toolColor} 
                strokeWidth="3" 
                opacity="0.3" 
                style={{ transform: `scale(${anim.toolScale})`, transformOrigin: '0px 0px' }}
              />
              <circle 
                cx="0" 
                cy="0" 
                r="95" 
                fill={COLORS.panel} 
                stroke={anim.toolColor} 
                strokeWidth="6" 
                style={{ transform: `scale(${anim.toolScale})`, transformOrigin: '0px 0px' }}
                filter="url(#glow-subtle)"
              />

              {/* Graphical inner icon representing terminal tools */}
              <rect x="-35" y="-35" width="70" height="70" rx="8" fill="#07111f" stroke={anim.toolColor} strokeWidth="3" />
              <path d="M-20,-10 L-5,5 L-20,20" fill="none" stroke={anim.toolColor} strokeWidth="4" strokeLinecap="round" />
              <line x1="5" y1="20" x2="20" y2="20" stroke={anim.toolColor} strokeWidth="4" strokeLinecap="round" />

              {/* Node Labels */}
              <text 
                x="0" 
                y="140" 
                fill={COLORS.text} 
                fontSize="32" 
                fontWeight="900" 
                fontFamily="sans-serif" 
                letterSpacing="3" 
                textAnchor="middle"
              >
                TOOL
              </text>
              <text 
                x="0" 
                y="175" 
                fill={COLORS.muted} 
                fontSize="18" 
                fontWeight="700" 
                fontFamily="monospace" 
                letterSpacing="1" 
                textAnchor="middle"
              >
                {anim.toolStatus}
              </text>
            </g>

            {/* ========================================================= */}
            {/* STOP GATE COMPONENT (Drawn between Agent & Tool) */}
            {/* ========================================================= */}
            {anim.stopGateVisible && (
              <g transform="translate(540, 820)">
                {/* Yellow Gate Background Border Box */}
                <rect 
                  x="-130" 
                  y="-110" 
                  width="260" 
                  height="220" 
                  rx="14" 
                  fill="#060c14" 
                  stroke={anim.stopGateOpenProgress >= 1 ? COLORS.success : COLORS.warning} 
                  strokeWidth="4" 
                  opacity="0.95" 
                />

                {/* Gate Barriers Sliding Open based on anim.stopGateOpenProgress */}
                {/* Upper Gate Barrier */}
                <rect 
                  x="-110" 
                  y={-90 - (anim.stopGateOpenProgress * 110)} 
                  width="220" 
                  height="80" 
                  rx="8" 
                  fill={anim.stopGateOpenProgress >= 1 ? 'rgba(67, 209, 122, 0.15)' : 'rgba(255, 209, 102, 0.15)'} 
                  stroke={anim.stopGateOpenProgress >= 1 ? COLORS.success : COLORS.warning} 
                  strokeWidth="3" 
                />
                
                {/* Lower Gate Barrier */}
                <rect 
                  x="-110" 
                  y={10 - (anim.stopGateOpenProgress * -110)} 
                  width="220" 
                  height="80" 
                  rx="8" 
                  fill={anim.stopGateOpenProgress >= 1 ? 'rgba(67, 209, 122, 0.15)' : 'rgba(255, 209, 102, 0.15)'} 
                  stroke={anim.stopGateOpenProgress >= 1 ? COLORS.success : COLORS.warning} 
                  strokeWidth="3" 
                />

                {/* Lock Icons / Status Text indicators */}
                <text 
                  x="0" 
                  y="-35" 
                  fill={anim.stopGateOpenProgress >= 1 ? COLORS.success : COLORS.warning} 
                  fontSize="18" 
                  fontWeight="800" 
                  fontFamily="monospace" 
                  letterSpacing="2" 
                  textAnchor="middle"
                >
                  STOP CONDITION
                </text>

                <text 
                  x="0" 
                  y="45" 
                  fill={anim.stopGateOpenProgress >= 1 ? COLORS.success : COLORS.warning} 
                  fontSize="24" 
                  fontWeight="900" 
                  fontFamily="sans-serif" 
                  letterSpacing="1" 
                  textAnchor="middle"
                >
                  {anim.stopGateOpenProgress >= 1 ? "OPENED: EXIT" : "LOCKED"}
                </text>

                {/* Visual Connection Pin when closed */}
                {anim.stopGateOpenProgress < 1 && (
                  <circle cx="0" cy="5" r="14" fill={COLORS.warning} className="animate-pulse" />
                )}
              </g>
            )}

            {/* ========================================================= */}
            {/* RETURNING RESPONSE STATE BLOCKS (TRAVELING ELEMENTS) */}
            {/* ========================================================= */}
            
            {/* Red Incomplete State 1 (Travels from 840 to 240) */}
            {anim.state1Active && (
              <g transform={`translate(${840 - (840 - 240) * anim.state1Pos}, 820)`}>
                {/* Red outline box */}
                <rect x="-110" y="-70" width="220" height="140" rx="14" fill="#0a0303" stroke={COLORS.error} strokeWidth="5" />
                {/* Visual Segments (Incomplete - 3 segments visible, top right empty red dashed) */}
                {/* Top Left */}
                <rect x="-80" y="-45" width="65" height="40" rx="4" fill={COLORS.error} />
                {/* Top Right (Missing in incomplete State!) */}
                <rect x="15" y="-45" width="65" height="40" rx="4" fill="none" stroke={COLORS.error} strokeWidth="3" strokeDasharray="5,5" />
                {/* Bottom Left */}
                <rect x="-80" y="5" width="65" height="40" rx="4" fill={COLORS.error} />
                {/* Bottom Right */}
                <rect x="15" y="5" width="65" height="40" rx="4" fill={COLORS.error} />
                {/* Label text */}
                <text x="0" y="60" fill={COLORS.text} fontSize="14" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                  STATE: INCOMPLETE
                </text>
              </g>
            )}

            {/* Red Incomplete State 2 (Second travel cycle) */}
            {anim.state2Active && (
              <g transform={`translate(${840 - (840 - 240) * anim.state2Pos}, 820)`}>
                <rect x="-110" y="-70" width="220" height="140" rx="14" fill="#0a0303" stroke={COLORS.error} strokeWidth="5" />
                {/* Identical segments as State 1 */}
                <rect x="-80" y="-45" width="65" height="40" rx="4" fill={COLORS.error} />
                <rect x="15" y="-45" width="65" height="40" rx="4" fill="none" stroke={COLORS.error} strokeWidth="3" strokeDasharray="5,5" />
                <rect x="-80" y="5" width="65" height="40" rx="4" fill={COLORS.error} />
                <rect x="15" y="5" width="65" height="40" rx="4" fill={COLORS.error} />
                <text x="0" y="60" fill={COLORS.text} fontSize="14" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                  UNCHANGED STATE
                </text>
              </g>
            )}

            {/* Green Complete Updated State 3 (Travels near end) */}
            {anim.state3Active && (
              <g transform={`translate(${840 - (840 - 240) * anim.state3Pos}, 820)`}>
                <rect x="-110" y="-70" width="220" height="140" rx="14" fill="#030c05" stroke={COLORS.success} strokeWidth="5" filter="url(#glow-subtle)" />
                {/* All 4 segments filled - representing complete status */}
                <rect x="-80" y="-45" width="65" height="40" rx="4" fill={COLORS.success} />
                <rect x="15" y="-45" width="65" height="40" rx="4" fill={COLORS.success} />
                <rect x="-80" y="5" width="65" height="40" rx="4" fill={COLORS.success} />
                <rect x="15" y="5" width="65" height="40" rx="4" fill={COLORS.success} />
                <text x="0" y="60" fill={COLORS.text} fontSize="14" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                  UPDATED STATE
                </text>
              </g>
            )}

            {/* ========================================================= */}
            {/* STATIC STATES SITTING INSIDE AGENT CORE FOR ANALYSIS */}
            {/* ========================================================= */}

            {/* State 1 sitting in agent */}
            {anim.state1InAgent && (
              <g transform="translate(240, 610)">
                <rect x="-100" y="-60" width="200" height="120" rx="12" fill="#0d1b2d" stroke={COLORS.error} strokeWidth="3" opacity="0.85" />
                <rect x="-70" y="-40" width="60" height="35" rx="3" fill={COLORS.error} opacity="0.8" />
                <rect x="10" y="-40" width="60" height="35" rx="3" fill="none" stroke={COLORS.error} strokeWidth="2" strokeDasharray="4,4" />
                <rect x="-70" y="5" width="60" height="35" rx="3" fill={COLORS.error} opacity="0.8" />
                <rect x="10" y="5" width="60" height="35" rx="3" fill={COLORS.error} opacity="0.8" />
                <text x="0" y="52" fill={COLORS.text} fontSize="12" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                  STATE_01: INCOMPLETE
                </text>
              </g>
            )}

            {/* Overlay comparison State 1.5 - appears on top of State 1 */}
            {anim.state1_5Active && (
              <g transform="translate(240, 520)" style={{ opacity: anim.state1_5Opacity }}>
                {/* Secondary matching bracket graphic */}
                <path d="M -110,-5 L -120,-5 L -120,135 L -110,135" fill="none" stroke="#ef5b5b" strokeWidth="3" />
                <path d="M 110,-5 L 120,-5 L 120,135 L 110,135" fill="none" stroke="#ef5b5b" strokeWidth="3" />
                
                {/* Second box identical stack */}
                <g transform="translate(0, 50)" opacity="0.95">
                  <rect x="-100" y="-60" width="200" height="120" rx="12" fill="#140808" stroke="#ef5b5b" strokeWidth="3" />
                  <rect x="-70" y="-40" width="60" height="35" rx="3" fill="#ef5b5b" />
                  <rect x="10" y="-40" width="60" height="35" rx="3" fill="none" stroke="#ef5b5b" strokeWidth="2" strokeDasharray="4,4" />
                  <rect x="-70" y="5" width="60" height="35" rx="3" fill="#ef5b5b" />
                  <rect x="10" y="5" width="60" height="35" rx="3" fill="#ef5b5b" />
                </g>
                <text x="0" y="132" fill="#ef5b5b" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle" className="animate-pulse">
                  100% IDENTICAL STATE
                </text>
              </g>
            )}

            {/* State 3 sitting in agent successfully */}
            {anim.state3InAgent && (
              <g transform="translate(240, 610)">
                <rect x="-100" y="-60" width="200" height="120" rx="12" fill="#0d1b2d" stroke={COLORS.success} strokeWidth="4" />
                <rect x="-70" y="-40" width="60" height="35" rx="3" fill={COLORS.success} />
                <rect x="10" y="-40" width="60" height="35" rx="3" fill={COLORS.success} />
                <rect x="-70" y="5" width="60" height="35" rx="3" fill={COLORS.success} />
                <rect x="10" y="5" width="60" height="35" rx="3" fill={COLORS.success} />
                <text x="0" y="52" fill={COLORS.text} fontSize="12" fontWeight="800" fontFamily="monospace" textAnchor="middle">
                  UPDATED STATE RECEIVED
                </text>
              </g>
            )}

            {/* ========================================================= */}
            {/* AGENT CORE (AMBER CENTRAL CORE) */}
            {/* ========================================================= */}
            <g transform="translate(240, 820)" style={{ transition: 'all 0.3s' }}>
              
              {/* Outer Pulsing Aura Ring */}
              <circle 
                cx="0" 
                cy="0" 
                r="110" 
                fill="none" 
                stroke={anim.agentColor} 
                strokeWidth="4" 
                opacity={anim.agentOutlinePulse ? "0.9" : "0.3"} 
                style={{ transform: `scale(${anim.agentScale})`, transformOrigin: '0px 0px' }}
              />
              
              {/* Deep Central hexagon backing shape */}
              <circle 
                cx="0" 
                cy="0" 
                r="95" 
                fill={COLORS.panel} 
                stroke={anim.agentColor} 
                strokeWidth="6" 
                style={{ transform: `scale(${anim.agentScale})`, transformOrigin: '0px 0px' }}
                filter="url(#glow-subtle)"
              />

              {/* Inner glowing core representation */}
              <polygon 
                points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" 
                fill={anim.agentColor} 
                opacity="0.9" 
              />
              <polygon 
                points="0,-25 21,-12 21,12 0,25 -21,12 -21,-12" 
                fill="#07111f" 
              />

              {/* Node Labels */}
              <text 
                x="0" 
                y="140" 
                fill={COLORS.text} 
                fontSize="32" 
                fontWeight="900" 
                fontFamily="sans-serif" 
                letterSpacing="3" 
                textAnchor="middle"
              >
                AGENT
              </text>
              <text 
                x="0" 
                y="175" 
                fill={COLORS.muted} 
                fontSize="18" 
                fontWeight="700" 
                fontFamily="monospace" 
                letterSpacing="1" 
                textAnchor="middle"
              >
                {anim.agentSubtext}
              </text>
            </g>

            {/* ========================================================= */}
            {/* CENTER DETAILED EXPLANATORY STATEMENTS (MIDDLE LABELS) */}
            {/* ========================================================= */}
            {anim.middleLabelOpacity > 0 && (
              <g transform="translate(540, 430)" style={{ opacity: anim.middleLabelOpacity, transition: 'opacity 0.3s' }}>
                <rect 
                  x="-250" 
                  y="-40" 
                  width="500" 
                  height="80" 
                  rx="12" 
                  fill={COLORS.panel} 
                  stroke={anim.middleLabelColor} 
                  strokeWidth="3" 
                  filter="url(#glow-subtle)"
                />
                <text 
                  x="0" 
                  y="10" 
                  fill={anim.middleLabelColor} 
                  fontSize="24" 
                  fontWeight="900" 
                  fontFamily="monospace" 
                  letterSpacing="2" 
                  textAnchor="middle"
                >
                  {anim.middleLabel}
                </text>
              </g>
            )}

            {/* ========================================================= */}
            {/* SUCCESS EXIT / COMPLETED STATUS (BOTTOM ZONE) */}
            {/* ========================================================= */}
            {anim.exitBlockVisible && (
              <g transform="translate(540, 1480)" opacity={anim.exitBlockGlow} style={{ transition: 'all 0.6s' }}>
                {/* Drop shadow back glow ring */}
                <rect 
                  x="-250" 
                  y="-60" 
                  width="500" 
                  height="120" 
                  rx="18" 
                  fill={COLORS.panel} 
                  stroke={COLORS.success} 
                  strokeWidth="5" 
                  filter="url(#glow-heavy)" 
                />
                
                {/* Inner checklist icon */}
                <g transform="translate(-190, -25)">
                  <rect x="0" y="0" width="50" height="50" rx="8" fill="#040b12" stroke={COLORS.success} strokeWidth="3" />
                  <path d="M 12,24 L 21,33 L 38,15" fill="none" stroke={COLORS.success} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                <text 
                  x="-120" 
                  y="-8" 
                  fill={COLORS.success} 
                  fontSize="20" 
                  fontWeight="800" 
                  fontFamily="monospace" 
                  letterSpacing="4"
                >
                  SYSTEM COMPLETED
                </text>
                
                <text 
                  x="-120" 
                  y="26" 
                  fill={COLORS.text} 
                  fontSize="32" 
                  fontWeight="900" 
                  fontFamily="sans-serif" 
                  letterSpacing="1.5"
                >
                  TASK COMPLETE
                </text>
              </g>
            )}

            {/* Dynamic vertical timestamp ticker (bottom right side inside mobile canvas) */}
            <g transform="translate(980, 1850)">
              <text 
                x="0" 
                y="0" 
                fill={COLORS.muted} 
                fontSize="22" 
                fontWeight="800" 
                fontFamily="monospace" 
                textAnchor="end"
              >
                00:{Math.floor(currentTime).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10).toString()}
              </text>
            </g>

            {/* Small watermark of the short series */}
            <g transform="translate(100, 1850)">
              <text 
                x="0" 
                y="0" 
                fill={COLORS.muted} 
                fontSize="18" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1"
                opacity="0.7"
              >
                AGENTIC AI INSIGHTS
              </text>
            </g>

          </svg>
        </div>

        {/* Outer bottom info note */}
        {!isRecordingMode && (
          <div className="mt-3 text-xs text-[#8fa5bb] text-center select-none flex items-center gap-1">
            <Smartphone size={13} />
            <span>Interactive scaled viewport. Ideal recording window at 100% full screen.</span>
          </div>
        )}

      </div>
    </div>
  );
}
