import formatarParaPlural from "../lib/formatarParaPlural";
import Field from "../interfaces/Field";
import escreverArquivo from "../lib/escreverArquivo";
import formatarParaNomeVariavel from "../lib/formatarParaNomeVariavel";

export default class CriadorProjecao {
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
    this.pacote = `package ${pacote}.projection;`;
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
    this.path = `./dados/${dono}/data/projection`;
  }

  public criar() {
    if (this.nomeVariavel === "dadosCadastrais") {
      this.criarProjecao(`${this.dono}Dados`);
      return;
    }

    this.criarProjecao(`${this.dono}${this.nome}`);

    if (this.lista) {
      this.criarListaProjecao();
    }
  }

  private criarProjecao(nomeClasse: string) {
    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private final String ${this.donoId};
    private final ${this.tipo} ${this.nomeVariavel};

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

  private criarListaProjecao() {
    const nomeClasse = `${this.dono}${this.nomePlural}`;

    let str: string = `
${this.pacote}

import java.beans.ConstructorProperties;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;

${this.importModel}

public class ${nomeClasse} {

    private final String ${this.donoId};
    private final List<${this.tipo}> ${this.nomeVariavelPlural};

    @JsonCreator
    @ConstructorProperties({ "${this.donoId}", "${this.nomeVariavelPlural}" })
    public ${nomeClasse}(String ${this.donoId}, Collection<${this.tipo}> ${this.nomeVariavelPlural}) {
        this.${this.donoId} = ${this.donoId};
        this.${this.nomeVariavelPlural} = new ArrayList<${this.tipo}>(${this.nomeVariavelPlural});
    }

    public final String get${this.dono}Id() {
        return ${this.donoId};
    }

    public final List<${this.tipo}> get${this.nomePlural}() {
        return Collections.unmodifiableList(${this.nomeVariavelPlural});
    }
}`;

    escreverArquivo(this.path, nomeClasse, str);
  }
}
