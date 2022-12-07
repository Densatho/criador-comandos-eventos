import fs from "fs";

export interface Field {
  import?: string;
  tipo: string;
  lista?: boolean;
  tipoPlural?: string;
}

export interface Component {
  dono: string;
  package: string;
  import: string;
  fields: Field[];
}

export default class CriadorComponent {
  dono: string;
  package: string;
  import: string;
  comandos: string[] = [];
  eventos: string[] = [];
  path: string;
  imports: any = {};
  contemLista: boolean = false;
  fields: any = {};

  constructor(component: Component) {
    this.dono = component.dono;
    this.package = component.package;
    this.import = component.import;
    this.path = `./dados/${this.dono}`;

    this.criar(component.fields);
  }

  private async criarPastas() {
    if (!fs.existsSync(`./dados/`)) {
      await fs.mkdirSync(`./dados/`);
    }
    if (!fs.existsSync(`${this.path}`)) {
      await fs.mkdirSync(`${this.path}`);
    }
    if (!fs.existsSync(`${this.path}/command`)) {
      await fs.mkdirSync(`${this.path}/command`);
    }
    if (!fs.existsSync(`${this.path}/event`)) {
      await fs.mkdirSync(`${this.path}/event`);
    }
    if (!fs.existsSync(`${this.path}/aggregate`)) {
      await fs.mkdirSync(`${this.path}/aggregate`);
    }
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

  private async criar(fields: Field[]) {
    await this.criarPastas();
    fields.forEach((field) => {
      if (field.lista) this.contemLista = true;

      this.imports[field.tipo] = field.import || "";
      this.fields[field.tipo] = field.tipoPlural || "";

      if (field.tipo.includes("DadosCadastrais")) {
        this.criarDadosCadastraisComando(field);
        this.atualizarComando(field);
        this.criarDadosCadastraisEvento(field);
        this.criarEventos("Atualizado", field);
      } else {
        this.criarComando(field);
        this.atualizarComando(field);
        this.removerComando(field);
        this.criarEventos(!field.lista ? "Criado" : "Adicionado", field);
        this.criarEventos("Atualizado", field);
        this.criarEventos("Removido", field);
      }
    });

    this.criarEventDispatcher();
    this.criarAggregate();
    console.log(this.comandos);
    console.log(this.eventos);
  }

  private criarDadosCadastraisComando(field: Field) {
    const nome = "dadosCadastrais";
    const id = this.formatNameString(this.dono) + "Id";

    const className = `Criar${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import ${this.import}.${field.tipo};
    
public class ${className} {
      
    private String ${id};
    private ${field.tipo} ${nome};
      
    public ${className} (String ${id}, ${field.tipo} ${nome}) {
        this.${id} = ${id};
        this.${nome} = ${nome};
    }
    
    public String get${this.dono}Id(){
        return ${id};
    }

    public ${field.tipo} getDadosCadastrais(){
        return ${nome};
    }
}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private criarDadosCadastraisEvento(field: Field) {
    const nome = "dadosCadastrais";
    const id = this.formatNameString(this.dono) + "Id";

    const className = `${this.dono}CriadoEvent`;

    let str: string = `
package ${this.package}.event;

import ${this.import}.${field.tipo};
    
public class ${className} {
      
    private String ${id};
    private ${field.tipo} ${nome};
      
    public ${className} (String ${id} ,${field.tipo} ${nome}) {
        this.${id} = ${id};
        this.${nome} = ${nome};
    }
    
    public String get${this.dono}Id(){
        return ${id};
    }

    public ${field.tipo} getDadosCadastrais(){
        return ${nome};
    }
}`;

    this.eventos.push(className);
    this.write("event", str, className);
  }

  private criarComando(field: Field) {
    if (field.lista) {
      this.AdicionarTodosComando(field);
    }

    const importe = field.import || this.import;
    const nome = this.formatNameString(field.tipo);

    const className = `${field.lista ? "Adicionar" : "Criar"}${field.tipo}${
      this.dono
    }Command`;

    let str: string = `
package ${this.package}.command;

import ${importe}.${field.tipo};
    
public class ${className} {
      
    private ${field.tipo} ${nome};
      
    public ${className} (${field.tipo} ${nome}) {
        this.${nome} = ${nome};
    }
    
    public ${field.tipo} get${field.tipo}(){
        return ${nome};
    }
}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private AdicionarTodosComando(field: Field) {
    const importe = field.import || this.import;
    const tipoPlural = field.tipoPlural || this.formatPluralString(field.tipo);
    const plural = this.formatNameString(tipoPlural);

    const className = `Adicionar${tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import java.util.Collection;

import ${importe}.${field.tipo};
    
public class ${className} {
      
    private Collection<${field.tipo}> ${plural};
      
    public ${className} (Collection<${field.tipo}> ${plural}) {
        this.${plural} = ${plural};
    }
    
    public Collection<${field.tipo}> get${tipoPlural}(){
        return ${plural};
    }
}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private atualizarComando(field: Field) {
    if (field.lista) {
      this.AtualizarTodosComando(field);
    }

    const importe = field.import || this.import;
    const nome = field.tipo.includes("DadosCadastrais")
      ? "dadosCadastrais"
      : this.formatNameString(field.tipo);
    const className = `Atualizar${
      field.tipo.includes("DadosCadastrais")
        ? "DadosCadastrais"
        : field.tipo + this.dono
    }Command`;

    let str: string = `
package ${this.package}.command;

import ${importe}.${field.tipo};
    
public class ${className} {
      
    private int index;
    private ${field.tipo} ${nome};
      
    public ${className} (int index, ${field.tipo} ${nome}) {
        this.index = index;
        this.${nome} = ${nome};
    }
    
    public int getIndex(){
      return index;
    }

    public ${field.tipo} get${field.tipo}(){
        return ${nome};
    }
}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private AtualizarTodosComando(field: Field) {
    const importe = field.import || this.import;
    const tipoPlural = field.tipoPlural || this.formatPluralString(field.tipo);
    const plural = this.formatNameString(tipoPlural);

    const className = `Atualizar${tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

import java.util.Collection;

import ${importe}.${field.tipo};

public class ${className} {
  
    private Collection<${field.tipo}> ${plural};
  
    public ${className} (Collection<${field.tipo}> ${plural}) {
        this.${plural} = ${plural};
    }

    public Collection<${field.tipo}> get${tipoPlural}(){
        return ${plural};
    }
}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private removerComando(field: Field) {
    if (field.lista) {
      this.removerTodosComando(field);
    }

    const className = `Remover${field.tipo}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;
    
public class ${className} {
   ${
     field.lista
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

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private removerTodosComando(field: Field) {
    const tipoPlural = field.tipoPlural || this.formatPluralString(field.tipo);

    const className = `Remover${tipoPlural}${this.dono}Command`;

    let str: string = `
package ${this.package}.command;

public class ${className} {

    public ${className} () {}

}`;

    this.comandos.push(className);
    this.write("command", str, className);
  }

  private criarEventos(action: string, field: Field) {
    if (field.lista) {
      this.criarTodosEventos(action, field);
    }

    const importe = field.import || this.import;
    const nome = field.tipo.includes("DadosCadastrais")
      ? "dadosCadastrais"
      : this.formatNameString(field.tipo);
    const className = `${
      field.tipo.includes("DadosCadastrais") ? "DadosCadastrais" : field.tipo
    }${action}Event`;
    const id = this.formatNameString(this.dono) + "Id";

    let str: string = `
package ${this.package}.event;

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import ${importe}.${field.tipo};
    
public class ${className} {
      
    private String ${this.dono.toLocaleLowerCase()}Id;
    private ${field.tipo} ${nome};

    @JsonCreator
    @ConstructorProperties({ "${id}", "${nome}" })
    public ${className} (String ${this.dono.toLocaleLowerCase()}Id, ${
      field.tipo
    } ${nome}) {
        this.${id} = ${id};
        this.${nome} = ${nome};
    }

    public String get${this.dono}Id(){
      return ${id};
    }
    
    public ${field.tipo} get${field.tipo}(){
        return ${nome};
    }
}`;

    this.eventos.push(className);
    this.write("event", str, className);
  }

  public criarTodosEventos(action: string, field: Field) {
    const importe = field.import || this.import;
    const tipoPlural = field.tipoPlural || this.formatPluralString(field.tipo);
    const plural = this.formatNameString(tipoPlural);
    const id = this.formatNameString(this.dono) + "Id";

    const className = `${tipoPlural}${action}sEvent`;

    let str: string = `
package ${this.package}.event;

import java.beans.ConstructorProperties;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Collection;

import ${importe}.${field.tipo};
    
public class ${className} {
      
    private String ${id};
    private Collection<${field.tipo}> ${plural};
      
    @JsonCreator
    @ConstructorProperties({ "${id}", "${plural}" })
    public ${className} (String ${id}, Collection<${field.tipo}> ${plural}) {
        this.${id} = ${id};
        this.${plural} = ${plural};
    }

    public String get${this.dono}Id(){
      return ${id};
    }
    
    public Collection<${field.tipo}> get${tipoPlural}(){
        return ${plural};
    }
}`;

    this.eventos.push(className);
    this.write("event", str, className);
  }

  private criarEventDispatcher() {
    const className = `${this.dono}Dispatcher`;
    const aggregate = `${this.dono}Aggregate`;

    let eventos: string = "";

    this.eventos.forEach((evento, index) => {
      eventos += `\tpublic void notifyEvent(final ${evento} event) {}\n`;
      if (
        (evento.includes("RemovidoE") ||
          evento.includes("DadosCadastraisAtualizadoEvent")) &&
        this.eventos.length !== index + 1
      ) {
        eventos += "\n";
      }
    });

    let str: string = `
package ${this.package}.event;

import ${this.package}.aggregate.${aggregate};
    
public class ${className} {
      
    public ${className}() {}

    public static ${className} dispatcher(${aggregate} aggregate) {
        return new ${className}();
    }

${eventos}}`;

    this.write("event", str, className);
  }

  private criarAggregate() {
    const className = `${this.dono}Aggregate`;
    const classBuilder = `${this.dono}Builder`;
    const dispatcher = `${this.dono}Dispatcher`;
    const id = this.formatNameString(this.dono) + "Id";

    let comandos: string = "";

    this.comandos.forEach((comando) => {
      comandos += `import ${this.package}.command.${comando};\n`;
    });

    let eventos: string = "";

    this.eventos.forEach((evento) => {
      eventos += `import ${this.package}.event.${evento};\n`;
    });

    let models: string = "";

    Object.entries(this.imports).map((importe) => {
      if (!importe[1]) {
        models += `import ${this.import}.${importe[0]};\n`;
      } else {
        models += `import ${importe[1]}.${importe[0]};\n`;
      }
    });

    let fields: string = "";
    let fieldsBuilder: string = "";
    let fieldsBuilderMetodo: string = "";
    let constructorFields: string = "";
    let dadosCadastrais: string = "";
    let comandosMetodos: string = "";

    Object.entries(this.fields).map((field) => {
      if (!field[1] && !field[0].includes("DadosCadastrais")) {
        fields += this.fieldsAggregate(field[0]);

        fieldsBuilder += `\t\t\t\tprivate ${field[0]} ${this.formatNameString(
          field[0]
        )};\n`;

        fieldsBuilderMetodo += `\t\t\t\tpublic ${classBuilder} with${
          field[0]
        }(${field[0]} ${this.formatNameString(field[0])}) {
\t\t\t\t\t\tthis.${this.formatNameString(field[0])} = ${this.formatNameString(
          field[0]
        )};
        return this;
\t\t\t\t}\n\n`;

        constructorFields += `\t\t\t\t${this.formatNameString(
          field[0]
        )} = builder.${this.formatNameString(field[0])};\n`;

        comandosMetodos += this.criarMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0])
        );

        comandosMetodos += this.atualizarMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0])
        );

        comandosMetodos += this.removerMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0])
        );

        comandosMetodos += this.obterMetodoAggregate(
          field[0],
          this.formatNameString(field[0])
        );
      } else if (field[0].includes("DadosCadastrais")) {
        dadosCadastrais = field[0];

        fields += this.fieldDadosCadastraisAggregate(dadosCadastrais);

        fieldsBuilder += `\t\t\t\tprivate ${field[0]} dadosCadastrais;\n`;

        fieldsBuilderMetodo += `\t\t\t\tpublic ${classBuilder} withDadosCadastrais(${
          field[0]
        } ${this.formatNameString(field[0])}) {
\t\t\t\t\t\tthis.${this.formatNameString(field[0])} = ${this.formatNameString(
          field[0]
        )};
        return this;
\t\t\t\t}\n\n`;

        constructorFields += `\t\t\t\tdadosCadastrais = builder.dadosCadastrais;\n`;
      } else {
        fields += this.fieldsListaAggregate(
          field[0],
          this.formatNameString(field[1] as string)
        );

        fieldsBuilder += `\t\t\t\tprivate List<${
          field[0]
        }> ${this.formatNameString(
          field[1] as string
        )} = Collections.emptyList();\n`;

        fieldsBuilderMetodo += `\t\t\t\tpublic ${classBuilder} with${
          field[1]
        }(Collection<${field[0]}> ${this.formatNameString(
          field[1] as string
        )}) {
\t\t\t\t\t\tthis.${this.formatNameString(
          field[1] as string
        )} = new ArrayList<>(${this.formatNameString(field[1] as string)});
        return this;
\t\t\t\t}\n\n`;

        constructorFields += `\t\t\t\t${this.formatNameString(
          field[1] as string
        )} = builder.${this.formatNameString(field[1] as string)};\n`;

        comandosMetodos += this.adicionarMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          this.formatNameString(field[1] as string)
        );

