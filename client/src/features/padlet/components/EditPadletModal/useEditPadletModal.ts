
import { useCallback, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../../shared/constants/background-colors';
import type { BackgroundTab } from '../../../../shared/components/BackgroundPicker/BackgroundPicker';
import type { Padlet } from '../../interfaces/padlet';
import { updatePadlet } from '../../services/padlet-service';

interface UseEditPadletModalOptions {
  padlet: Padlet;
  onClose: () => void;
  onSubmit?: (padlet: Padlet) => void;
}

export function useEditPadletModal({
  padlet,
  onClose,
  onSubmit,
}: UseEditPadletModalOptions) {
  const [title, setTitle] = useState(padlet.title);
  const [description, setDescription] = useState(padlet.description ?? '');
  const [bgTab, setBgTab] = useState<BackgroundTab>('colors');
  const [selectedColor, setSelectedColor] = useState<string>(
    padlet.background ?? BACKGROUND_COLORS[0],
  );
  const [boardType, setBoardType] = useState(padlet.boardType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updated = await updatePadlet(padlet.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        background: selectedColor,
        boardType,
      });

      onSubmit?.(updated);
      onClose();
    } catch {
      setError('עדכון הלוח נכשל, נסי שוב');
    } finally {
      setIsLoading(false);
    }
  }, [
    boardType,
    description,
    isLoading,
    onClose,
    onSubmit,
    padlet.id,
    selectedColor,
    title,
  ]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    bgTab,
    setBgTab,
    selectedColor,
    setSelectedColor,
    boardType,
    setBoardType,
    isLoading,
    error,
    handleSubmit,
  };
}