import LZString from 'lz-string';
import type { Report } from '../types';

export function encodeReport(report: Report): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(report));
}

export function decodeReport(payload: string): Report | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed?.archetype?.name || !Array.isArray(parsed?.radar)) return null;
    return parsed as Report;
  } catch {
    return null;
  }
}

export function buildShareUrl(report: Report): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#r=${encodeReport(report)}`;
}
