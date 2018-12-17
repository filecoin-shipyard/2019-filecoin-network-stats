export default function ellipsify(input: string, length = 20): string {
  if (input.length < length) {
    return input;
  }

  return `${input.slice(0, length / 2)}...${input.slice(-length / 2)}`
}