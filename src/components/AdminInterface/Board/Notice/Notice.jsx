import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AdminNoitceNav from "../../AdminCommon/AdminNav/AdminNoitceNav";
import "../Notice/Notice.css";

function Notice() {
  const navigate = useNavigate();
  const location = useLocation();

  // 쿼리 파라미터에서 페이지 번호를 읽어옴
  const queryParams = new URLSearchParams(location.search);
  const pageFromQuery = parseInt(queryParams.get("page")) || 1; // 기본값은 1페이지

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(pageFromQuery); // 페이지 상태 설정
  const noticesPerPage = 5;

  const backendUrl = window.ENV?.API_URL || `http://`;

  useEffect(() => {
    axios
      .get(`${backendUrl}/notices`)
      .then((res) => setNotices(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = notices.filter(
    (n) =>
      n.noticeTitle.toLowerCase().includes(search.toLowerCase()) ||
      n.noticeWriter.toLowerCase().includes(search.toLowerCase()) ||
      n.enrollDate.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / noticesPerPage);
  const startIndex = (currentPage - 1) * noticesPerPage;
  const paginated = filtered.slice(startIndex, startIndex + noticesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/admin/notice?page=${pageNumber}`); // 페이지 번호를 쿼리로 전달
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminNoitceNav />
      <div style={{ width: "90%" }}>
        <div className="Notice">
          <h1>공지사항</h1>
          <input
            type="text"
            placeholder="제목/작성일시/작성자 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="Notice-container">
            <table>
              <thead>
                <colgroup>
                  <col style={{ width: "60%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <tr>
                  <th>제목</th>
                  <th>작성일시</th>
                  <th>작성자</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((notice) => (
                  <tr
                    key={notice.id}
                    onClick={() =>
                      navigate(`/admin/notice/${notice.id}?page=${currentPage}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>{notice.noticeTitle}</td>
                    <td>{notice.enrollDate}</td>
                    <td>{notice.noticeWriter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="Notice-pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              ◀ 처음
            </button>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              ◀ 이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                style={{
                  fontWeight: currentPage === i + 1 ? "bold" : "normal",
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              다음 ▶
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              끝 ▶
            </button>
          </div>

          <div className="Notice-write-button">
            <button onClick={() => navigate("/admin/notice/write")}>
              공지사항 작성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notice;
