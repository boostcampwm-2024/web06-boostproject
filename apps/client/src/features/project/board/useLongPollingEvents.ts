import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { useToast } from '@/lib/useToast.tsx';
import { TaskEvent } from '@/features/project/board/types.ts';
import { boardAPI } from '@/features/project/board/api.ts';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';

const MAX_RETRY_COUNT = 5;
const POLLING_INTERVAL = 500;

export const useLongPollingEvents = (projectId: number, onEvent: (event: TaskEvent) => void) => {
  const toast = useToast();

  const { version, setVersion } = useBoardStore();

  useEffect(() => {
    const controller = new AbortController();

    let timeoutId: number;
    let isPolling = false;
    let retryCount = 0;

    const pollEvent = async () => {
      if (isPolling) {
        timeoutId = setTimeout(pollEvent, POLLING_INTERVAL);
        return;
      }

      try {
        isPolling = true;
        const events = await boardAPI.getEvent(projectId, version === 0 ? Date.now() : version, {
          signal: controller.signal,
        });

        if (events) {
          const lastEventVersion = events[events.length - 1].version;
          setVersion(lastEventVersion);

          events.forEach((event) => {
            onEvent(event);
          });

          retryCount = 0;
        }
      } catch (error) {
        retryCount += 1;
        if ((error as AxiosError).status === 404) {
          retryCount = 0;
        }
        if (retryCount >= MAX_RETRY_COUNT) {
          toast.error('Failed to poll event. Please refresh the page.', 5000);
          return;
        }
      } finally {
        isPolling = false;
        if (!controller.signal.aborted) {
          timeoutId = setTimeout(pollEvent, POLLING_INTERVAL);
        }
      }
    };

    pollEvent();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [projectId, onEvent, toast]);
};
