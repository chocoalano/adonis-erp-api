import cloudinary from "#config/cloudinary";

class CloudinaryService {
  public static async upload(file: any, folder_target: string) {
    try {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 14);
      const result = await cloudinary.uploader.upload(file.tmpPath, {
        folder: folder_target,
        public_id: timestamp, // Rename file saat upload
        overwrite: true,
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  public static async uploadAbsensi(file: any, folder_target: string, nik: number) {
    try {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 14);
      const newFileName = `${nik}-${timestamp}`;
      const result = await cloudinary.uploader.upload(file.tmpPath, {
        folder: folder_target,
        public_id: newFileName, // Rename file saat upload
        overwrite: true,
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  public static async delete(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  public static async extractPublicId(cloudinaryUrl: string): Promise<{ status: boolean; res: string }> {
    const urlParts = cloudinaryUrl.split('/upload/');
    if (urlParts.length < 2) {
      return { status: false, res: 'Invalid Cloudinary URL' }
    }
    const pathWithVersion = urlParts[1];
    const publicIdWithExtension = pathWithVersion.split('/').slice(1).join('/'); // Skips the version part
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove the extension
    return { status: true, res: publicId };
  }
}

export default CloudinaryService;
