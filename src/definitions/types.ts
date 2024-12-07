export interface Node {
    id: string;
    label: string;
    value: number;
    variance?: number;
    children?: Node[];
  }

export interface ButtonProps {
    name: string;
    onClick: () => void
}