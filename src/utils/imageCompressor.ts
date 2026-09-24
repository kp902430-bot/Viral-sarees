/**
 * Helper utility to resize and compress user-selected images (from phone camera or gallery)
 * to high-quality lightweight Data URLs to save instantly into localStorage without exceeding browser quota.
 */
export const compressImageFile = (
  file: File,
  maxDimension = 1200,
  quality = 0.84
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if valid image type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Draw image with smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG format with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if canvas rendering fails
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
