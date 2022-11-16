import Component from "../interfaces/Component";
import Field from "../interfaces/Field";
import CriadorComandos from "./CriadorComandos";
import criarPasta from "../lib/criarPasta";
import CriadorEventos from "./CriadorEventos";
import CriadorEvenDispatcher from "./CriadorEventDispatcher";
import CriadorAggregate from "./CriadorAggregate";
import CriadorProjecao from "./CriadorProjecao";
import CriadorRepository from "./CriadorRepository";

export default class CriadorComponent {
  private dono: string;
  private pacoteComponent: string;
  private pacoteData: string;
  private import: string;
  private path: string;
  private contemLista: boolean = false;

  constructor(component: Component) {
    this.dono = component.dono;
    this.pacoteComponent = component.pacoteComponent;
    this.pacoteData = component.pacoteData;
    this.import = component.import;
    this.path = `./dados/${this.dono}`;

    this.criar(component.fields);
  }

  private async criarPastas() {
    await criarPasta("./dados/");
    await criarPasta(`${this.path}`);
    await criarPasta(`${this.path}/command`);
    await criarPasta(`${this.path}/event`);
    await criarPasta(`${this.path}/aggregate`);

    if (this.pacoteData) {
      await criarPasta(`${this.path}/data`);
      await criarPasta(`${this.path}/data/projection`);
    }
  }

  private async criar(fields: Field[]) {
    await this.criarPastas();
    fields.forEach((field) => {
      if (field.lista) this.contemLista = true;

      field.import = field.import || this.import;
      field.nome = field.nome || field.tipo;

      if (field.tipo.includes("DadosCadastrais")) {
        field.nome = "DadosCadastrais";
      }

      this.criarComandosEventos(field);
    });

    this.criarEventDispatcher(fields);
    this.criarAggregate(fields);

    if (this.pacoteData) this.criarRepository(fields);
  }

  private criarComandosEventos(field: Field) {
    new CriadorComandos(this.dono, this.pacoteComponent, field).criar();
    new CriadorEventos(this.dono, this.pacoteComponent, field).criar();

    if (this.pacoteData) {
      new CriadorProjecao(this.dono, this.pacoteData, field).criar();
    }
  }

  private criarEventDispatcher(fields: Field[]) {
    new CriadorEvenDispatcher(this.dono, this.pacoteComponent, fields).criar();
  }

  private criarAggregate(fields: Field[]) {
    new CriadorAggregate(
      this.dono,
      this.pacoteComponent,
      fields,
      this.contemLista,
      this.import
    ).criar();
  }

  private criarRepository(fields: Field[]) {
    new CriadorRepository(
      this.dono,
      this.pacoteData,
      fields,
      this.contemLista
    ).criar();
  }
}
