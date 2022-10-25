# criador-comandos-eventos

cria comandos apartir de um arquivo chamado dados.json

o json deve conter os seguintes campos:

{
  "package": "primori.base.cadastral.component.funcionario",
  "import": "primori.base.cadastral.domain.funcionario.model",
  "dono": "Funcionario",
  "tipo": "ESocial",
  "lista": true,
  "tipoPlural": "ESociais"
}

O tipo plural serve para customizar o plural. pois normalmente é inserido um s antes de letras maiusculas.
