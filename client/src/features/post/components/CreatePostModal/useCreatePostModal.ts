import { useCallback, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../../shared/constants/background-colors';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../enums/post-content-tab';
import type { Post } from '../../interfaces/post';
import { createPost, updatePost } from '../../services/post-service';
import {
  getInitialTextContent,
  inferContentTab,
} from '../../utils/post-form-utils';

interface UseCreatePostModalOptions {
  padletId: string;
  postToEdit?: Post | null;
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

function getInitialState(postToEdit?: Post | null) {
  if (!postToEdit) {
    return {
      activeTab: PostContentTabValues.Text,
      textContent: '',
      selectedColor: BACKGROUND_COLORS[0],
    };
  }

  const activeTab = inferContentTab(postToEdit);

  return {
    activeTab,
    textContent: getInitialTextContent(postToEdit, activeTab),
    selectedColor: postToEdit.color ?? BACKGROUND_COLORS[0],
  };
}

export function useCreatePostModal({
  padletId,
  postToEdit,
  onClose,
  onSubmit,
}: UseCreatePostModalOptions) {
  const initialState = getInitialState(postToEdit);
  const isEditMode = postToEdit != null;

  const [activeTab, setActiveTab] = useState<PostContentTab>(
    initialState.activeTab,
  );
  const [textContent, setTextContent] = useState(initialState.textContent);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    initialState.selectedColor,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = useCallback((tab: PostContentTab) => {
    setActiveTab(tab);
    setTextContent('');
    setSelectedFile(null);
  }, []);

  const hasImageContent =
    selectedFile !== null ||
    (isEditMode &&
      activeTab === PostContentTabValues.Image &&
      Boolean(postToEdit?.subject));

  const canSubmit =
    (activeTab === PostContentTabValues.Text && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Image && hasImageContent) ||
    (activeTab === PostContentTabValues.Link && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Poll && textContent.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    const input = {
      color: selectedColor,
      contentTab: activeTab,
      content:
        activeTab === PostContentTabValues.Image
          ? undefined
          : textContent.trim(),
      imageFileName:
        activeTab === PostContentTabValues.Image
          ? selectedFile?.name ?? postToEdit?.subject ?? undefined
          : undefined,
    };

    try {
      const post = isEditMode
        ? await updatePost(padletId, postToEdit.id, input)
        : await createPost(padletId, input);

      onSubmit?.(post);
      resetFormState(setActiveTab, setTextContent, setSelectedFile, setSelectedColor);
      onClose();
    } catch {
      setError(
        isEditMode ? 'עדכון הפוסט נכשל, נסי שוב' : 'יצירת הפוסט נכשלה, נסי שוב',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    canSubmit,
    isEditMode,
    isLoading,
    onClose,
    onSubmit,
    padletId,
    postToEdit,
    selectedColor,
    selectedFile,
    textContent,
  ]);

  return {
    isEditMode,
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
