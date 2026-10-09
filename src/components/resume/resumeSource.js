// Update this existing Drive item's contents with Manage versions → Upload new version.
// A new upload with the same filename has a different ID and is a different source.
export const RESUME_DRIVE_FILE_ID = "1ur7krnoyejgUwa6azvwzmWAas6kzIiVT";

export function getResumeSource(fileId = RESUME_DRIVE_FILE_ID) {
  if (typeof fileId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(fileId)) return null;

  const fileUrl = `https://drive.google.com/file/d/${fileId}`;
  return {
    previewUrl: `${fileUrl}/preview`,
    openUrl: `${fileUrl}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}
