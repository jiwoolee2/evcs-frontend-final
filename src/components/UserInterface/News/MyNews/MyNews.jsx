import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { removeHtmlTags, formatDate } from "../NewsMain/NewsItemComponents";
import MyPageNav from "../../Common/Nav/MyPageNav";
import { MyPageDiv } from "../../Member/Mypage/MyPage.styles";
import * as S from "../../News/NewsMain/NewsMain.styles";

const backendUrl = window.ENV?.API_URL || `http://localhost:8080`;

const MyNews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fullList, setFullList] = useState([]);
  const [imageResults, setImageResults] = useState({});
  const [activeTab, setActiveTab] = useState("likes");

  const page = parseInt(searchParams.get("page") || "1");
  const size = 3;
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/news/mypage/${activeTab}`,
          authHeader
        );
        setFullList(res.data || []);
        const updatedImages = {};
        for (const news of res.data || []) {
          if (news.imageUrl) updatedImages[news.title] = news.imageUrl;
        }
        setImageResults(updatedImages);
      } catch (err) {
        console.error("마이뉴스 불러오기 실패", err);
      }
    };

    fetchData();
    setSearchParams({ page: 1 });
  }, [activeTab, token]);

  const handleChatClick = async (item) => {
    const key = removeHtmlTags(item.title);
    let imageUrl = imageResults[key] || "/images/loading.png";

    if (imageUrl === "/images/loading.png") {
      try {
        const res = await axios.get(`${backendUrl}/api/naver-image`, {
          params: { query: key },
        });
        const hits = res.data.items || [];
        const fetched =
          hits[0]?.thumbnail || hits[0]?.link || "/images/loading.png";
        setImageResults((prev) => ({ ...prev, [key]: fetched }));
        imageUrl = fetched;
      } catch (e) {
        console.error("이미지 재조회 실패", e);
      }
    }

    navigate("/newsDetail", {
      state: {
        title: removeHtmlTags(item.title),
        description: removeHtmlTags(item.description),
        pubDate: formatDate(item.pubDate),
        imageUrl,
        originallink: item.originUrl,
        query: item.query,
      },
    });
  };

  const pagedList = fullList.slice((page - 1) * size, page * size);
  const totalPages = Math.ceil(fullList.length / size);
  const currentBlock = Math.floor((page - 1) / 10);
  const startPage = currentBlock * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePageChange = (targetPage) => {
    setSearchParams({ page: targetPage });
  };

  const handleBlockPrev = () => {
    const prevBlockStart = startPage - 10;
    if (prevBlockStart >= 1) handlePageChange(prevBlockStart);
  };

  const handleBlockNext = () => {
    const nextBlockStart = startPage + 10;
    if (nextBlockStart <= totalPages) handlePageChange(nextBlockStart);
  };

  return (
    <MyPageDiv>
      <MyPageNav />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>내 뉴스</h2>
        <div style={{ marginBottom: "1rem" }}>
          <S.KeywordButton
            onClick={() => setActiveTab("likes")}
            active={activeTab === "likes"}
          >
            좋아요한 뉴스
          </S.KeywordButton>
          {" | "}
          <S.KeywordButton
            onClick={() => setActiveTab("bookmarks")}
            active={activeTab === "bookmarks"}
          >
            북마크한 뉴스
          </S.KeywordButton>
        </div>
        <ul>
          {pagedList.map((item) => (
            <li key={item.newsNo} style={{ marginBottom: "1rem" }}>
              <strong
                onClick={() => handleChatClick(item)}
                style={{
                  cursor: "pointer",
                  color: "#0366d6",
                  textDecoration: "underline",
                }}
              >
                {removeHtmlTags(item.title)}
              </strong>
              <p>{removeHtmlTags(item.description)}</p>
              {imageResults[item.title] && (
                <img src={imageResults[item.title]} alt="" width={100} />
              )}
            </li>
          ))}
        </ul>
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
      </div>
    </MyPageDiv>
  );
};

export default MyNews;
