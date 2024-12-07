import { ButtonProps } from "../definitions/types";

export default function Button({name, onClick} : ButtonProps) {
  return <button onClick={onClick}>{name}</button>
}
