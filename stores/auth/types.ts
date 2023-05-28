export interface UserData {
  id: string,
  token: string,
  point: number,
}

export interface Setting {
  name?: string,
  fontSize?: 'small' | 'medium' | 'large',
  vision?: string,
  theme?: 'light' | 'dark' | 'default',
  isReady: boolean,
}
