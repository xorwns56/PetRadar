import { useState } from "react";
import "../style/Pagination.css";
const Pagination = ({ totalItems, itemSize, pageSize = 10, onClick }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemSize);
  //const totalPageBlocks = Math.ceil(totalPages / pageSize);
  const currPageBlock = Math.floor((page - 1) / pageSize) + 1;
  const blockEnd = currPageBlock * pageSize;
  const blockStart = blockEnd - pageSize + 1;
  const pageArr = [];
  for (let page = blockStart; page <= blockEnd; page++) {
    pageArr.push(page);
  }
  const handlePageChange = (newPage) => {
    const safeNewPage = Math.min(totalPages, Math.max(1, newPage));
    setPage(safeNewPage);
    onClick(safeNewPage);
  };
  return (
    totalPages > 1 && (
      <div className="Pagination">
        {blockStart > 1 && (
          <span
            className="nav"
            onClick={() => handlePageChange(blockStart - 1)}
          >
            {"<"}
          </span>
        )}
        {pageArr.map((item) => {
          return (
            <span
              key={item}
              className={`page ${item <= totalPages ? "" : "hide"} ${
                item === page ? "active" : ""
              }`}
              onClick={() => item <= totalPages && handlePageChange(item)}
            >
              {item}
            </span>
          );
        })}
        {blockEnd < totalPages && (
          <span className="nav" onClick={() => handlePageChange(blockEnd + 1)}>
            {">"}
          </span>
        )}
      </div>
    )
  );
};
export default Pagination;
