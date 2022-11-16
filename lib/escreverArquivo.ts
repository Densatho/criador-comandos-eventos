import * as fs from "fs";

export default function escreverArquivo(
  path: string,
  nomeArquivo: string,
  conteudo: string
) {
  conteudo = conteudo.substring(1, conteudo.length);

  fs.writeFile(`${path}/${nomeArquivo}.java`, conteudo, function (err) {
    if (err) throw err;
    console.log(`arquivo ${nomeArquivo} foi criado com sucesso.`);
  });
}
