import type { CaptureData } from "../../shared/types";

interface Props {
  data: CaptureData | null;
  onClear: () => void;
}

export function CapturedContent({ data, onClear }: Props) {
  if (!data) {
    return (
      <div className="captured-empty">
        <p>还没有捕获内容</p>
        <p>在网页上选中文本或图片，右键点击 "AI 选中问答"</p>
      </div>
    );
  }

  return (
    <div className="captured-content">
      <div className="captured-content-header">
        <span className="label">{data.type === "image" ? "已捕获图片" : "已捕获文本"}</span>
        <button className="clear-btn" onClick={onClear} title="清除">
          ×
        </button>
      </div>

      {data.type === "text" && data.text && (
        <div className="captured-text">{data.text}</div>
      )}

      {data.type === "image" && data.imageUrl && (
        <img
          className="captured-image"
          src={data.imageUrl}
          alt="Captured content"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".captured-image-error")) {
              const errorDiv = document.createElement("div");
              errorDiv.className = "captured-image-error";
              errorDiv.textContent = "图片加载失败";
              parent.appendChild(errorDiv);
            }
          }}
        />
      )}

      {data.sourceUrl && (
        <div className="captured-source" title={data.sourceUrl}>
          来源: {data.sourceUrl}
        </div>
      )}
    </div>
  );
}