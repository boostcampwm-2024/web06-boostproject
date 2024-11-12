import axios from 'axios';

const { VITE_API_SERVER_URL } = import.meta.env;

const api = axios.create({
	baseURL: VITE_API_SERVER_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config) => {
		const newConfig = { ...config };

		const accessToken = ''; // accessToken 은 store 에서 가져오기
		if (accessToken) {
			newConfig.headers.Authorization = `Bearer ${accessToken}`;
		}

		const refreshToken = localStorage.getItem('refreshToken');
		if (refreshToken) {
			newConfig.headers['x-refresh-token'] = refreshToken;
		}

		return newConfig;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
