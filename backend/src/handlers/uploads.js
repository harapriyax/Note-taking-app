const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { success, error, parseBody, getUserId } = require('../lib/response');

const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET_NAME = process.env.ATTACHMENTS_BUCKET || `noteflow-attachments-${process.env.STAGE || 'live'}`;

const s3Client = new S3Client({ region: REGION });

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB max per file

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
]);

function sanitizeFileName(fileName) {
  return (fileName || 'attachment')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-100);
}

// POST /api/uploads/presigned-url
module.exports.getPresignedUrl = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const body = parseBody(event);
  const files = Array.isArray(body.files) ? body.files : (body.fileName ? [body] : []);

  if (files.length === 0) {
    return error('At least one file must be specified', 400);
  }

  if (files.length > 20) {
    return error('Cannot upload more than 20 files in a single batch', 400);
  }

  const presignedList = [];

  for (const item of files) {
    const { fileName, fileType, fileSize } = item;

    if (!fileName || !fileType) {
      return error('Each file must have a fileName and fileType', 400);
    }

    if (!ALLOWED_MIME_TYPES.has(fileType.toLowerCase())) {
      return error(`File type "${fileType}" is not supported. Only images (PNG, JPG, WEBP, GIF, SVG) and PDFs are allowed.`, 400);
    }

    if (fileSize && Number(fileSize) > MAX_FILE_SIZE) {
      return error(`File "${fileName}" exceeds the maximum allowed size of 25MB.`, 400);
    }

    const fileId = uuidv4();
    const cleanName = sanitizeFileName(fileName);
    const s3Key = `attachments/${userId}/${fileId}-${cleanName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;

      presignedList.push({
        id: fileId,
        fileName: cleanName,
        originalName: fileName,
        fileType,
        fileSize: fileSize || null,
        key: s3Key,
        uploadUrl,
        fileUrl,
        type: fileType.toLowerCase() === 'application/pdf' ? 'pdf' : 'image',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to generate pre-signed URL:', err);
      return error('Failed to generate upload URL. Please try again.', 500);
    }
  }

  return success({
    success: true,
    bucket: BUCKET_NAME,
    uploads: presignedList,
  });
};
