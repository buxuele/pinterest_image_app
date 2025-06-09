import React, { useState } from 'react';
import axios from 'axios';

const TranslateTool = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('请输入要翻译的文本');
      return;
    }

    setLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      // 这里使用免费的翻译 API，你可以根据需要替换成其他翻译服务
      const response = await axios.post('https://api.mymemory.translated.net/get', {
        q: inputText,
        langpair: 'zh|en'
      });

      if (response.data && response.data.responseData) {
        setTranslatedText(response.data.responseData.translatedText);
      } else {
        throw new Error('翻译服务返回数据格式错误');
      }
    } catch (error) {
      console.error('翻译失败：', error);
      setError('翻译失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="inputText" className="form-label">中文输入</label>
                <textarea
                  id="inputText"
                  className="form-control"
                  rows="4"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入要翻译的中文文本..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="d-grid gap-2 mb-4">
                <button
                  className="btn btn-primary"
                  onClick={handleTranslate}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      翻译中...
                    </>
                  ) : (
                    '翻译'
                  )}
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {translatedText && (
                <div className="mb-3">
                  <label className="form-label">英文翻译</label>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0">{translatedText}</p>
                  </div>
                </div>
              )}

              <div className="text-muted small mt-3">
                <p className="mb-1">提示：</p>
                <ul className="mb-0">
                  <li>按 Enter 键快速翻译（Shift + Enter 换行）</li>
                  <li>支持长文本翻译</li>
                  <li>翻译结果仅供参考</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslateTool; 