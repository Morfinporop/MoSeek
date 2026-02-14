import { useThemeStore } from '../store/themeStore';

export function Background() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37, 99, 235, 0.04) 0%, transparent 60%)',
        }}
      />

      {/* Floating orbs */}
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          top: '5%',
          left: '10%',
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.02) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float-slow 20s ease-in-out infinite',
        }}
      />
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          right: '5%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float-slow-reverse 25s ease-in-out infinite',
        }}
      />
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          bottom: '10%',
          left: '25%',
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.015) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'float-slow 18s ease-in-out infinite',
          animationDelay: '-5s',
        }}
      />
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '350px',
          height: '350px',
          top: '30%',
          left: '60%',
          background: isDark
            ? 'radial-gradient(circle, rgba(148, 163, 184, 0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100, 116, 139, 0.02) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'float-slow-reverse 22s ease-in-out infinite',
          animationDelay: '-8s',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
            : 'radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: isDark
            ? 'linear-gradient(to top, #0a0a0a, transparent)'
            : 'linear-gradient(to top, #fafafa, transparent)',
        }}
      />
    </div>
  );
}
