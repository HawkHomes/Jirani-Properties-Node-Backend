import multer = require('multer');

export const FileParserMiddleWare = (req, res, next) => {
	const upload = multer({ storage: multer.memoryStorage() });
};
