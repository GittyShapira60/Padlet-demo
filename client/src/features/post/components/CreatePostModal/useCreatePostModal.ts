import { useCallback, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../../shared/constants/background-colors';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../enums/post-content-tab';
import type { Post } from '../../interfaces/post';
import { createPost, updatePost } from '../../services/post-service';
import { getInitialTextContent, inferContentTab } from '../../utils/post-form-utils';

interface UseCreatePostModalOptions {
  padletId: string;
  postToEdit?: Post | null;
  onClose: () => void;
  onSubmit?: (post: Post) => void;
}

export const MAX_POLL_ANSWERS = 4;
export const MIN_POLL_ANSWERS = 2;
const INITIAL_POLL_ANSWERS: string[] = ['', ''];

function getInitialState(postToEdit?: Post | null) {
  if (!postToEdit) {
    return {
      activeTab: PostContentTabValues.Text,
      textContent: '',
      selectedColor: BACKGROUND_COLORS[0],
      pollAnswers: [...INITIAL_POLL_ANSWERS],
    };
  }
  const activeTab = inferContentTab(postToEdit);
  const pollAnswers =
    activeTab === PostContentTabValues.Poll && postToEdit.poll
      ? postToEdit.poll.options.map((o) => o.label)
      : [...INITIAL_POLL_ANSWERS];
  return {
    activeTab,
    textContent: getInitialTextContent(postToEdit, activeTab),
    selectedColor: postToEdit.color ?? BACKGROUND_COLORS[0],
    pollAnswers,
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

  const [activeTab, setActiveTab] = useState<PostContentTab>(initialState.activeTab);
  const [textContent, setTextContent] = useState(initialState.textContent);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(initialState.selectedColor);
  const [pollAnswers, setPollAnswers] = useState<string[]>(initialState.pollAnswers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = useCallback((tab: PostContentTab) => {
    setActiveTab(tab);
    setTextContent('');
    setSelectedFile(null);
    setPollAnswers([...INITIAL_POLL_ANSWERS]);
  }, []);

  const updatePollAnswer = useCallback((index: number, value: string) => {
    setPollAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }, []);

  const addPollAnswer = useCallback(() => {
    setPollAnswers((prev) => prev.length < MAX_POLL_ANSWERS ? [...prev, ''] : prev);
  }, []);

  const removePollAnswer = useCallback((index: number) => {
    setPollAnswers((prev) => prev.length > MIN_POLL_ANSWERS ? prev.filter((_, i) => i !== index) : prev);
  }, []);

  const hasImageContent =
    selectedFile !== null ||
    (isEditMode && activeTab === PostContentTabValues.Image && Boolean(postToEdit?.subject));

  const hasEnoughPollAnswers =
    pollAnswers.filter((a) => a.trim().length > 0).length >= MIN_POLL_ANSWERS;

  const canSubmit =
    (activeTab === PostContentTabValues.Text && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Image && hasImageContent) ||
    (activeTab === PostContentTabValues.Link && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Poll && textContent.trim().length > 0 && hasEnoughPollAnswers);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setError('');
    const input = {
      color: selectedColor,
      contentTab: activeTab,
      content: activeTab === PostContentTabValues.Image ? undefined : textContent.trim(),
      imageFileName:
        activeTab === PostContentTabValues.Image
          ? selectedFile?.name ?? postToEdit?.subject ?? undefined
          : undefined,
      pollAnswers:
        activeTab === PostContentTabValues.Poll
          ? pollAnswers.filter((a) => a.trim().length > 0)
          : undefined,
    };
    try {
      const post = isEditMode
        ? await updatePost(padletId, postToEdit.id, input)
        : await createPost(padletId, input);
      onSubmit?.(post);
      setActiveTab(PostContentTabValues.Text);
      setTextContent('');
      setSelectedFile(null);
      setSelectedColor(BACKGROUND_COLORS[0]);
      setPollAnswers([...INITIAL_POLL_ANSWERS]);
      onClose();
    } catch {
      setError(isEditMode ? 'עדכון הפוסט נכשל, נסי שוב' : 'יצירת הפוסט נכשלה, נסי שוב');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, canSubmit, isEditMode, isLoading, onClose, onSubmit, padletId, pollAnswers, postToEdit, selectedColor, selectedFile, textContent]);

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
    pollAnswers,
    updatePollAnswer,
    addPollAnswer,
    removePollAnswer,
    isLoading,
    error,
    canSubmit,
    handleSubmit,
  };
}