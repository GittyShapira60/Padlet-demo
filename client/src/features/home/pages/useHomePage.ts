import { useCallback, useState } from 'react';
import { usePadlets } from '../../padlet/hooks/usePadlets';
import { useAuth } from '../../auth/context/AuthProvider';
import type { Padlet } from '../../padlet/interfaces/padlet';
import type { CopyPadletOptions } from '../../padlet/services/padlet-service';

export function useHomePage() {
  const { user } = useAuth();
  const { boards, hasBoards, isLoading, error, addPadlet, removePadlet, duplicatePadlet } = usePadlets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const username = user?.username ?? 'משתמש';
  const hasSharedBoards = boards.shared.length > 0;
  const showLoading = isLoading;
  const showError = Boolean(error);
  const showEmpty = !isLoading && !error && !hasBoards;
  const showBoards = !isLoading && !error && hasBoards;

  const handleCreatePadlet = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handlePadletCreated = useCallback(
    (padlet: Padlet) => {
      addPadlet(padlet);
    },
    [addPadlet],
  );

  const handleDeletePadlet = useCallback(
    async (padletId: string) => {
      await removePadlet(padletId);
    },
    [removePadlet],
  );

  const handleCopyPadlet = useCallback(
    async (padletId: string, options: CopyPadletOptions) => {
      await duplicatePadlet(padletId, options);
    },
    [duplicatePadlet],
  );

  return {
    username,
    boards,
    error,
    hasSharedBoards,
    showLoading,
    showError,
    showEmpty,
    showBoards,
    isCreateModalOpen,
    handleCreatePadlet,
    handleCloseCreateModal,
    handlePadletCreated,
    handleDeletePadlet,
    handleCopyPadlet,
  };
}