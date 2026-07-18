import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import fileTreeData from "../../../LearningMaterial/fileTree.json";

// ============ 类型定义 ============
interface FileItem {
  name: string;
  type: "file";
  path: string;
}

interface DirectoryItem {
  name: string;
  type: "directory";
  children: TreeItem[];
}

type TreeItem = FileItem | DirectoryItem;

interface Stats {
  dirs: number;
  files: number;
}

// ============ 工具函数 ============
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];

function isImageFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

const FILE_ICON_MAP: Record<string, string> = {
  pdf: "📄",
  doc: "📝", docx: "📝",
  xls: "📊", xlsx: "📊",
  ppt: "📽️", pptx: "📽️",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", svg: "🖼️", webp: "🖼️",
  mp3: "🎵", wav: "🎵", flac: "🎵",
  mp4: "🎬", avi: "🎬", mkv: "🎬",
  zip: "📦", rar: "📦", "7z": "📦", tar: "📦", gz: "📦",
  txt: "📃", md: "📃",
  html: "🌐", htm: "🌐",
  css: "🎨",
  js: "⚡", ts: "⚡", jsx: "⚡", tsx: "⚡",
  py: "🐍",
  java: "☕",
  json: "📋",
  xml: "📋",
};

function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICON_MAP[ext] || "📎";
}

function countStats(items: TreeItem[]): Stats {
  let dirs = 0, files = 0;
  for (const item of items) {
    if (item.type === "directory") {
      dirs++;
      if (item.children) {
        const sub = countStats(item.children);
        dirs += sub.dirs;
        files += sub.files;
      }
    } else {
      files++;
    }
  }
  return { dirs, files };
}

function findItemsByPath(tree: TreeItem[], pathStr: string): TreeItem[] | null {
  if (!pathStr) return tree;
  const parts = pathStr.split("/");
  let items: TreeItem[] = tree;
  for (const part of parts) {
    const found = items.find(
      (item): item is DirectoryItem =>
        item.type === "directory" && item.name === part
    );
    if (!found || !found.children) return null;
    items = found.children;
  }
  return items;
}

// 递归过滤树：保留名称匹配的条目，目录若含匹配子项也保留
function filterTree(items: TreeItem[], query: string): TreeItem[] {
  const lowerQuery = query.toLowerCase();
  const result: TreeItem[] = [];

  for (const item of items) {
    if (item.type === "directory") {
      const nameMatch = item.name.toLowerCase().includes(lowerQuery);
      if (item.children) {
        const filteredChildren = filterTree(item.children, query);
        if (nameMatch || filteredChildren.length > 0) {
          result.push({
            ...item,
            children: nameMatch ? item.children : filteredChildren,
          });
        }
      } else if (nameMatch) {
        result.push(item);
      }
    } else {
      if (item.name.toLowerCase().includes(lowerQuery)) {
        result.push(item);
      }
    }
  }

  return result;
}

// ============ TreeNode 组件 ============
interface TreeNodeProps {
  item: TreeItem;
  depth: number;
}

