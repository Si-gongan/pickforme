interface IMySectionItem {
  name: string;
  onPress?(): void;
}

export interface IMySectionProps {
  title?: string;
  items: IMySectionItem[];
}
