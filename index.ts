import CriadorComponent, { Component } from "./CriadorComponent";
import dados from "./dados.json";

dados.forEach((value) => {
  const criador = new CriadorComponent(value as Component);
  console.log(criador);
});
