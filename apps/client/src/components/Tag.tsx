import { twMerge } from 'tailwind-merge';

export interface LabelProps {
	text: string;
	className?: string;
}

function Tag({ text, className, ...props }: LabelProps) {
	return (
		<span
			className={twMerge(
				'inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white drop-shadow-sm',
				className
			)}
			{...props}
		>
			{text}
		</span>
	);
}

export default Tag;
