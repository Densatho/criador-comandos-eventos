export default function formatarParaNomeVariavel(str: string): string {
  if (!str) {
    return null;
  }

  return str.charAt(0).toLowerCase() + str.slice(1);
}
