const process = require('process');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.ROOT_DIR)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

const loader = multer({ storage: storage });

exports.uploadFile = (req, res, next) => {
    try {
        const upload = loader.single('file');
        upload(req, res, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: 'Hubo un error al subir el archivo.' });
            }        
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Hubo un error al subir el archivo.' });
    }
};

exports.uploadFiles = (req, res, next) => {
    try {
        const upload = loader.fields([{ name: 'zip', maxCount: 1 }, { name: 'json', maxCount: 1 }]);
        upload(req, res, (err) => {
            if (err) {
                console.log("Error de multer => ", err);
                return res.status(500).send({ message: 'Hubo un error al subir el archivo.' });
            }        
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Hubo un error al subir el archivo.' });
    }
};

exports.uploadImage = (req, res, next) => {
    const upload = loader.single('image');

    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: 'Hubo un error al subir el archivo.' });
        }
        
        next();
    });
};