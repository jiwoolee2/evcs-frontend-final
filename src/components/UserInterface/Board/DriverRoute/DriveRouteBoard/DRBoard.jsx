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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const DRBoard = () => {
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [openPhotoModal, setopenPhotoModal] = useState(false);
  const [openRouteModal, setOpenRouteModal] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [openDriveRoute, setOpenDriveRoute] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [heart, setHeart] = useState(true);
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
  const [boardLikesInfo, setBoardLikesInfo] = useState([]);
  const [isUpdateMode, setIsUpdateMode] = useState(true);
  const [updateBoardNo, setUpdateBoardNo] = useState(null);
  const [editingCommentNo, setEditingCommentNo] = useState(null); // 수정 중인 댓글 번호
  const [editedContent, setEditedContent] = useState(""); // 임시 수정 값 저장
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";

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

  const handleDriveRoute = (e) => {
    setOpenDriveRoute(true);
    setSrcMap(e.driveRouteImage);
  };

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

  const clickToMore = () => {
    setCurrentPage((currentPage) => currentPage + 1);
  };

  // -----------------게시물 추가----------------------
  const handleInsertBoard = async () => {
    if (!boardContent || boardContent.trim() === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (boardImage.length < 2 || boardImage.length > 10) {
      alert("사진을 2장 이상 10장 이하로로 첨부해주세요.");
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
            setBoards([...drBoard]);
            setCurrentPage(1); // 페이지 초기화

            return axios.get(`${apiUrl}/driveRouteBoard/selectLikes`, {
              headers: {
                Authorization: `Bearer ${auth.user.accessToken}`,
              },
            });
          })
          .then((res) => {
            setBoardLikesInfo([...res.data]);
          })
          .catch((err) => {
            console.error("게시물/좋아요 재조회 실패", err);
          });
      });
  };
  const handleContentValue = (e) => {
    setBoardContent(e.target.value);
  };

  const handleCommentList = (board) => {
    setCommentTargetBoard({
      memberNickName: board.memberNickName,
      memberNo: board.memberNo,
      boardNo: board.boardNo,
      boardContent: board.boardContent,
    });
    setOpenCommentModal(true);
  };

  // ----------------------게시물 수정----------------------
  const handleUpdate = (board) => {
    setBoardContent(board.boardContent);
    setMapUrl(board.driveRouteImage); // 드라이브 경로 이미지
    setImagesUrl(
      board.drBoardImage.map((image) => image.boardImage) // URL만 추출
    );
    setBoardImage([]); // 실제 파일은 없지만 placeholder로라도 빈 배열로 초기화
    setUpdateBoardNo(board.boardNo);
    setIsUpdateMode(false);
    setopenPhotoModal(true); // 모달 열기
  };
  const handleUpdateBoard = async () => {
    if (!boardContent) {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (boardImage.length > 10) {
      alert("사진을 10장 이하로로 첨부해주세요.");
      return;
    } else if (mapUrl === "") {
      alert("드라이브 루트를 선택해주세요.");
      return;
    }

    const formData = new FormData();

    formData.append("boardNo", updateBoardNo);
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
            setBoards([...drBoard]);
            setCurrentPage(1); // 페이지 초기화

            return axios.get(`${apiUrl}/driveRouteBoard/selectLikes`, {
              headers: {
                Authorization: `Bearer ${auth.user.accessToken}`,
              },
            });
          })
          .then((res) => {
            setBoardLikesInfo([...res.data]);
          })
          .catch((err) => {
            console.error("게시물/좋아요 재조회 실패", err);
          });
      });
  };

  // ----------------------게시물 삭제----------------------
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
          axios
            .get(`${apiUrl}/driveRouteBoard/1`, {
              headers: {
                Authorization: `Bearer ${auth.user.accessToken}`,
              },
            })
            .then((res) => {
              const drBoard = res.data;
              setBoards([...drBoard]);
              setCurrentPage(1); // 페이지 초기화

              return axios.get(`${apiUrl}/driveRouteBoard/selectLikes`, {
                headers: {
                  Authorization: `Bearer ${auth.user.accessToken}`,
                },
              });
            })
            .then((res) => {
              setBoardLikesInfo([...res.data]);
            })
            .catch((err) => {
              console.error("게시물/좋아요 재조회 실패", err);
            });
        });
    }
  };

  // ----------------------댓글 조회----------------------
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
              setopenPhotoModal(true), setIsUpdateMode(true);
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
          />

          <Wrapper>
            {boards.map((board, i) => (
              <ContentBox key={i}>
                <TopBar>
                  <NickName>{board.memberNickName} 님의 게시글</NickName>
                  {board.boardWriter == auth.user.memberNo && (
                    <ButtonGroup>
                      <UpdateButton onClick={() => handleUpdate(board)}>
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
                  {boardLikesInfo.some(
                    (item) => item.boardNo == board.boardNo
                  ) ? (
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
                {board.likeCount > 0 && (
                  <span
                    style={{
                      marginLeft: "15px",
                      marginBottom: "20px",
                      fontWeight: "bold",
                      color: "#949393",
                    }}
                  >
                    {board.likeCount}명이 좋아합니다
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
          {hasMore && (
            <MoreButtonWrapper>
              <StyledMoreButton onClick={clickToMore}>
                더보기
                <ExpandMoreIcon />
              </StyledMoreButton>
            </MoreButtonWrapper>
          )}

          {/* 게시물 만들기(사진설정) 모달 */}
          {openPhotoModal && (
            <ModalWrapper>
              <CloseBtn
                onClick={() => {
                  setopenPhotoModal(false);
                  setImagesUrl([]);
                  setMapUrl("");
                }}
              >
                <CloseRoundedIcon style={{ fontSize: "40px" }} />
              </CloseBtn>
              <ModalLabel>
                <ModalHeader>
                  {isUpdateMode ? <>새 게시물 만들기</> : <>게시물 수정하기</>}
                  <ModalSubmit
                    onClick={() => {
                      setOpenRouteModal(true);
                      setopenPhotoModal(false);
                    }}
                  >
                    다음
                  </ModalSubmit>
                </ModalHeader>
                <ModalContent>
                  <input
                    style={{ display: "none" }}
                    type="file"
                    ref={ref}
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                  />
                  {imagesUrl == "" ? (
                    <>
                      <div
                        style={{
                          width: "200px",
                          height: "50px",
                          position: "fixed",
                          right: "400px",
                          top: "300px",
                          cursor: "pointer",
                        }}
                      >
                        <InsertPhotoRoundedIcon />
                        <Button variant="primary" onClick={fileHandler}>
                          사진을 선택해주세요
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="slider-container"
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {imagesUrl.length === 1 ? (
                          <>
                            {imagesUrl.map((url, index) => (
                              <div key={index} style={{ position: "relative" }}>
                                <img
                                  src={url}
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
                          </>
                        ) : (
                          <Slider {...settings}>
                            {imagesUrl.map((url, index) => (
                              <div key={index} style={{ position: "relative" }}>
                                <img
                                  src={url}
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
                        )}
                      </div>
                      <AutoAwesomeMotionOutlinedIcon
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "20px",
                          fontSize: "30px",
                          color: "#fff",
                          backgroundColor: "rgba(0,0,0,0.4)",
                          borderRadius: "50%",
                          padding: "5px",
                          cursor: "pointer",
                        }}
                        onClick={fileHandler}
                      />
                    </>
                  )}
                </ModalContent>
              </ModalLabel>
            </ModalWrapper>
          )}

          {/* 경로설정 및 내용작성 모달 */}
          {openRouteModal && (
            <ModalWrapper>
              <CloseBtn
                onClick={() => {
                  setOpenRouteModal(false);
                  setImagesUrl([]);
                  setMapUrl("");
                }}
              >
                <CloseRoundedIcon style={{ fontSize: "40px" }} />
              </CloseBtn>
              <ModalLabel>
                <ModalHeader>
                  {isUpdateMode ? (
                    <>
                      새 게시물 만들기
                      <ModalSubmit onClick={handleInsertBoard}>
                        공유하기
                      </ModalSubmit>
                    </>
                  ) : (
                    <>
                      게시물 수정하기
                      <ModalSubmit onClick={handleUpdateBoard}>
                        수정하기
                      </ModalSubmit>
                    </>
                  )}
                  <ModalBack
                    onClick={() => {
                      setOpenRouteModal(false);
                      setopenPhotoModal(true);
                      setMapUrl("");
                    }}
                  >
                    이전
                  </ModalBack>
                </ModalHeader>
                <ModalContent>
                  <LeftContent>
                    {mapUrl == "" ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => setOpenMapModal(true)}
                        >
                          드라이브 루트 선택하기
                        </Button>
                      </>
                    ) : (
                      <>
                        <DriveRoute
                          onClick={() => setOpenMapModal(true)}
                          style={{ cursor: "pointer" }}
                        >
                          <MapImg src={mapUrl} alt="지도지도" />
                        </DriveRoute>
                      </>
                    )}
                  </LeftContent>
                  <RightContent>
                    <DriveContent>
                      <Textarea
                        type="text"
                        onChange={handleContentValue}
                        placeholder="내용을 작성해주세요"
                        value={boardContent}
                      ></Textarea>
                    </DriveContent>
                  </RightContent>
                </ModalContent>
              </ModalLabel>
            </ModalWrapper>
          )}

          {/* 드라이브 경로 모달 */}
          {openMapModal && (
            <ModalWrapper>
              <CloseBtn onClick={() => setOpenMapModal(false)}>
                <CloseRoundedIcon style={{ fontSize: "40px" }} />
              </CloseBtn>
              <ModalLabel>
                <ModalHeader>드라이브 경로 선택</ModalHeader>

                <DriveRouteMap mapUrl={(url) => setMapUrl(url)} />
              </ModalLabel>
            </ModalWrapper>
          )}

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

          {/* 댓글 모달 */}
          {openCommentModal && (
            <CommentModalWrapper>
              <CloseBtn onClick={() => setOpenCommentModal(false)}>
                <CloseRoundedIcon style={{ fontSize: "40px" }} />
              </CloseBtn>
              <CommentModalLabel>
                <ModalHeader>상세보기</ModalHeader>
                <ModalContent>
                  <LeftComment>
                    <BoardImage>
                      <Slider {...settings}>
                        {boardImages
                          .filter(
                            (item) =>
                              item.boardNo === commentTargetBoard.boardNo
                          )
                          .map((item, index) => {
                            return (
                              <div key={index}>
                                <img
                                  src={item.boardImage}
                                  style={{
                                    width: "100%",
                                    height: "400px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                  alt={`preview-${index}`}
                                />
                              </div>
                            );
                          })}
                      </Slider>
                    </BoardImage>

                    <BoardContent>
                      {commentTargetBoard.boardContent}
                    </BoardContent>
                  </LeftComment>
                  <RightContent>
                    <Comments>
                      {commentInfo.map((comment, commentNo) => (
                        <CommentItem key={commentNo}>
                          <CommentTop>
                            <CommentAuthor>
                              {comment.memberNickname}
                            </CommentAuthor>
                            {comment.commentWriter == auth.user.memberNo && (
                              <CommentButtonGroup>
                                {editingCommentNo == comment.commentNo ? (
                                  <>
                                    <span
                                      className="save"
                                      onClick={() =>
                                        handleUpdateComment(comment.commentNo)
                                      }
                                    >
                                      저장
                                    </span>
                                    <span
                                      className="cancel"
                                      onClick={() => setEditingCommentNo(null)}
                                    >
                                      취소
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className="edit"
                                      onClick={() => {
                                        setEditingCommentNo(comment.commentNo);
                                        setEditedContent(
                                          comment.commentContent
                                        ); // 현재 내용 가져오기
                                      }}
                                    >
                                      수정
                                    </span>
                                    <span
                                      className="delete"
                                      onClick={() =>
                                        handleDeleteComment(comment.commentNo)
                                      }
                                    >
                                      삭제
                                    </span>
                                  </>
                                )}
                              </CommentButtonGroup>
                            )}
                          </CommentTop>

                          {editingCommentNo === comment.commentNo ? (
                            <input
                              type="text"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              maxLength={85}
                              style={{ width: "100%", marginTop: "5px" }}
                            />
                          ) : (
                            <CommentText>{comment.commentContent}</CommentText>
                          )}
                        </CommentItem>
                      ))}
                    </Comments>
                    {hasMoreComment && (
                      <CommentSubmit onClick={handleMoreComments}>
                        댓글 더보기
                      </CommentSubmit>
                    )}
                    <InsertComment>
                      <Commentarea
                        type="text"
                        placeholder="댓글 달기.."
                        maxLength={85}
                        value={comment.commentContent} // 추가
                        onChange={(e) =>
                          setComment({
                            ...comment,
                            commentContent: e.target.value,
                          })
                        }
                      />
                      <CommentSubmit onClick={handleComment}>
                        게시
                      </CommentSubmit>
                    </InsertComment>
                  </RightContent>
                </ModalContent>
              </CommentModalLabel>
            </CommentModalWrapper>
          )}
        </RentBodyDiv>
      </RentContainerDiv>
    </>
  );
};
export default DRBoard;
