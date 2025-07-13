import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./NoticeDetail.css"; // CSS 파일을 import

function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get("page") || 1; // 현재 페이지

  const [notice, setNotice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const backendUrl = window.ENV?.API_URL || `http://`;

  useEffect(() => {
    axios
      .get(`${backendUrl}/notices/${id}`)
      .then((res) => setNotice(res.data))
      .catch(() => alert("공지사항을 불러올 수 없습니다."));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotice((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    axios
      .put(`${backendUrl}/notices/${id}`, {
        id: parseInt(id),
        noticeTitle: notice.noticeTitle,
        noticeWriter: notice.noticeWriter,
        noticeContent: notice.noticeContent,
      })
      .then(() => {
        setIsEditing(false);
        alert("수정되었습니다.");
      })
      .catch(() => alert("수정 실패"));
  };

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`${backendUrl}/notices/${id}`)
        .then(() => {
          alert("삭제되었습니다.");
          navigate(`/admin/notice?page=${page}`); // 삭제 후 동일한 페이지로 돌아감
        })
        .catch(() => alert("삭제 실패"));
    }
  };

  if (!notice) return <div>📭 공지사항을 불러오는 중...</div>;

  return (
    <div className="notice-detail-container">
      <div className="notice-detail-card">
        {isEditing ? (
          <>
            <h2>공지사항 수정</h2>
            <input
              name="noticeTitle"
              value={notice.noticeTitle}
              onChange={handleChange}
              placeholder="제목"
            />
            <input
              name="noticeWriter"
              value={notice.noticeWriter}
              onChange={handleChange}
              placeholder="작성자"
            />
            <textarea
              name="noticeContent"
              value={notice.noticeContent}
              onChange={handleChange}
              placeholder="내용"
            />
            <div className="notice-actions">
              <button className="confirm-btn" onClick={handleUpdate}>
                ✅ 수정 완료
              </button>
              <button className="back-btn" onClick={() => setIsEditing(false)}>
                ❌ 수정 취소
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{notice.noticeTitle}</h1>
            <div className="notice-meta">
              <span>🖊 작성자: {notice.noticeWriter}</span>
              <span>🗓 작성일: {notice.enrollDate}</span>
            </div>
            <div
              className="notice-content"
              dangerouslySetInnerHTML={{ __html: notice.noticeContent }}
            ></div>
            <div className="notice-actions">
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✏ 수정하기
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                🗑 삭제하기
              </button>
              <button
                className="back-btn"
                onClick={() => navigate(`/admin/notice?page=${page}`)} // 페이지 유지하며 돌아감
              >
                🏠 목록으로 돌아가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NoticeDetail;
