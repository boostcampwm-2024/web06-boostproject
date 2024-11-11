export type FormState<T> = {
	values: T;
	errors: { [K in keyof T]?: string };
	touched: { [K in keyof T]?: boolean };
	isValid: { [K in keyof T]?: boolean };
	isDirty: { [K in keyof T]?: boolean };
	formIsValid: boolean;
	formIsDirty: boolean;
};

export type ValidationRule = {
	required?: { value: boolean; message?: string };
	minLength?: { value: number; message?: string };
	maxLength?: { value: number; message?: string };
	pattern?: { value: RegExp; message?: string };
	validate?: { value: (value: string) => boolean; message?: string };
};
