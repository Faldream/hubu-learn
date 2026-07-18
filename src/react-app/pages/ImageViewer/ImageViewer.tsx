import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import "./ImageViewer.css";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];

function isImageFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

// Vite glob 导入：构建时扫描 LearningMaterial 下所有图片，生成路径→URL 映射
const imageUrlMap = import.meta.glob<string>(
  "../../../LearningMaterial/**/*.{jpg,jpeg,png,gif,svg,webp,bmp}",
  { query: "?url", import: "default" }
);

interface ImageResult {
  url: string;
  forPath: string;
}

function ImageViewer() {
  const location = useLocation();
  const filePath = (location.state as { imagePath?: string })?.imagePath || "";
  const fileName = filePath.split("/").pop() || filePath;
  const isValid = filePath !== "" && isImageFile(fileName);

  // null = 加载中 / 未找到，有值 = 加载成功
  const [result, setResult] = useState<ImageResult | null>(null);
  const loadIdRef = useRef(0);

  useEffect(() => {
    if (!isValid) return;

    const loadId = ++loadIdRef.current;
    const globKey = `../../../LearningMaterial/${filePath}`;
    const loader = imageUrlMap[globKey];

    const fulfill = (url: string | null) => {
      if (loadIdRef.current === loadId) {
        setResult(url ? { url, forPath: filePath } : null);
      }
    };

    if (loader) {
      loader()
        .then((url) => fulfill(url))
        .catch(() => fulfill(null));
    } else {
      // 用 microtask 包装，避免在 effect 中同步调用 setState
      Promise.resolve().then(() => fulfill(null));
    }
  }, [filePath, isValid]);

  const isCurrent = result !== null && result.forPath === filePath;
  const imageUrl = isCurrent ? result.url : null;
  const isLoading = isValid && !isCurrent;

  if (!isValid) {
    return (
      <div className="iv-container">
        <div className="iv-error">
          <span className="iv-error-icon">⚠️</span>
          <p>无效的图片路径</p>
          <Link to="/" className="iv-back-link">← 返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="iv-container">
      <div className="iv-toolbar">
        <Link to="/" className="iv-back-link">← 返回</Link>
        <span className="iv-filename">{fileName}</span>
        <a
          className="iv-download-link"
          href={imageUrl || "#"}
          download={fileName}
        >
          ⬇ 下载原图
        </a>
      </div>
      <div className="iv-image-wrap">
        {isLoading ? (
          <div className="fb-loading">
            <div className="fb-spinner" />
            <span>加载中...</span>
          </div>
        ) : imageUrl ? (
          <img className="iv-image" src={imageUrl} alt={fileName} />
        ) : (
          <div className="iv-error">
            <span className="iv-error-icon">🖼️</span>
            <p>无法加载图片</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageViewer;
