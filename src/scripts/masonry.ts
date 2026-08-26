export interface CardPosition {
	id: string;
	left: number;
	top: number;
}

export function computeVisualOrder(positions: CardPosition[], rowTolerance = 20): string[] {
	if (positions.length === 0) return [];

	const sorted = [...positions].sort((a, b) => a.top - b.top);

	const rows: CardPosition[][] = [];
	let currentRow: CardPosition[] = [];
	let rowAnchorTop = sorted[0]!.top;

	for (const pos of sorted) {
		if (currentRow.length > 0 && Math.abs(pos.top - rowAnchorTop) > rowTolerance) {
			rows.push(currentRow);
			currentRow = [];
			rowAnchorTop = pos.top;
		}
		currentRow.push(pos);
	}
	if (currentRow.length > 0) rows.push(currentRow);

	const result: string[] = [];
	for (const row of rows) {
		row.sort((a, b) => a.left - b.left);
		for (const item of row) result.push(item.id);
	}
	return result;
}
