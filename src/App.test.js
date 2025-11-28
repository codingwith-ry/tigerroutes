/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock react-router-dom for tests so App can be rendered without installing
// the full router package in environments where node_modules aren't present.
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element || null,
  Link: ({ children }) => <a>{children}</a>,
  NavLink: ({ children }) => <a>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
