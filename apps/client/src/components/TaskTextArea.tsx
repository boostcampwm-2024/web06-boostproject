import { ChangeEvent, CompositionEvent, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from '@tanstack/react-router';
import { useAuth } from '@/contexts/authContext.tsx';

type TextDiff = {
  position: number;
  content: string;
  event: 'INSERT_TITLE' | 'DELETE_TITLE';
};

export default function TaskTextArea({
  taskId,
  initialTitle,
}: {
  taskId: number;
  initialTitle: string;
}) {
  const [localTitle, setLocalTitle] = useState(initialTitle);
  const [isComposing, setIsComposing] = useState(false);
  const prevTitleRef = useRef(initialTitle);
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();

  useEffect(() => {
    if (initialTitle !== prevTitleRef.current) {
      setLocalTitle(initialTitle);
      prevTitleRef.current = initialTitle;
    }
  }, [initialTitle]);

  const { mutate: updateTitle } = useMutation({
    mutationFn: async ({ position, content, event }: TextDiff) => {
      const payload = {
        event,
        taskId,
        title: {
          position,
          content,
          length: content.length,
        },
      };

      return axios.post(`/api/project/${projectId}/update`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
  });

  const handleTitleUpdate = (prevTitle: string, newTitle: string) => {
    const { position, originalContent, content } = findDiff(prevTitle, newTitle);

    if (originalContent.length === content.length) {
      updateTitle({ position, content: originalContent, event: 'DELETE_TITLE' });
      updateTitle({ position, content, event: 'INSERT_TITLE' });
      return;
    }

    if (originalContent.length > content.length) {
      updateTitle({ position, content: originalContent, event: 'DELETE_TITLE' });
      return;
    }

    updateTitle({ position, content, event: 'INSERT_TITLE' });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);

    if (!isComposing) {
      handleTitleUpdate(prevTitleRef.current, newTitle);
      prevTitleRef.current = newTitle;
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    const currentValue = e.currentTarget.value;
    handleTitleUpdate(prevTitleRef.current, currentValue);
    prevTitleRef.current = currentValue;
  };

  return (
    <textarea
      value={localTitle}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      className="flex-1 resize-none bg-transparent focus:outline-none"
      placeholder="Enter task title..."
    />
  );
}

function findDiff(str1: string, str2: string) {
  let startIndex = 0;
  let endIndex1 = 0;
  let endIndex2 = 0;

  while (
    startIndex < str1.length &&
    startIndex < str2.length &&
    str1[startIndex] === str2[startIndex]
  ) {
    startIndex += 1;
  }

  let backIndex1 = str1.length - 1;
  let backIndex2 = str2.length - 1;

  while (
    backIndex1 >= startIndex &&
    backIndex2 >= startIndex &&
    str1[backIndex1] === str2[backIndex2]
  ) {
    backIndex1 -= 1;
    backIndex2 -= 1;
  }

  endIndex1 = backIndex1 + 1;
  endIndex2 = backIndex2 + 1;

  return {
    position: startIndex,
    originalContent: str1.substring(startIndex, endIndex1),
    content: str2.substring(startIndex, endIndex2),
    length: str2.substring(startIndex, endIndex2).length,
  };
}
