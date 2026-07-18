/**
 * 目录扫描脚本 —— 生成 fileTree.json
 *
 * 用法：  node generate-tree.js
 * 功能：  递归扫描 src/LearningMaterial 目录，生成完整的文件树 JSON
 *        后续在 Cloudflare Pages 上部署时，只需将此 JSON 一并上传即可
 *
 * 添加新文件/文件夹后，重新运行此脚本即可刷新树结构，无需修改 index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LearningMaterial 目录作为资料存储根目录
const LEARNING_MATERIAL_DIR = path.resolve(__dirname, '..', '..', 'LearningMaterial');
const ROOT_DIR = LEARNING_MATERIAL_DIR;
const OUTPUT_FILE = path.join(ROOT_DIR, 'fileTree.json');

// 需要排除的文件/文件夹
const EXCLUDE = new Set([
    'node_modules',
    '.git',
    '.gitignore',
    'generate-tree.js',  // 脚本自身不展示
    'fileTree.json',      // 树数据文件自身不展示
    'index.html',         // 网页自身不展示
]);

/**
 * 递归扫描目录
 * @param {string} dirPath  绝对路径
 * @param {string} relPath  相对路径（用于生成下载链接）
 * @returns {object[]} 当前目录下的条目列表
 */
function scanDirectory(dirPath, relPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const items = [];

    for (const entry of entries) {
        const name = entry.name;
        if (name.startsWith('.') || EXCLUDE.has(name)) continue;

        const fullPath = path.join(dirPath, name);
        const entryRelPath = relPath ? `${relPath}/${name}` : name;

        if (entry.isDirectory()) {
            items.push({
                name,
                type: 'directory',
                children: scanDirectory(fullPath, entryRelPath),
            });
        } else if (entry.isFile()) {
            items.push({
                name,
                type: 'file',
                path: entryRelPath, // 相对路径，用于前端构建下载链接
            });
        }
    }

    // 排序：文件夹在前，文件在后；各自按中文拼音排序
    items.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'zh-CN');
    });

    return items;
}

// ============ 执行 ============
console.log('🔍 正在扫描目录结构...\n');

const tree = scanDirectory(ROOT_DIR, '');

// 统计
function countItems(items) {
    let dirs = 0, files = 0;
    for (const item of items) {
        if (item.type === 'directory') {
            dirs++;
            const sub = countItems(item.children);
            dirs += sub.dirs;
            files += sub.files;
        } else {
            files++;
        }
    }
    return { dirs, files };
}

const stats = countItems(tree);

// 写入文件
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tree, null, 2), 'utf-8');
console.log(`✅ 已生成 ${OUTPUT_FILE}`);
console.log(`📁 ${stats.dirs} 个文件夹，📄 ${stats.files} 个文件`);
console.log('\n现在可以将整个项目部署到 Cloudflare Pages 了！');
