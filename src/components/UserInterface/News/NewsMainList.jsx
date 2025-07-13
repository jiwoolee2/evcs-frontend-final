import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ListNewsItem,
  removeHtmlTags,
  formatDate,
} from "./NewsMain/NewsItemComponents";

const NewsMainList = ({
  backendUrl = window.ENV?.API_URL || `http://localhost:8080`,
  query = "전기차",
}) => {
  const navigate = useNavigate();

  const [listNews, setListNews] = useState([]);
  const [imageResults, setImageResults] = useState({});
  const [loading, setLoading] = useState(false);

  const getImageUrl = (item) => {
    const key = removeHtmlTags(item.title);
    return imageResults[key] || "/images/loading.png";
  };

  const extractKeywords = (title) => {
    const clean = title
      .replace(/<[^>]+>/g, "")
      .replace(/[^가-힣a-zA-Z0-9 ]/g, "");
    return clean
      .split(" ")
      .filter((w) => w.length >= 2)
      .slice(0, 2)
      .join(" ");
  };

  const handleChatClick = async (item) => {
    const key = removeHtmlTags(item.title);
    let imageUrl = getImageUrl(item);
    const placeholder = "/images/loading.png";

    if (imageUrl === placeholder) {
      try {
        const kws = extractKeywords(key);
        const res = await axios.get(`${backendUrl}/api/naver-image`, {
          params: { query: kws },
        });
        const hits = res.data.items || [];
        const fetched = hits[0]?.thumbnail || hits[0]?.link || placeholder;
        setImageResults((prev) => ({ ...prev, [key]: fetched }));
        imageUrl = fetched;
      } catch (e) {
        console.error("ChatIcon 이미지 로딩 실패:", e);
      }
    }

    navigate("/newsDetail", {
      state: {
        title: removeHtmlTags(item.title),
        description: removeHtmlTags(item.description),
        pubDate: formatDate(item.pubDate),
        imageUrl,
        originallink: item.originallink,
        query,
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/api/naver-news`, {
        params: { query, display: 20, start: 1 },
      })
      .then((res) => {
        const items = res.data.items || [];
        const unique = Array.from(
          new Map(items.map((i) => [removeHtmlTags(i.title), i])).values()
        );
        setListNews(unique.slice(0, 10));
      })
      .catch((err) => {
        console.error("뉴스 가져오기 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <>
      {listNews.map((item, i) => (
        <ListNewsItem
          key={i}
          item={item}
          loading={loading}
          onChatClick={handleChatClick}
        />
      ))}
    </>
  );
};

export default NewsMainList;
