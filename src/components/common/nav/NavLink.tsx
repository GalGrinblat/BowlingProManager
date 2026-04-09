import React from 'react';
import { Link } from 'react-router-dom';
import { useNavLabel } from '../../../hooks/useNavLabel';

interface NavLinkProps {
  direction: 'back' | 'forward';
  label: string;
  to: string;
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  direction,
  label,
  to,
  className,
}) => {
  const { back, forward } = useNavLabel();
  return (
    <Link to={to} className={className}>
      {direction === 'back' ? back(label) : forward(label)}
    </Link>
  );
};
