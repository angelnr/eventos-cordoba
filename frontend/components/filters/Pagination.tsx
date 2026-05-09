import React from 'react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({
  page,
  pages,
  total,
  limit,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (pages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {startItem}-{endItem} de {total} eventos
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginación">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-sm border rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          Anterior
        </button>

        {getPageNumbers(page, pages).map((item, i) =>
          typeof item === 'string' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-500">...</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                item === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
              aria-label={`Página ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 text-sm border rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
}
