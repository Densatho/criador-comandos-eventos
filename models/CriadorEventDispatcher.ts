import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";

export default class CriadorEvenDispatcher {
  private dono: string;
  private aggregate: string;
  private pacote: string;
  private importAggregate: string;
  private path: string;
  private fields: Field[];

  constructor(dono: string, pacote: string, fields: Field[]) {
    this.dono = dono;
    this.aggregate = `${this.dono}Aggregate`;
    this.pacote = `package ${pacote}.event;`;
    this.importAggregate = `import ${pacote}.aggregate.${dono}Aggregate;`;
    this.path = `./dados/${dono}/event`;
    this.fields = fields;
  }

  public criar() {
    const nomeClasse = `${this.dono}Dispatcher`;

    let eventos: string = "";

    this.fields.forEach((field) => {
      if (field.nome !== "DadosCadastrais") {
        eventos += this.stringEventos(field);
      } else {
        eventos += this.StringEventosDadosCadastrais(field);
      }
    });

    let str: string = `
${this.pacote}

${this.importAggregate};

public class ${nomeClasse} {

    public ${nomeClasse} () {}

    public static ${nomeClasse} dispatcher(${this.aggregate} aggregate) {
        return new ${nomeClasse}();
    }
${eventos}
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private stringEventos(field: Field): string {
    return `
    public void notifyEvent(final ${field.nome}${
      field.lista ? "Adicionado" : "Criado"
    }Event evt) {}${
      field.lista
        ? `
    public void notifyEvent(final ${field.nomePlural}AdicionadosEvent evt) {}`
        : ""
    }
    public void notifyEvent(final ${field.nome}AtualizadoEvent evt) {}${
      field.lista
        ? `
    public void notifyEvent(final ${field.nomePlural}AtualizadosEvent evt) {}`
        : ""
    }
    public void notifyEvent(final ${field.nome}RemovidoEvent evt) {}${
      field.lista
        ? `
    public void notifyEvent(final ${field.nomePlural}RemovidosEvent evt) {}`
        : ""
    }
`;
  }

  private StringEventosDadosCadastrais(field: Field): string {
    return `
    public void notifyEvent(final ${this.dono}CriadoEvent evt) {}
    public void notifyEvent(final ${field.nome}AtualizadoEvent evt) {}
`;
  }
}
