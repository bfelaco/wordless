import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from './App';

test('renders Wordless link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Wordless/i);
  expect(linkElement).toBeInTheDocument();
});
