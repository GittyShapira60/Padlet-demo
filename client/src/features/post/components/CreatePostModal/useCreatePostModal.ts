import { useCallback, useRef, useState } from 'react';
import { BACKGROUND_COLORS } from '../../../../shared/constants/background-colors';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../enums/post-content-tab';
import type { Post } from '../../interfaces/post';
import { createPost, updatePost } from '../../services/post-service';
import { getInitialDescription, getInitialTextContent, inferContentTab } from '../../utils/post-form-utils';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UseCreatePostModalOptions {
  padletId: string;
  postToEdit?: Post | null;
  visitId?: string | null;
  onClose: () => void;
  onSubmit?: (post: Post) => void;
}

export const MAX_POLL_ANSWERS = 4;
export const MIN_POLL_ANSWERS = 2;
export type PollAnswer = { id: number; value: string };
const INITIAL_POLL_ANSWERS: PollAnswer[] = [
  { id: 1, value: '' },
  { id: 2, value: '' },
];

function getInitialState(postToEdit?: Post | null) {
  if (!postToEdit) {
    return {
      activeTab: PostContentTabValues.Text,
      textContent: '',
      description: '',
      selectedColor: BACKGROUND_COLORS[0],
      pollAnswers: [...INITIAL_POLL_ANSWERS],
    };
  }
  const activeTab = inferContentTab(postToEdit);
  const pollAnswers =
    activeTab === PostContentTabValues.Poll && postToEdit.poll
      ? postToEdit.poll.options.map((o, i) => ({ id: i + 1, value: o.label }))
      : [...INITIAL_POLL_ANSWERS];
  return {
    activeTab,
    textContent: getInitialTextContent(postToEdit, activeTab),
    description: getInitialDescription(postToEdit),
    selectedColor: postToEdit.color ?? BACKGROUND_COLORS[0],
    pollAnswers,
  };
}

export function useCreatePostModal({
  padletId,
  postToEdit,
  visitId,
  onClose,
  onSubmit,
}: UseCreatePostModalOptions) {
  const initialState = getInitialState(postToEdit);
  const isEditMode = postToEdit != null;

  const [activeTab, setActiveTab] = useState<PostContentTab>(initialState.activeTab);
  const [textContent, setTextContent] = useState(initialState.textContent);
  const [description, setDescription] = useState(initialState.description);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(initialState.selectedColor);
  const [pollAnswers, setPollAnswers] = useState<PollAnswer[]>(initialState.pollAnswers);
  const nextIdRef = useRef(initialState.pollAnswers.length + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = useCallback((tab: PostContentTab) => {
    setActiveTab(tab);
    setTextContent('');
    setDescription('');
    setSelectedFile(null);
    setPollAnswers([...INITIAL_POLL_ANSWERS]);
    nextIdRef.current = INITIAL_POLL_ANSWERS.length + 1;
  }, []);

  const updatePollAnswer = useCallback((id: number, value: string) => {
    setPollAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, value } : a)));
  }, []);

  const addPollAnswer = useCallback(() => {
    setPollAnswers((prev) => {
      if (prev.length >= MAX_POLL_ANSWERS) return prev;
      const id = nextIdRef.current++;
      return [...prev, { id, value: '' }];
    });
  }, []);

  const removePollAnswer = useCallback((id: number) => {
    setPollAnswers((prev) =>
      prev.length > MIN_POLL_ANSWERS ? prev.filter((a) => a.id !== id) : prev,
    );
  }, []);

  const hasImageContent =
    selectedFile !== null ||
    (isEditMode && activeTab === PostContentTabValues.Image && Boolean(postToEdit?.imageUrl));

  const hasEnoughPollAnswers =
    pollAnswers.filter((a) => a.value.trim().length > 0).length >= MIN_POLL_ANSWERS;

  const canSubmit =
    (activeTab === PostContentTabValues.Text && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Image && hasImageContent) ||
    (activeTab === PostContentTabValues.Link && textContent.trim().length > 0) ||
    (activeTab === PostContentTabValues.Poll && textContent.trim().length > 0 && hasEnoughPollAnswers);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setError('');

    let imageData: string | undefined;
    if (activeTab === PostContentTabValues.Image && selectedFile) {
      if (selectedFile.size > 5_000_000) {
        setError('Image must be under 5 MB');
        setIsLoading(false);
        return;
      }
      imageData = await fileToBase64(selectedFile);
    }

    const includesDescription = activeTab === PostContentTabValues.Image || activeTab === PostContentTabValues.Link;

    const input = {
      color: selectedColor,
      contentTab: activeTab,
      content: activeTab === PostContentTabValues.Image ? undefined : textContent.trim(),
      imageFileName:
        activeTab === PostContentTabValues.Image
          ? selectedFile?.name ?? postToEdit?.subject ?? undefined
          : undefined,
      imageData,
      description: includesDescription ? description.trim() || undefined : undefined,
      pollAnswers:
        activeTab === PostContentTabValues.Poll
          ? pollAnswers.filter((a) => a.value.trim().length > 0).map((a) => a.value)
          : undefined,
    };
    try {
      const post = isEditMode
        ? await updatePost(padletId, postToEdit.id, input)
        : await createPost(padletId, input, visitId);
      onSubmit?.(post);
      setActiveTab(PostContentTabValues.Text);
      setTextContent('');
      setDescription('');
      setSelectedFile(null);
      setSelectedColor(BACKGROUND_COLORS[0]);
      setPollAnswers([...INITIAL_POLL_ANSWERS]);
      nextIdRef.current = INITIAL_POLL_ANSWERS.length + 1;
      onClose();
    } catch {
      setError(isEditMode ? 'עדכון הפוסט נכשל, נסי שוב' : 'יצירת הפוסט נכשלה, נסי שוב');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, canSubmit, description, isEditMode, isLoading, onClose, onSubmit, padletId, pollAnswers, postToEdit, selectedColor, selectedFile, textContent, visitId]);

  return {
    isEditMode,
    activeTab,
    handleTabChange,
    textContent,
    setTextContent,
    description,
    setDescription,
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
