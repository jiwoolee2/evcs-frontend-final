import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  removeHtmlTags,
  formatDate,
} from "../../UserInterface/News/NewsMain/NewsItemComponents";
import { Report2, Report3 } from "../Report/AdminReport/AdminReport.styled";
import CommunityNav from "../AdminCommon/AdminNav/AdminComunityNav";
import { Button } from "react-bootstrap";

const backendUrl = window.ENV?.API_URL || `http://localhost:80`;

const NewsAdminPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 카테고리 관리
  const [categories, setCategories] = useState([]);
  // 뉴스 리스트
  const [newsList, setNewsList] = useState([]);
  // 필터 상태
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [sortOption, setSortOption] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 카테고리 추가/수정용
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryNo, setEditingCategoryNo] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // 페이징
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const size = 5;

  // 인증 헤더
  const token = localStorage.getItem("accessToken");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  // 카테고리 불러오기
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/admin/news/category/all`,
        authHeader
      );
      setCategories(res.data);
    } catch (err) {
      console.error("카테고리 목록 불러오기 실패", err);
    }
  };

  // 뉴스 리스트 불러오기
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${backendUrl}/admin/news/list`, authHeader);
      setNewsList(res.data || []);
    } catch (err) {
      console.error("뉴스 목록 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchNews();
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ page: newPage });
  };

  const handleRowClick = (item) => {
    navigate("/newsDetail", {
      state: {
        title: removeHtmlTags(item.title),
        description: removeHtmlTags(item.description),
        pubDate: formatDate(item.pubDate),
        imageUrl: item.imageUrl,
        originallink: item.originUrl,
        query: item.query,
      },
    });
  };

  // 검색 버튼 클릭 시에만 검색어 적용
  const handleSearchClick = () => {
    setSearchTerm(searchInput);
    setPage(1);
    setSearchParams({ page: 1 });
  };

  // 카테고리 추가/수정/삭제
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(
        `${backendUrl}/admin/news/category`,
        { newsCategory: newCategory },
        authHeader
      );
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error("카테고리 추가 실패", err);
    }
  };

  const handleEditCategory = async (newsCategoryNo) => {
    if (!editingCategoryName.trim()) return;
    try {
      await axios.put(
        `${backendUrl}/admin/news/category/${newsCategoryNo}`,
        { newsCategory: editingCategoryName },
        authHeader
      );
      setEditingCategoryNo(null);
      setEditingCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error("카테고리 수정 실패", err);
    }
  };

  const handleDeleteCategory = async (newsCategoryNo) => {
    try {
      await axios.delete(
        `${backendUrl}/admin/news/category/${newsCategoryNo}`,
        authHeader
      );
      fetchCategories();
    } catch (err) {
      console.error("카테고리 삭제 실패", err);
    }
  };

  // 날짜 필터 단축 버튼
  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  // 상태 토글 (활성/비활성)
  const toggleStatus = async (newsNo, currentStatus) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    try {
      await axios.put(`${backendUrl}/admin/news/status`, null, {
        params: { newsNo, status: newStatus },
        ...authHeader,
      });
      fetchNews();
    } catch (err) {
      console.error("상태 업데이트 실패", err);
    }
  };

  // 필터 & 정렬 적용
  const filteredNews = newsList
    .filter((n) => {
      const pub = new Date(n.pubDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const matchesSearch =
        !searchTerm ||
        (searchField === "title" &&
          removeHtmlTags(n.title || "").includes(searchTerm)) ||
        (searchField === "query" && n.query && n.query.includes(searchTerm));

      return (
        matchesSearch &&
        (!selectedCategory || n.query === selectedCategory) &&
        (!start || pub >= start) &&
        (!end || pub <= end)
      );
    })
    .sort((a, b) => {
      if (sortOption === "latest")
        return new Date(b.pubDate) - new Date(a.pubDate);
      if (sortOption === "views") return b.count - a.count;
      return 0;
    });

  const totalPages = Math.ceil(filteredNews.length / size);
  const pagedList = filteredNews.slice((page - 1) * size, page * size);
  const currentBlock = Math.floor((page - 1) / 10);
  const startPage = currentBlock * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <Report2>
      <CommunityNav />
      <Report3>
        <h1 className="text-2xl font-bold mb-4">뉴스 관리</h1>
        <div className="flex gap-8">
          {/* 카테고리 관리 */}
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-2">카테고리 관리</h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="새 카테고리 입력"
                className="border p-1 flex-1"
              />
              <Button onClick={handleAddCategory}>추가</Button>
            </div>
            <table className="w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">번호</th>
                  <th className="px-4 py-2 border">카테고리 이름</th>
                  <th className="px-4 py-2 border">관리</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.newsCategoryNo} className="text-center border-t">
                    <td className="px-4 py-2 border">{i + 1}</td>
                    <td className="px-4 py-2 border">
                      {editingCategoryNo === cat.newsCategoryNo ? (
                        <input
                          className="border p-1 w-full"
                          value={editingCategoryName}
                          onChange={(e) =>
                            setEditingCategoryName(e.target.value)
                          }
                        />
                      ) : (
                        cat.newsCategory
                      )}
                    </td>
                    <td className="px-4 py-2 border space-x-2">
                      {editingCategoryNo === cat.newsCategoryNo ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleEditCategory(cat.newsCategoryNo)
                            }
                          >
                            확인
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingCategoryNo(null)}
                          >
                            취소
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingCategoryNo(cat.newsCategoryNo);
                              setEditingCategoryName(cat.newsCategory);
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleDeleteCategory(cat.newsCategoryNo)
                            }
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 뉴스 게시판 관리 */}
          <div className="w-2/3">
            <h2 className="text-xl font-semibold mb-2">뉴스 게시판 관리</h2>
            <div className="report-filters mb-4 grid grid-cols-3 gap-2">
              {/* 날짜 필터 */}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-1"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-1"
              />

              {/* 검색 바 + 버튼 */}
              <div className="col-span-2 flex">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="검색어"
                  className="flex-1 border p-1"
                />
                <Button size="sm" onClick={handleSearchClick}>
                  검색
                </Button>
              </div>

              {/* 단축 버튼 */}
              <div className="flex gap-1">
                {[7, 30, 180, 365].map((d) => (
                  <Button key={d} size="sm" onClick={() => handlePreset(d)}>
                    {d === 7
                      ? "1주"
                      : d === 30
                      ? "1개월"
                      : d === 180
                      ? "6개월"
                      : "1년"}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  초기화
                </Button>
              </div>

              {/* 정렬 */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border p-1"
              >
                <option value="latest">최신순</option>
                <option value="views">조회수순</option>
              </select>

              {/* 카테고리 필터 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border p-1"
              >
                <option value="">전체</option>
                {categories.map((cat) => (
                  <option key={cat.newsCategoryNo} value={cat.newsCategory}>
                    {cat.newsCategory}
                  </option>
                ))}
              </select>
            </div>

            {/* 뉴스 테이블 */}
            <div className="report-table-container overflow-auto">
              <table className="report-table w-full table-auto border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">제목</th>
                    <th className="px-4 py-2 border">카테고리</th>
                    <th className="px-4 py-2 border">등록일</th>
                    <th className="px-4 py-2 border">조회수</th>
                    <th className="px-4 py-2 border">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedList.map((item) => (
                    <tr
                      key={item.newsNo}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-4 py-2 border">
                        {removeHtmlTags(item.title)}
                      </td>
                      <td className="px-4 py-2 border">{item.query}</td>
                      <td className="px-4 py-2 border">
                        {formatDate(item.pubDate)}
                      </td>
                      <td className="px-4 py-2 border">{item.count}</td>
                      <td
                        className="px-4 py-2 border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="mr-2">
                          {item.newsStatus === "Y" ? "활성" : "비활성"}
                        </span>
                        {" | "}
                        <Button
                          size="sm"
                          variant={
                            item.newsStatus === "Y"
                              ? "outline-danger"
                              : "outline-success"
                          }
                          onClick={() =>
                            toggleStatus(item.newsNo, item.newsStatus)
                          }
                        >
                          {item.newsStatus === "Y" ? "비활성화" : "활성화"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="pagination">
              {page > 1 && (
                <button onClick={() => handlePageChange(1)}>{"<<"}</button>
              )}
              {startPage > 1 && (
                <button onClick={() => handlePageChange(startPage - 1)}>
                  {"<"}
                </button>
              )}
              {visiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={p === page ? "active" : ""}
                >
                  {p}
                </button>
              ))}
              {endPage < totalPages && (
                <button onClick={() => handlePageChange(endPage + 1)}>
                  {">"}
                </button>
              )}
              {page < totalPages && (
                <button onClick={() => handlePageChange(totalPages)}>
                  {">>"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Report3>
    </Report2>
  );
};

export default NewsAdminPage;
