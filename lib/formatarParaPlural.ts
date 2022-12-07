export default function formatarParaPlural(str: string): string {
  // formata a string dando espaço antes das letras maiusculas e tira o espaço de começo da linha
  str = str.replace(/([A-Z])/g, " $1").trim();
  // troca os espaços vazios por "s" e coloca um s no final
  str = str.replace(" ", "s") + "s";

  return str;
}