function TreeNode({ item }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);

  if (item.type === "directory") {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li className={`tree-node ${expanded ? "expanded" : ""}`}>
        <div
          className="row folder-row"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="arrow">▶</span>
          <span className="icon folder-icon">{expanded ? "📂" : "📁"}</span>
          <span className="name">{item.name}</span>
        </div>
        <ul className="tree-children">
          {hasChildren ? (
            item.children!.map((child, i) => (
              <TreeNode key={`${child.name}-${i}`} item={child} depth={0} />
            ))
          ) : (
            <li className="empty-msg">（空文件夹）</li>
          )}
        </ul>
      </li>
    );
  }

  // 文件节点
  const isImage = isImageFile(item.name);

  return (
    <li className="tree-node">
      <div className="row file-row">
        <span className="arrow" style={{ visibility: "hidden" }}>▶</span>
        <span className="icon">{getFileIcon(item.name)}</span>
        <span className="name">{item.name}</span>
        <div className="file-actions">
          {isImage && (
            <Link
              className="preview-btn"
              to="/preview"
              state={{ imagePath: item.path }}
              title={`预览 ${item.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              预览
            </Link>
          )}
          <a
            className="download-btn"
            href={`/${item.path}`}
            download={item.name}
            title={`下载 ${item.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            ⬇ 下载
          </a>
        </div>
      </div>
    </li>
  );
}

// ============ 面包屑组件 ============
interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = useMemo(() => {
    if (!path) return [];
    return path.split("/");
  }, [path]);

  return (
    <div className="breadcrumb">
      <span
        className={!path ? "breadcrumb-current" : "breadcrumb-link"}
        onClick={() => onNavigate("")}
      >
        根目录
      </span>
      {parts.map((part, index) => {
        const targetPath = parts.slice(0, index + 1).join("/");
        const isLast = index === parts.length - 1;
        return (
          <span key={targetPath}>
            <span className="breadcrumb-sep"> › </span>
            <span
              className={isLast ? "breadcrumb-current" : "breadcrumb-link"}
              onClick={() => onNavigate(targetPath)}
            >
              {part}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ============ 主组件 ============

function Home() {
  const [fullTree, setFullTree] = useState<TreeItem[] | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 加载目录树（从导入的 JSON 数据初始化）
  const loadTree = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      setFullTree(fileTreeData as TreeItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // 当前显示的条目（考虑搜索过滤）
  const currentItems = useMemo(() => {
    if (!fullTree) return null;
    const baseItems = searchQuery
      ? filterTree(fullTree, searchQuery)
      : findItemsByPath(fullTree, currentPath);
    return baseItems;
  }, [fullTree, currentPath, searchQuery]);

  // 统计信息
  const stats = useMemo(() => {
    if (!fullTree) return null;
    return countStats(currentItems ?? fullTree);
  }, [fullTree, currentItems]);

  // 处理刷新
  const handleRefresh = () => {
    loadTree();
  };

  // 处理折叠/展开全部
  const handleToggleAll = () => {
    setAllExpanded(!allExpanded);
    const allNodes = document.querySelectorAll(".tree-node");
    allNodes.forEach((node) => {
      if (!allExpanded) {
        node.classList.add("expanded");
      } else {
        node.classList.remove("expanded");
      }
      const icon = node.querySelector(".folder-icon");
      if (icon) {
        icon.textContent = !allExpanded ? "📂" : "📁";
      }
    });
  };

  // 搜索时自动展开全部
  const isSearching = searchQuery.trim().length > 0;

  // 清除搜索
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // 搜索时自动展开，取消搜索时恢复
  useEffect(() => {
    if (!isSearching) return;
    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      const allNodes = document.querySelectorAll(".fb-file-list .tree-node");
      allNodes.forEach((node) => {
        node.classList.add("expanded");
        const icon = node.querySelector(".folder-icon");
        if (icon) icon.textContent = "📂";
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [isSearching, currentItems]);

  // 导航到指定路径
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <div className="fb-container">
      <div className="fb-inner">
        {/* 头部 */}
        <div className="fb-header">
          <span className="fb-header-icon">📁</span>
          <h1 className="fb-header-title">文件浏览器</h1>
        </div>

        {/* 工具栏 */}
        <div className="fb-toolbar">
          <button className="fb-btn" onClick={handleRefresh}>
            刷新
          </button>
          <button className="fb-btn" onClick={handleToggleAll}>
            {allExpanded ? "📁 全部折叠" : "📂 全部展开"}
          </button>
          <div className="fb-search">
            <input
              type="text"
              className="fb-search-input"
              placeholder="搜索文件或文件夹..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <button className="fb-search-clear" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
          {!isSearching && (
            <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
          )}
        </div>

        {/* 文件列表 */}
        <div className="fb-file-area">
          {loading && (
            <div className="fb-loading">
              <div className="fb-spinner" />
              <span>正在加载文件列表...</span>
            </div>
          )}

          {error && (
            <div className="fb-error">
              ⚠️ 加载失败：{error}
              <br />
              <small>
                请先运行 <code>node paper/generate-tree.js</code> 生成
                fileTree.json
              </small>
            </div>
          )}

          {!loading && !error && currentItems && currentItems.length === 0 && (
            <div className="fb-empty">
              <span className="fb-empty-icon">📭</span>
              <span>此目录为空</span>
            </div>
          )}

          {!loading && !error && currentItems && currentItems.length > 0 && (
            <ul className={`fb-file-list ${isSearching ? "search-active" : ""}`}>
              {currentItems.map((item, i) => (
                <TreeNode key={`${item.name}-${i}`} item={item} depth={0} />
              ))}
            </ul>
          )}

          {isSearching && !loading && !error && currentItems && currentItems.length === 0 && (
            <div className="fb-empty">
              <span className="fb-empty-icon">🔍</span>
              <span>未找到匹配 "{searchQuery}" 的结果</span>
            </div>
          )}
        </div>

        {/* 状态栏 */}
        <div className="fb-status-bar">
          <span>
            {stats && (
              <>
                {stats.dirs > 0 && `${stats.dirs} 个文件夹`}
                {stats.dirs > 0 && stats.files > 0 && "，"}
                {stats.files > 0 && `${stats.files} 个文件`}
              </>
            )}
          </span>
          <span>{currentPath ? `📂 ${currentPath}` : "📂 根目录"}</span>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="fb-footer">
        <a
          className="fb-footer-link"
          href="https://github.com/Faldream/hubu-learn"
          target="_blank"
          rel="noopener noreferrer"
        >
         项目地址 & 联系方式
        </a>
        <span className="fb-footer-sep">|</span>
        <Link className="fb-footer-link" to="/credits">
         致谢名单
        </Link>
      </footer>
    </div>
  );
}

export default Home;
