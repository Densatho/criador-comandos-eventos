import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";
import formatarParaNomeVariavel from "../lib/formatarParaNomeVariavel";

export default class CriadorAggregate {
  private dono: string;
  private donoId: string;
  private package: string;
  private pacote: string;
  private importDispatcher: string;
  private path: string;
  private fields: Field[];
  private contemLista: boolean;
  private importPadrao: string;

  constructor(
    dono: string,
    pacote: string,
    fields: Field[],
    contemLista: boolean,
    importPadrao: string
  ) {
    this.dono = dono;
    this.donoId = formatarParaNomeVariavel(this.dono) + "Id";
    this.package = pacote;
    this.pacote = `package ${pacote}.event;`;
    this.importDispatcher = `import ${pacote}.event.${dono}Dispatcher;`;
    this.path = `./dados/${dono}/aggregate`;
    this.fields = fields;
    this.contemLista = contemLista;
    this.importPadrao = importPadrao;
  }

  public criar() {
    const nomeClasse = `${this.dono}Aggregate`;
    const classBuilder = `${this.dono}Builder`;
    const dispatcher = `${this.dono}Dispatcher`;

    let importComandos: string = "";
    let importEventos: string = "";
    let importModels: string = "";
    let propriedadesClasse: string = "";
    let parseBuilder: string = "";
    let tipoDadosCadastrais: string = "";
    let metodosClasse: string = "";

    this.fields.forEach((field) => {
      if (field.nome === "DadosCadastrais") tipoDadosCadastrais = field.tipo;

      importComandos += this.importComandosString(field);
      importEventos += this.importEventosString(field);
      importModels += this.importModelString(field);
      parseBuilder += this.parseBuilderString(field);

      if (!field.lista) {
        propriedadesClasse += this.propriedadeString(field);
        metodosClasse += this.metodoString(field, dispatcher);
      } else {
        propriedadesClasse += this.propriedadeListaString(field);
        metodosClasse += this.metodoListaString(field, dispatcher);
      }
    });

    importComandos = importComandos.substring(0, importComandos.length - 1);
    importEventos = importEventos.substring(0, importEventos.length - 1);
    importModels = importModels.substring(0, importModels.length - 1);
    propriedadesClasse = propriedadesClasse.substring(
      0,
      propriedadesClasse.length - 5
    );
    parseBuilder = parseBuilder.substring(0, parseBuilder.length - 9);

    let str: string = `
${this.pacote}
${
  !this.contemLista
    ? ""
    : `
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
`
}
${importComandos}
${importEventos}
${this.importDispatcher}
${importModels}

import userviceframework.aggregate.AggregateRoot;
import userviceframework.aggregate.command.CommandHandler;

@AggregateRoot
public class ${nomeClasse} {

    private String ${this.donoId};
    ${propriedadesClasse}

    ${this.classBuilder(nomeClasse, classBuilder)}

    public static ${classBuilder} builder() {
        return new ${classBuilder}();
    }

    public ${nomeClasse}(${classBuilder} builder) {
        ${this.donoId} = builder.${this.donoId};
        ${parseBuilder}
    }
    
    public final String get${this.dono}Id() {
        return ${this.donoId};
    }${
      tipoDadosCadastrais
        ? `

    @CommandHandler
    public static final ${nomeClasse} criar${this.dono}(Criar${this.dono}Command cmd) {
        return criar${this.dono}(cmd.get${this.dono}Id(), cmd.getDadosCadastrais());
    }
    
    public static final ${nomeClasse} criar${this.dono}(String ${this.donoId}, ${tipoDadosCadastrais} dadosCadastrais) {
        ${nomeClasse} aggregate = ${nomeClasse}.builder().with${this.dono}Id(${this.donoId}).withDadosCadastrais(dadosCadastrais).build();
        ${dispatcher}.dispatcher(aggregate).notifyEvent(new ${this.dono}CriadoEvent(${this.donoId}, dadosCadastrais));
        return aggregate;
    }
    
    @CommandHandler
    public void atualizarDadosCadastrais(AtualizarDadosCadastraisCommand cmd) {
        atualizarDadosCadastrais(cmd.getDadosCadastrais());
    }
    
    public void atualizarDadosCadastrais(${tipoDadosCadastrais} dadosCadastrais) {
        this.dadosCadastrais = dadosCadastrais;
        ${dispatcher}.dispatcher(this).notifyEvent(new DadosCadastraisAtualizadoEvent(${this.donoId}, dadosCadastrais));
    }
    
    public final ${tipoDadosCadastrais} getDadosCadastrais() {
        return dadosCadastrais;
    }`
        : ""
    }
    ${metodosClasse}
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private importComandosString(field: Field): string {
    if (field.nome === "DadosCadastrais") {
      return `
import ${this.package}.command.Criar${this.dono}Command;
import ${this.package}.command.Atualizar${field.nome}Command;
`.substring(1);
    }

    return `
import ${this.package}.command.${field.lista ? "Adicionar" : "Criar"}${
      field.nome
    }Command;${
      field.lista
        ? `
import ${this.package}.command.Adicionar${field.nomePlural}Command;`
        : ""
    }
import ${this.package}.command.Atualizar${field.nome}Command;${
      field.lista
        ? `
import ${this.package}.command.Atualizar${field.nomePlural}Command;`
        : ""
    }
import ${this.package}.command.Remover${field.nome}Command;${
      field.lista
        ? `
import ${this.package}.command.Remover${field.nomePlural}Command;`
        : ""
    }
`.substring(1);
  }

  private importEventosString(field: Field): string {
    if (field.nome === "DadosCadastrais") {
      return `
import ${this.package}.command.${this.dono}CriadoEvent;
import ${this.package}.command.${field.nome}AtualizadoEvent;
`.substring(1);
    }

    return `
import ${this.package}.command.${field.nome}${
      field.lista ? "Adicionado" : "Criado"
    }Event;${
      field.lista
        ? `
import ${this.package}.command.${field.nomePlural}AdicionadosEvent;`
        : ""
    }
import ${this.package}.command.${field.nome}AtualizadoEvent;${
      field.lista
        ? `
import ${this.package}.command.${field.nomePlural}AtualizadosEvent;`
        : ""
    }
import ${this.package}.command.${field.nome}RemovidoEvent;${
      field.lista
        ? `
import ${this.package}.command.${field.nomePlural}RemovidosEvent;`
        : ""
    }
`.substring(1);
  }

  private importModelString(field: Field): string {
    return `
import ${field.import || this.importPadrao}.${field.tipo};
`.substring(1);
  }

  private propriedadeString(field: Field): string {
    return `
private ${field.tipo} ${formatarParaNomeVariavel(field.nome)};
    `.substring(1);
  }

  private propriedadeListaString(field: Field): string {
    return `
private List<${field.tipo}> ${formatarParaNomeVariavel(
      field.nomePlural
    )} = new ArrayList<${field.tipo}>();
    `.substring(1);
  }

  private parseBuilderString(field: Field): string {
    const nomeVariavel = !field.lista
      ? formatarParaNomeVariavel(field.nome)
      : formatarParaNomeVariavel(field.nomePlural);

    return `
${nomeVariavel} = builder.${nomeVariavel};
        `.substring(1);
  }

  private metodoString(field: Field, dispatcher: string): string {
    if (field.nome === "DadosCadastrais") return "";

    const nomeVariavel = formatarParaNomeVariavel(field.nome);

    return `
    @CommandHandler
    public void criar${field.nome}(Criar${field.nome}Command cmd) {
        criar${field.nome}(cmd.get${field.nome}());
    }
    
    public void criar${field.nome}(${field.tipo} ${nomeVariavel}) {
        this.${nomeVariavel} = ${nomeVariavel};
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}CriadoEvent(${this.donoId}, ${nomeVariavel}));
    }

    @CommandHandler
    public void atualizar${field.nome}(Atualizar${field.nome}Command cmd) {
        atualizar${field.nome}(cmd.get${field.nome}());
    }
    
    public void atualizar${field.nome}(${field.tipo} ${nomeVariavel}) {
        this.${nomeVariavel} = ${nomeVariavel};
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}AtualizadoEvent(${this.donoId}, ${nomeVariavel}));
    }

    @CommandHandler
    public void remover${field.nome}(Remover${field.nome}Command cmd) {
        remover${field.nome}(cmd.get${field.nome}());
    }

    public void remover${field.nome}(${field.tipo} ${nomeVariavel}) {
        ${field.tipo} ${nomeVariavel} = this.${nomeVariavel};
        this.${nomeVariavel} = null;
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}RemovidoEvent(${this.donoId}, ${nomeVariavel}));
    }

    public final ${field.tipo} get${field.nome}() {
        return ${nomeVariavel};
    }
