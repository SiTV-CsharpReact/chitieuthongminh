const express = require('express');
const multer = require('multer');
const { decode } = require('html-entities');
const path = require('path');
const fs = require('fs');

const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB
const router = express.Router();

const logInfo = (...args) => console.log('ℹ️ [INFO]', ...args);
const logWarn = (...args) => console.warn('⚠️ [WARN]', ...args);
const logError = (...args) => console.error('❌ [ERROR]', ...args);

/* ===================== CONFIG ===================== */
const UPLOAD_ROOT = path.join(__dirname, '..', 'upload');
const UPLOAD_DIR = path.join(UPLOAD_ROOT, 'image');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ===================== HELPERS ===================== */
const safePath = (p = '') =>
    path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, '');

const exists = p => fs.existsSync(p);

const removeVietnameseTones = (filename) => {
    if (!filename) return '';

    logInfo('🔤 Input:', JSON.stringify(filename));

    // 1. Decode HTML entities & Handle buffer encoding
    let decodedFilename = decode(filename);

    const ext = path.extname(decodedFilename);
    const name = path.basename(decodedFilename, ext);

    logInfo('📁 Name:', JSON.stringify(name), 'Ext:', JSON.stringify(ext));

    // 2. ✅ CLEAN UTF-8 / Corrupt characters
    let cleanName = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')    // Vietnamese accents
        .replace(/[\u00c0-\u00ff]/g, '')    // Latin-1 corrupt
        .replace(/Ì|Ä|£|\\x[0-9a-fA-F]{2}/g, '')
        .replace(/[^\x20-\x7E\w\s-]/g, '')  // ASCII + alphanumeric
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

    logInfo('🔧 After clean:', JSON.stringify(cleanName));

    // 3. Regex backup for manual mapping
    cleanName = cleanName
        .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .toLowerCase();

    // 4. Final Slugification
    cleanName = cleanName
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

    const result = ext ? `${cleanName}${ext}` : cleanName;
    logInfo('✅ Output:', JSON.stringify(result));
    return result;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = safePath(req.query.folder || '');
        const dir = path.join(UPLOAD_DIR, folder);

        logInfo('Upload request', {
            folder: folder || 'ROOT',
            file: file.originalname
        });

        if (folder && !fs.existsSync(dir)) {
            logError('Folder không tồn tại', dir);
            return cb(new Error('Folder không tồn tại'), null);
        }

        cb(null, folder ? dir : UPLOAD_DIR);
    },

    filename: (req, file, cb) => {
        try {
            // Multer often messes up double-byte filenames on Windows/Linux
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const cleanName = removeVietnameseTones(originalName);
            cb(null, cleanName);
        } catch (e) {
            logError('Filename error', e);
            cb(e, null);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB
    fileFilter: (req, file, cb) =>
        file.mimetype.startsWith('image/')
            ? cb(null, true)
            : cb(new Error('Chỉ cho phép upload file ảnh (jpg, png, webp,...)'), false)
});

/* ===================== 1. LIST ===================== */
router.get('/list', (req, res) => {
    try {
        const folder = safePath(req.query.folder || '');
        const dir = path.join(UPLOAD_DIR, folder);

        let folders = [];
        let files = [];

        if (!exists(dir)) {
            return res.json({ folders, files, currentFolder: folder });
        }

        const items = fs.readdirSync(dir, { withFileTypes: true });
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        items.forEach(item => {
            const fullPath = path.join(dir, item.name);
            const relativePath = folder ? `${folder}/${item.name}` : item.name;

            if (item.isDirectory()) {
                folders.push({ name: item.name, path: relativePath });
            } else if (!item.name.startsWith('.')) { // Ignore hidden files
                const stat = fs.statSync(fullPath);
                files.push({
                    name: item.name,
                    path: relativePath,
                    size: stat.size,
                    url: `${baseUrl}/upload/image/${relativePath}`
                });
            }
        });

        res.json({ folders, files, currentFolder: folder });
    } catch (err) {
        logError('List error', err);
        res.status(500).json({ error: 'Lỗi khi đọc danh sách file' });
    }
});

/* ===================== 2. UPLOAD ===================== */
router.post('/upload', (req, res) => {
    upload.array('files', 10)(req, res, err => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const uploadedFiles = (req.files || []).map(f => {
            const rel = path.relative(UPLOAD_DIR, f.path);
            return {
                name: f.filename,
                path: rel,
                size: f.size,
                url: `${baseUrl}/upload/image/${rel}`
            };
        });

        res.json({ success: true, files: uploadedFiles });
    });
});

