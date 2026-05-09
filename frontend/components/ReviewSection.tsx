import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useReviews } from '../lib/useReviews';
import { StarRating } from './StarRating';
import { Button } from './ui/Button';
import Link from 'next/link';

interface ReviewSectionProps {
  eventId: number;
  eventDate: string;
  organizerId?: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  eventId,
  eventDate,
  organizerId,
}) => {
  const { user, token } = useAuth();
  const {
    stats,
    reviews,
    loading,
    error,
    hasMore,
    loadMore,
    createReview,
    updateReview,
    deleteReview,
  } = useReviews(eventId, token);

  const [selectedRating, setSelectedRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPastEvent = eventDate ? new Date(eventDate) < new Date() : false;
  const isOrganizer = user ? user.id === organizerId : false;
  const hasUserReview = !!stats?.userReview;
  const userReview = stats?.userReview;

  const handleCreate = async () => {
    if (selectedRating === 0) return;
    setIsSubmitting(true);
    setLocalError(null);
    const success = await createReview(eventId, selectedRating);
    setIsSubmitting(false);
    if (success) {
      setSelectedRating(0);
    }
  };

  const handleUpdate = async () => {
    if (!userReview || selectedRating === 0) return;
    setIsSubmitting(true);
    setLocalError(null);
    const success = await updateReview(userReview.id, selectedRating);
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
      setSelectedRating(0);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;
    setIsSubmitting(true);
    setLocalError(null);
    const success = await deleteReview(userReview.id);
    setIsSubmitting(false);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  const handleStartEdit = () => {
    if (!userReview) return;
    setIsEditing(true);
    setSelectedRating(userReview.rating);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRating(0);
    setLocalError(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderDistribution = () => {
    if (!stats || stats.reviewCount === 0) return null;

    const maxCount = Math.max(
      ...Object.values(stats.distribution).map(Number),
      1
    );

    return (
      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[String(star)] || 0;
          const percentage = stats.reviewCount > 0
            ? (count / stats.reviewCount) * 100
            : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right text-gray-600 dark:text-gray-400 font-medium">
                {star}
              </span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-500 dark:text-gray-400 text-xs">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-3">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const reviewCount = stats?.reviewCount ?? 0;
  const averageRating = stats?.averageRating ?? 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Valoraciones ({reviewCount})
        </h2>
      </div>

      {/* Estadísticas de puntuación */}
      {reviewCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {averageRating.toFixed(1)}
            </span>
            <StarRating
              rating={Math.round(averageRating)}
              readOnly
              size="sm"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reviewCount} {reviewCount === 1 ? 'valoración' : 'valoraciones'}
            </span>
          </div>
          <div className="md:col-span-2">
            {renderDistribution()}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <p className="text-gray-500 dark:text-gray-400">Sé el primero en valorar este evento</p>
        </div>
      )}

      {/* Sección de acción del usuario */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {!user ? (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Inicia sesión para valorar este evento
            </p>
            <Link href="/login">
              <Button size="sm">Iniciar Sesión</Button>
            </Link>
          </div>
        ) : !isPastEvent ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Las valoraciones estarán disponibles cuando finalice el evento
          </p>
        ) : isOrganizer ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No puedes valorar tu propio evento
          </p>
        ) : isEditing ? (
          /* Modo edición */
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Tu valoración:</p>
            <div className="flex items-center gap-3">
              <StarRating
                rating={selectedRating}
                onChange={setSelectedRating}
                size="lg"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRating > 0 ? `${selectedRating}/5` : 'Selecciona'}
              </span>
            </div>
            {(localError || error) && (
              <p className="text-red-600 text-sm mt-2">{localError || error}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleUpdate}
                isLoading={isSubmitting}
                disabled={selectedRating === 0 || isSubmitting}
              >
                Guardar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : hasUserReview && userReview ? (
          /* Usuario con reseña existente */
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu valoración:
            </p>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <StarRating
                  rating={userReview.rating}
                  readOnly
                  size="md"
                  showValue
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(userReview.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartEdit}
                >
                  Modificar
                </Button>
                {!showDeleteConfirm ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Eliminar
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">¿Seguro?</span>
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Sí, eliminar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {(localError || error) && (
              <p className="text-red-600 text-sm mt-2">{localError || error}</p>
            )}
          </div>
        ) : (
          /* Usuario sin reseña - selector de estrellas */
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Valora este evento:</p>
            <div className="flex items-center gap-3">
              <StarRating
                rating={selectedRating}
                onChange={setSelectedRating}
                size="lg"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRating > 0 ? `${selectedRating}/5` : 'Selecciona'}
              </span>
            </div>
            {(localError || error) && (
              <p className="text-red-600 text-sm mt-2">{localError || error}</p>
            )}
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleCreate}
                isLoading={isSubmitting}
                disabled={selectedRating === 0 || isSubmitting}
              >
                Enviar Valoración
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Listado de reseñas */}
      {reviews.length > 0 && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Todas las valoraciones
          </h3>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {review.user.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readOnly size="sm" />
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                isLoading={loading}
                disabled={loading}
              >
                Cargar más valoraciones
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