`;
  }

  private metodoListaString(field: Field, dispatcher: string): string {
    if (field.nome === "DadosCadastrais") return "";

    const nomeVariavel = formatarParaNomeVariavel(field.nome);
    const nomeVariavelPlural = formatarParaNomeVariavel(field.nomePlural);

    return `
    @CommandHandler
    public void adicionar${field.nome}(Adicionar${field.nome}Command cmd) {
        adicionar${field.nome}(cmd.get${field.nome}());
    }
    
    public void adicionar${field.nome}(${field.tipo} ${nomeVariavel}) {
        ${nomeVariavelPlural}.add(${nomeVariavel});
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}AdicionadoEvent(${this.donoId}, ${nomeVariavel}));
    }

    @CommandHandler
    public void adicionar${field.nomePlural}(Adicionar${field.nomePlural}Command cmd) {
        adicionar${field.nomePlural}(cmd.get${field.nomePlural}());
    }
    
    public void adicionar${field.nomePlural}(${field.tipo} ${nomeVariavelPlural}) {
        this.${nomeVariavelPlural}.addAll(${nomeVariavelPlural});
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nomePlural}AdicionadosEvent(${this.donoId}, ${nomeVariavelPlural}));
    }

    @CommandHandler
    public void atualizar${field.nome}(Atualizar${field.nome}Command cmd) {
        atualizar${field.nome}(cmd.getIndex(), cmd.get${field.nome}());
    }
    
    public void atualizar${field.nome}(int index, ${field.tipo} ${nomeVariavel}) {
        ${nomeVariavelPlural}.set(index, ${nomeVariavel});
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}AtualizadoEvent(${this.donoId}, index, ${nomeVariavel}));
    }

    @CommandHandler
    public void atualizar${field.nomePlural}(Atualizar${field.nomePlural}Command cmd) {
        atualizar${field.nomePlural}(cmd.get${field.nomePlural}());
    }
    
    public void atualizar${field.nomePlural}(Collection<${field.tipo}> ${nomeVariavelPlural}) {
        this.${nomeVariavelPlural} = ${nomeVariavelPlural};
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nomePlural}AtualizadosEvent(${this.donoId}, ${nomeVariavelPlural}));
    }

    @CommandHandler
    public void remover${field.nome}(Remover${field.nome}Command cmd) {
        remover${field.nome}(cmd.getIndex());
    }
    
    public void remover${field.nome}(int index) {
        ${field.tipo} ${nomeVariavel} = ${nomeVariavelPlural}.remove(index);
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nome}RemovidoEvent(${this.donoId}, index, ${nomeVariavel}));
    }

    @CommandHandler
    public void remover${field.nomePlural}(Remover${field.nomePlural}Command cmd) {
        remover${field.nomePlural}();
    }
    
    public void remover${field.nomePlural}() {
        List<${field.tipo}> ${nomeVariavelPlural} = this.${nomeVariavelPlural};
        this.${nomeVariavelPlural} = new ArrayList<${field.tipo}>();
        ${dispatcher}.dispatcher(this).notifyEvent(new ${field.nomePlural}RemovidosEvent(${this.donoId}, ${nomeVariavelPlural}));
    }

    public final ${field.tipo} get${field.nome}(int index) {
        return ${nomeVariavelPlural}.get(index);
    }

    public final List<${field.tipo}> get${field.nomePlural}(int index) {
        return Collections.unmodifiableList(${nomeVariavelPlural});
    }
