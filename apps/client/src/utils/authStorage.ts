export const getStoredUser = () => {
	return localStorage.getItem('user');
};

export const setStoredUser = (user: string | null) => {
	if (user) {
		localStorage.setItem('user', user);
	} else {
		localStorage.removeItem('user');
	}
};
