import CriadorComponent, { Component } from "./CriadorComponent";
import data from "./dataTeste.json";

data.forEach((value) => {
  const criador = new CriadorComponent(value as Component);
});
