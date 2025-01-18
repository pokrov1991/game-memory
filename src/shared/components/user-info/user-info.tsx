import styles from './styles.module.css'
import { Defs } from './defs'
import { TUser } from '@/types'
import { MouseEventHandler } from 'react'
import { useUser } from '@/shared/contexts/UserContext'
import YandexSDK from '@/shared/services/sdk/yandexSdk';

const UserName = (user: TUser) => {
  return (
    <>
      <tspan x="15%" y="35%">
        {user?.name}
      </tspan>
    </>
  )
}
const EnterButton = (
  handleEnter: MouseEventHandler<SVGTSpanElement> | undefined
) => {
  return (
    <>
      <tspan x="15%" y="35%" onClick={handleEnter} className={styles.link}>
        Войти
      </tspan>
    </>
  )
}

const SubTitleAuth = () => {
  return (
    <>
      <tspan x="15%" y="65%">
        Приветствую путник!
      </tspan>
    </>
  )
}
const SubTitleGuest = (
  handleEnter: MouseEventHandler<SVGTSpanElement>
) => {
  return (
    <>
      <tspan x="15%" y="65%">
        <tspan fill="#B0F2FF" onClick={handleEnter} className={styles.link}>
          Войдите в аккаунт
        </tspan>{' '}
        что бы сохранить свой прогресс
      </tspan>
    </>
  )
}

export const UserInfo = () => {
  const { user, setUser, setGame  } = useUser();
  const isAuth = user !== null && user.mode !== 'lite';

  const handleEnter = () => YandexSDK.authUser().then((res) => {
    setUser(res.user)
    setGame(res.game)
  });

  return (
    <svg className={styles.user} width="1038" height="267" fill="none" viewBox="0 0 1038 267">
      <path
        fill="url(#paint0_linear_17_698)"
        fillRule="evenodd"
        d="M137 132.98h901v1H137v-1z"
        clipRule="evenodd"></path>
      <g filter="url(#filter0_d_17_698)">
        <path
          stroke="#01CBFD"
          strokeLinejoin="round"
          d="M78.815 82.284H151.214V154.683H78.815z"
          shapeRendering="crispEdges"
          transform="rotate(45 78.815 82.284)"></path>
      </g>
      <g filter="url(#filter1_d_17_698)">
        <path
          stroke="#01CBFD"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M129.108 141.89l8.446-8.446-8.446-8.446"></path>
      </g>
      <g filter="url(#filter2_d_17_698)">
        <path
          stroke="#01CBFD"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M27.014 141.924l-8.446-8.446 8.445-8.446"></path>
      </g>
      <g filter="url(#filter3_di_17_698)">
        <path
          fill="url(#imageAvatar)" 
          d="M78.849 92.915H134.573V148.639H78.849z"
          transform="rotate(45 78.85 92.915)"></path>
      </g>
      <g filter="url(#filter4_if_17_698)">
        <path
          fill="url(#paint1_linear_17_698)"
          fillRule="evenodd"
          d="M4.16 134.351a1.001 1.001 0 010-1.415L134.257 2.839a.868.868 0 00-1.227-1.226L1.707 132.936a1 1 0 000 1.415L133.03 265.674a.87.87 0 001.227 0 .87.87 0 000-1.227L4.16 134.351z"
          clipRule="evenodd"></path>
      </g>
      <g filter="url(#filter5_i_17_698)">
        <path
          fill="url(#paint2_linear_17_698)"
          d="M8.416 134.35l128.863 128.864c.63.629 1.707.183 1.707-.708V4.78c0-.89-1.077-1.337-1.707-.707L8.416 132.936a1 1 0 000 1.414z"></path>
      </g>
      <g>
        <text x="50%" y="50%" fontSize={32} fill="#B0F2FF">
          {isAuth ? UserName(user) : EnterButton(handleEnter)}
        </text>
      </g>
      <g>
        <text x="50%" y="80%" fontSize={22} fill="#05C3FF">
          {isAuth ? SubTitleAuth() : SubTitleGuest(handleEnter)}
        </text>
      </g>
      <Defs avatar={user?.avatar} />
    </svg>
  )
}