`;
  }

  private classBuilder(nomeClasse: string, classBuilder: string): string {
    let propriedadesBuilder: string = "";
    let metodosBuilder: string = "";

    this.fields.forEach((field) => {
      if (!field.lista) {
        propriedadesBuilder += this.propridadeBuilderString(field);
        metodosBuilder += this.metodosBuilderString(field, classBuilder);
      } else {
        propriedadesBuilder += this.propridadeListaBuilderString(field);
        metodosBuilder += this.metodosListaBuilderString(field, classBuilder);
      }
    });

    propriedadesBuilder = propriedadesBuilder.substring(
      0,
      propriedadesBuilder.length - 9
    );
    metodosBuilder = metodosBuilder.substring(0, metodosBuilder.length - 10);

    return `
    public static class ${classBuilder} {

        private String ${this.donoId};
        ${propriedadesBuilder}

        public ${classBuilder}() {}

        public ${classBuilder} with${this.dono}Id(String ${this.donoId}) {
            this.${this.donoId} = ${this.donoId};
        }

        ${metodosBuilder}
        
        public ${nomeClasse} build() {
            return new ${nomeClasse}(this);
        }
    }`.substring(5);
  }

  private propridadeBuilderString(field: Field): string {
    return `
private ${field.tipo} ${formatarParaNomeVariavel(field.nome)};
        `.substring(1);
  }

  private propridadeListaBuilderString(field: Field): string {
    return `
private List<${field.tipo}> ${formatarParaNomeVariavel(
      field.nomePlural
    )} = new ArrayList<${field.tipo}>();
        `.substring(1);
  }

  private metodosBuilderString(field: Field, builder: string): string {
    const nomeVariavel = formatarParaNomeVariavel(field.nome);
    return `
public ${builder} with${field.nome}(${field.tipo} ${nomeVariavel}) {
            this.${nomeVariavel} = ${nomeVariavel};
            return this;
        }

        `.substring(1);
  }

  private metodosListaBuilderString(field: Field, builder: string): string {
    const nomeVariavel = formatarParaNomeVariavel(field.nomePlural);

    return `
public ${builder} with${field.nomePlural}(Collection<${field.tipo}> ${nomeVariavel}) {
            this.${nomeVariavel} = new ArrayList<${field.tipo}>(${nomeVariavel});
            return this;
        }

        `.substring(1);
  }
}
