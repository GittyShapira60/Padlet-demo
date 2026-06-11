import { useCallback, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../constants/background-colors';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import type { Post } from '../../../interfaces/post';
import { createPost } from '../../../services/post-service';

interface UseCreatePostModalOptions {
  padletId: string;
  authorUsername: string;
  onClose: () => void;
  onSubmit?: (post: Post) => void;
}

function resetFormState(
  setActiveTab: (tab: PostContentTab) => void,
  setTextContent: (value: string) => void,
  setSelectedFile: (file: File | null) => void,
  setSelectedColor: (color: string) => void,
) {
  setActiveTab(PostContentTabValues.Text);
  setTextContent('');
  setSelectedFile(null);
  setSelectedColor(BACKGROUND_COLORS[0]);
}

export function useCreatePostModal({
  padletId,
  authorUsername,
  onClose,
  onSubmit,
}: UseCreatePostModalOptions) {
  const [activeTab, setActiveTab] = useState<PostContentTab>(
    PostContentTabValues.Text,
  );
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(BACKGROUND_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = useCallback((tab: PostContentTab) => {
    setActiveTab(tab);
    setTextContent('');
    setSelectedFile(null);
  }, []);

  const canSubmit =
    (activeTab === PostContentTabValues.Text && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Image && selectedFile !== null) ||
    (activeTab === PostContentTabValues.Link && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Poll && textContent.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const post = await createPost(
        padletId,
        {
          color: selectedColor,
          contentTab: activeTab,
          content:
            activeTab === PostContentTabValues.Image
              ? undefined
              : textContent.trim(),
          imageFileName: selectedFile?.name,
        },
        authorUsername,
      );

      onSubmit?.(post);
      resetFormState(setActiveTab, setTextContent, setSelectedFile, setSelectedColor);
      onClose();
    } catch {
      setError('יצירת הפוסט נכשלה, נסי שוב');
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    authorUsername,
    canSubmit,
    isLoading,
    onClose,
    onSubmit,
    padletId,
    selectedColor,
    selectedFile,
    textContent,
  ]);

  return {
    activeTab,
    handleTabChange,
    textContent,
    setTextContent,
    selectedFile,
    setSelectedFile,
    selectedColor,
    setSelectedColor,
    isLoading,
    error,
    canSubmit,
    handleSubmit,
  };
}
