import React, { useState, useEffect } from "react";
import "../Notice/UserNotice.css";
import NoticeNav from "../../Common/Nav/NoticeNav";
import { BoardContainerDiv, BoardBodyDiv } from "../Board.styles";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

function UserNotice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const noticesPerPage = 5;
  const [notices, setNotices] = useState([]);
  const backendUrl = window.ENV?.API_URL || `http://localhost:8080`;

  useEffect(() => {
    axios
      .get(`${backendUrl}/notices`)
      .then((res) => setNotices(res.data))
      .catch((err) => console.error("공지사항 불러오기 실패:", err));
  }, []);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page"), 10);
    const pageFromState = location.state?.page;

    if (pageFromState && !isNaN(pageFromState)) {
      setCurrentPage(pageFromState);
    } else if (pageFromUrl && !isNaN(pageFromUrl)) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams, location.state]);

  useEffect(() => {
    if (search !== "") {
      setCurrentPage(1);
    }
  }, [search]);

  const filteredNotices = notices.filter(
    (n) =>
      (n.noticeTitle &&
        n.noticeTitle.toLowerCase().includes(search.toLowerCase())) ||
      (n.enrollDate &&
        n.enrollDate.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredNotices.length / noticesPerPage);
  const startIndex = (currentPage - 1) * noticesPerPage;
  const paginatedNotices = filteredNotices.slice(
    startIndex,
    startIndex + noticesPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/notice?page=${page}`, { state: { page } });
  };

  return (
    <BoardContainerDiv>
      <NoticeNav />
      <BoardBodyDiv>
        <div className="Notice">
          <h1>공지사항</h1>

          <input
            type="text"
            placeholder="제목/작성일시/작성자 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: "10px", padding: "5px", width: "250px" }}
          />

          <div className="Notice-container">
            <table>
              <colgroup>
                <col style={{ width: "50%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>작성일시</th>
                  <th>작성자</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotices.length > 0 ? (
                  paginatedNotices.map((notice) => (
                    <tr
                      key={notice.id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/notice/${notice.id}`, {
                          state: { page: currentPage },
                        })
                      }
                    >
                      <td>{notice.noticeTitle}</td>
                      <td>{notice.enrollDate}</td>
                      <td>{notice.noticeWriter}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      🔍 검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredNotices.length > 0 && (
            <div className="Notice-pagination" style={{ marginTop: "20px" }}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                ◀ 처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀ 이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  style={{
                    margin: "0 5px",
                    fontWeight: currentPage === i + 1 ? "bold" : "normal",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
          )}
        </div>
      </BoardBodyDiv>
    </BoardContainerDiv>
  );
}

export default UserNotice;
