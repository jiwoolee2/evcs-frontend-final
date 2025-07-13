import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Report2는 스타일드 컨테이너입니다.
import { Report2, Report3 } from "./Report.styled";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import axios from "axios";
import MyPageNav from "../../../UserInterface/Common/Nav/MyPageNav";

const Report = () => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const navigate = useNavigate();
  const { auth } = useAuth();
  const memberNo = auth.user.memberNo; // 사용자 번호로 필터링

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [titleQueryInput, setTitleQueryInput] = useState("");
  const [titleQuery, setTitleQuery] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const token = localStorage.getItem("accessToken");
  // const authHeader = token
  //   ? { headers: { Authorization: `Bearer ${token}` } }
  //   : {};

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        memberNo,
        startDate,
        endDate,
        title: titleQuery,
        page,
        size: 10,
      };
      const response = await axios.get(`${apiUrl}/api/usReports`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = response.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.content)
        ? payload.content
        : [];
      setReports(list);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("신고 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [memberNo, startDate, endDate, titleQuery, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = () => {
    setPage(0);
    setTitleQuery(titleQueryInput);
  };

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
    setPage(0);
    setTitleQuery(titleQueryInput);
  };

  const handleRowClick = (rpNo) => {
    navigate(`/reports/${rpNo}`);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <Report2>
      <div className="nav">
        <MyPageNav />
        <Report3>
          <h2>내 게시판 신고 내역</h2>

          <div className="report-filters">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="제목 검색"
              value={titleQueryInput}
              onChange={(e) => setTitleQueryInput(e.target.value)}
            />
            <button onClick={() => handlePreset(7)}>1주일</button>
            <button onClick={() => handlePreset(30)}>1개월</button>
            <button onClick={() => handlePreset(90)}>3개월</button>
            <button onClick={() => handlePreset(180)}>6개월</button>
            <button onClick={() => handlePreset(365)}>1년</button>
            <button className="search-button" onClick={handleSearch}>
              검색
            </button>
          </div>

          <div className="report-table-container">
            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && reports.length === 0 && !error && (
              <p>신고 내역이 없습니다.</p>
            )}
            {reports.length > 0 && (
              <>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>제목</th>
                      <th>피의자</th>
                      <th>신청일</th>
                      <th>진행상황</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.rpNo} onClick={() => handleRowClick(r.rpNo)}>
                        <td>{r.rpNo}</td>
                        <td className="report-title">{r.title}</td>
                        <td>{r.rpMemberNo}</td>
                        <td>{r.enrollDate?.slice(0, 10)}</td>
                        <td>
                          {r.status === "Y"
                            ? "처리완료"
                            : r.status === "N"
                            ? "거부됨"
                            : r.status === "P"
                            ? "진행중"
                            : r.status === "O"
                            ? "진행중"
                            : "알 수 없음"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination">
                  <button onClick={handlePrev} disabled={page === 0}>
                    ◀ 이전
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={idx === page ? "active" : ""}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleNext}
                    disabled={page >= totalPages - 1}
                  >
                    다음 ▶
                  </button>
                </div>
              </>
            )}
          </div>
        </Report3>
      </div>
    </Report2>
  );
};

export default Report;
