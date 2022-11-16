import dados from "./dados.json";
import Component from "./interfaces/Component";
import CriadorComponent from "./models/CriadorComponent";

dados.forEach((value) => {
  const criador = new CriadorComponent(value as Component);
  console.log(criador);
});
