/** Alternating symmetric tilt: right, left, right, left… */
export function getBrainstormTilt(index: number): number {
  return index % 2 === 0 ? 2.5 : -2.5;
}
