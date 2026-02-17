// File validation utilities for secure file uploads

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'text/plain': ['txt'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx']
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File size exceeds 30MB limit' 
    };
  }

  // Check MIME type
  const allowedTypes = Object.keys(ALLOWED_MIME_TYPES);
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only PDF, Word, Excel, PowerPoint, images, and text files are allowed.' 
    };
  }

  // Validate extension matches MIME type
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) {
    return { 
      valid: false, 
      error: 'File must have a valid extension' 
    };
  }

  const expectedExtensions = ALLOWED_MIME_TYPES[file.type];
  if (!expectedExtensions || !expectedExtensions.includes(ext)) {
    return { 
      valid: false, 
      error: `File extension .${ext} does not match the file type ${file.type}` 
    };
  }

  // Sanitize filename - check for path traversal attempts
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { 
      valid: false, 
      error: 'Invalid characters in filename' 
    };
  }

  return { valid: true };
};

// Generate a signed URL that expires
export const getSignedFileUrl = async (
  supabase: any,
  bucket: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
};
