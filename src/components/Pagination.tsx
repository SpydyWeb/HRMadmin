import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Button from "./ui/button";
import { cn } from "@/lib/utils";


interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="lg"
        className={cn(
          currentPage === 1 && "opacity-50 pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <BsArrowLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <Button
          key={page}
          variant="ghost"
          className={cn(
            currentPage === page
              ? "bg-white border border-gray-200 shadow-sm font-semibold text-gray-900"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {/* Next Button */}
      <Button
        variant="ghost"
        size="lg"
        className={cn(
          currentPage === totalPages && "opacity-50 pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <BsArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
