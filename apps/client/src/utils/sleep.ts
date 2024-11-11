// fetch 상황을 가정하기 위한 함수
/* eslint-disable no-promise-executor-return */
export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
/* eslint-disable no-promise-executor-return */