        comandosMetodos += this.adicionarTodosMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          field[1] as string
        );

        comandosMetodos += this.atualizarItemMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          this.formatNameString(field[1] as string)
        );

        comandosMetodos += this.atualizarTodosMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          field[1] as string
        );

        comandosMetodos += this.removerItemMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          this.formatNameString(field[1] as string)
        );

        comandosMetodos += this.removerTodosMetodoAggregate(
          dispatcher,
          id,
          field[0],
          this.formatNameString(field[0]),
          field[1] as string
        );

        comandosMetodos += this.obterItemMetodoAggregate(
          field[0],
          this.formatNameString(field[1] as string)
        );

        comandosMetodos += this.obterTodosMetodoAggregate(
          field[0],
          field[1] as string
        );
      }
    });

    comandos = comandos.substring(0, comandos.length - 1);
    eventos = eventos.substring(0, eventos.length - 1);
    models = models.substring(0, models.length - 1);
    fields = fields.substring(4);
    comandosMetodos = comandosMetodos.substring(0, comandosMetodos.length - 1);

    let str: string = `
package ${this.package}.aggregate;
${
  !this.contemLista
    ? ""
    : `\nimport java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;\n`
}
${comandos}
${eventos}
import ${this.package}.event.${dispatcher};
${models}
import userviceframework.aggregate.AggregateRoot;
import userviceframework.aggregate.command.CommandHandler;

@AggregateRoot
public class ${className} {

    private String ${id};
    ${fields}
    public static class ${classBuilder} {

        private String ${id};
${fieldsBuilder}
        public ${classBuilder}() {}

        public ${classBuilder} with${this.dono}Id(String ${id}){
            this.${id} = ${id};
            return this;
        }

${fieldsBuilderMetodo}\t\t\t\tpublic ${className} build(){
            return new ${className}(this);
        }
    }

    public static ${classBuilder} builder() {
        return new ${classBuilder}();
    }

    public ${className}(${classBuilder} builder) {
        ${id} = builder.${id};
${constructorFields}
    }
    ${
      !dadosCadastrais
        ? ""
        : `
    @CommandHandler
    public static final ${className} criar${this.dono}(final Criar${this.dono}Command command) {
        return criar${this.dono}(command.get${this.dono}Id(), command.getDadosCadastrais());
    }
    
    public static final ${className} criar${this.dono}(final String ${id}, ${dadosCadastrais} dadosCadastrais) {
        ${className} aggregate = builder().with${this.dono}Id(${id}).withDadosCadastrais(dadosCadastrais).build(); 
        ${dispatcher}.dispatcher(aggregate).notifyEvent(new ${this.dono}CriadoEvent(${id}, dadosCadastrais));
        return aggregate;
    }
    
    @CommandHandler
    public void atualizarDadosCadastrais(final AtualizarDadosCadastraisCommand command) {
        atualizarDadosCadastrais(command.getDadosCadastrais());
    }
    
    public void atualizarDadosCadastrais(final ${dadosCadastrais} dadosCadastrais) {
        this.dadosCadastrais = dadosCadastrais;
        ${dispatcher}.dispatcher(this).notifyEvent(new DadosCadastraisAtualizadoEvent(${id}, dadosCadastrais));
    }
    
    public final ${dadosCadastrais} obterDadosCadastrais() {
        return dadosCadastrais;
    }`
    }
    
    public final String obter${this.dono}Id() {
        return ${id};
    }

${comandosMetodos}
}`;

    this.write("aggregate", str, className);
  }

  private fieldsAggregate(field: string): string {
    const nameField = this.formatNameString(field);

    let str = `
    private ${field} ${nameField};
`;

    return str.slice(1);
  }

  private fieldDadosCadastraisAggregate(field: string): string {
    let str = `
    private ${field} dadosCadastrais;
`;

    return str.slice(1);
  }

  private fieldsListaAggregate(field: string, nameField: string): string {
    let str = `
    private List<${field}> ${nameField} = Collections.emptyList();
`;

    return str.slice(1);
  }

  private criarMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string
  ): string {
    let str = `
    @CommandHandler
    public void criar${field}(Criar${field}${this.dono}Command command) {
      criar${field}(command.get${field}());
    }
    
    public void criar${field}(${field} ${fieldName}) {
      this.${fieldName} = ${fieldName};
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}CriadoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private adicionarMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    let str = `
    @CommandHandler
    public void adicionar${field}(Adicionar${field}${this.dono}Command command) {
      adicionar${field}(command.get${field}());
    }
    
    public void adicionar${field}(${field} ${fieldName}) {
      ${name}.add(${fieldName});
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}AdicionadoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private adicionarTodosMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    const nameVar = this.formatNameString(name);

    let str = `
    @CommandHandler
    public void adicionar${name}(Adicionar${name}${this.dono}Command command) {
      adicionar${name}(command.get${fieldName}());
    }
    
    public void adicionar${name}(Collection<${field}> ${nameVar}) {
      this.${nameVar}.addAll(${nameVar});
      ${dispatcher}.dispatcher(this).notifyEvent(new ${name}AdicionadosEvent(${id}, ${nameVar}));
    }\n\n`;

    return str.slice(1);
  }

  private atualizarMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string
  ): string {
    let str = `
    @CommandHandler
    public void atualizar${field}(Atualizar${field}${this.dono}Command command) {
      atualizar${field}(command.get${field}());
    }
    
    public void atualizar${field}(${field} ${fieldName}) {
      this.${fieldName} = ${fieldName};
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}AtualizadoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private atualizarItemMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    let str = `
    @CommandHandler
    public void atualizar${field}(Atualizar${field}${this.dono}Command command) {
      atualizar${field}(command.getIndex(), command.get${field}());
    }
    
    public void atualizar${field}(int index, ${field} ${fieldName}) {
      ${name}.set(index, ${fieldName});
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}AtualizadoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private atualizarTodosMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    const nameVar = this.formatNameString(name);

    let str = `
    @CommandHandler
    public void atualizar${name}(atualizar${name}${this.dono}Command command) {
      atualizar${name}(command.get${name}());
    }
    
    public void atualizar${name}(Collection<${field}> ${nameVar}) {
      this.${nameVar} = new ArrayList<>(${nameVar});
      ${dispatcher}.dispatcher(this).notifyEvent(new ${name}AtualizadosEvent(${id}, ${nameVar}));
    }\n\n`;

    return str.slice(1);
  }

  private removerMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string
  ): string {
    let str = `
    @CommandHandler
    public void remover${field}(Remover${field}${this.dono}Command command) {
      remover${field}();
    }
    
    public void remover${field}() {
      ${field} ${fieldName} = this.${fieldName};
      this.${fieldName} = null;
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}RemovidoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private removerItemMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    let str = `
    @CommandHandler
    public void remover${field}(Remover${field}${this.dono}Command command) {
      remover${field}(command.getIndex());
    }
    
    public void remover${field}(int index) {
      ${field} ${fieldName} = ${name}.remove(index);
      ${dispatcher}.dispatcher(this).notifyEvent(new ${field}RemovidoEvent(${id}, ${fieldName}));
    }\n\n`;

    return str.slice(1);
  }

  private removerTodosMetodoAggregate(
    dispatcher: string,
    id: string,
    field: string,
    fieldName: string,
    name: string
  ): string {
    const nameVar = this.formatNameString(name);

    let str = `
    @CommandHandler
    public void remover${name}(Remover${name}${this.dono}Command command) {
      remover${fieldName}();
    }
    
    public void remover${name}() {
      List<${field}> ${nameVar} = this.${nameVar};
      this.${nameVar} = new ArrayList<>();
      ${dispatcher}.dispatcher(this).notifyEvent(new ${name}RemovidosEvent(${id}, ${nameVar}));
    }\n\n`;

    return str.slice(1);
  }

  private obterMetodoAggregate(field: string, fieldName: string): string {
    let str = `
    public final ${field} get${field}() {
      return ${fieldName};
    }\n\n`;

    return str.slice(1);
  }

  private obterItemMetodoAggregate(field: string, name: string): string {
    let str = `
    public final ${field} get${field}(int index) {
      return ${name}.get(index);
    }\n\n`;

    return str.slice(1);
  }

  private obterTodosMetodoAggregate(field: string, name: string): string {
    const nameVar = this.formatNameString(name);

    let str = `
    public final List<${field}> get${name}() {
      return Collections.unmodifiableList(${nameVar});
    }\n\n`;

    return str.slice(1);
  }

  private write(local: string, str: string, className: string) {
    str = str.substring(1, str.length);

    fs.writeFile(
      `${this.path}/${local}/${className}.java`,
      str,
      function (err) {
        if (err) throw err;
        console.log(`arquivo ${className} foi criado com sucesso.`);
      }
    );
  }
}
