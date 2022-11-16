import formatarParaPlural from "../lib/formatarParaPlural";
import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";
import formatarParaNomeVariavel from "../lib/formatarParaNomeVariavel";

export default class CriadorComandos {
  private dono: string;
  private donoId: string;
  private pacote: string;
  private importModel: string;
  private lista: boolean;
  private tipo: string;
  private nome: string;
  private nomePlural: string;
  private nomeVariavel: string;
  private nomeVariavelPlural: string;
  private path: string;

  constructor(dono: string, pacote: string, field: Field) {
    this.dono = dono;
    this.donoId = formatarParaNomeVariavel(this.dono) + "Id";
    this.pacote = `package ${pacote}.command;`;
    this.importModel = `import ${field.import}.${field.tipo};`;
    this.lista = field.lista;
    this.tipo = field.tipo;
    this.nome = field.nome;
    this.nomeVariavel = formatarParaNomeVariavel(field.nome);

    if (field.nomePlural) {
      this.nomePlural = field.nomePlural;
      this.nomeVariavelPlural = formatarParaNomeVariavel(field.nomePlural);
    } else if (field.lista) {
      this.nomePlural = formatarParaPlural(field.nome);
      this.nomeVariavelPlural = formatarParaNomeVariavel(this.nomePlural);
    }
    this.path = `./dados/${dono}/command`;
  }

  public criar() {
    if (this.nomeVariavel === "dadosCadastrais") {
      this.criarDadosCadastrais();
      this.atualizarComando();

      return;
    }
    this.criarComando();
    this.atualizarComando();
    this.removerComando();
  }

  private criarDadosCadastrais() {
    const nomeClasse = `Criar${this.dono}Command`;

    let str: string = `
${this.pacote}

${this.importModel}
    
public class ${nomeClasse} {
      
    private String ${this.donoId};
    private ${this.tipo} ${this.nomeVariavel};
      
    public ${nomeClasse}(String ${this.donoId}, ${this.tipo} ${this.nomeVariavel}) {
        this.${this.donoId} = ${this.donoId};
        this.${this.nomeVariavel} = ${this.nomeVariavel};
    }
    
    public String get${this.dono}Id(){
        return ${this.donoId};
    }

    public ${this.tipo} get${this.nome}(){
        return ${this.nomeVariavel};
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private criarComando() {
    if (this.lista) {
      this.adicionarTodos();
    }

    const nomeClasse = `${this.lista ? "Adicionar" : "Criar"}${
      this.nome
    }Command`;

    let str: string = `
${this.pacote}

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private ${this.tipo} ${this.nomeVariavel};

    public ${nomeClasse}(String ${this.donoId}, ${this.tipo} ${this.nomeVariavel}) {
        this.${this.donoId} = ${this.donoId};
        this.${this.nomeVariavel} = ${this.nomeVariavel};
    }

    public String get${this.dono}Id() {
        return ${this.donoId};
    }

    public ${this.tipo} get${this.nome}() {
        return ${this.nomeVariavel};
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private adicionarTodos() {
    const nomeClasse = `Adicionar${this.nomePlural}Command`;

    let str: string = `
${this.pacote}

import java.util.Collection;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private Collection<${this.tipo}> ${this.nomeVariavelPlural};

    public ${nomeClasse}(String ${this.donoId}, Collection<${this.tipo}> ${this.nomeVariavelPlural}) {
        this.${this.donoId} = ${this.donoId};
        this.${this.nomeVariavelPlural} = ${this.nomeVariavelPlural};
    }

    public String get${this.dono}Id() {
        return ${this.donoId};
    }

    public Collection<${this.tipo}> get${this.nomePlural}() {
        return ${this.nomeVariavelPlural};
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private atualizarComando() {
    if (this.lista) {
      this.atualizarTodos();
    }

    const nomeClasse = `Atualizar${this.nome}Command`;

    let str: string = `
${this.pacote}

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};${
      this.lista
        ? `
    private int index;`
        : ""
    }
    private ${this.tipo} ${this.nomeVariavel};

    public ${nomeClasse}(String ${this.donoId}${
      this.lista ? `, int index` : ""
    }, ${this.tipo} ${this.nomeVariavel}) {
        this.${this.donoId} = ${this.donoId};${
      this.lista
        ? `
        this.index = index;`
        : ""
    }
        this.${this.nomeVariavel} = ${this.nomeVariavel};
    }
    
    public String get${this.dono}Id() {
        return ${this.donoId};
    }${
      this.lista
        ? `

    public int getIndex() {
        return index;
    }`
        : ""
    }

    public ${this.tipo} get${this.nome}() {
        return ${this.nomeVariavel};
    }
  }`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private atualizarTodos() {
    const nomeClasse = `Atualizar${this.nomePlural}Command`;

    let str: string = `
${this.pacote}

import java.util.Collection;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private Collection<${this.tipo}> ${this.nomeVariavelPlural};

    public ${nomeClasse}(String ${this.donoId}, Collection<${this.tipo}> ${this.nomeVariavelPlural}) {
        this.${this.donoId} = ${this.donoId};
        this.${this.nomeVariavelPlural} = ${this.nomeVariavelPlural};
    }

    public String get${this.dono}Id() {
        return ${this.donoId};
    }

    public Collection<${this.tipo}> get${this.nomeVariavelPlural}() {
        return ${this.nomeVariavelPlural};
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private removerComando() {
    if (this.lista) {
      this.removerTodos();
    }

    const nomeClasse = `Remover${this.nome}Command`;

    let str: string = `
${this.pacote}

public class ${nomeClasse} {

    private String ${this.donoId};${
      this.lista
        ? `
    private int index;`
        : ""
    }

    public ${nomeClasse}(String ${this.donoId}${
      this.lista ? `, int index` : ""
    }) {
        this.${this.donoId} = ${this.donoId};${
      this.lista
        ? `
        this.index = index;`
        : ""
    }
    }

    public String get${this.dono}Id() {
        return ${this.donoId};
    }${
      this.lista
        ? `

    public int getIndex() {
        return index;
    }`
        : ""
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }

  private removerTodos() {
    const nomeClasse = `Remover${this.nomePlural}Command`;

    let str: string = `
${this.pacote}

public class ${nomeClasse} {

    public ${nomeClasse}(String ${this.donoId}) {
        this.${this.donoId} = ${this.donoId};
    }

    public String get${this.dono}Id() {
        return ${this.donoId};
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }
}
