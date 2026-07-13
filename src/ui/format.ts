const RAW = /^[A-Za-z0-9_-]{48}$/;
const EQ = /^[A-Za-z0-9_-]{48}$/;

export function isFriendlyAddress(addr: string): boolean {
  return RAW.test(addr);
}

export function isRawAddress(addr: string): boolean {
  return EQ.test(addr) || /^0:[a-f0-9]{64}$/.test(addr);
}

export function shortAddress(addr: string, lead = 4, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= lead + tail + 1) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

export function formatTon(nano: string | number, decimals = 4): string {
  const value = Number(nano) / 1e9;
  if (!Number.isFinite(value)) return '0';
  return value.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
}

export function explorerAddress(addr: string): string {
  return `https://testnet.tonscan.org/address/${addr}`;
}