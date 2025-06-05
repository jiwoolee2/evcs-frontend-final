import { useEffect } from "react";
import axios from "axios";
const SelectBoard = ({ currentPage, setBoards, apiUrl, setHasMore }) => {
  useEffect(() => {
    axios
      .get(`${apiUrl}/driveRouteBoard/${currentPage}`)
      .then((result) => {
        const { drBoard } = result.data;
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

  return;
  <></>;
};
export default SelectBoard;
