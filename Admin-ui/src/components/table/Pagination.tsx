import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Button from "../ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="flex items-center justify-center gap-2 p-4">
//       {/* Previous Button */}
//       <Button
//         variant="ghost"
//         size="lg"
//         className={cn(
//           currentPage === 1 && "opacity-50 pointer-events-none"
//         )}
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         <BsArrowLeft className="h-4 w-4" />
//       </Button>

//       {/* Page Numbers */}
//       {pages.map((page) => (
//         <Button
//           key={page}
//           variant="ghost"
//           className={cn(
//             currentPage === page
//               ? "bg-white border border-gray-200 shadow-sm font-semibold text-gray-900"
//               : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//           )}
//           onClick={() => onPageChange(page)}
//         >
//           {page}
//         </Button>
//       ))}

//       {/* Next Button */}
//       <Button
//         variant="ghost"
//         size="lg"
//         className={cn(
//           currentPage === totalPages && "opacity-50 pointer-events-none"
//         )}
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         <BsArrowRight className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// }

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const generatePages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      // Show all if small number
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePages()

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {/* Previous */}
      <Button
        variant="ghost"
        size="lg"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <BsArrowLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant="ghost"
            className={cn(
              currentPage === page
                ? "bg-white border border-gray-200 shadow-sm font-semibold text-gray-900"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
            onClick={() => onPageChange(Number(page))}
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="lg"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <BsArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
