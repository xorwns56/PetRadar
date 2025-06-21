import "../style/Pagination.css";
const Pagination = ({
  onClick,
  totalItems = 0,
  currentPage = 1,
  itemSize = 5,
  pageSize = 5,
}) => {
  const totalPages = Math.ceil(totalItems / itemSize);
  currentPage = Math.min(totalPages, Math.max(1, currentPage));
  //const totalPageBlocks = Math.ceil(totalPages / pageSize);
  const currPageBlock = Math.floor((currentPage - 1) / pageSize) + 1;
  const blockEnd = currPageBlock * pageSize;
  const blockStart = blockEnd - pageSize + 1;
  const pageArr = [];
  for (let page = blockStart; page <= blockEnd; page++) {
    pageArr.push(page);
  }
  return (
    totalPages > 0 && (
      <div className="Pagination">
        <span
          className={blockStart > 1 ? "" : "hide"}
          onClick={() => onClick(blockStart - 1)}
        >
          ◀
        </span>
        {pageArr.map((item) => {
          return (
            <span
              className={item > totalPages ? "hide" : ""}
              onClick={() => onClick(item)}
            >
              {item}
            </span>
          );
        })}
        <span
          className={blockEnd < totalPages ? "" : "hide"}
          onClick={() => onClick(blockEnd + 1)}
        >
          ▶
        </span>
      </div>
    )
  );
};
export default Pagination;
