import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useMoodStore } from '../store/moodStore';
import type { Mood } from '../store/moodStore';

const COFFEE_COLORS: Record<Mood, string[]> = {
  neutral: ['180, 130, 70', '200, 150, 90', '220, 170, 110'],
  happy: ['255, 190, 90', '255, 175, 55', '240, 160, 45'],
  excited: ['255, 150, 110', '245, 120, 90', '230, 105, 75'],
  calm: ['175, 150, 140', '155, 125, 115', '140, 105, 90'],
  focused: ['200, 160, 110', '180, 135, 85', '160, 115, 65'],
  curious: ['220, 150, 80', '200, 130, 65', '180, 115, 50'],
  confused: ['145, 125, 115', '125, 105, 95', '110, 90, 80'],
  frustrated: ['175, 105, 85', '160, 90, 70', '145, 75, 55'],
  grateful: ['235, 185, 125', '215, 165, 105', '195, 145, 85'],
  reflective: ['150, 130, 120', '130, 110, 100', '110, 90, 80'],
};

const COFFEE_PHYSICS: Record<Mood, { speed: number; size: number; energy: number }> = {
  neutral: { speed: 1, size: 1, energy: 0.5 },
  happy: { speed: 1.3, size: 1.1, energy: 0.7 },
  excited: { speed: 1.6, size: 1.2, energy: 0.9 },
  calm: { speed: 0.6, size: 1.15, energy: 0.3 },
  focused: { speed: 0.8, size: 0.95, energy: 0.6 },
  curious: { speed: 1.2, size: 1.05, energy: 0.65 },
  confused: { speed: 1.1, size: 0.9, energy: 0.5 },
  frustrated: { speed: 1.4, size: 0.85, energy: 0.8 },
  grateful: { speed: 0.7, size: 1.2, energy: 0.4 },
  reflective: { speed: 0.5, size: 1.1, energy: 0.35 },
};

interface Orb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  color: string;
  targetColor: string;
  opacity: number;
  targetOpacity: number;
  mood: Mood;
  pulseOffset: number;
  pulseSpeed: number;
  mass: number;
  breathePhase: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  offset: number;
  driftY: number;
  driftX: number;
  warmth: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

interface GridNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  offset: number;
  speed: number;
}

