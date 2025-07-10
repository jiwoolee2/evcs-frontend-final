import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext/AuthContext";

import {
  H1,
  H3,
  RentBodyDiv,
  RentContainerDiv,
  MoreButtonWrapper,
  StyledMoreButton,
} from "./DRBoard.styles";
import { CustomPrev, CustomNext } from "../CustomSlides/CustomSlides";
import SelectBoard from "./BoardCRUD/SelectBoard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const DRBoard = () => {
  const navi = useNavigate();
  const { auth } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [boards, setBoards] = useState([]);

  const [hasMore, setHasMore] = useState(true);

  const [boardLikesInfo, setBoardLikesInfo] = useState([]);
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: false,
    nextArrow: <CustomNext />,
    prevArrow: <CustomPrev />,
  };

  // ----------------------게시물 조회----------------------

  useEffect(() => {
    axios
      .get(`${apiUrl}/driveRouteBoard/${currentPage}`)
      .then((result) => {
        console.log("게시물 조회 결과:", result);
        const drBoard = result.data.drBoard ?? [];
        if (currentPage === 1) {
          setBoards([...drBoard]);
        }

        if (drBoard.length % 10 != 0) {
          setHasMore(false);
        }
      })
      .catch((error) => {
        console.error("게시물 조회 실패:", error);
      });
  }, [currentPage]);

  const clickToMore = () => {
    setCurrentPage((currentPage) => currentPage + 1);
  };

  /* 하얀하트 누르면 게시글 번호 들고 db 가서 좋아요 테이블에 memberNo boardNo 추가
    검정 하트를 한 번 더 누르면 게시글 번호 들고 가서 memberNo boardNo 삭제
   driveRouteBoard join해서 status가 Y인 것만 boardNo desc로 memberNo,boardNo을 조회해와서  boardNo,memberNo이 일치하면 좋아요 표시됨
  */

  console.log("로그인한 유저 번호:", auth.user.memberNo);

  return (
    <>
      <RentContainerDiv>
        <RentBodyDiv>
          <H1>일상 공유 게시판</H1>

          <br />
          <br />

          <H3>당신의 일상과 드라이브 루트를 공유해보세요~</H3>

          <br />

          <SelectBoard
            currentPage={currentPage}
            boards={boards}
            setBoards={setBoards}
            apiUrl={apiUrl}
            setHasMore={setHasMore}
            setCurrentPage={setCurrentPage}
            setBoardLikesInfo={setBoardLikesInfo}
            boardLikesInfo={boardLikesInfo}
            auth={auth}
            settings={settings}
          />
          {hasMore && (
            <MoreButtonWrapper>
              <StyledMoreButton onClick={clickToMore}>
                더보기
                <ExpandMoreIcon />
              </StyledMoreButton>
            </MoreButtonWrapper>
          )}
        </RentBodyDiv>
      </RentContainerDiv>
    </>
  );
};
export default DRBoard;
