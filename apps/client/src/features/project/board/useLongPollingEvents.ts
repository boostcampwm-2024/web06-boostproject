import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { useToast } from '@/lib/useToast.tsx';
import { TaskEvent } from '@/features/project/board/types.ts';
import { boardAPI } from '@/features/project/board/api.ts';

const MAX_RETRY_COUNT = 5;
const POLLING_INTERVAL = 500;

export const useLongPollingEvents = (projectId: number, onEvent: (event: TaskEvent) => void) => {
  const toast = useToast();

  useEffect(() => {
    const controller = new AbortController();

    let timeoutId: number;
    let isPolling = false;
    let retryCount = 0;
    let canceled = false;

    const pollEvent = async (version: number = Date.now()) => {
      if (isPolling) {
        timeoutId = setTimeout(() => pollEvent(newVersion), POLLING_INTERVAL);
        return;
      }

      let newVersion = version;

      try {
        isPolling = true;
        const events = await boardAPI.getEvent(projectId, version, {
          signal: controller.signal,
        });

        if (events) {
          newVersion = events[events.length - 1].version;

          events.forEach((event) => {
            onEvent(event);
          });

          retryCount = 0;
        }
      } catch (error) {
        retryCount += 1;
        if ((error as AxiosError).status === 404) {
          // 정상 동작
          retryCount = 0;
        }
        if (retryCount >= MAX_RETRY_COUNT) {
          toast.error('Failed to poll event. Please refresh the page.', 5000);
          canceled = true;
          return;
        }
      } finally {
        isPolling = false;
        if (!controller.signal.aborted && !canceled) {
          timeoutId = setTimeout(() => pollEvent(newVersion), POLLING_INTERVAL);
        }
      }
    };

    pollEvent();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [projectId, toast]);
};
