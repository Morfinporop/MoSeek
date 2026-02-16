import { useEffect, useRef, useCallback } from 'react';
import { useThemeStore } from '../store/themeStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  rotationSpeed: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface MouseGlow {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
}

const COLORS = [
  '139, 92, 246',   // violet
  '168, 85, 247',   // purple
  '99, 102, 241',   // indigo
  '192, 132, 252',  // light purple
  '129, 140, 248',  // light indigo
  '79, 70, 229',    // deep indigo
  '236, 72, 153',   // pink accent
  '59, 130, 246',   // blue accent
  '147, 51, 234',   // vivid purple
];

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const mouseRef = useRef<MouseGlow>({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const lastTimeRef = useRef<number>(0);
  const { theme } = useThemeStore();

  const createParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 8000), 200);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    return particles;
  }, []);

  const createNebulae = useCallback((width: number, height: number) => {
    const nebulae: Nebula[] = [
      { x: width * 0.15, y: height * 0.2, size: 400, color: '139, 92, 246', angle: 0, rotationSpeed: 0.02, pulseSpeed: 0.15, pulseOffset: 0 },
      { x: width * 0.85, y: height * 0.65, size: 450, color: '168, 85, 247', angle: Math.PI / 3, rotationSpeed: -0.015, pulseSpeed: 0.12, pulseOffset: 1 },
      { x: width * 0.5, y: height * 0.85, size: 380, color: '99, 102, 241', angle: Math.PI / 6, rotationSpeed: 0.018, pulseSpeed: 0.18, pulseOffset: 2 },
      { x: width * 0.3, y: height * 0.55, size: 320, color: '192, 132, 252', angle: Math.PI / 4, rotationSpeed: -0.012, pulseSpeed: 0.14, pulseOffset: 3 },
      { x: width * 0.7, y: height * 0.15, size: 300, color: '129, 140, 248', angle: Math.PI / 2, rotationSpeed: 0.016, pulseSpeed: 0.16, pulseOffset: 4 },
      { x: width * 0.5, y: height * 0.4, size: 360, color: '147, 51, 234', angle: 0, rotationSpeed: -0.01, pulseSpeed: 0.13, pulseOffset: 5 },
    ];
    return nebulae;
  }, []);

  const spawnShootingStar = useCallback((width: number, height: number): ShootingStar => {
    const startX = Math.random() * width;
    const startY = Math.random() * height * 0.4;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 6 + 4;
    const maxLife = Math.random() * 60 + 40;

    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Math.random() * 80 + 40,
      opacity: 1,
      life: 0,
      maxLife,
      color: COLORS[Math.floor(Math.random() * 5)],
    };
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      particlesRef.current = createParticles(window.innerWidth, window.innerHeight);
      nebulaeRef.current = createNebulae(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const width = () => window.innerWidth;
    const height = () => window.innerHeight;

    const drawNebulae = (time: number) => {
      nebulaeRef.current.forEach((nebula) => {
        nebula.angle += nebula.rotationSpeed * 0.016;

        const pulse = Math.sin(time * nebula.pulseSpeed + nebula.pulseOffset) * 0.25 + 0.75;
        const currentSize = nebula.size * pulse;

        const offsetX = Math.sin(time * 0.1 + nebula.pulseOffset) * 20;
        const offsetY = Math.cos(time * 0.08 + nebula.pulseOffset) * 15;
        const cx = nebula.x + offsetX;
        const cy = nebula.y + offsetY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(nebula.angle);

        // Основное свечение — эллиптическое
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
        gradient.addColorStop(0, `rgba(${nebula.color}, 0.07)`);
        gradient.addColorStop(0.3, `rgba(${nebula.color}, 0.04)`);
        gradient.addColorStop(0.6, `rgba(${nebula.color}, 0.015)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.ellipse(0, 0, currentSize, currentSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Второй слой — перекрёстный
        const gradient2 = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 0.7);
        gradient2.addColorStop(0, `rgba(${nebula.color}, 0.05)`);
        gradient2.addColorStop(0.5, `rgba(${nebula.color}, 0.02)`);
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.ellipse(0, 0, currentSize * 0.5, currentSize * 0.9, Math.PI / 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient2;
        ctx.fill();

        ctx.restore();
      });
    };

    const drawParticles = (time: number) => {
      particlesRef.current.forEach((p) => {
        // Движение
        p.x += p.vx;
        p.y += p.vy;

        // Мягкое притяжение к мыши
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 1) {
            const force = (200 - dist) / 200 * 0.02;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Затухание скорости
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Обёртка
        const w = width();
        const h = height();
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Мерцание
        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.5 + 0.5;
        const currentOpacity = p.opacity * (0.3 + twinkle * 0.7);
        const currentSize = p.size * (0.7 + twinkle * 0.3);

        // Свечение вокруг частицы
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        glow.addColorStop(0, `rgba(${p.color}, ${currentOpacity * 0.4})`);
        glow.addColorStop(0.5, `rgba(${p.color}, ${currentOpacity * 0.1})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Ядро
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentOpacity})`;
        ctx.fill();

        // Белый центр для ярких частиц
        if (currentOpacity > 0.5 && currentSize > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.6})`;
          ctx.fill();
        }
      });

      // Линии связи между близкими частицами
      const connectionDistance = 120;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const lineOpacity = (1 - dist / connectionDistance) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const drawShootingStars = () => {
      // Спавн новых
      if (Math.random() < 0.005) {
        shootingStarsRef.current.push(spawnShootingStar(width(), height()));
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.life++;
        star.x += star.vx;
        star.y += star.vy;

        const progress = star.life / star.maxLife;
        star.opacity = progress < 0.2
          ? progress / 0.2
          : 1 - ((progress - 0.2) / 0.8);

        if (star.opacity <= 0 || star.life >= star.maxLife) return false;

        // Хвост
        const tailX = star.x - (star.vx / Math.sqrt(star.vx ** 2 + star.vy ** 2)) * star.length;
        const tailY = star.y - (star.vy / Math.sqrt(star.vx ** 2 + star.vy ** 2)) * star.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, `rgba(${star.color}, 0)`);
        gradient.addColorStop(0.6, `rgba(${star.color}, ${star.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Свечение головы
        const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 8);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.9})`);
        headGlow.addColorStop(0.3, `rgba(${star.color}, ${star.opacity * 0.4})`);
        headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();

        return true;
      });
    };

    const drawMouseGlow = () => {
      const mouse = mouseRef.current;
      if (!mouse.active) return;

      // Плавное следование
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      gradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.04)');
      gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.02)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Внутреннее кольцо
      const innerGradient = ctx.createRadialGradient(mouse.x, mouse.y, 30, mouse.x, mouse.y, 60);
      innerGradient.addColorStop(0, 'rgba(192, 132, 252, 0.05)');
      innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
    };

    const drawGrid = (time: number) => {
      ctx.save();
      ctx.globalAlpha = 0.015;

      const spacing = 60;
      const w = width();
      const h = height();

      for (let x = 0; x < w; x += spacing) {
        const wave = Math.sin(time * 0.3 + x * 0.01) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = `rgba(139, 92, 246, ${wave * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let y = 0; y < h; y += spacing) {
        const wave = Math.sin(time * 0.2 + y * 0.01) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(99, 102, 241, ${wave * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Пересечения — светящиеся точки
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          const dist = mouseRef.current.active
            ? Math.sqrt((x - mouseRef.current.x) ** 2 + (y - mouseRef.current.y) ** 2)
            : Infinity;

          const proximityGlow = dist < 200 ? (1 - dist / 200) * 0.6 : 0;
          const baseGlow = Math.sin(time * 0.5 + x * 0.02 + y * 0.02) * 0.3 + 0.3;
          const totalGlow = Math.min(baseGlow + proximityGlow, 1);

          if (totalGlow > 0.2) {
            ctx.beginPath();
            ctx.arc(x, y, 1 + totalGlow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192, 132, 252, ${totalGlow})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();
    };

    const drawVignette = () => {
      const w = width();
      const h = height();
      const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      const w = width();
      const h = height();

      ctx.clearRect(0, 0, w, h);

      const time = timestamp * 0.001;

      // Слои отрисовки (от дальнего к ближнему)
      drawGrid(time);
      drawNebulae(time);
      drawParticles(time);
      drawShootingStars();
      drawMouseGlow();
      drawVignette();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, createParticles, createNebulae, spawnShootingStar]);

  if (theme === 'light') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
