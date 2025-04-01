"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function Pagination({
                             currentPage,
                             totalPages,
                             itemsPerPage,
                             totalItems,
                             onPageChange,
                             onItemsPerPageChange,
                             itemsPerPageOptions = [5, 10, 15, 20, 50],
                             className
                           }: PaginationProps) {
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    onItemsPerPageChange(newItemsPerPage);
  };

  // If no items or only one page, don't show pagination
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0", className)}>
      {/* Items per page selector */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Afficher</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span>par page</span>
      </div>

      {/* Page buttons */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          // Calculate page numbers to show centered around current page
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          // Only render if pageNum is valid
          if (pageNum > 0 && pageNum <= totalPages) {
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
                className={`h-8 w-8 p-0 ${
                  currentPage === pageNum
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                }`}
              >
                {pageNum}
              </Button>
            );
          }
          return null;
        })}

        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page indicator */}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
}