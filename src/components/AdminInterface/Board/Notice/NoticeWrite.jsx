import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NoticeWrite() {
  const [title, setTitle] = useState("");
  const [writer, setWriter] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const backendUrl = window.ENV?.API_URL || `http://`;

  const handleSave = () => {
    axios
      .post(`${backendUrl}/notices`, {
        noticeTitle: title,
        noticeContent: content,
        noticeWriter: writer,
      })
      .then(() => navigate("/admin/notice"))
      .catch((err) => alert("저장 실패: " + err.message));
  };

  return (
    <div className="notice-detail-container">
      <div className="notice-detail-card">
        <h2>공지사항 작성</h2>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="작성자"
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
        ></textarea>
        <div className="notice-actions">
          <button className="confirm-btn" onClick={handleSave}>
            ✅ 저장하기
          </button>
          <button
            className="back-btn"
            onClick={() => navigate("/admin/notice")}
          >
            ❌ 취소
          </button>
        </div>
      </div>
    </div>
  );
}
export default NoticeWrite;
