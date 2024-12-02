import { useState, DragEvent } from 'react';

type DropHandler = (sectionId: number, taskId: number) => void;

export const useDragAndDrop = (onDrop?: DropHandler) => {
  const [belowSectionId, setBelowSectionId] = useState<number>(-1);
  const [belowTaskId, setBelowTaskId] = useState<number>(-1);

  const handleDragStart = (e: DragEvent, sectionId: number, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.setData('sectionId', sectionId.toString());
  };

  const handleDragOver = (e: DragEvent, sectionId: number, taskId?: number) => {
    e.preventDefault();
    setBelowSectionId(sectionId);
    setBelowTaskId(taskId ?? -1);
  };

  const handleDragLeave = () => {
    setBelowTaskId(-1);
    setBelowSectionId(-1);
  };

  const handleDrop = (e: DragEvent, sectionId: number) => {
    e.preventDefault();

    const draggedTaskId = Number(e.dataTransfer.getData('taskId'));
    if (!draggedTaskId || Number.isNaN(draggedTaskId) || draggedTaskId === belowTaskId) {
      handleDragEnd();
      return;
    }

    onDrop?.(sectionId, draggedTaskId);

    handleDragEnd();
  };

  const handleDragEnd = () => {
    setBelowTaskId(-1);
    setBelowSectionId(-1);
  };

  return {
    belowSectionId,
    belowTaskId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
