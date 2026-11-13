// Eases vehicle markers along their trip's shape between pings (board F1 section 1) and drops a
// vehicle 2 minutes after its last ping. A ping carries shapeDistTraveled (metres along the shape);
// the marker is placed at that distance plus speed * time since the ping, so it follows the road
// instead of cutting corners.

export const HIDE_AFTER_SEC = 120;
const MAX_EXTRAPOLATE_SEC = 12;

interface Shape {
	pts: number[][];
	cum: number[];
}

interface Ping {
	ts: number;
	dist: number;
	speed: number;
}

export interface EasedInput {
	unique_id: string;
	shape_id: string;
	shape_dist: number | null;
	timestamp: number;
	speed: number;
	lat: number;
	lon: number;
}

function metres(a: number[], b: number[]): number {
	const rad = Math.PI / 180;
	const dLat = (b[0] - a[0]) * rad;
	const dLon = (b[1] - a[1]) * rad;
	const h =
		Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
	return 12742000 * Math.asin(Math.sqrt(h));
}

function toShape(pts: number[][]): Shape {
	const cum = [0];
	for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + metres(pts[i - 1], pts[i]));
	return { pts, cum };
}

function pointAt(shape: Shape, dist: number): [number, number] {
	const { pts, cum } = shape;
	if (dist <= 0) return [pts[0][0], pts[0][1]];
	const end = cum.length - 1;
	if (dist >= cum[end]) return [pts[end][0], pts[end][1]];
	let lo = 0;
	let hi = end;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (cum[mid] <= dist) lo = mid;
		else hi = mid;
	}
	const span = cum[hi] - cum[lo] || 1;
	const f = (dist - cum[lo]) / span;
	return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
}

export function createVehicleEaser(fetchShape: (shapeId: string) => Promise<number[][]>) {
	const shapes = new Map<string, Shape | null>(); // null = requested, not arrived
	const pings = new Map<string, Ping>();

	function ensureShape(shapeId: string): Shape | null {
		const have = shapes.get(shapeId);
		if (have !== undefined) return have;
		shapes.set(shapeId, null);
		fetchShape(shapeId).then(
			(pts) => {
				if (pts.length > 1) shapes.set(shapeId, toShape(pts));
				else shapes.delete(shapeId);
			},
			() => shapes.delete(shapeId)
		);
		return null;
	}

	// Vehicles within 2 minutes of their last ping, each placed `aheadSec` seconds after `nowSec`
	// along its shape (raw lat/lon while the shape is loading or the ping has no shapeDistTraveled).
	return function ease<T extends EasedInput>(vehicles: T[], nowSec: number, aheadSec = 0): T[] {
		const out: T[] = [];
		for (const v of vehicles) {
			if (nowSec - v.timestamp > HIDE_AFTER_SEC) continue;
			const prev = pings.get(v.unique_id);
			if (v.shape_dist != null && (!prev || prev.ts !== v.timestamp)) {
				const gap = prev ? v.timestamp - prev.ts : 0;
				const moved = prev ? v.shape_dist - prev.dist : 0;
				const speed = gap > 0 && moved >= 0 ? moved / gap : Math.max(v.speed, 0);
				pings.set(v.unique_id, { ts: v.timestamp, dist: v.shape_dist, speed });
			}
			const ping = pings.get(v.unique_id);
			const shape = v.shape_id && ping ? ensureShape(v.shape_id) : null;
			if (!ping || !shape) {
				out.push(v);
				continue;
			}
			const age = Math.min(Math.max(nowSec + aheadSec - ping.ts, 0), MAX_EXTRAPOLATE_SEC);
			const [lat, lon] = pointAt(shape, ping.dist + ping.speed * age);
			out.push({ ...v, lat, lon });
		}
		return out;
	};
}
