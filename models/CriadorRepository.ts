import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";
import formatarParaNomeVariavel from "../lib/formatarParaNomeVariavel";

export default class CriadorRepository {
  private dono: string;
  private donoId: string;
  private aggregate: string;
  private pacote: string;
  private importProjectionBase: string;
  private importAggregate: string;
  private path: string;
  private fields: Field[];
  private contemLista: boolean;

  constructor(
    dono: string,
    pacote: string,
    fields: Field[],
    contemLista: boolean
  ) {
    this.dono = dono;
    this.donoId = formatarParaNomeVariavel(this.dono) + "Id";
    this.aggregate = `${this.dono}Aggregate`;
    this.pacote = `package ${pacote};`;
    this.importProjectionBase = `import ${pacote}.projection`;
    this.importAggregate = `import ${pacote.replace(
      "data",
      "component"
    )}.aggregate.${dono}Aggregate;`;
    this.path = `./dados/${dono}/data`;
    this.fields = fields;
    this.contemLista = contemLista;
  }

  public criar() {
    const nomeInterface = `I${this.dono}Repository`;

    let importsProjections: string = "";
    let importsModel: string = "";
    let tipoDadosCadastrais: string = "";
    let criarDados: string = "";
    let atualizarDados: string = "";
    let removerDados: string = "";
    let obterDados: string = "";

    this.fields.forEach((field) => {
      if (field.nome !== "DadosCadastrais") {
        importsProjections += this.importProjectionString(field, false);
        importsModel += this.importModelString(field);
        criarDados += this.criarDadosString(field);
        atualizarDados += this.atualizarDadosString(field);
        removerDados += this.removerDadosString(field);
        obterDados += this.obterDadosString(field, false);
      } else {
        tipoDadosCadastrais = field.tipo;

        importsProjections += this.importProjectionString(field, true);
        importsModel += this.importModelString(field);
        atualizarDados += this.atualizarDadosString(field);
        obterDados += this.obterDadosString(field, true);
      }
    });

    importsProjections = importsProjections.trim();
    importsModel = importsModel.trim();
    criarDados = criarDados.trim();
    atualizarDados = atualizarDados.trim();
    removerDados = removerDados.trim();
    obterDados = obterDados.trim();

    let str: string = `
${this.pacote}
${
  this.contemLista
    ? `
import java.util.Collection;`
    : ""
}
import java.util.Optional;

import org.springframework.stereotype.Component;

${this.importAggregate}
${importsProjections}
${importsModel}
import userviceframework.data.repository.Repository;

@Component
public interface ${nomeInterface} extends Repository<${
      this.aggregate
    }, String> {

    void create(String ${this.donoId}, ${tipoDadosCadastrais} dadosCadastrais);
    Optional<${this.aggregate}> load(String ${this.donoId});

    ${criarDados}

    ${atualizarDados}

    ${removerDados}

    ${obterDados}

    Collection<${this.dono}Dados> get${this.dono}s();

}`;

    escreverArquivo(this.path, nomeInterface, str);
  }

  private importProjectionString(
    field: Field,
    dadosCadastrais: boolean
  ): string {
    if (dadosCadastrais)
      return `
${this.importProjectionBase}.${this.dono}Dados;
`.substring(1);

    return `
${this.importProjectionBase}.${this.dono}${field.nome};${
      field.lista
        ? `
${this.importProjectionBase}.${this.dono}${field.nomePlural};`
        : ""
    }
`.substring(1);
  }

  private importModelString(field: Field): string {
    return `
import ${field.import}.${field.tipo};
`.substring(1);
  }

  private criarDadosString(field: Field): string {
    let nomeVariavel = formatarParaNomeVariavel(field.nome);
    let nomeVariavelPlural = formatarParaNomeVariavel(field.nomePlural);

    return `
    void ${field.lista ? "add" : "create"}${field.nome}(String ${
      this.donoId
    }, ${field.tipo} ${nomeVariavel});${
      field.lista
        ? `
    void addAll${field.nomePlural}(String ${this.donoId}, Collection<${field.tipo}> ${nomeVariavelPlural});`
        : ""
    }
    `.substring(5);
  }

  private atualizarDadosString(field: Field): string {
    let nomeVariavel = formatarParaNomeVariavel(field.nome);
    let nomeVariavelPlural = formatarParaNomeVariavel(field.nomePlural);

    return `
    void update${field.nome}(String ${this.donoId}, ${
      field.lista ? `int index, ` : ""
    }${field.tipo} ${nomeVariavel});${
      field.lista
        ? `
    void update${field.nomePlural}(String ${this.donoId}, Collection<${field.tipo}> ${nomeVariavelPlural});`
        : ""
    }
    `.substring(5);
  }

  private removerDadosString(field: Field): string {
    return `
    void delete${field.nome}(String ${this.donoId}${
      field.lista ? `, int index` : ""
    });${
      field.lista
        ? `
    void delete${field.nomePlural}(String ${this.donoId});`
        : ""
    }
    `.substring(5);
  }

  private obterDadosString(field: Field, dadosCadastrais: boolean): string {
    if (dadosCadastrais)
      return `
      ${this.dono}Dados get${this.dono}(String ${this.donoId});
    `.substring(5);

    return `
    ${this.dono}${field.nome} get${field.nome}(String ${this.donoId}${
      field.lista ? `, int index` : ""
    });${
      field.lista
        ? `
    ${this.dono}${field.nomePlural} get${field.nomePlural}(String ${this.donoId});`
        : ""
    }
    `.substring(5);
  }
}
