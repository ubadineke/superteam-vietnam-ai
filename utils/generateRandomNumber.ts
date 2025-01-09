export default function generateRandomNumber(digits: number) {
  if (digits <= 0) {
    throw new Error('The number of digits must be greater than 0.');
  }

  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
