import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfilePage from '../User-side/ProfilePage';

// Mock the auth context to provide a logged-in user
jest.mock('../utils/AuthContext', () => ({
  useAuth: () => ({
    user: { studentAccount_ID: 123, name: 'Jane Student', email: 'jane@example.com' },
    setUser: jest.fn(),
    loading: false
  })
}));

// Mock heavy components to keep the test focused
jest.mock('../User-side/UserNavbar', () => () => <div>UserNavbar</div>);
jest.mock('../Visitor-side/Footer', () => () => <div>Footer</div>);

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

describe('ProfilePage', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn((url, opts) => {
      // strands
      if (url && url.toString().endsWith('/api/strands')) {
        return Promise.resolve({ ok: true, json: async () => [ { strand_ID: '1', strandName: 'STEM' } ] });
      }

      // student profile GET
      if (url && url.toString().includes('/api/student-profile/123') && (!opts || opts.method === undefined)) {
        return Promise.resolve({ ok: true, json: async () => ({
          name: 'Jane Student',
          strand_ID: '1',
          gradeLevel: 12,
          genAverageGrade: 92,
          mathGrade: 95,
          scienceGrade: 90,
          englishGrade: 93
        }) });
      }

      // student profile PUT
      if (url && url.toString().includes('/api/student-profile/123') && opts && opts.method === 'PUT') {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }

      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.clearAllMocks();
  });

  it('loads strands and profile, and saves updated profile', async () => {
    render(<ProfilePage />);

    // Wait for strands option to appear
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Ensure initial API calls were made
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/strands', { credentials: 'include' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/student-profile/123', { credentials: 'include' });

    // Strand select should contain the mocked option and be selected
    const strandSelect = screen.getByLabelText('Strand/Track');
    expect(strandSelect).toBeInTheDocument();
    expect(strandSelect.value).toBe('1');

    // Change some fields so validation passes
    const genInput = screen.getByLabelText('General Average');
    const mathInput = screen.getByLabelText('Mathematics');
    const sciInput = screen.getByLabelText('Science');
    const engInput = screen.getByLabelText('English');

    fireEvent.change(genInput, { target: { value: '92' } });
    fireEvent.change(mathInput, { target: { value: '95' } });
    fireEvent.change(sciInput, { target: { value: '90' } });
    fireEvent.change(engInput, { target: { value: '93' } });

    // Ensure Save button is present and enabled
    const saveBtn = screen.getByRole('button', { name: /Save Profile/i });
    expect(saveBtn).toBeInTheDocument();

    // Click save and expect a PUT to be made
    fireEvent.click(saveBtn);

    await waitFor(() => {
      // PUT should be called for saving profile
      const putCall = global.fetch.mock.calls.find(c => c[0].includes('/api/student-profile/123') && c[1] && c[1].method === 'PUT');
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall[1].body);
      expect(body.genAverageGrade).toBe('92');
      expect(body.mathGrade).toBe('95');
    });
  });
});
