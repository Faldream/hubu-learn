# 📚 湖大学习资料

湖北大学课程复习资料与历年试卷在线浏览平台。

---

## 🙏 感谢资源贡献者

本项目中的学习资料由以下同学热心提供，特此致谢：

KijinSeija265  [Github试卷项目链接](https://github.com/KijinSeija265/HUBU-CS-Exam)

---

## 📖 项目简介

本项目旨在为湖北大学同学提供一个便捷的课程资料共享平台，支持在线浏览和下载复习资料与历年试卷。

**主要功能：**

- 📁 **树形文件浏览** — 按课程分类展示复习资料与试卷，支持文件夹展开/折叠
- ⬇️ **一键下载** — 点击文件旁的下载按钮即可下载 PDF 等资料
- 🧭 **面包屑导航** — 清晰展示当前路径，支持快速跳转
- 📱 **响应式布局** — 适配桌面端和移动端

**技术栈：** React 19 + TypeScript + Vite + Cloudflare Workers

---

## 🚀 部署流程

### 前提条件

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare 账号](https://dash.cloudflare.com/)（用于部署）

### 本地开发

```bash
# 1. 克隆项目
git clone <仓库地址>
cd hubu-learn

# 2. 安装依赖
npm install

# 3. 添加学习资料
# 将复习资料和试卷放入 src/LearningMaterial/ 对应目录
# 目录结构示例：
#   src/LearningMaterial/
#   ├── 复习资料/
#   │   ├── 马克思主义原理/
#   │   └── 数据结构/
#   └── 试卷/
#       ├── 马克思主义原理/
#       └── 数据结构/

# 4. 生成文件树
node src/react-app/utils/generate-tree.js

# 5. 启动开发服务器
npm run dev
# 浏览器访问 http://localhost:5173
```

### 添加新资料

1. 将文件放入 `src/LearningMaterial/` 对应子目录
2. 运行 `node src/react-app/utils/generate-tree.js` 刷新目录树
3. 提交并推送

> 构建时（`npm run build`）会自动执行生成脚本，无需手动操作。