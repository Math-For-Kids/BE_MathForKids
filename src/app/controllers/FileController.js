const { Upload } = require("@aws-sdk/lib-storage");
const { s3 } = require("../config/awsConfig");

class FileController {
  uploadFile = async (file, key) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    try {
      const uploadParallel = new Upload({
        client: s3,
        queueSize: 5,
        partSize: 10 * 1024 * 1024,
        leavePartsOnError: false,
        params,
      });

      uploadParallel.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });

      const data = await uploadParallel.done();
      console.log("Upload completed!", { data });
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  uploadMultipleFiles = async (files) => {
    const uploadedFiles = {};

    for (const file of files) {
      const fileName = Date.now().toString() + "-" + file.originalname;
      console.log("Upload file: " + fileName);
      try {
        const uploadedFile = await this.uploadFile(file, fileName);
        uploadedFiles[file.fieldname] = process.env.CLOUD_FRONT + fileName;
      } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
      }
    }

    return uploadedFiles;
  };
}

module.exports = new FileController();
