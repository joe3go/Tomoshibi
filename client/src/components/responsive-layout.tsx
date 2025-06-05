import { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(true);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 480);
      setIsTablet(width > 480 && width <= 1024);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return (
    <div className={`responsive-layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'} ${className}`}>
      {children}
    </div>
  );
}

interface FluidGridProps {
  children: React.ReactNode;
  minColumnWidth?: string;
  gap?: string;
  className?: string;
}

export function FluidGrid({ children, minColumnWidth = '280px', gap = 'var(--space-md)', className = '' }: FluidGridProps) {
  return (
    <div 
      className={`fluid-grid ${className}`}
      style={{
        display: 'grid',
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumnWidth}, 100%), 1fr))`
      }}
    >
      {children}
    </div>
  );
}

interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'min' | 'comfortable';
  className?: string;
}

export function TouchTarget({ children, onClick, size = 'min', className = '' }: TouchTargetProps) {
  const sizeClass = size === 'comfortable' ? 'touch-target-comfortable' : 'touch-target-min';
  
  return (
    <button
      onClick={onClick}
      className={`touch-target ${sizeClass} ${className}`}
      style={{
        minHeight: size === 'comfortable' ? 'var(--touch-target-comfortable)' : 'var(--touch-target-min)',
        minWidth: size === 'comfortable' ? 'var(--touch-target-comfortable)' : 'var(--touch-target-min)',
        touchAction: 'manipulation',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  isJapanese?: boolean;
  className?: string;
}

export function ResponsiveText({ children, variant = 'base', isJapanese = false, className = '' }: ResponsiveTextProps) {
  const textSize = isJapanese ? `var(--jp-text-${variant})` : `var(--text-${variant})`;
  const fontFamily = isJapanese ? "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif" : 'inherit';
  
  return (
    <span
      className={`responsive-text ${isJapanese ? 'japanese-text' : ''} ${className}`}
      style={{
        fontSize: textSize,
        fontFamily,
        lineHeight: isJapanese ? '1.8' : '1.6'
      }}
    >
      {children}
    </span>
  );
}

interface ContentPriorityProps {
  children: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export function ContentPriority({ children, priority, className = '' }: ContentPriorityProps) {
  const priorityClass = `content-priority-${priority}`;
  
  return (
    <div className={`${priorityClass} ${className}`}>
      {children}
    </div>
  );
}

interface MobileNavigationProps {
  items: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }>;
  className?: string;
}

export function MobileNavigation({ items, className = '' }: MobileNavigationProps) {
  return (
    <nav className={`mobile-nav ${className}`}>
      <div className="flex justify-around items-center w-full">
        {items.map((item, index) => (
          <TouchTarget
            key={index}
            onClick={item.onClick}
            size="comfortable"
            className={`mobile-nav-item ${item.active ? 'active' : ''}`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-lg">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </TouchTarget>
        ))}
      </div>
    </nav>
  );
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({ src, alt, className = '', loading = 'lazy' }: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={`responsive-image ${className}`}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block'
      }}
    />
  );
}