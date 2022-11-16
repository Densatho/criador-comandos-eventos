import Field from "./Field";

export default interface Component {
  dono: string;
  pacoteComponent: string;
  pacoteData?: string;
  import: string;
  fields: Field[];
}
