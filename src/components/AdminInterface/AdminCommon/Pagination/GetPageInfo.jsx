import Pagination from "react-js-pagination";

const GetPageInfo = ({ currentPage, setCurrentPage, pageInfo }) => {
  const { boardNoPerPage, totalBoardNo, pageSize } = pageInfo;
  return (
    <div>
      <Pagination
        activePage={currentPage}
        itemsCountPerPage={boardNoPerPage}
        totalItemsCount={totalBoardNo}
        pageRangeDisplayed={pageSize}
        prevPageText={"<"}
        nextPageText={">"}
        onChange={(currentPage) => setCurrentPage(currentPage)}
      />
    </div>
  );
};
export default GetPageInfo;
