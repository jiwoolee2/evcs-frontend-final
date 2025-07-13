import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ListNewsItem,
  SearchBar,
  removeHtmlTags,
  formatDate,
} from "../NewsMain/NewsItemComponents";
import * as S from "../NewsMain/NewsMain.styles";

const NewsList = ({ backendUrl = "http://localhost:8080" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // URL 쿼리 또는 기본값으로 초기화
  const [query, setQuery] = useState(queryParams.get("query") || "전기차");
  const [sort, setSort] = useState(queryParams.get("sort") || "sim");
  const [page, setPage] = useState(Number(queryParams.get("page")) || 1);
  const size = 10;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);

  // API 호출 함수
  const fetchNews = async (
    targetPage,
    targetQuery = query,
    targetSort = sort
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/naver-news-list`, {
        params: {
          query: targetQuery,
          sort: targetSort,
          page: targetPage,
          size,
        },
      });

      const rawItems = res.data.items || [];
      const uniqueItems = Array.from(
        new Map(rawItems.map((item) => [item.originallink, item])).values()
      );

      setItems(uniqueItems);
      setTotal(res.data.total || 0);
      setPage(targetPage);
    } catch (err) {
      console.error("뉴스 리스트 요청 실패", err);
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시: 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/news/categories`);
        const list = res.data
          .map((item) => item.newsCategory)
          .filter((name) => name && name !== "기타");
        setKeywords(list);
      } catch {
        setKeywords(["전기차"]);
      }
    };
    loadCategories();
  }, [backendUrl]);

  // 마운트 시: 기본 '전기차' 검색 실행
  useEffect(() => {
    fetchNews(1, query, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색 버튼 핸들러
  const handleSearch = (searchQuery) => {
    const q = (searchQuery ?? query).trim() || "전기차";
    setQuery(q);
    fetchNews(1, q, sort);
  };

  // 정렬 버튼 핸들러
  const handleSort = (newSort) => {
    setSort(newSort);
    fetchNews(1, query, newSort);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(Math.min(total, 1000) / size);
  const currentBlock = Math.floor((page - 1) / 10);
  const startPage = currentBlock * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // 페이지 변경 핸들러
  const handlePageChange = (targetPage) => {
    fetchNews(targetPage, query, sort);
  };
  const handleBlockPrev = () => {
    const prev = startPage - 10;
    if (prev >= 1) handlePageChange(prev);
  };
  const handleBlockNext = () => {
    const next = startPage + 10;
    if (next <= totalPages) handlePageChange(next);
  };

  // 뉴스 선택 → 상세 페이지
  const handleChatClick = (item) => {
    navigate("/newsDetail", {
      state: {
        title: removeHtmlTags(item.title),
        description: removeHtmlTags(item.description),
        pubDate: formatDate(item.pubDate),
        imageUrl: item.imageUrl,
        originallink: item.originallink,
        query,
      },
    });
  };

  return (
    <S.FullWidthContainer>
      <S.Container>
        <S.PageHeader>뉴스 전체 보기</S.PageHeader>

        {/* 검색 바 */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          keywords={keywords}
          loading={loading}
        />

        {/* 정렬 버튼 */}
        <S.SortButtons>
          <S.KeywordButton
            onClick={() => handleSort("date")}
            active={sort === "date"}
          >
            최신순
          </S.KeywordButton>
          <S.KeywordButton
            onClick={() => handleSort("sim")}
            active={sort === "sim"}
          >
            유사도순
          </S.KeywordButton>
        </S.SortButtons>

        {/* 뉴스 리스트 */}
        <S.NewsList>
          <S.NewsItems>
            {items.map((item) => (
              <ListNewsItem
                key={item.originallink}
                item={item}
                onChatClick={handleChatClick}
                loading={loading}
              />
            ))}
          </S.NewsItems>
        </S.NewsList>

        {/* 페이지네이션 */}
        <S.Pagination>
          {page > 1 && (
            <button onClick={() => handlePageChange(1)}>{"<<"}</button>
          )}
          {startPage > 1 && <button onClick={handleBlockPrev}>{"<"}</button>}
          {visiblePages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              disabled={p === page}
            >
              {p}
            </button>
          ))}
          {endPage < totalPages && (
            <button onClick={handleBlockNext}>{">"}</button>
          )}
          {page < totalPages && (
            <button onClick={() => handlePageChange(totalPages)}>{">>"}</button>
          )}
        </S.Pagination>
      </S.Container>
    </S.FullWidthContainer>
  );
};

export default NewsList;
