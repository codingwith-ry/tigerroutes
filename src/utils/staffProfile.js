export async function fetchStaffProfile() {
  try {
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

    const res = await fetch(`http://localhost:5000/api/counselor/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || !body.success) return null;
    return body.data || null;
  } catch (err) {
    console.error('fetchStaffProfile error', err);
    return null;
  }
}
