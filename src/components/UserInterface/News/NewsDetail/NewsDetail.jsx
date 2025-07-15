import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as S from "./NewsDetail.styles";
import * as S1 from "../NewsMain/NewsMain.styles";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import CommentSection from "./CommentSection";

const NewsDetail = ({ backendUrl = window.ENV.API_URL }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, description, pubDate, imageUrl, originallink, query } =
    location.state || {};
  const { auth } = useAuth();

  const [article, setArticle] = useState(null);
  const [disabledMsg, setDisabledMsg] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [hateCount, setHateCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasHated, setHasHated] = useState(false);

  const token = localStorage.getItem("accessToken");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  // 1) 상세 요청
  useEffect(() => {
    if (!title || !originallink) return;

    axios
      .post(
        `${backendUrl}/news/detail`,
        {
          title,
          originUrl: originallink,
          description,
          imageUrl,
          pubDate,
          query,
        },
        authHeader
      )
      .then((res) => {
        const data = res.data;
        setArticle(data.news);
        setLikeCount(data.likeCount);
        setHateCount(data.hateCount);
        setBookmarked(data.bookmarked);
      })
      .catch((err) => {
        // 410 Gone → 비활성화된 뉴스
        if (err.response?.status === 410) {
          setDisabledMsg(
            err.response?.data?.message || "비활성화된 뉴스입니다."
          );
        } else {
          console.error("뉴스 상세 요청 실패:", err);
        }
      });
  }, [title, originallink]);

  // 2) 상태, 좋아요/싫어요/북마크 초기 확인
  useEffect(() => {
    if (!article || !token) return;

    const p = article.newsNo;
    Promise.all([
      axios.get(`${backendUrl}/news/like/status`, {
        params: { newsNo: p },
        ...authHeader,
      }),
      axios.get(`${backendUrl}/news/hate/status`, {
        params: { newsNo: p },
        ...authHeader,
      }),
      axios.get(`${backendUrl}/news/bookmark/status`, {
        params: { newsNo: p },
        ...authHeader,
      }),
    ])
      .then(([r1, r2, r3]) => {
        setHasLiked(r1.data);
        setHasHated(r2.data);
        setBookmarked(r3.data);
      })
      .catch(() => {});
  }, [article, token]);

  // 유틸: 좋아요/싫어요/북마크 상태 갱신
  const updateStatus = async () => {
    const p = article.newsNo;
    const [r1, r2, r3, r4] = await Promise.all([
      axios.get(`${backendUrl}/news/like/status`, {
        params: { newsNo: p },
        ...authHeader,
      }),
      axios.get(`${backendUrl}/news/hate/status`, {
        params: { newsNo: p },
        ...authHeader,
      }),
      axios.get(`${backendUrl}/news/like`, {
        params: { newsNo: p },
        ...authHeader,
      }),
      axios.get(`${backendUrl}/news/hate`, {
        params: { newsNo: p },
        ...authHeader,
      }),
    ]);
    setHasLiked(r1.data);
    setHasHated(r2.data);
    setLikeCount(r3.data);
    setHateCount(r4.data);
  };

  // 핸들러들...
  const handleLike = async () => {
    if (!token) return alert("로그인 후 이용해주세요.");
    await axios.post(
      `${backendUrl}/news/like`,
      { newsNo: article.newsNo },
      authHeader
    );
    updateStatus();
  };

  const handleHate = async () => {
    if (!token) return alert("로그인 후 이용해주세요.");
    await axios.post(
      `${backendUrl}/news/hate`,
      { newsNo: article.newsNo },
      authHeader
    );
    updateStatus();
  };

  const handleBookmark = async () => {
    if (!token) return alert("로그인 후 이용해주세요.");
    await axios.post(
      `${backendUrl}/news/bookmark`,
      { newsNo: article.newsNo },
      authHeader
    );
    const r = await axios.get(`${backendUrl}/news/bookmark/status`, {
      params: { newsNo: article.newsNo },
      ...authHeader,
    });
    setBookmarked(r.data);
  };

  const handleBlock = () => {
    if (!auth?.user || !article) return alert("로그인 후 이용 가능합니다.");
    navigate("/reportingPage", {
      state: {
        boardInfo: { boardId: article.newsNo, boardTitle: article.title },
        reporter: { userId: auth.user.memberNo, userName: auth.user.name },
        reported: { userId: article.newsNo, userName: "뉴스 게시판 신고" },
      },
    });
  };

  // 렌더링
  if (disabledMsg) {
    return (
      <S.Container>
        <S.ArticleTitle>⛔ {disabledMsg}</S.ArticleTitle>
        <Button onClick={() => navigate(-1)}>뒤로가기</Button>
      </S.Container>
    );
  }
  if (!article) {
    return <S.Loading>기사를 불러오는 중입니다...</S.Loading>;
  }

  return (
    <S.Container>
      <S.ArticleTitle>
        <strong>뉴스 게시판</strong>
      </S.ArticleTitle>
      <S.ArticleBox>
        <S.ArticleContent>
          <S.ArticleCategory>{article.query}</S.ArticleCategory>
          <S.ArticleCategory>{article.pubDate}</S.ArticleCategory>
          <S.ArticleText>
            <h2>{article.title}</h2>
            <h5>
              <S1.SectionIcon>|</S1.SectionIcon>기사의 요약 내용
            </h5>
            <div>{article.description}</div>
            <div>
              <S1.SectionIcon>|</S1.SectionIcon>기사 이미지
            </div>
            <img
              src={article.imageUrl}
              alt="기사 이미지"
              style={{ width: "100%", maxWidth: "600px", marginTop: 10 }}
            />
            <div>원문 링크</div>
            <a
              href={article.originUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {article.originUrl}
            </a>
          </S.ArticleText>
          <S.ArticleActions>
            <Button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: "#03c75a",
                color: "#fff",
                border: "none",
              }}
            >
              뒤로가기
            </Button>
            <Button
              size="sm"
              variant={hasLiked ? "primary" : "outline-primary"}
              onClick={handleLike}
            >
              👍 {likeCount}
            </Button>
            <Button
              size="sm"
              variant={hasHated ? "danger" : "outline-danger"}
              onClick={handleHate}
            >
              👎 {hateCount}
            </Button>
            {auth?.user?.isAuthenticated && (
              <>
                <Button
                  size="sm"
                  variant={bookmarked ? "success" : "outline-success"}
                  onClick={handleBookmark}
                >
                  {bookmarked ? "🔖 북마크됨" : "📌 북마크"}
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={handleBlock}
                >
                  ⛔게시판 차단
                </Button>
              </>
            )}
          </S.ArticleActions>
        </S.ArticleContent>
      </S.ArticleBox>
      <CommentSection newsNo={article.newsNo} backendUrl={backendUrl} />
    </S.Container>
  );
};

export default NewsDetail;
