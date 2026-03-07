import React from 'react';
/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../../src/contexts/LanguageContext';
import { LoginView } from '../../../src/components/common/LoginView';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    loginWithGoogle: jest.fn(),
  }),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: { error: jest.fn() },
}));

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)' ? matches : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

describe('LoginView', () => {
  it('shows sign-in button', () => {
    mockMatchMedia(false);
    render(
      <LanguageProvider>
        <LoginView />
      </LanguageProvider>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not show standalone banner in normal browser mode', () => {
    mockMatchMedia(false);
    render(
      <LanguageProvider>
        <LoginView />
      </LanguageProvider>
    );
    expect(screen.queryByText(/Running as installed app/i)).not.toBeInTheDocument();
  });

  it('shows standalone banner when display-mode is standalone', () => {
    mockMatchMedia(true);
    render(
      <LanguageProvider>
        <LoginView />
      </LanguageProvider>
    );
    expect(screen.getByText(/Running as installed app/i)).toBeInTheDocument();
  });

  it('standalone banner includes Open in Browser link with target _blank', () => {
    mockMatchMedia(true);
    render(
      <LanguageProvider>
        <LoginView />
      </LanguageProvider>
    );
    const link = screen.getByRole('link', { name: /Open in Browser/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows guest viewer link', () => {
    mockMatchMedia(false);
    render(
      <LanguageProvider>
        <LoginView />
      </LanguageProvider>
    );
    const guestLink = screen.getByRole('link', { name: /viewer|guest/i });
    expect(guestLink).toHaveAttribute('href', '/board');
  });
});
