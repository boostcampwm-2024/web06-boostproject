import { Button } from '@/components/ui/button.tsx';

function App() {
	return (
		<>
			<h1 className="text-primary p-1 pt-2">Welcome to Harmony!</h1>
			<p>Harmony 는 일정관리 서비스입니다.</p>
			<Button>default</Button>
			<Button variant="destructive">destructive</Button>
			<Button variant="secondary">secondary</Button>
			<Button variant="outline">outline</Button>
			<Button variant="ghost">ghost</Button>
			<Button variant="link">link</Button>
		</>
	);
}

export default App;