function parseColor(c: string): [number, number, number] {
  const parts = c.split(',').map(s => parseInt(s.trim()));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseColor(a);
  const [br, bg, bb] = parseColor(b);
  return `${Math.round(ar + (br - ar) * t)}, ${Math.round(ag + (bg - ag) * t)}, ${Math.round(ab + (bb - ab) * t)}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const orbsRef = useRef<Orb[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const gridRef = useRef<GridNode[]>([]);
  const idCounterRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const { theme } = useThemeStore();
  const eventCounterRef = useRef(0);

  useEffect(() => {
    const unsub = useMoodStore.subscribe((state) => {
      if (state.eventCounter > eventCounterRef.current) {
        eventCounterRef.current = state.eventCounter;
        spawnOrb(state.currentMood);
        spawnParticles(state.currentMood);
      }
    });
    return unsub;
  }, []);

  function spawnParticles(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = COFFEE_COLORS[mood];
    const count = 4 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.6;
      particlesRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.2,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 3 + Math.random() * 4,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.15 + Math.random() * 0.2,
      });
    }
    if (particlesRef.current.length > 60) {
      particlesRef.current = particlesRef.current.slice(-45);
    }
  }

  function spawnOrb(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = COFFEE_COLORS[mood];
    const physics = COFFEE_PHYSICS[mood];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.35;
    const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.35;

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.2 + Math.random() * 0.7) * physics.speed;
    const baseRadius = (70 + Math.random() * 100) * physics.size;

    orbsRef.current.push({
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 10,
      targetRadius: baseRadius,
      color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.12 + physics.energy * 0.08,
      mood,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.2 + physics.energy * 0.3,
      mass: baseRadius,
      breathePhase: Math.random() * Math.PI * 2,
    });

    const MAX_ORBS = 12;
    if (orbsRef.current.length > MAX_ORBS) {
      orbsRef.current[0].targetOpacity = 0;
      orbsRef.current[0].targetRadius = 0;
    }
  }

  useEffect(() => {
    if (theme === 'light') {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;

      const starCount = Math.floor((w * h) / 28000);
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.0 + 0.3,
        opacity: Math.random() * 0.12 + 0.03,
        twinkleSpeed: Math.random() * 0.5 + 0.15,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.02 + 0.005),
        driftX: (Math.random() - 0.5) * 0.008,
        warmth: Math.random(),
      }));

      const gridSpacing = 80;
      const cols = Math.ceil(w / gridSpacing) + 2;
      const rows = Math.ceil(h / gridSpacing) + 2;
      gridRef.current = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          gridRef.current.push({
            x: i * gridSpacing - gridSpacing,
            y: j * gridSpacing - gridSpacing,
            baseX: i * gridSpacing - gridSpacing,
            baseY: j * gridSpacing - gridSpacing,
            offset: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.4,
          });
        }
      }

      if (orbsRef.current.length === 0) {
        (['neutral', 'calm', 'focused', 'curious'] as Mood[]).forEach(m => spawnOrb(m));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;

    const animate = (timestamp: number) => {
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
      lastTime = timestamp;
      const t = timestamp * 0.001;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const ambientGlow = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t * 0.04) * w * 0.06,
        h * 0.4 + Math.cos(t * 0.03) * h * 0.06,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.6
      );
      ambientGlow.addColorStop(0, 'rgba(180, 130, 70, 0.04)');
      ambientGlow.addColorStop(0.3, 'rgba(140, 100, 55, 0.02)');
      ambientGlow.addColorStop(0.6, 'rgba(80, 55, 30, 0.008)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, w, h);

      gridRef.current.forEach((node) => {
        node.x = node.baseX + Math.sin(t * node.speed + node.offset) * 8;
        node.y = node.baseY + Math.cos(t * node.speed * 0.8 + node.offset) * 8;
      });

      ctx.strokeStyle = 'rgba(180, 140, 90, 0.015)';
      ctx.lineWidth = 0.5;
      const gridSpacing = 80;
      const cols = Math.ceil(w / gridSpacing) + 2;

      for (let i = 0; i < gridRef.current.length; i++) {
        const node = gridRef.current[i];
        const rightIdx = i + 1;
        const bottomIdx = i + cols;

        if (rightIdx < gridRef.current.length && (i + 1) % cols !== 0) {
          const right = gridRef.current[rightIdx];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }

        if (bottomIdx < gridRef.current.length) {
          const bottom = gridRef.current[bottomIdx];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.stroke();
        }
      }

      gridRef.current.forEach((node) => {
        let nodeColor = '160, 130, 90';
        let nodeOpacity = 0.03;

        for (const orb of orbsRef.current) {
          const dx = node.x - orb.x;
          const dy = node.y - orb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < orb.radius * 2) {
            const influence = smoothstep(orb.radius * 2, 0, dist);
            nodeColor = lerpColor(nodeColor, orb.color, influence * 0.6);
            nodeOpacity = lerp(nodeOpacity, orb.opacity * 0.4, influence);
          }
        }

        if (nodeOpacity > 0.01) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${nodeColor}, ${nodeOpacity})`;
          ctx.fill();
        }
      });

      const orbs = orbsRef.current;
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        a.radius = lerp(a.radius, a.targetRadius, delta * 1.5);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 1.8);
        a.color = lerpColor(a.color, a.targetColor, delta * 2);
        a.breathePhase += delta * 0.4;

        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        if (distC > 50) {
          a.vx += (dxC / distC) * 0.00007 * distC;
          a.vy += (dyC / distC) * 0.00007 * distC;
        }

        if (mx > 0 && my > 0) {
          const dxM = a.x - mx;
          const dyM = a.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 200 && distM > 1) {
            const force = smoothstep(200, 0, distM) * 0.07;
            a.vx += (dxM / distM) * force;
            a.vy += (dyM / distM) * force;
          }
        }

        for (let j = i + 1; j < orbs.length; j++) {
          const b = orbs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius * 0.6 + b.radius * 0.6;

          if (dist < minDist && dist > 0.1) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.008;
            const total = a.mass + b.mass;
            a.vx -= nx * push * (b.mass / total);
            a.vy -= ny * push * (b.mass / total);
            b.vx += nx * push * (a.mass / total);
            b.vy += ny * push * (a.mass / total);
            const sep = overlap * 0.15;
            a.x -= nx * sep * (b.mass / total);
            a.y -= ny * sep * (b.mass / total);
            b.x += nx * sep * (a.mass / total);
            b.y += ny * sep * (a.mass / total);
          } else if (dist < minDist * 1.8 && dist > 0.1) {
            const repel = 0.001 / (dist * dist) * (a.mass * b.mass);
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * repel / a.mass;
            a.vy -= ny * repel / a.mass;
            b.vx += nx * repel / b.mass;
            b.vy += ny * repel / b.mass;
          }
        }

        a.vx *= 0.991;
        a.vy *= 0.991;
        a.x += a.vx;
        a.y += a.vy;

        const margin = a.radius * 0.3;
        if (a.x < margin) a.vx += 0.025;
        if (a.x > w - margin) a.vx -= 0.025;
        if (a.y < margin) a.vy += 0.025;
        if (a.y > h - margin) a.vy -= 0.025;
      }

      orbsRef.current = orbs.filter(o => o.opacity > 0.001 || o.targetOpacity > 0);

      const sorted = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sorted) {
        if (orb.opacity < 0.005) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.05 + 1;
        const breathe = Math.sin(t * 0.25 + orb.breathePhase) * 0.03 + 1;
        const r = orb.radius * pulse * breathe;

        const outer = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 2.5);
        outer.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.25})`);
        outer.addColorStop(0.25, `rgba(${orb.color}, ${orb.opacity * 0.12})`);
        outer.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.05})`);
        outer.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();

        const main = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.3);
        main.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.7})`);
        main.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.35})`);
        main.addColorStop(0.6, `rgba(${orb.color}, ${orb.opacity * 0.12})`);
        main.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = main;
        ctx.fill();

        const core = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 0.45);
        core.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 1.2})`);
        core.addColorStop(0.4, `rgba(${orb.color}, ${orb.opacity * 0.6})`);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        const innerGlow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 0.2);
        innerGlow.addColorStop(0, `rgba(255, 240, 220, ${orb.opacity * 0.15})`);
        innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = innerGlow;
        ctx.fill();
      }

      for (let i = 0; i < orbsRef.current.length; i++) {
        for (let j = i + 1; j < orbsRef.current.length; j++) {
          const a = orbsRef.current[i];
          const b = orbsRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectDist = (a.radius + b.radius) * 2;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 4;

            if (strength > 0.005) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              const perpX = -dy / dist * 15 * Math.sin(t * 0.3 + i * 0.4);
              const perpY = dx / dist * 15 * Math.sin(t * 0.3 + i * 0.4);

              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, 0)`);
              grad.addColorStop(0.15, `rgba(${a.color}, ${strength * 0.2})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.35})`);
              grad.addColorStop(0.85, `rgba(${b.color}, ${strength * 0.2})`);
              grad.addColorStop(1, `rgba(${b.color}, 0)`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.5 + strength * 4;
              ctx.lineCap = 'round';
              ctx.stroke();

              const glowR = 20 + strength * 25;
              const glow = ctx.createRadialGradient(midX + perpX * 0.3, midY + perpY * 0.3, 0, midX, midY, glowR);
              glow.addColorStop(0, `rgba(${midColor}, ${strength * 0.25})`);
              glow.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.08})`);
              glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.beginPath();
              ctx.arc(midX, midY, glowR, 0, Math.PI * 2);
              ctx.fillStyle = glow;
              ctx.fill();
            }
          }
        }
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.996;
        p.vy *= 0.996;
        p.vy -= 0.002;

        const alpha = p.opacity * smoothstep(0, 0.2, p.life) * smoothstep(1, 0.7, 1 - p.life);
        if (alpha < 0.002) return true;

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        pg.addColorStop(0, `rgba(${p.color}, ${alpha * 0.4})`);
        pg.addColorStop(0.5, `rgba(${p.color}, ${alpha * 0.15})`);
        pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        return true;
      });

      starsRef.current.forEach((star) => {
        star.y += star.driftY;
        star.x += star.driftX;
        if (star.y < -5) { star.y = h + 5; star.x = Math.random() * w; }
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;

        const tw = Math.sin(t * star.twinkleSpeed + star.offset);
        const alpha = star.opacity * (0.5 + tw * 0.3 + 0.2);

        let starColor: string;
        if (star.warmth < 0.3) starColor = '200, 185, 170';
        else if (star.warmth < 0.6) starColor = '220, 200, 175';
        else if (star.warmth < 0.85) starColor = '235, 215, 185';
        else starColor = '250, 235, 200';

        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < orb.radius * 2) {
            const inf = smoothstep(orb.radius * 2, 0, dd) * 0.3;
            starColor = lerpColor(starColor, orb.color, inf);
            break;
          }
        }

        if (star.size > 0.6) {
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2.5);
          sg.addColorStop(0, `rgba(${starColor}, ${alpha * 0.08})`);
          sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      const vig = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.2,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.85
      );
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(0.5, 'rgba(8, 5, 3, 0.1)');
      vig.addColorStop(1, 'rgba(8, 5, 3, 0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationRef.current);
    };
  }, [theme]);

  if (theme === 'light') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
