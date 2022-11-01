import fs from "fs";

export default class CriadorComandosEventos {
  private package: string;
  private import: string;
  private dono: string;
  private tipo: string;
  private nome: string;
  private lista: true;
  private listaConfig: {
    plural: string;
    tipoPlural: string;
  };

  constructor(value: any) {
    this.package = value.package;
    this.import = value.import;
    this.dono = value.dono;
    this.tipo = value.tipo;
    this.nome = this.formatNameString(value.tipo);
    this.lista = value.lista;
    this.listaConfig = {
      plural: !value.tipoPlural
        ? this.formatPluralString(this.nome)
        : this.formatNameString(value.tipoPlural),
      tipoPlural: !value.tipoPlural
        ? this.formatPluralString(this.tipo)
        : value.tipoPlural,
    };
  }

  private formatNameString(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private formatPluralString(str: string): string {
    // formata a string dando espaço antes das letras maiusculas e tira o espaço de começo da linha
    str = str.replace(/([A-Z])/g, " $1").trim();
    // troca os espaços vazios por "s" e coloca um s no final
    str = str.replace(" ", "s") + "s";

    return str;
  }

  private createCommand() {
    if (this.lista) {
      this.addAllCommand();
    }

    const className = `${this.lista ? "Adicionar" : "Criar"}${this.tipo}${
      this.dono
    }Command`;

    let str: string = `
package ${this.package}.command;

import ${this.import}.${this.tipo};
    
public class ${className} {
      
    private ${this.tipo} ${this.nome};
      
    public ${className} (${this.tipo} ${this.nome}) {
        this.${this.nome} = ${this.nome};
    }
    
    public ${this.tipo} get${this.tipo}(){
        return ${this.nome};
    }
}`;

    this.write("command", str, className);
  }

  private addAllCommand() {
    const className = `Adicionar${this.listaConfig.tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import java.util.Collection;

import ${this.import}.${this.tipo};
    
public class ${className} {
      
    private Collection<${this.tipo}> ${this.listaConfig.plural};
      
    public ${className} (Collection<${this.tipo}> ${this.listaConfig.plural}) {
        this.${this.listaConfig.plural} = ${this.listaConfig.plural};
    }
    
    public Collection<${this.tipo}> get${this.listaConfig.tipoPlural}(){
        return ${this.listaConfig.plural};
    }
}`;

    this.write("command", str, className);
  }

  private updateCommand() {
    if (this.lista) {
      this.updateAllCommand();
    }
    const className = `Atualizar${this.tipo}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import ${this.import}.${this.tipo};
    
public class ${className} {
    ${this.lista ? `\n\tprivate int index;` : ""}
    private ${this.tipo} ${this.nome};
      
    public ${className} (${this.lista ? `int index, ` : ""}${this.tipo} ${
      this.nome
    }) {${this.lista ? `\n\tthis.index = index;` : ""}
        this.${this.nome} = ${this.nome};
    }
    ${
      this.lista
        ? `\n\tpublic int getIndex(){
      return index;
    }\n`
        : ""
    }
    public ${this.tipo} get${this.tipo}(){
        return ${this.nome};
    }
}`;

    this.write("command", str, className);
  }

  private updateAllCommand() {
    const className = `Atualizar${this.listaConfig.tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import java.util.Collection;

import ${this.import}.${this.tipo};

public class ${className} {
  
    private Collection<${this.tipo}> ${this.listaConfig.plural};
  
    public ${className} (Collection<${this.tipo}> ${this.listaConfig.plural}) {
        this.${this.listaConfig.plural} = ${this.listaConfig.plural};
    }

    public Collection<${this.tipo}> get${this.listaConfig.tipoPlural}(){
        return ${this.listaConfig.plural};
    }
}`;

    this.write("command", str, className);
  }

  private deleteCommand() {
    if (this.lista) {
      this.deleteAllCommand();
    }
    const className = `Remover${this.tipo}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;
    
public class ${className} {
   ${
     this.lista
       ? `
    private int index;
      
    public ${className} (int index) {
        this.index = index;
    }
    
    public int getIndex(){
      return index;
    }`
       : ""
   }
}`;

    this.write("command", str, className);
  }

  private deleteAllCommand() {
    const className = `Remover${this.listaConfig.tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

public class ${className} {

    public ${className} () {}

}`;

    this.write("command", str, className);
  }

  private event(action: string) {
    if (this.lista) {
      this.allEvent(action);
    }

    const className = `${this.tipo}${action}Event`;

    let str: string = `
package ${this.package}.event;

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import ${this.import}.${this.tipo};
    
public class ${className} {
      
    private String ${this.dono.toLocaleLowerCase()}Id;
    private ${this.tipo} ${this.nome};

    @JsonCreator
    @ConstructorProperties({ "${this.dono.toLocaleLowerCase()}Id", "${
      this.nome
    }" })
    public ${className} (String ${this.dono.toLocaleLowerCase()}Id, ${
      this.tipo
    } ${this.nome}) {
        this.${this.dono.toLocaleLowerCase()}Id = ${this.dono.toLocaleLowerCase()}Id;
        this.${this.nome} = ${this.nome};
    }

    public String get${this.dono}Id(){
      return ${this.dono.toLocaleLowerCase()}Id;
    }
    
    public ${this.tipo} get${this.tipo}(){
        return ${this.nome};
    }
}`;

    this.write("event", str, className);
  }

  public allEvent(action: string) {
    const className = `${this.listaConfig.tipoPlural}${action}sEvent`;

    let str: string = `
package ${this.package}.event;

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Collection;

import ${this.import}.${this.tipo};
    
public class ${className} {
      
    private String ${this.dono.toLocaleLowerCase()}Id;
    private Collection<${this.tipo}> ${this.listaConfig.plural};
      
    @JsonCreator
    @ConstructorProperties({ "${this.dono.toLocaleLowerCase()}Id", "${
      this.listaConfig.plural
    }" })
    public ${className} (String ${this.dono.toLocaleLowerCase()}Id, Collection<${
      this.tipo
    }> ${this.listaConfig.plural}) {
        this.${this.dono.toLocaleLowerCase()}Id = ${this.dono.toLocaleLowerCase()}Id;
        this.${this.listaConfig.plural} = ${this.listaConfig.plural};
    }

    public String get${this.dono}Id(){
      return ${this.dono.toLocaleLowerCase()}Id;
    }
    
    public Collection<${this.tipo}> get${this.listaConfig.plural}(){
        return ${this.listaConfig.plural};
    }
}`;

    this.write("event", str, className);
  }

  private write(local: string, str: string, className: string) {
    str = str.substring(1, str.length);

    fs.writeFile(`./${local}/${className}.java`, str, function (err) {
      if (err) throw err;
      console.log(`arquivo ${className} foi criado com sucesso.`);
    });
  }

  public async create() {
    if (!fs.existsSync(`./command`)) {
      await fs.mkdirSync(`./command`);
    }
    if (!fs.existsSync(`./event`)) {
      await fs.mkdirSync(`./event`);
    }

    this.createCommand();
    this.updateCommand();
    this.deleteCommand();
    this.event(this.lista ? "Adicionado" : "Criado");
    this.event("Atualizado");
    this.event("Removido");
  }
}
