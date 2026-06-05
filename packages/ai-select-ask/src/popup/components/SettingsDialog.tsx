import { useState, useCallback } from "react";
import type { Settings } from "../../shared/types";

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, onSave, onClose }: Props) {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterText, setFilterText] = useState("");

  const fetchModels = useCallback(async () => {
    const key = apiKey.trim();
    // Strip trailing slash to avoid double-slash URLs
    const url = baseUrl.trim().replace(/\/+$/, "");
    if (!url && !key) return;

    setLoadingModels(true);
    setModelError(null);

    try {
      // Auto-correct baseUrl in the input field so user sees the cleaned version
      if (url !== baseUrl.trim()) {
        setBaseUrl(url);
      }

      const res = await fetch(`${url}/v1/models`, {
        headers: key ? { Authorization: `Bearer ${key}` } : {},
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
      }

      const data = await res.json();
      const ids: string[] = (data.data ?? [])
        .map((m: { id?: string }) => m.id)
        .filter(Boolean)
        .sort();

      if (ids.length === 0) {
        setModelError("未找到可用模型");
      } else {
        setModels(ids);
        // Auto-select first if current model not in list
        if (!ids.includes(model)) {
          setModel(ids[0] ?? model);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "获取失败";
      setModelError(msg);
    } finally {
      setLoadingModels(false);
    }
  }, [baseUrl, apiKey, model]);

  const filteredModels = filterText
    ? models.filter((m) => m.toLowerCase().includes(filterText.toLowerCase()))
    : models;

  const handleSave = useCallback(() => {
    onSave({
      baseUrl: baseUrl.trim() || settings.baseUrl,
      apiKey: apiKey.trim(),
      model: model.trim() || settings.model,
    });
    onClose();
  }, [baseUrl, apiKey, model, settings, onSave, onClose]);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>API 设置</h2>

        <div className="settings-field">
          <label>Base URL</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com"
          />
        </div>

        <div className="settings-field">
          <label>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="settings-field">
          <label>
            Model
            <button
              className="fetch-models-btn"
              onClick={fetchModels}
              disabled={loadingModels}
              title="从 API 获取可用模型列表"
            >
              {loadingModels ? "⏳" : "🔍"} 获取模型
            </button>
          </label>

          {/* Model selector */}
          {models.length > 0 ? (
            <div className="model-select-wrapper">
              <div
                className="model-select-display"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{model || "请选择模型"}</span>
                <span className="dropdown-arrow">{showDropdown ? "▲" : "▼"}</span>
              </div>
              {showDropdown && (
                <div className="model-dropdown">
                  <input
                    className="model-filter-input"
                    placeholder="搜索模型..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <div className="model-list">
                    {filteredModels.length === 0 ? (
                      <div className="model-item-empty">无匹配模型</div>
                    ) : (
                      filteredModels.map((m) => (
                        <div
                          key={m}
                          className={`model-item ${m === model ? "model-item-active" : ""}`}
                          onClick={() => {
                            setModel(m);
                            setShowDropdown(false);
                            setFilterText("");
                          }}
                        >
                          {m}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="点击获取模型或手动输入"
            />
          )}

          {modelError && <div className="model-error">{modelError}</div>}
        </div>

        <div className="settings-actions">
          <button className="cancel-btn" onClick={onClose}>取消</button>
          <button className="save-btn" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
