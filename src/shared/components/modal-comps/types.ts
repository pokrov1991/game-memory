import { ReactNode } from "react";

export enum TypeModal {
  Lose = 'lose',
  Win = 'win',
  Exit = 'exit',
}

export type TModal = {
  isOpened: boolean
  type: TypeModal,
  className?: string,
}

export type TModalAction = TModal & {
  levelName?: string | ReactNode,
  level?: number,
  title?: string | number,
  subtitle?: string | number,
  info?: string | JSX.Element,
  buttonSuccess?: string,
  buttonCancel?: string,
  isButtonCancel?: boolean,
  onContinue(e?: React.MouseEvent<HTMLButtonElement>): void,
  onExit?(): void
}

export type TModalNonType = Omit<TModalAction, 'type'>
