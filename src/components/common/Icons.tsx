import React from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

interface StarIconProps extends Omit<IconProps, 'strokeWidth'> {
  fill?: string;
}

export const Trophy: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, className = '' }) => (
  React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className
  },
  React.createElement('path', { d: 'M6 9H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2' }),
  React.createElement('path', { d: 'M6 9c0-1 1-3 6-3s6 2 6 3' }),
  React.createElement('path', { d: 'M6 9h12v12H6z' }),
  React.createElement('path', { d: 'M9 17v3' }),
  React.createElement('path', { d: 'M15 17v3' })
  )
);

export const Plus: React.FC<Omit<IconProps, 'strokeWidth'>> = ({ size = 24, className = '' }) => 
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
    React.createElement('path', { d: 'M12 5v14' }), 
    React.createElement('path', { d: 'M5 12h14' })
  );

export const ArrowRight: React.FC<Omit<IconProps, 'strokeWidth'>> = ({ size = 24, className = '' }) => 
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
    React.createElement('path', { d: 'M5 12h14' }), 
    React.createElement('path', { d: 'M12 5l7 7-7 7' })
  );

export const ArrowLeft: React.FC<Omit<IconProps, 'strokeWidth'>> = ({ size = 24, className = '' }) => 
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
    React.createElement('path', { d: 'M19 12H5' }), 
    React.createElement('path', { d: 'M12 19l-7-7 7-7' })
  );

export const CheckCircle: React.FC<Omit<IconProps, 'strokeWidth'>> = ({ size = 24, className = '' }) => 
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), 
    React.createElement('path', { d: 'M22 4L12 14.01l-3-3' })
  );

export const Star: React.FC<StarIconProps> = ({ size = 24, fill = 'none', className = '' }) => 
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
    React.createElement('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
  );
