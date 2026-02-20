const AWS = require('aws-sdk');

// Configure Yandex Object Storage (S3-compatible)
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true
});

const BUCKET = process.env.S3_BUCKET;

async function uploadFile(buffer, key, contentType) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

async function deleteFile(key) {
  const params = {
    Bucket: BUCKET,
    Key: key
  };

  await s3.deleteObject(params).promise();
}

function getFileUrl(key) {
  return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  s3,
  BUCKET
};
