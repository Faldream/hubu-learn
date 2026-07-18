import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import "./Credits.css";
import creditsMd from "./Credits.md?raw";

function Credits() {
  return (
    <div className="credits-container">
      <div className="credits-card">
        <div className="credits-header">
          <Link to="/" className="credits-back">
            返回
          </Link>
          <h1 className="credits-title">致谢名单</h1>
        </div>

        <div className="credits-markdown">
          <Markdown>{creditsMd}</Markdown>
        </div>
      </div>
    </div>
  );
}

export default Credits;
