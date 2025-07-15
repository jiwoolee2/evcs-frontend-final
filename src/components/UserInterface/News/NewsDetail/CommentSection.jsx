import { useEffect, useState } from "react";
import * as S from "./NewsDetail.styles";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext/AuthContext";

const CommentSection = ({ newsNo, backendUrl }) => {
  const { auth } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const token = localStorage.getItem("accessToken");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  useEffect(() => {
    fetchComments();
  }, [newsNo]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${backendUrl}/news/comment/list`, {
        params: { newsNo },
        ...authHeader,
      });
      setComments(res.data);
    } catch (error) {
      console.error("댓글 불러오기 실패", error);
    }
  };

  const handleAddComment = async () => {
    if (!token) return alert("로그인 후 이용해주세요.");
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `${backendUrl}/news/comment`,
        { newsNo, content: newComment },
        authHeader
      );
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("댓글 작성 실패", error);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!token) return alert("로그인 후 이용해주세요.");
    if (!replyContent.trim()) return;
    try {
      await axios.post(
        `${backendUrl}/news/comment`,
        { newsNo, content: replyContent, parentId },
        authHeader
      );
      setReplyContent("");
      setReplyTargetId(null);
      fetchComments();
    } catch (error) {
      console.error("답글 작성 실패", error);
    }
  };

  const toggleLike = async (commentId) => {
    if (!token) return alert("로그인 후 이용해주세요.");
    try {
      const current = comments.find((c) => c.id === commentId);
      if (!current) return;

      if (current.hasLiked) {
        await axios.delete(`${backendUrl}/news/comment/like`, {
          params: { newsCmtId: commentId },
          ...authHeader,
        });
      } else {
        if (current.hasHated) {
          await axios.delete(`${backendUrl}/news/comment/hate`, {
            params: { newsCmtId: commentId },
            ...authHeader,
          });
        }
        await axios.post(`${backendUrl}/news/comment/like`, null, {
          params: { newsCmtId: commentId },
          ...authHeader,
        });
      }
      fetchComments();
    } catch (error) {
      console.error("좋아요 토글 실패", error);
    }
  };

  const toggleHate = async (commentId) => {
    if (!token) return alert("로그인 후 이용해주세요.");
    try {
      const current = comments.find((c) => c.id === commentId);
      if (!current) return;

      if (current.hasHated) {
        await axios.delete(`${backendUrl}/api/news/comment/hate`, {
          params: { newsCmtId: commentId },
          ...authHeader,
        });
      } else {
        if (current.hasLiked) {
          await axios.delete(`${backendUrl}/api/news/comment/like`, {
            params: { newsCmtId: commentId },
            ...authHeader,
          });
        }
        await axios.post(`${backendUrl}/api/news/comment/hate`, null, {
          params: { newsCmtId: commentId },
          ...authHeader,
        });
      }
      fetchComments();
    } catch (error) {
      console.error("싫어요 토글 실패", error);
    }
  };

  const handleEditComment = async () => {
    if (!token) return alert("로그인 후 이용해주세요.");
    if (!editContent.trim()) return;
    try {
      await axios.put(
        `${backendUrl}/news/comment`,
        {
          commentId: editingCommentId,
          content: editContent,
        },
        authHeader
      );
      setEditingCommentId(null);
      setEditContent("");
      fetchComments();
    } catch (error) {
      console.error("댓글 수정 실패", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return alert("로그인 후 이용해주세요.");
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      await axios.delete(`${backendUrl}/news/comment/${commentId}`, authHeader);
      fetchComments();
    } catch (error) {
      console.error("댓글 삭제 실패", error);
    }
  };

  const handleReportComment = async (commentId) => {
    if (!token) return alert("로그인 후 이용해주세요.");
    if (!window.confirm("해당 댓글을 신고하시겠습니까?")) return;
    try {
      await axios.post(
        `${backendUrl}/report/comment`,
        {
          newsCmtId: commentId,
          reportReason: "부적절한 내용",
        },
        authHeader
      );
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("댓글 신고 실패", error);
      alert("신고 처리 중 오류 발생");
    }
  };

  const renderComments = (comments, parentId = null, depth = 0) => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => (
        <div
          key={comment.id}
          style={{ marginLeft: depth * 20, marginTop: "10px" }}
        >
          <S.CommentItem>
            <S.CommentHeader>
              <strong>{comment.memberNick || "익명"}</strong>
              <span>{comment.commentDate?.split("T")[0]}</span>
            </S.CommentHeader>
            <S.CommentBody>
              {editingCommentId === comment.id ? (
                <>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: "80%" }}
                  />
                  <Button
                    size="sm"
                    onClick={handleEditComment}
                    variant="success"
                    style={{ marginLeft: "8px" }}
                  >
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingCommentId(null)}
                    style={{ marginLeft: "5px" }}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <div>{comment.content}</div>
                  <S.CommentActions>
                    {auth?.user?.isAuthenticated && (
                      <>
                        <Button
                          size="sm"
                          variant={
                            comment.hasLiked ? "primary" : "outline-primary"
                          }
                          onClick={() => toggleLike(comment.id)}
                        >
                          👍 {comment.likes || 0}
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            comment.hasHated ? "danger" : "outline-danger"
                          }
                          onClick={() => toggleHate(comment.id)}
                        >
                          👎 {comment.dislikes || 0}
                        </Button>
                        {depth < 1 && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => setReplyTargetId(comment.id)}
                          >
                            답글 달기
                          </Button>
                        )}
                        {(comment.mine || auth.user.role === "ADMIN") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditContent(comment.content);
                              }}
                            >
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              삭제
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => handleReportComment(comment.id)}
                        >
                          🚨 신고
                        </Button>
                      </>
                    )}
                  </S.CommentActions>
                  {auth?.user?.isAuthenticated &&
                    replyTargetId === comment.id && (
                      <div style={{ marginTop: "10px" }}>
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="답글을 입력하세요"
                          style={{ width: "80%", marginRight: "8px" }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(comment.id)}
                          variant="success"
                        >
                          답글 작성
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setReplyTargetId(null)}
                          variant="secondary"
                          style={{ marginLeft: "5px" }}
                        >
                          취소
                        </Button>
                      </div>
                    )}
                </>
              )}
            </S.CommentBody>
          </S.CommentItem>
          {renderComments(comments, comment.id, depth + 1)}
        </div>
      ));
  };

  return (
    <S.CommentSectionContainer>
      {auth?.user?.isAuthenticated && (
        <S.CommentInputWrapper>
          <S.CommentInput
            placeholder="댓글 작성 공간"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <S.CommentButton onClick={handleAddComment}>작성</S.CommentButton>
        </S.CommentInputWrapper>
      )}
      <S.CommentList>{renderComments(comments)}</S.CommentList>
    </S.CommentSectionContainer>
  );
};

export default CommentSection;
