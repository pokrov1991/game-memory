export enum TypeModal {
  Lose = 'lose',
  Win = 'win',
  Exit = 'exit',
}

export type TModal = {
  isOpened: boolean
  type: TypeModal
}

export type TModalAction = TModal & {
  levelName?: string,
  level?: number,
  title?: string | number,
  subtitle?: string | number,
  info?: string,
  onContinue(e?: React.MouseEvent<HTMLButtonElement>): void,
  onExit?(): void
}

export type TModalNonType = Omit<TModalAction, 'type'>
