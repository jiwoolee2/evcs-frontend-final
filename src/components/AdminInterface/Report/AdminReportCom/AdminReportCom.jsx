import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Report2, Report3 } from "./AdminReportCom.styled";
import axios from "axios";
import AdminReportNav from "../../AdminCommon/AdminNav/AdminReportNav";

const AdminReportCom = () => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [titleQueryInput, setTitleQueryInput] = useState("");
  const [titleQuery, setTitleQuery] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        title: titleQuery || undefined,
        page: page,
        size: 10,
      };
      const response = await axios.get(`${apiUrl}/api/amReportsCom`, {
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
      setTotalPages(payload.totalPages || 1); // ← 최소 1페이지 보장
    } catch (err) {
      console.error(err);
      setError("신고 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, titleQuery, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = () => {
    setPage(0);
    setTitleQuery(titleQueryInput);
  };

  function toKSTDateString(date) {
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().slice(0, 10);
  }

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(toKSTDateString(start));
    setEndDate(toKSTDateString(end));
    setPage(0);
    setTitleQuery(titleQueryInput);
  };

  const handleRowClick = (rpNo) => {
    navigate(`/admin/adminReportsCom/${rpNo}`);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <Report2>
      <AdminReportNav />
      <Report3>
        <h2>관리자용 댓글 신고 내역</h2>

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
                    <th>내용</th>
                    <th>피의자</th>
                    <th>신고날자</th>
                    <th>뉴스번호</th>
                    <th>뉴스댓글번호</th>
                    <th>상태코드</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.reNo} onClick={() => handleRowClick(r.reNo)}>
                      <td>{r.reNo}</td>
                      <td className="report-title">{r.reContent}</td>
                      <td>{r.reMemberNo}</td>
                      <td>{r.reEnrollDate}</td>
                      <td>{r.commentGroupNo}</td>
                      <td>{r.commentDepth}</td>
                      <td>
                        {r.reStatus === "Y"
                          ? "처리완료"
                          : r.reStatus === "N"
                          ? "거부됨"
                          : r.reStatus === "P"
                          ? "진행중"
                          : r.reStatus === "O"
                          ? "취소됨"
                          : "알 수 없음"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 📌 페이징 */}
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

                <button onClick={handleNext} disabled={page >= totalPages - 1}>
                  다음 ▶
                </button>
              </div>
            </>
          )}
        </div>
      </Report3>
    </Report2>
  );
};

export default AdminReportCom;
