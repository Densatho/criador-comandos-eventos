import data from "./dados.json";
import CriadorComandosEventos from "./CriadorComandosEventos";

data.forEach((value) => {
  const criador = new CriadorComandosEventos(value);
  console.log(criador);
  criador.create();
});
