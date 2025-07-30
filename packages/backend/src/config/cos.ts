import COS from 'cos-nodejs-sdk-v5';
import dotenv from 'dotenv';

dotenv.config();

// 腾讯云COS配置
const cosConfig = {
	SecretId: process.env.COS_SECRET_ID || '',
	SecretKey: process.env.COS_SECRET_KEY || '',
	Region: process.env.COS_REGION || 'ap-beijing',
	Bucket: process.env.COS_BUCKET || '',
	Domain: process.env.COS_DOMAIN || '',
};

// 创建COS实例
const cos = new COS({
	SecretId: cosConfig.SecretId,
	SecretKey: cosConfig.SecretKey,
});

// 检查COS配置是否完整
export const isCOSConfigured = () => {
	return (
		cosConfig.SecretId &&
		cosConfig.SecretKey &&
		cosConfig.Region &&
		cosConfig.Bucket
	);
};

// 上传文件到COS
export const uploadToCOS = async (
	file: Buffer,
	fileName: string,
	contentType: string = 'application/octet-stream'
): Promise<string> => {
	if (!isCOSConfigured()) {
		throw new Error('COS配置不完整，请检查环境变量');
	}

	try {
		const result = await cos.putObject({
			Bucket: cosConfig.Bucket,
			Region: cosConfig.Region,
			Key: fileName,
			Body: file,
			ContentType: contentType,
		});

		// 返回文件的访问URL
		return `${cosConfig.Domain}/${fileName}`;
	} catch (error) {
		console.error('COS上传失败:', error);
		throw new Error('文件上传失败');
	}
};

// 删除COS中的文件
export const deleteFromCOS = async (fileName: string): Promise<void> => {
	if (!isCOSConfigured()) {
		throw new Error('COS配置不完整，请检查环境变量');
	}

	try {
		await cos.deleteObject({
			Bucket: cosConfig.Bucket,
			Region: cosConfig.Region,
			Key: fileName,
		});
	} catch (error) {
		console.error('COS删除失败:', error);
		throw new Error('文件删除失败');
	}
};

// 生成唯一文件名
export const generateFileName = (originalName: string, category?: string): string => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
	const basePath = category ? `images/${category}` : 'uploads';
	return ext ? `${basePath}/${timestamp}_${random}.${ext}` : `${basePath}/${timestamp}_${random}`;
};

export { cos, cosConfig };