"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function CustomPagination({ currentPage, totalPages, onPageChange, pageSize, totalEntries}) {
  const maxPagesToShow = 5; // Number of page links to display directly
  const pages = [];

  if (totalPages <= maxPagesToShow) {
    // If total pages are few, show all
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first page
    pages.push(1);

    // Determine start and end for the middle block
    let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

    
    if (endPage - startPage + 1 < maxPagesToShow - 2) {
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + (maxPagesToShow - 3) - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - (maxPagesToShow - 3) + 1);
      }
    }    
    if (startPage > 2) {
      pages.push("ellipsis");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed after middle block
    if (endPage < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Show last page
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <div className="w-2/4 text-sm text-zinc-700">Showing {(currentPage - 1) * pageSize + 1} to{" "} {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries</div>
      <Pagination className={'mx-0 justify-end'}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (<PaginationEllipsis />) : (<PaginationLink href="#" isActive={currentPage === page} onClick={() => onPageChange(page)}>{page}</PaginationLink>)}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
