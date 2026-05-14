import ImageKit from "imagekit";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const getCompressionSettings = (fileSizeMB) => {
  if (fileSizeMB > 5) {
    return { quality: 60, maxWidth: 800 };
  } else if (fileSizeMB > 3) {
    return { quality: 70, maxWidth: 1000 };
  } else if (fileSizeMB > 1) {
    return { quality: 75, maxWidth: 1200 };
  } else {
    return { quality: 80, maxWidth: 1500 };
  }
};

export const getImageKitAuth = (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.status(200).send(authenticationParameters);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const deleteImage = async (fileId) => {
  try {
    if (!fileId) return;

    let mainFileDetails;
    try {
      mainFileDetails = await imagekit.getFileDetails(fileId);
      console.log(`Found main file: ${mainFileDetails.name}`);
    } catch (error) {
      if (error.message.includes('File not found') || error.message.includes('No file exists')) {
        console.log(`Main file ${fileId} was already deleted`);
        return;
      }
      throw error;
    }

    await imagekit.deleteFile(fileId);
    console.log(`Deleted main image: ${mainFileDetails.name}`);

    try {
      const searchQuery = mainFileDetails.name.replace(/\.[^/.]+$/, "");
      
      const files = await imagekit.listFiles({
        skip: 0,
        limit: 100,
        searchQuery: searchQuery
      });

      const icoFiles = files.filter(file => {
        const isRelated = file.name.includes(searchQuery) && 
                         file.fileId !== fileId;
        const isLikelyIco = file.size < 50 * 1024;
        const isInSystemFolder = file.filePath.includes('system') || 
                                file.filePath.includes('thumbnails') ||
                                file.filePath.includes('preview');
        
        return isRelated && (isLikelyIco || isInSystemFolder);
      });

      for (const icoFile of icoFiles) {
        try {
          await imagekit.deleteFile(icoFile.fileId);
          console.log(`Deleted ICO file: ${icoFile.name} (${icoFile.filePath})`);
        } catch (icoError) {
          console.warn(`Could not delete ICO file ${icoFile.name}:`, icoError.message);
        }
      }

      if (icoFiles.length > 0) {
        console.log(`Deleted ${icoFiles.length} ICO files for ${mainFileDetails.name}`);
      }

    } catch (searchError) {
      console.warn('Could not search for ICO files:', searchError.message);
    }

  } catch (error) {
    console.error('Error in deleteImage:', error.message);
  }
};

export const uploadImage = async (req, res) => {
  try {
    console.log('=== UPLOAD IMAGE START ===');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?._id || 'unknown';
    const originalBuffer = req.file.buffer;
    const originalSizeMB = originalBuffer.length / (1024 * 1024);

    let fileBuffer = originalBuffer;
    let compressionInfo = null;

    if (originalSizeMB > 1) {
      const compressedBuffer = await compressImage(originalBuffer, 80, 1200);
      fileBuffer = compressedBuffer;
      
      const compressedSizeMB = fileBuffer.length / (1024 * 1024);
      const compressionRatio = ((1 - fileBuffer.length / originalBuffer.length) * 100).toFixed(1);
      
      compressionInfo = {
        originalSize: originalSizeMB.toFixed(2),
        compressedSize: compressedSizeMB.toFixed(2),
        compressionRatio: `${compressionRatio}%`
      };
      
      console.log(`Auto-compressed: ${compressionInfo.originalSize}MB -> ${compressionInfo.compressedSize}MB`);
    }

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: `profile_${userId}_${uuidv4()}.jpg`,
      folder: '/profiles',
      useUniqueFileName: true,
      tags: ["profile", `user_${userId}`],
      isPrivateFile: false,
    });

    const responseData = {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId
    };

    if (compressionInfo) {
      Object.assign(responseData, compressionInfo);
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({ 
      message: 'Upload failed: ' + error.message 
    });
  }
};

export const uploadCompressedImage = async (req, res) => {
  try {
    console.log('=== COMPRESSED UPLOAD START ===');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?._id || 'unknown';
    const originalBuffer = req.file.buffer;
    const originalSizeMB = originalBuffer.length / (1024 * 1024);

    console.log(`Original file: ${originalSizeMB.toFixed(2)}MB, type: ${req.file.mimetype}`);

    const compressionSettings = getCompressionSettings(originalSizeMB);
    const compressedBuffer = await compressImage(originalBuffer, compressionSettings.quality, compressionSettings.maxWidth);

    const compressedSizeMB = compressedBuffer.length / (1024 * 1024);
    const compressionRatio = ((1 - compressedBuffer.length / originalBuffer.length) * 100).toFixed(1);

    console.log(`Uploading compressed image: ${compressedSizeMB.toFixed(2)}MB (${compressionRatio}% smaller)`);

    const uploadResponse = await imagekit.upload({
      file: compressedBuffer,
      fileName: `profile_${userId}_${uuidv4()}.jpg`,
      folder: '/profiles',
      useUniqueFileName: true,
      tags: ["profile", `user_${userId}`, "compressed"],
      isPrivateFile: false,
    });

    console.log(`Upload successful: ${uploadResponse.size} bytes`);

    res.status(200).json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      originalSize: originalSizeMB.toFixed(2),
      compressedSize: compressedSizeMB.toFixed(2),
      compressionRatio: `${compressionRatio}%`,
      quality: compressionSettings.quality,
      width: compressionSettings.maxWidth
    });

  } catch (error) {
    console.error('=== COMPRESSED UPLOAD ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({ 
      message: 'Upload failed: ' + error.message 
    });
  }
};

