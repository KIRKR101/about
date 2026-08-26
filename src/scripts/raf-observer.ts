export function createRafObserver(callback: () => void) {
	let frame = 0;
	let observer: ResizeObserver | null = null;

	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			callback();
		});
	}

	function observe(target: Element) {
		if (observer) observer.disconnect();
		observer = new ResizeObserver(schedule);
		observer.observe(target);
	}

	function destroy() {
		if (observer) observer.disconnect();
		observer = null;
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
	}

	return { observe, destroy };
}
