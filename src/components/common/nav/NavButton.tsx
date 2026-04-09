import React from 'react';
import { useNavLabel } from '../../../hooks/useNavLabel';

interface NavButtonProps {
  direction: 'back' | 'forward';
  label: string;
  onClick: () => void;
  className?: string;
  type?: 'button' | 'submit';
}

export const NavButton: React.FC<NavButtonProps> = ({
  direction,
  label,
  onClick,
  className = 'text-gray-600 hover:text-gray-800',
  type = 'button',
}) => {
  const { back, forward } = useNavLabel();
  return (
    <button type={type} onClick={onClick} className={className}>
      {direction === 'back' ? back(label) : forward(label)}
    </button>
  );
};