/* ===================== 3. CREATE FOLDER ===================== */
router.post('/create', express.json(), (req, res) => {
    const parent = safePath(req.body.parent || '');
    const rawName = req.body.name?.trim();

    if (!rawName) return res.status(400).json({ error: 'Tên folder rỗng' });

    const cleanName = removeVietnameseTones(rawName);
    const dir = path.join(UPLOAD_DIR, parent, cleanName);

    if (exists(dir)) return res.status(400).json({ error: 'Folder đã tồn tại' });

    fs.mkdirSync(dir, { recursive: true });
    res.json({ success: true, name: cleanName });
});

/* ===================== 4. RENAME ===================== */
router.post('/rename', express.json(), async (req, res) => {
    try {
        const oldPath = safePath(req.body.oldPath);
        const newNameRaw = req.body.newName?.trim();

        if (!oldPath || !newNameRaw) return res.status(400).json({ error: 'Thiếu dữ liệu' });

        const newName = removeVietnameseTones(newNameRaw);
        const oldFull = path.join(UPLOAD_DIR, oldPath);
        const newFull = path.join(path.dirname(oldFull), newName);

        if (!exists(oldFull)) return res.status(404).json({ error: 'Nguồn không tồn tại' });
        if (exists(newFull)) return res.status(400).json({ error: 'Tên mới đã tồn tại' });

        await fs.promises.rename(oldFull, newFull);
        res.json({ success: true, newName });
    } catch (err) {
        logError('Rename error', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi đổi tên' });
    }
});

/* ===================== 5. MOVE ===================== */
router.post('/move', express.json(), async (req, res) => {
    try {
        const source = safePath(req.body.source);
        const target = safePath(req.body.target || '');

        if (!source) return res.status(400).json({ error: 'Thiếu nguồn di chuyển' });

        const from = path.join(UPLOAD_DIR, source);
        const targetDir = path.join(UPLOAD_DIR, target);
        const to = path.join(targetDir, path.basename(source));

        if (!exists(from)) return res.status(404).json({ error: 'Nguồn không tồn tại' });
        if (!exists(targetDir)) return res.status(400).json({ error: 'Thư mục đích không tồn tại' });
        if (exists(to)) return res.status(400).json({ error: 'Đã tồn tại file/thư mục trùng tên tại đích' });

        await fs.promises.rename(from, to);
        res.json({ success: true });
    } catch (err) {
        logError('Move error', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi di chuyển' });
    }
});

/* ===================== 6. DELETE ===================== */
router.delete('/delete', express.json(), (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items)) return res.status(400).json({ error: 'Danh sách xóa không hợp lệ' });

    items.forEach(({ path: p }) => {
        const full = path.join(UPLOAD_DIR, safePath(p));
        if (exists(full)) {
            fs.rmSync(full, { recursive: true, force: true });
        }
    });

    res.json({ success: true });
});

/* ===================== 7. TREE ===================== */
const readTree = (dir, base = '') =>
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => ({
            name: d.name,
            path: base ? `${base}/${d.name}` : d.name,
            children: readTree(path.join(dir, d.name), base ? `${base}/${d.name}` : d.name)
        }));

router.get('/tree', (req, res) => {
    try {
        res.json(readTree(UPLOAD_DIR));
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi đọc cấu trúc thư mục' });
    }
});

/* ===================== 8. SEARCH ===================== */
const recursiveSearch = (dir, baseUrl, keyword, currentPath = '') => {
    let results = [];
    if (!exists(dir)) return results;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        const relativePath = currentPath ? `${currentPath}/${item.name}` : item.name;

        if (item.isDirectory()) {
            results = results.concat(recursiveSearch(fullPath, baseUrl, keyword, relativePath));
        } else if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
            const stat = fs.statSync(fullPath);
            results.push({
                name: item.name,
                path: relativePath,
                size: stat.size,
                url: `${baseUrl}/upload/image/${relativePath}`
            });
        }
    });

    return results;
};

router.get('/search', (req, res) => {
    const keyword = req.query.keyword?.trim();
    if (!keyword) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

    const folder = safePath(req.query.folder || '');
    const dir = path.join(UPLOAD_DIR, folder);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const files = recursiveSearch(dir, baseUrl, keyword, folder);
    res.json({ success: true, files });
});

/* ===================== 9. STORAGE ===================== */
const getFolderSize = (dir) => {
    let total = 0;
    if (!exists(dir)) return 0;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            total += getFolderSize(fullPath);
        } else {
            total += fs.statSync(fullPath).size;
        }
    });
    return total;
};

router.get('/storage', (req, res) => {
    const size = getFolderSize(UPLOAD_DIR);
    const percent = (size / MAX_STORAGE) * 100;

    res.json({
        success: true,
        used: size,
        max: MAX_STORAGE,
        usedGB: (size / 1024 / 1024 / 1024).toFixed(2),
        maxGB: (MAX_STORAGE / 1024 / 1024 / 1024).toFixed(0),
        percent: percent.toFixed(0)
    });
});

module.exports = router;
