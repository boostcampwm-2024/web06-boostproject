import { useState, useCallback, useEffect } from 'react';
import type { ValidationRule, FormState, useFormReturnType } from './useForm.types';

export function useForm<T extends { [key: string]: string }>(
	initialValues: T,
	validationRules: { [K in keyof T]?: ValidationRule } = {}
): useFormReturnType<T> {
	const [formState, setFormState] = useState<FormState<T>>({
		values: initialValues,
		errors: {},
		touched: {},
		isValid: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
		isDirty: {},
		formIsValid: true,
		formIsDirty: false,
	});

	const validateField = useCallback(
		(name: keyof T, value: string): string => {
			const rules = validationRules[name];
			if (!rules) return '';

			const { required, minLength, maxLength, pattern, validate } = rules;

			if (required?.value && !value) {
				return required.message || '필수 입력 항목입니다';
			}

			if (minLength && value.length < minLength.value) {
				return minLength.message || `최소 ${minLength.value}자 이상 입력해주세요`;
			}

			if (maxLength && value.length > maxLength.value) {
				return maxLength.message || `최대 ${maxLength.value}자까지 입력 가능합니다`;
			}

			if (pattern && !pattern.value.test(value)) {
				return pattern.message || '올바른 형식이 아닙니다';
			}

			if (validate && !validate.value(value)) {
				return validate.message || '유효하지 않은 값입니다';
			}

			return '';
		},
		[validationRules]
	);

	const validateForm = useCallback(() => {
		let isFormValid = true;
		const newErrors: { [K in keyof T]?: string } = {};

		Object.keys(formState.values).forEach((key) => {
			const error = validateField(key as keyof T, formState.values[key as keyof T]);
			if (error) {
				newErrors[key as keyof T] = error;
				isFormValid = false;
			}
		});

		setFormState((prev) => ({
			...prev,
			errors: newErrors,
			formIsValid: isFormValid,
		}));
	}, [formState.values, validateField]);

	const handleChange = useCallback(
		(name: keyof T, value: string) => {
			setFormState((prev) => {
				const error = validateField(name, value);

				const updatedIsDirty = { ...prev.isDirty, [name]: value !== initialValues[name] };
				const updatedIsValid = { ...prev.isValid, [name]: !error };
				const updatedTouched = { ...prev.touched, [name]: true };

				return {
					...prev,
					values: { ...prev.values, [name]: value },
					errors: { ...prev.errors, [name]: error },
					touched: updatedTouched,
					isDirty: updatedIsDirty,
					isValid: updatedIsValid,
					formIsDirty: Object.values(updatedIsDirty).some(Boolean),
					formIsValid: Object.values(updatedIsValid).every(Boolean),
				};
			});
		},
		[initialValues, validateField]
	);

	const reset = useCallback(() => {
		setFormState({
			values: initialValues,
			errors: {},
			touched: {},
			isValid: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
			isDirty: {},
			formIsValid: true,
			formIsDirty: false,
		});
	}, [initialValues]);

	useEffect(() => {
		validateForm();
	}, [validateForm]);

	return {
		values: formState.values,
		errors: formState.errors,
		touched: formState.touched,
		isValid: formState.isValid,
		isDirty: formState.isDirty,
		formIsValid: formState.formIsValid,
		formIsDirty: formState.formIsDirty,
		handleChange,
		reset,
	};
}
