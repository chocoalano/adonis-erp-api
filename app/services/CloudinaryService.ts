import cloudinary from "#config/cloudinary";

class CloudinaryService {
    public static async upload(file: any, folder_target: string) {
        try {
            const result = await cloudinary.uploader.upload(file.tmpPath, {
                folder: folder_target,
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

    public static async extractPublicId(cloudinaryUrl: string) {
        const urlParts = cloudinaryUrl.split('/upload/');
        if (urlParts.length < 2) {
            throw new Error('Invalid Cloudinary URL');
        }
        const pathWithVersion = urlParts[1];
        const publicIdWithExtension = pathWithVersion.split('/').slice(1).join('/'); // Skips the version part
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove the extension
        return publicId;
    }
}

export default CloudinaryService;
