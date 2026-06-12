// ==========================================
// GOOGLE DRIVE SERVICE
// Manages brand → folder mappings and simulates
// auto-upload workflow for approved assets.
// In production, this would call a backend or Google Drive API.
// For now, stores folder config in localStorage and
// tracks upload records.
// ==========================================

const FOLDER_MAP_KEY = 'creaflow_drive_folders';
const UPLOAD_LOG_KEY = 'creaflow_drive_uploads';

// Brand → Google Drive folder mapping
export interface BrandFolderMapping {
  brandId: string;
  folderId: string;
  folderName: string;
  folderUrl: string;
}

export interface DriveUploadRecord {
  id: string;
  cardId: string;
  cardTitle: string;
  brandId: string;
  fileName: string;
  folderName: string;
  folderId: string;
  uploadedAt: string;
  status: 'pending' | 'uploaded' | 'error';
  driveUrl?: string;
  errorMessage?: string;
}

// ==========================================
// FOLDER MAPPINGS
// ==========================================

export function getFolderMappings(): BrandFolderMapping[] {
  try {
    return JSON.parse(localStorage.getItem(FOLDER_MAP_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFolderMappings(mappings: BrandFolderMapping[]): void {
  localStorage.setItem(FOLDER_MAP_KEY, JSON.stringify(mappings));
}

export function getFolderForBrand(brandId: string): BrandFolderMapping | undefined {
  return getFolderMappings().find(m => m.brandId === brandId);
}

export function setFolderForBrand(mapping: BrandFolderMapping): void {
  const current = getFolderMappings();
  const idx = current.findIndex(m => m.brandId === mapping.brandId);
  if (idx >= 0) {
    current[idx] = mapping;
  } else {
    current.push(mapping);
  }
  saveFolderMappings(current);
}

export function removeFolderMapping(brandId: string): void {
  saveFolderMappings(getFolderMappings().filter(m => m.brandId !== brandId));
}

// ==========================================
// UPLOAD RECORDS
// ==========================================

export function getUploadRecords(): DriveUploadRecord[] {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addUploadRecord(record: DriveUploadRecord): void {
  const records = getUploadRecords();
  records.unshift(record);
  localStorage.setItem(UPLOAD_LOG_KEY, JSON.stringify(records.slice(0, 200)));
}

export function updateUploadRecord(id: string, update: Partial<DriveUploadRecord>): void {
  const records = getUploadRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...update };
    localStorage.setItem(UPLOAD_LOG_KEY, JSON.stringify(records));
  }
}

// ==========================================
// SIMULATED UPLOAD (client-side only)
// In production this would call Google Drive API
// ==========================================

export async function simulateUploadToDrive(
  cardId: string,
  cardTitle: string,
  brandId: string,
  artUrl: string
): Promise<DriveUploadRecord> {
  const folder = getFolderForBrand(brandId);
  if (!folder) {
    throw new Error(`Nenhuma pasta do Drive configurada para esta marca.`);
  }

  const record: DriveUploadRecord = {
    id: `upload-${Date.now()}`,
    cardId,
    cardTitle,
    brandId,
    fileName: `${cardTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`,
    folderName: folder.folderName,
    folderId: folder.folderId,
    uploadedAt: new Date().toISOString(),
    status: 'pending',
  };

  addUploadRecord(record);

  // Simulate async upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate success (in production, actually upload to Drive)
  const driveUrl = `https://drive.google.com/drive/folders/${folder.folderId}`;
  updateUploadRecord(record.id, {
    status: 'uploaded',
    driveUrl,
  });

  return { ...record, status: 'uploaded', driveUrl };
}

// Check if auto-upload is enabled for a brand
export function isAutoUploadEnabled(brandId: string): boolean {
  return !!getFolderForBrand(brandId);
}
