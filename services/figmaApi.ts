// ==========================================
// FIGMA REST API SERVICE
// Client-side Figma API using Personal Access Token
// ==========================================

const STORAGE_KEY = 'creaflow_figma_token';

export function getFigmaToken(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setFigmaToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearFigmaToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isFigmaConnected(): boolean {
  return !!getFigmaToken();
}

// Headers builder
function headers(): HeadersInit {
  const token = getFigmaToken();
  if (!token) throw new Error('Figma token not configured');
  return { 'X-Figma-Token': token };
}

// ==========================================
// URL PARSING
// ==========================================

export interface FigmaUrlInfo {
  fileKey: string;
  nodeId?: string;
  fileName?: string;
}

export function parseFigmaUrl(url: string): FigmaUrlInfo | null {
  try {
    // Match: figma.com/design/FILE_KEY/NAME?node-id=X-Y
    // or:    figma.com/file/FILE_KEY/NAME?node-id=X-Y
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)(?:\/([^?]*))?/);
    if (!match) return null;

    const fileKey = match[1];
    const fileName = match[2] ? decodeURIComponent(match[2]) : undefined;

    // Extract node-id from query params
    const urlObj = new URL(url);
    const nodeIdParam = urlObj.searchParams.get('node-id');
    const nodeId = nodeIdParam ? nodeIdParam.replace('-', ':') : undefined;

    return { fileKey, nodeId, fileName };
  } catch {
    return null;
  }
}

// ==========================================
// API CALLS
// ==========================================

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

export interface FigmaExportResult {
  nodeId: string;
  imageUrl: string;
}

// Get file metadata
export async function getFileInfo(fileKey: string): Promise<FigmaFile> {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Figma API error ${res.status}`);
  }
  const data = await res.json();
  return {
    name: data.name,
    lastModified: data.lastModified,
    thumbnailUrl: data.thumbnailUrl,
    version: data.version,
  };
}

// Get top-level frames (pages → frames)
export async function getFileFrames(fileKey: string): Promise<FigmaNode[]> {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=2`, { headers: headers() });
  if (!res.ok) throw new Error(`Figma API error ${res.status}`);
  const data = await res.json();

  const frames: FigmaNode[] = [];
  for (const page of data.document?.children || []) {
    for (const child of page.children || []) {
      if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
        frames.push({ id: child.id, name: child.name, type: child.type });
      }
    }
  }
  return frames;
}

// Export frames as PNG images
export async function exportFrames(
  fileKey: string,
  nodeIds: string[],
  format: 'png' | 'svg' | 'jpg' | 'pdf' = 'png',
  scale: number = 2
): Promise<FigmaExportResult[]> {
  const ids = nodeIds.join(',');
  const res = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Figma API error ${res.status}`);
  const data = await res.json();

  return Object.entries(data.images || {}).map(([nodeId, url]) => ({
    nodeId,
    imageUrl: url as string,
  }));
}

// Get rendered image of specific node(s) — for thumbnails
export async function getNodeThumbnail(fileKey: string, nodeId: string): Promise<string | null> {
  try {
    const results = await exportFrames(fileKey, [nodeId], 'png', 1);
    return results[0]?.imageUrl || null;
  } catch {
    return null;
  }
}

// List recent files from the user's Figma account
export interface FigmaProjectFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export async function getRecentFiles(): Promise<FigmaProjectFile[]> {
  // Figma API: GET /v1/me → get teams → get projects → get files
  // Simpler: use /v1/me/files (not officially documented but works)
  // Fallback: we'll get the user's teams and iterate
  try {
    const meRes = await fetch('https://api.figma.com/v1/me', { headers: headers() });
    if (!meRes.ok) throw new Error(`Auth failed: ${meRes.status}`);
    const me = await meRes.json();

    // Try to get team projects
    const teamIds: string[] = [];
    // If user has teams, get first team's projects
    if (me.id) {
      // Get projects from all teams would be complex;
      // Instead, let users paste file URLs directly.
      // Return empty — the UI will show "paste URL" as primary UX.
    }
    return [];
  } catch {
    return [];
  }
}

// Validate token by checking /v1/me
export async function validateToken(): Promise<{ valid: boolean; userName?: string; email?: string }> {
  try {
    const res = await fetch('https://api.figma.com/v1/me', { headers: headers() });
    if (!res.ok) return { valid: false };
    const data = await res.json();
    return { valid: true, userName: data.handle, email: data.email };
  } catch {
    return { valid: false };
  }
}
