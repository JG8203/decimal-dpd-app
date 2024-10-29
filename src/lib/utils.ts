export const currentDate = () => {
	const now = new Date();
	return now.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};

export const currentTime = () => {
	const now = new Date();
	return now.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	});
};