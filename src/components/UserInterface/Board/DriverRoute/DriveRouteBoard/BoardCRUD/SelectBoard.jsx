import { useEffect, useRef } from "react";
import { useState } from "react";
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
import BoardModal from "./BoardModal";

const SelectBoard = ({
  boards,
  setBoards,
  setCurrentPage,
  auth,
  boardLikesInfo,
  setBoardLikesInfo,
  settings,
  handleCommentList,
  handleLikeCancelBtn,
  handleLikeBtn,
  openPhotoModal,
  setopenPhotoModal,
  isInsertMode,
  setIsInsertMode,
}) => {
  console.log("boards", boards);

  const apiUrl = window.ENV?.API_URL || "http://localhost:80";

  // 게시글 수정 시 내용 저장할 state
  const [boardContent, setBoardContent] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [imagesUrl, setImagesUrl] = useState([]);
  const [boardImage, setBoardImage] = useState([]); // 파일자체를 저장
  const [updateBoardNo, setUpdateBoardNo] = useState(null);

  // 지도표시 모달
  const [srcMap, setSrcMap] = useState("");
  // 게시글 수정/작성 모달
  const [openDriveRoute, setOpenDriveRoute] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [openRouteModal, setOpenRouteModal] = useState(false);

  const [driveRouteImage, setDriveRouteImage] = useState(null);
  const [expandedPost, setExpandedPost] = useState({});
  const ref = useRef();

  const handleContentValue = (e) => {
    setBoardContent(e.target.value);
  };

  const handleDriveRoute = (board) => {
    setOpenDriveRoute(true);
    setSrcMap(board.driveRouteImage.driveRouteImage);
  };

  const handleUpdateBtn = (board) => {
    getBoardInfo(board);
    setIsInsertMode(false);
    setopenPhotoModal(true); // 모달 열기
  };

  const getBoardInfo = (board) => {
    setBoardContent(board.boardContent);
    setMapUrl(board.driveRouteImage.driveRouteImage); // 드라이브 경로 이미지
    setImagesUrl(
      board.drBoardImage.map((image) => image.boardImage) // URL만 추출
    );
    setUpdateBoardNo(board.boardNo);
  };

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

  const fetchBoards = (page = 1) => {
    axios
      .get(`${apiUrl}/driveRouteBoard/${page}`, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((res) => {
        setBoards(res.data.data.drBoard);
        setCurrentPage(page); // 페이지까지 업데이트
      })
      .catch((error) => {
        console.error("게시물 조회 실패", error);
      });
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

      <BoardModal
        // 게시글 수정 시 내용 저장할 state
        boardContent={boardContent}
        mapUrl={mapUrl}
        imagesUrl={imagesUrl}
        boardImage={boardImage}
        isInsertMode={isInsertMode}
        updateBoardNo={updateBoardNo}
        setBoardContent={setBoardContent}
        setMapUrl={setMapUrl}
        setImagesUrl={setImagesUrl}
        setIsInsertMode={setIsInsertMode}
        // 게시글 수정/작성 모달
        openPhotoModal={openPhotoModal}
        setOpenPhotoModal={setopenPhotoModal}
        openRouteModal={openRouteModal}
        setOpenRouteModal={setOpenRouteModal}
        openMapModal={openMapModal}
        setOpenMapModal={setOpenMapModal}
        openDriveRoute={openDriveRoute}
        setOpenDriveRoute={setOpenDriveRoute}
        auth={auth}
        settings={settings}
        handleContentValue={handleContentValue}
        ref={ref}
      />

      {/* 드라이브 경로 이미지 */}
      {openDriveRoute && (
        <ModalWrapper>
          <CloseBtn onClick={() => setOpenDriveRoute(false)}>
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <ModalLabel>
            <ModalHeader>드라이브 경로</ModalHeader>
            <ModalDriveRoute>
              <ModalDriveRouteImg
                src={srcMap}
                alt="드라이브 경로"
                style={{
                  width: "100%",
                  maxHeight: "630px",
                  objectFit: "cover",
                  backgroundRepeat: "none",
                }}
              />
            </ModalDriveRoute>
          </ModalLabel>
        </ModalWrapper>
      )}
    </>
  );
};
export default SelectBoard;
