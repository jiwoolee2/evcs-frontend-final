import { useEffect, useRef } from "react";
import axios from "axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatIcon from "@mui/icons-material/Chat";
import DriveEtaTwoToneIcon from "@mui/icons-material/DriveEtaTwoTone";
import {
  Wrapper,
  ContentBox,
  NickName,
  Images,
  Content,
  PostIcon,
  DriveRouteIcon,
  MoreText,
  ButtonGroup,
  TopBar,
  UpdateButton,
  DeleteButton,
} from "../DRBoard.styles";
import { CustomNext, CustomPrev } from "../../CustomSlides/CustomSlides";
import Slider from "react-slick";

const SelectBoard = ({
  boards,
  setBoards,
  setCurrentPage,
  auth,
  boardLikesInfo,
  setBoardLikesInfo,
  expandedPost,
  settings,
  handleUpdateBtn,
  handleCommentList,
  handleDriveRoute,
  handleLikeCancelBtn,
  handleLikeBtn,
}) => {
  console.log("boards", boards);

  const handleDelete = (boardNo) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`${apiUrl}/driveRouteBoard/delete/${boardNo}`, {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        })
        .then((result) => {
          alert("게시물이 삭제되었습니다.");
          fetchBoards(1);
        })
        .catch((error) => {
          console.error("게시물 삭제 실패", error);
          alert("게시물 삭제에 실패했습니다.");
        });
    }
  };
  return (
    <>
      <Wrapper>
        {boards.map((board, i) => (
          <ContentBox key={i}>
            <TopBar>
              <NickName>{board.memberNickName} 님의 게시글</NickName>
              {board.boardWriter == auth.user.memberNo && (
                <ButtonGroup>
                  <UpdateButton onClick={() => handleUpdateBtn(board)}>
                    수정
                  </UpdateButton>
                  <DeleteButton onClick={() => handleDelete(board.boardNo)}>
                    삭제
                  </DeleteButton>
                </ButtonGroup>
              )}
            </TopBar>
            <Images>
              <div
                className="slider-container"
                style={{ width: "100%", height: "100%" }}
              >
                <Slider {...settings}>
                  {board.drBoardImage.map((item, index) => (
                    <div key={index}>
                      <img
                        src={item.boardImage}
                        style={{
                          width: "100%",
                          maxHeight: "630px",
                          objectFit: "cover",
                          backgroundRepeat: "no-repeat",
                        }}
                        alt={`preview-${index}`}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </Images>
            <PostIcon>
              {boardLikesInfo.some((item) => item.boardNo == board.boardNo) ? (
                <FavoriteRoundedIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLikeCancelBtn(board.boardNo)}
                />
              ) : (
                <FavoriteBorderIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => handleLikeBtn(board.boardNo)}
                />
              )}

              <ChatIcon
                onClick={() => handleCommentList(board)}
                style={{ cursor: "pointer" }}
              />
              <DriveRouteIcon
                style={{
                  cursor: "pointer",
                  textAlign: "right",
                }}
                onClick={() => handleDriveRoute(board)}
              >
                <DriveEtaTwoToneIcon />
                드라이브 경로
              </DriveRouteIcon>
            </PostIcon>
            {board.likesCount > 0 && (
              <span
                style={{
                  marginLeft: "15px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  color: "#949393",
                }}
              >
                {board.likesCount}명이 좋아합니다
              </span>
            )}

            <Content expanded={!!expandedPost[board.boardNo]}>
              {board.boardContent}
            </Content>
            {board.boardContent.length > 80 && (
              <MoreText
                onClick={() =>
                  setExpandedPost((prev) => ({
                    ...prev,
                    [board.boardNo]: !prev[board.boardNo],
                  }))
                }
              >
                {expandedPost[board.boardNo] ? "접기" : "...더보기"}
              </MoreText>
            )}
          </ContentBox>
        ))}
      </Wrapper>
    </>
  );
};
export default SelectBoard;
