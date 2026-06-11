import { useCallback, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../constants/background-colors';
import { PadletBoardType } from '../../../enums/padlet-board-type';
import type { PadletBoardType as PadletBoardTypeValue } from '../../../enums/padlet-board-type';
import type { Padlet } from '../../../interfaces/padlet';
import { createPadlet } from '../../../services/padlet-service';
import type { BackgroundTab } from '../../shared/BackgroundPicker/BackgroundPicker';

interface UseCreatePadletModalOptions {
  onClose: () => void;
  onSubmit?: (padlet: Padlet) => void;
}

export function useCreatePadletModal({
  onClose,
  onSubmit,
}: UseCreatePadletModalOptions) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bgTab, setBgTab] = useState<BackgroundTab>('colors');
  const [selectedColor, setSelectedColor] = useState<string>(
    BACKGROUND_COLORS[0],
  );
  const [boardType, setBoardType] = useState<PadletBoardTypeValue>(
    PadletBoardType.FreeWall,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const padlet = await createPadlet({
        title: title.trim(),
        description: description.trim() || undefined,
        background: selectedColor,
        boardType,
      });

      onSubmit?.(padlet);
      onClose();
    } catch {
      setError('יצירת הלוח נכשלה, נסי שוב');
    } finally {
      setIsLoading(false);
    }
  }, [
    boardType,
    description,
    isLoading,
    onClose,
    onSubmit,
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
