import { ChangeEvent, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [title, setTitle] = useState(initialTitle);
  const prevTitleRef = useRef(initialTitle);
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const prevTitle = prevTitleRef.current;
    setTitle(e.target.value);

    const { position, originalContent, content } = findDiff(prevTitle, e.target.value);

    if (originalContent.length === content.length) {
      updateTitle({ position, content: originalContent, event: 'DELETE_TITLE' });
      updateTitle({ position, content, event: 'INSERT_TITLE' });
      prevTitleRef.current = e.target.value;
      return;
    }

    if (originalContent.length > content.length) {
      updateTitle({ position, content: originalContent, event: 'DELETE_TITLE' });
      prevTitleRef.current = e.target.value;
      return;
    }

    updateTitle({ position, content, event: 'INSERT_TITLE' });
    prevTitleRef.current = e.target.value;
  };

  return (
    <textarea
      value={title}
      onChange={handleChange}
      className="flex-1 resize-none bg-transparent focus:outline-none"
      placeholder="Enter task title..."
    />
  );
}

function findDiff(str1: string, str2: string) {
  let startIndex = 0;
  let endIndex1 = 0;
  let endIndex2 = 0;

  // 앞에서부터 같은 부분 찾기
  while (
    startIndex < str1.length &&
    startIndex < str2.length &&
    str1[startIndex] === str2[startIndex]
  ) {
    startIndex += 1;
  }

  // 뒤에서부터 같은 부분 찾기
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
