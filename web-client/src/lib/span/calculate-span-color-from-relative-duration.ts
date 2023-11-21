export function calculateSpanColorFromRelativeDuration(inputValue: number) {
  if (inputValue > 150) {
    return "bg-red-500";
  }
  if (inputValue > 100) {
    return "bg-yellow-400";
  }

  return "bg-teal-500";
}
