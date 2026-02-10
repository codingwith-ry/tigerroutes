const multiTokenPrefixes = new Set(['de la', 'de los']);
const singleTokenPrefixes = new Set(['de', 'del', 'dela', 'delos', 'van', 'von', 'da', 'di']);

const normalizeName = (value) => {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

export const formatDisplayName = (name) => {
  const base = normalizeName(name);
  if (!base) return '';
  if (base.includes(',')) return base;

  const parts = base.split(' ').filter(Boolean);
  if (parts.length <= 1) return parts[0] || base;

  let lastNameStart = parts.length - 1;
  if (parts.length >= 3) {
    const twoTokenPrefix = `${parts[parts.length - 3]} ${parts[parts.length - 2]}`.toLowerCase();
    if (multiTokenPrefixes.has(twoTokenPrefix)) {
      lastNameStart = parts.length - 3;
    }
  }

  if (lastNameStart === parts.length - 1 && parts.length >= 2) {
    const oneTokenPrefix = parts[parts.length - 2].toLowerCase();
    if (singleTokenPrefixes.has(oneTokenPrefix)) {
      lastNameStart = parts.length - 2;
    }
  }

  const lastName = parts.slice(lastNameStart).join(' ');
  const firstName = parts.slice(0, lastNameStart).join(' ');
  if (!firstName) return lastName;

  const formatted = `${lastName}, ${firstName}`;
  return formatted.endsWith('.') ? formatted : `${formatted}.`;
};

export const getNameInitials = (name) => {
  const base = normalizeName(name);
  if (!base) return '';
  const cleaned = base.replace(/[.,]/g, '');
  const parts = cleaned.split(' ').filter(Boolean);
  return parts.map((part) => part[0]).join('').toUpperCase();
};
