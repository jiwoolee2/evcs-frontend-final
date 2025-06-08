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
  const [srcMap, setSrcMap] = useState("");
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
    if (mapUrl !== "") {
      setOpenMapModal(false);
    }
  }, [mapUrl]);

  const fileHandler = () => {
    if (ref.current) {
      ref.current.value = null;
      ref.current.click();
    }
  };

  const handleImageChange = (e) => {
    const images = e.target.files;
    let imagesUrlList = [...imagesUrl]; // imagesUrl배열을 펼쳐서 [] 안에 집어넣음
    let imageLength = images.length > 10 ? 10 : images.length;

    for (let i = 0; i < imageLength; i++) {
      setBoardImage((prev) => [...prev, images[i]]);
      const currentImageUrl = URL.createObjectURL(images[i]);
      imagesUrlList.push(currentImageUrl);
    }
    setImagesUrl(imagesUrlList);
    console.log(imagesUrlList);
  };

  const handleContentValue = (e) => {
    setBoardContent(e.target.value);
  };

  const handleInsertBoard = async (
    updateBoardNo,
    boardContent,
    boardImage,
    mapUrl
  ) => {
    console.log(
      "boardNo:",
      updateBoardNo,
      "boardContent:",
      boardContent,
      "boardImage:",
      boardImage,
      "mapUrl:",
      mapUrl
    );
    if (!boardContent || boardContent.trim === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardImage.length > 10 || boardImage.length < 2) {
      alert("이미지는 2장 이상 넣어주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (mapUrl === "") {
      alert("드라이브 루트를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("boardContent", boardContent);
    formData.append("boardWriter", auth.user.memberNo);
    boardImage.forEach((boardFiles) => {
      formData.append("boardFiles", boardFiles);
    });
    if (mapUrl) {
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      const drFile = new File([blob], "driveRoute.png", { type: blob.type });
      formData.append("drFile", drFile);
    }

    axios
      .post(`${apiUrl}/driveRouteBoard/insert`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        setOpenRouteModal(false);
        setBoardContent("");
        setBoardImage([]);
        setImagesUrl([]);
        setMapUrl("");
        setSrcMap("");
        alert("게시물이 등록되었습니다.");
        axios
          .get(`${apiUrl}/driveRouteBoard/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drBoard = res.data;
            fetchBoards(1);
          });
      });
  };

  const handleUpdateBoard = async (
    updateBoardNo,
    boardContent,
    boardImage,
    mapUrl
  ) => {
    console.log(
      "boardNo:",
      updateBoardNo,
      "boardContent:",
      boardContent,
      "boardImage:",
      boardImage,
      "mapUrl:",
      mapUrl
    );
    if (!boardContent || boardContent.trim === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (mapUrl === "") {
      alert("드라이브 루트를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("boardContent", boardContent);
    formData.append("boardWriter", auth.user.memberNo);
    formData.append("boardNo", updateBoardNo);
    boardImage.forEach((boardFiles) => {
      formData.append("boardFiles", boardFiles);
    });
    if (mapUrl) {
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      const drFile = new File([blob], "driveRoute.png", { type: blob.type });
      formData.append("drFile", drFile);
    }

    axios
      .post(`${apiUrl}/driveRouteBoard/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        setOpenRouteModal(false);
        setBoardContent("");
        setBoardImage([]);
        setImagesUrl([]);
        setMapUrl("");
        setSrcMap("");
        alert("게시물이 수정되었습니다.");
        axios
          .get(`${apiUrl}/driveRouteBoard/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drBoard = res.data;
            fetchBoards(1);
          });
      });
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

  const handleDriveRoute = (e) => {
    setOpenDriveRoute(true);
    setSrcMap(e.driveRouteImage);
  };

  const handleUpdateBtn = (board) => {
    setBoardContent(board.boardContent);
    setMapUrl(board.driveRouteImage.driveRouteImage); // 드라이브 경로 이미지
    setImagesUrl(
      board.drBoardImage.map((image) => image.boardImage) // URL만 추출
    );
    setUpdateBoardNo(board.boardNo);
    setIsInsertMode(false);
    setopenPhotoModal(true); // 모달 열기
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

  console.log("로그인한 유저 번호:", auth.user.memberNo);

  return (
    <>
      <RentContainerDiv>
        {!openPhotoModal &&
          !openCommentModal &&
          !openRouteModal &&
          !openDriveRoute && <DriveRouteBoardNav />}
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
            setCurrentPage={setCurrentPage}
            boards={boards}
            setBoards={setBoards}
            setBoardLikesInfo={setBoardLikesInfo}
            boardLikesInfo={boardLikesInfo}
            expandedPost={expandedPost}
            auth={auth}
            settings={settings}
            handleUpdateBtn={handleUpdateBtn}
            handleDelete={handleDelete}
            handleCommentList={handleCommentList}
            handleDriveRoute={handleDriveRoute}
            handleLikeCancelBtn={handleLikeCancelBtn}
            handleLikeBtn={handleLikeBtn}
          />
          {hasMore && (
            <MoreButtonWrapper>
              <StyledMoreButton onClick={clickToMore}>
                더보기
                <ExpandMoreIcon />
              </StyledMoreButton>
            </MoreButtonWrapper>
          )}

          <BoardModal
            updateBoardNo={updateBoardNo}
            boardImage={boardImage}
            openPhotoModal={openPhotoModal}
            setOpenPhotoModal={setopenPhotoModal}
            openRouteModal={openRouteModal}
            setOpenRouteModal={setOpenRouteModal}
            openMapModal={openMapModal}
            setOpenMapModal={setOpenMapModal}
            openDriveRoute={openDriveRoute}
            setOpenDriveRoute={setOpenDriveRoute}
            imagesUrl={imagesUrl}
            setImagesUrl={setImagesUrl}
            mapUrl={mapUrl}
            setMapUrl={setMapUrl}
            boardContent={boardContent}
            setBoardContent={setBoardContent}
            isInsertMode={isInsertMode}
            setIsInsertMode={setIsInsertMode}
            auth={auth}
            settings={settings}
            handleUpdateBoard={handleUpdateBoard}
            handleInsertBoard={handleInsertBoard}
            handleContentValue={handleContentValue}
            handleImageChange={handleImageChange}
            fileHandler={fileHandler}
            ref={ref}
          />

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