export const uploadSmartCompressedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?._id || 'unknown';
    const fileBuffer = req.file.buffer;
    const fileSizeMB = fileBuffer.length / (1024 * 1024);

    let quality = 80;
    let width = 1200;

    if (fileSizeMB > 5) {
      quality = 50;
      width = 800;
    } else if (fileSizeMB > 3) {
      quality = 60;
      width = 1000;
    } else if (fileSizeMB > 1) {
      quality = 70;
      width = 1200;
    }

    console.log(`Smart compression: ${fileSizeMB.toFixed(2)}MB -> quality: ${quality}, width: ${width}`);

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: `profile_${userId}_${uuidv4()}.jpg`,
      folder: '/profiles',
      useUniqueFileName: true,
      tags: ["profile", `user_${userId}`, "compressed"],
      isPrivateFile: false,
      quality: quality,
      background: "FFFFFF",
      transformation: {
        pre: `w-${width}-c-at_max`
      }
    });

    const compressionRatio = ((fileSizeMB - (uploadResponse.size / (1024 * 1024))) / fileSizeMB * 100).toFixed(1);

    res.status(200).json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      originalSize: fileSizeMB.toFixed(2),
      compressedSize: (uploadResponse.size / (1024 * 1024)).toFixed(2),
      compressionRatio: `${compressionRatio}%`,
      quality: quality,
      width: width
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const compressImage = async (buffer, quality = 70, maxWidth = 800) => {
  try {
    let sharpInstance = sharp(buffer);
    
    const metadata = await sharpInstance.metadata();
    const isTransparent = metadata.hasAlpha;
    
    console.log(`Image format: ${metadata.format}, size: ${metadata.width}x${metadata.height}, transparent: ${isTransparent}`);
    
    if (metadata.format === 'png' && isTransparent) {
      sharpInstance = sharpInstance
        .resize({
          width: maxWidth,
          height: maxWidth,
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ 
          quality: quality,
          compressionLevel: 9
        });
    } else {
      sharpInstance = sharpInstance
        .resize({
          width: maxWidth,
          height: maxWidth,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: quality,
          mozjpeg: true
        });
    }
    
    const compressedBuffer = await sharpInstance.toBuffer();
    
    const originalSize = (buffer.length / (1024 * 1024)).toFixed(2);
    const compressedSize = (compressedBuffer.length / (1024 * 1024)).toFixed(2);
    const compressionRatio = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(1);
    
    console.log(`Compression result: ${originalSize}MB -> ${compressedSize}MB (${compressionRatio}% reduction)`);
    
    return compressedBuffer;
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress image');
  }
};

export const uploadPostImage = async (req, res) => {
  try {
    console.log('=== UPLOAD POST IMAGE START ===');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?._id || 'unknown';
    const originalBuffer = req.file.buffer;
    const originalSizeMB = originalBuffer.length / (1024 * 1024);

    let fileBuffer = originalBuffer;
    let compressionInfo = null;

    if (originalSizeMB > 1) {
      const compressedBuffer = await compressImage(originalBuffer, 80, 1200);
      fileBuffer = compressedBuffer;
      
      const compressedSizeMB = fileBuffer.length / (1024 * 1024);
      const compressionRatio = ((1 - fileBuffer.length / originalBuffer.length) * 100).toFixed(1);
      
      compressionInfo = {
        originalSize: originalSizeMB.toFixed(2),
        compressedSize: compressedSizeMB.toFixed(2),
        compressionRatio: `${compressionRatio}%`
      };
      
      console.log(`Auto-compressed: ${compressionInfo.originalSize}MB -> ${compressionInfo.compressedSize}MB`);
    }

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: `post_${userId}_${uuidv4()}.jpg`,
      folder: '/posts',
      useUniqueFileName: true,
      tags: ["post", `user_${userId}`],
      isPrivateFile: false,
    });

    const responseData = {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId
    };

    if (compressionInfo) {
      Object.assign(responseData, compressionInfo);
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('=== POST UPLOAD ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({ 
      message: 'Upload failed: ' + error.message 
    });
  }
};

export const uploadCompressedPostImage = async (req, res) => {
  try {
    console.log('=== COMPRESSED POST UPLOAD START ===');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?._id || 'unknown';
    const originalBuffer = req.file.buffer;
    const originalSizeMB = originalBuffer.length / (1024 * 1024);

    console.log(`Original file: ${originalSizeMB.toFixed(2)}MB, type: ${req.file.mimetype}`);

    const compressionSettings = getCompressionSettings(originalSizeMB);
    const compressedBuffer = await compressImage(originalBuffer, compressionSettings.quality, compressionSettings.maxWidth);

    const compressedSizeMB = compressedBuffer.length / (1024 * 1024);
    const compressionRatio = ((1 - compressedBuffer.length / originalBuffer.length) * 100).toFixed(1);

    console.log(`Uploading compressed image: ${compressedSizeMB.toFixed(2)}MB (${compressionRatio}% smaller)`);

    const uploadResponse = await imagekit.upload({
      file: compressedBuffer,
      fileName: `post_${userId}_${uuidv4()}.jpg`,
      folder: '/posts',
      useUniqueFileName: true,
      tags: ["post", `user_${userId}`, "compressed"],
      isPrivateFile: false,
    });

    console.log(`Upload successful: ${uploadResponse.size} bytes`);

    res.status(200).json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      originalSize: originalSizeMB.toFixed(2),
      compressedSize: compressedSizeMB.toFixed(2),
      compressionRatio: `${compressionRatio}%`,
      quality: compressionSettings.quality,
      width: compressionSettings.maxWidth
    });

  } catch (error) {
    console.error('=== COMPRESSED POST UPLOAD ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({ 
      message: 'Upload failed: ' + error.message 
    });
  }
};