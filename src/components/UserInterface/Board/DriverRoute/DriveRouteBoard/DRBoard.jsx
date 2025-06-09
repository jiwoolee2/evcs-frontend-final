import Button from "react-bootstrap/Button";
import Slider from "react-slick";
import DriveRouteBoardNav from "../../../Common/Nav/DriveRouteBoardNav";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DriveEtaTwoToneIcon from "@mui/icons-material/DriveEtaTwoTone";
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AutoAwesomeMotionOutlinedIcon from "@mui/icons-material/AutoAwesomeMotionOutlined";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import DriveRouteMap from "../DriveRouteMap/DriveRouteMap";
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext/AuthContext";

import {
  H1,
  H3,
  Wrapper,
  ContentBox,
  NickName,
  Images,
  Content,
  RentBodyDiv,
  RentContainerDiv,
  PostIcon,
  DriveRouteIcon,
  InsertButton,
  ModalWrapper,
  ModalLabel,
  ModalHeader,
  ModalContent,
  LeftContent,
  RightContent,
  ModalSubmit,
  ModalBack,
  CloseBtn,
  DriveRoute,
  MapImg,
  DriveContent,
  Textarea,
  Comments,
  CommentSubmit,
  InsertComment,
  Commentarea,
  LeftComment,
  CommentModalWrapper,
  CommentModalLabel,
  ModalDriveRoute,
  ModalDriveRouteImg,
  MoreButtonWrapper,
  StyledMoreButton,
  BoardContent,
  BoardImage,
  MoreText,
  CommentItem,
  CommentAuthor,
  CommentText,
  DeleteButton,
  UpdateButton,
  ButtonGroup,
  TopBar,
  CommentButtonGroup,
  CommentTop,
} from "./DRBoard.styles";
import { CustomPrev, CustomNext } from "../CustomSlides/CustomSlides";
import SelectBoard from "./BoardCRUD/SelectBoard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BoardModal from "./BoardCRUD/BoardModal";
import SelectComment from "./CommentCRUD/SelectComment";
const DRBoard = () => {
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [openPhotoModal, setopenPhotoModal] = useState(false);
  const [openRouteModal, setOpenRouteModal] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [openDriveRoute, setOpenDriveRoute] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const ref = useRef(null);
  const [imagesUrl, setImagesUrl] = useState([]);
  const [boardImage, setBoardImage] = useState([]);
  const navi = useNavigate();
  const [expandedPost, setExpandedPost] = useState({});
  const [boardContent, setBoardContent] = useState("");
  const { auth } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [boards, setBoards] = useState([]);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const [commentInfo, setCommentInfo] = useState([]);
  const [hasMoreComment, setHasMoreComment] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [commentTargetBoard, setCommentTargetBoard] = useState(null);
  const [comment, setComment] = useState({
    boardNo: null,
    commentContent: null,
  });
  const [isInsertMode, setIsInsertMode] = useState(true);
  const [updateBoardNo, setUpdateBoardNo] = useState(null);
  const [editingCommentNo, setEditingCommentNo] = useState(null); // 수정 중인 댓글 번호
  const [editedContent, setEditedContent] = useState(""); // 임시 수정 값 저장
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

  useEffect(() => {
    if (
      commentTargetBoard?.boardNo &&
      comment.boardNo !== commentTargetBoard.boardNo
    ) {
      setComment((prev) => ({
        ...prev,
        boardNo: commentTargetBoard.boardNo,
      }));
    }
  }, [commentTargetBoard]);

  // ----------------------게시물 조회----------------------

  useEffect(() => {
    axios
      .get(`${apiUrl}/driveRouteBoard/${currentPage}`)
      .then((result) => {
        console.log("게시물 조회 결과:", result.data.data.drBoard);
        const drBoard = result.data.data.drBoard;
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

  // ----------------------댓글 조회----------------------
  const handleCommentList = (board) => {
    setCommentTargetBoard({
      memberNickName: board.memberNickName,
      memberNo: board.memberNo,
      boardNo: board.boardNo,
      boardContent: board.boardContent,
    });
    setOpenCommentModal(true);
  };

  useEffect(() => {
    if (!commentTargetBoard) return;
    axios
      .get(
        `${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/${currentCommentPage}`,
        {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        }
      )
      .then((result) => {
        const drComment = result.data.drComment;
        setCommentInfo(drComment);
        setHasMoreComment(drComment.length === 10);
      })
      .catch((error) => {
        console.error("댓글 조회 실패:", error);
      });
  }, [commentTargetBoard, currentCommentPage]);

  const handleMoreComments = () => {
    setCurrentCommentPage((prev) => prev + 1);
  };

  // ----------------------댓글 추가----------------------
  const handleComment = () => {
    axios
      .post(`${apiUrl}/driveRouteComment/insert`, comment, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        alert("댓글이 등록되었습니다.");
        // 댓글 재조회 - 1페이지로 초기화
        setCurrentCommentPage(1);
        axios
          .get(`${apiUrl}/driveRouteComment/${comment.boardNo}/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drComment = res.data.drComment;
            setCommentInfo(drComment);
            setHasMoreComment(drComment.length === 10);
            setComment((prev) => ({ ...prev, commentContent: "" }));
          })
          .catch((err) => console.error("댓글 재조회 실패", err));
      })
      .catch((error) => {
        console.error("댓글 등록 실패:", error);
      });
  };

  // ----------------------댓글 삭제----------------------
  const handleDeleteComment = (commentNo) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`${apiUrl}/driveRouteComment/delete/${commentNo}`, {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        })
        .then((result) => {
          alert("댓글이 삭제되었습니다.");

          // 댓글 재조회
          setCurrentCommentPage(1);
          axios
            .get(
              `${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/1`,
              {
                headers: {
                  Authorization: `Bearer ${auth.user.accessToken}`,
                },
              }
            )
            .then((res) => {
              const drComment = res.data.drComment;
              setCommentInfo(drComment);
              setHasMoreComment(drComment.length === 10);
              setComment((prev) => ({ ...prev, commentContent: "" }));
            })
            .catch((err) => console.error("댓글 재조회 실패", err));
        })
        .catch((error) => {
          console.error("댓글 삭제 실패:", error);
        });
    }
  };

  // ----------------------댓글 수정----------------------
  const handleUpdateComment = (commentNo) => {
    axios
      .put(
        `${apiUrl}/driveRouteComment/update`,
        {
          commentContent: editedContent,
          commentNo: commentNo,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        }
      )
      .then((result) => {
        alert("댓글이 수정되었습니다.");
        setEditingCommentNo(null);
        // 댓글 재조회
        setCurrentCommentPage(1);
        axios
          .get(`${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drComment = res.data.drComment;
            setCommentInfo(drComment);
            setHasMoreComment(drComment.length === 10);
            setComment((prev) => ({ ...prev, commentContent: "" }));
          })
          .catch((err) => console.error("댓글 재조회 실패", err));
      })
      .catch((error) => {
        console.error("댓글 삭제 실패:", error);
      });
  };

  /* 하얀하트 누르면 게시글 번호 들고 db 가서 좋아요 테이블에 memberNo boardNo 추가
    검정 하트를 한 번 더 누르면 게시글 번호 들고 가서 memberNo boardNo 삭제
   driveRouteBoard join해서 status가 Y인 것만 boardNo desc로 memberNo,boardNo을 조회해와서  boardNo,memberNo이 일치하면 좋아요 표시됨
  */
  useEffect(() => {
    axios
      .get(`${apiUrl}/driveRouteBoard/selectLikes`, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        console.log("boardLikesInfo :", result.data);
        setBoardLikesInfo([...result.data]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleLikeBtn = (boardNo) => {
    axios
      .get(`${apiUrl}/driveRouteBoard/likes/${boardNo}`, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then(() => {
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.boardNo === boardNo
              ? { ...board, likeCount: board.likeCount + 1 }
              : board
          )
        );
        setBoardLikesInfo((prev) => [...prev, { boardNo }]);

        axios
          .get(`${apiUrl}/driveRouteBoard/selectLikes`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((result) => {
            console.log("boardLikesInfo :", result.data);
            setBoardLikesInfo([...result.data]);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleLikeCancelBtn = (boardNo) => {
    axios
      .delete(`${apiUrl}/driveRouteBoard/likesCancel/${boardNo}`, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then(() => {
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.boardNo === boardNo
              ? {
                  ...board,
                  likeCount: Math.max(board.likeCount - 1, 0), // 0 미만 방지
                }
              : board
          )
        );
        setBoardLikesInfo((prev) =>
          prev.filter((item) => item.boardNo !== boardNo)
        );
        axios
          .get(`${apiUrl}/driveRouteBoard/selectLikes`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((result) => {
            console.log("boardLikesInfo :", result.data);
            setBoardLikesInfo([...result.data]);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
          <InsertButton
            onClick={() => {
              setopenPhotoModal(true), setIsInsertMode(true);
            }}
          >
            <AddBoxOutlinedIcon /> 게시물 만들기
          </InsertButton>
          <br />

          <SelectBoard
            currentPage={currentPage}
            setBoards={setBoards}
            apiUrl={apiUrl}
            setHasMore={setHasMore}
            setCurrentPage={setCurrentPage}
            boards={boards}
            setBoardLikesInfo={setBoardLikesInfo}
            boardLikesInfo={boardLikesInfo}
            auth={auth}
            settings={settings}
            handleCommentList={handleCommentList}
            handleLikeCancelBtn={handleLikeCancelBtn}
            handleLikeBtn={handleLikeBtn}
            openPhotoModal={openPhotoModal}
            setopenPhotoModal={setopenPhotoModal}
            isInsertMode={isInsertMode}
            setIsInsertMode={setIsInsertMode}
          />
          {hasMore && (
            <MoreButtonWrapper>
              <StyledMoreButton onClick={clickToMore}>
                더보기
                <ExpandMoreIcon />
              </StyledMoreButton>
            </MoreButtonWrapper>
          )}

          <SelectComment
            openCommentModal={openCommentModal}
            commentTargetBoard={commentTargetBoard}
            commentInfo={commentInfo}
            editingCommentNo={editingCommentNo}
            hasMoreComment={hasMoreComment}
            handleMoreComments={handleMoreComments}
            handleComment={handleComment}
            comment={comment}
            boardImages={boardImage} // 게시물 이미지 정보 전달
            setOpenCommentModal={setOpenCommentModal}
            setEditingCommentNo={setEditingCommentNo}
            setEditedContent={setEditedContent}
            editedContent={editedContent}
            handleDeleteComment={handleDeleteComment}
            handleUpdateComment={handleUpdateComment}
          />
        </RentBodyDiv>
      </RentContainerDiv>
    </>
  );
};
export default DRBoard;
