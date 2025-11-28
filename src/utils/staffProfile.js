export async function fetchStaffProfile() {
  try {
    // Prefer server-side session endpoint (HttpOnly cookie) — non-breaking: fall back to legacy sessionStorage
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${base}/api/staff/me`, { credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        if (body && body.success && body.data) {
          return body.data;
        }
      }
    } catch (err) {
      // ignore and fall back to sessionStorage
    }

    // Legacy fallback: read staffUser from sessionStorage for migration compatibility
    const raw = sessionStorage.getItem('staffUser');
    if (!raw) return null;
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
    if (!parsed) return null;

    // If it already contains profile fields, return as-is
    if (parsed.name || parsed.email || parsed.role || parsed.staffRole_ID) return parsed;

    // Otherwise expect { staffAccount_ID }
    const id = parsed.staffAccount_ID || parsed.staffAccountId || parsed.id;
    if (!id) return null;

    try {
      const res2 = await fetch(`${base}/api/admin/counselor/${encodeURIComponent(id)}`, { credentials: 'include' });
      if (!res2.ok) return null;
      const body2 = await res2.json();
      if (!body2 || !body2.success) return null;
      return body2.data || null;
    } catch (err) {
      return null;
    }
  } catch (err) {
    console.error('fetchStaffProfile error', err);
    return null;
  }
}
