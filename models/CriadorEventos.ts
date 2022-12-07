import formatarParaPlural from "../lib/formatarParaPlural";
import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";
import formatarParaNomeVariavel from "../lib/formatarParaNomeVariavel";

export default class CriadorEventos {
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
    this.pacote = `package ${pacote}.event;`;
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
    this.path = `./dados/${dono}/event`;
  }

  public criar() {
    if (this.nomeVariavel === "dadosCadastrais") {
      this.criarDadosCadastrais();
      this.atualizarEvento();

      return;
    }

    this.criarEvento();
    this.atualizarEvento();
    this.removerEvento();
  }

  private criarDadosCadastrais() {
    const nomeClasse = `${this.dono}CriadoEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private ${this.tipo} ${this.nomeVariavel};

    @JsonCreator
    @ConstructorProperties({"${this.donoId}", "${this.nomeVariavel}"})
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

  private criarEvento() {
    if (this.lista) {
      this.criarTodosEventos();
    }

    const nomeClasse = `${this.nome}${
      this.lista ? "Adicionado" : "Criado"
    }Event`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private ${this.tipo} ${this.nomeVariavel};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}", "${this.nomeVariavel}" })
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

  public criarTodosEventos() {
    const nomeClasse = `${this.nomePlural}AdicionadosEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Collection;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private Collection<${this.tipo}> ${this.nomeVariavelPlural};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}", "${this.nomeVariavelPlural}" })
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

  private atualizarEvento() {
    if (this.lista) {
      this.atualizarTodosEvento();
    }

    const nomeClasse = `${this.nome}AtualizadoEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};${
      this.lista
        ? `
    private int index;`
        : ""
    }
    private ${this.tipo} ${this.nomeVariavel};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}",${
      this.lista ? ` "index",` : ""
    } "${this.nomeVariavel}" })
    public ${nomeClasse}(String ${this.donoId},${
      this.lista ? ` int index,` : ""
    } ${this.tipo} ${this.nomeVariavel}) {
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

  public atualizarTodosEvento() {
    const nomeClasse = `${this.nomePlural}AtualizadosEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Collection;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private Collection<${this.tipo}> ${this.nomeVariavelPlural};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}", "${this.nomeVariavelPlural}" })
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

  private removerEvento() {
    if (this.lista) {
      this.removerTodosEvento();
    }

    const nomeClasse = `${this.nome}RemovidoEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};${
      this.lista
        ? `
    private int index;`
        : ""
    }
    private ${this.tipo} ${this.nomeVariavel};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}",${
      this.lista ? ` "index",` : ""
    } "${this.nomeVariavel}" })
    public ${nomeClasse}(String ${this.donoId},${
      this.lista ? " int index," : ""
    } ${this.tipo} ${this.nomeVariavel}) {
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

  public removerTodosEvento() {
    const nomeClasse = `${this.nomePlural}RemovidosEvent`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Collection;

${this.importModel}

public class ${nomeClasse} {

    private String ${this.donoId};
    private Collection<${this.tipo}> ${this.nomeVariavelPlural};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}", "${this.nomeVariavelPlural}" })
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
}
