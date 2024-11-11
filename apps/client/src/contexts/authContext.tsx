import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getStoredUser, setStoredUser } from '@/utils/authStorage';
import { sleep } from '@/utils/sleep';

export interface AuthContext {
	isAuthenticated: boolean;
	login: (username: string) => Promise<void>;
	logout: () => Promise<void>;
	user: string | null;
}

const AuthContext = createContext<AuthContext | null>(null);

/* eslint-disable react/jsx-no-constructed-context-values */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<string | null>(getStoredUser());
	const isAuthenticated = !!user;

	const login = useCallback(async (username: string) => {
		// TODO: 로그인 API 호출
		await sleep(100);
		setStoredUser(username);
		setUser(username);
	}, []);

	const logout = useCallback(async () => {
		// TODO: 로그아웃 API 호출
		await sleep(100);
		setStoredUser(null);
		setUser(null);
	}, []);

	useEffect(() => {
		setUser(getStoredUser());
	}, []);

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
/* eslint-disable react/jsx-no-constructed-context-values */

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
}
