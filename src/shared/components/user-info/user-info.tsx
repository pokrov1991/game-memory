import styles from './styles.module.css'
import { useNavigate } from 'react-router-dom'
import { Defs } from './defs'
import { useLogOutMutation } from '@/shared/slices'
import { TUserTemp } from '@/types'
import { MouseEventHandler } from 'react'
import { isBrowser } from '@/shared/utils/entry-server'
import { useUser } from '../../contexts/UserContext'

const Fullname = (currentData: TUserTemp) => {
  return (
    <>
      <tspan x="15%" y="35%">
        {currentData?.name}
      </tspan>
    </>
  )
}
const EnterButton = (
  handleEnter: MouseEventHandler<SVGTSpanElement> | undefined
) => {
  return (
    <>
      <tspan x="15%" y="35%" onClick={handleEnter} className={styles.edit}>
        Войти
      </tspan>
    </>
  )
}
const EditButton = (
  handleRedirectClick: MouseEventHandler<SVGTSpanElement>
) => {
  return (
    <>
      <g
        transform="translate(155,140)"
        className={styles.edit}
        onClick={handleRedirectClick}
        width={200}
        height={200}>
        <path
          d="M20.4314 24L21.2157 23.2222L22 22.4444L17.2941 15.4444H15.3333V14.2778H13.7647L14.9412 3H3.17647L2 13.1111H9.05882L9.84314 7.66667H7.4902L7.09804 10.3889H5.13725L5.52941 6.11111H11.8039L10.6275 17H13.7647V17.7778H15.3333L20.4314 24Z"
          fill="#02CBFD"
        />
        <g filter="url(#filter0_d_265_20)">
          <path
            d="M35.6709 14.8662H32.2549V13.1797H35.6709C36.3154 13.1797 36.8346 13.0508 37.2285 12.793C37.6296 12.5352 37.9196 12.1771 38.0986 11.7188C38.2848 11.2604 38.3779 10.7376 38.3779 10.1504C38.3779 9.61328 38.2848 9.1084 38.0986 8.63574C37.9196 8.16309 37.6296 7.78353 37.2285 7.49707C36.8346 7.20345 36.3154 7.05664 35.6709 7.05664H32.6631V21H30.6865V5.35938H35.6709C36.6807 5.35938 37.5329 5.56348 38.2275 5.97168C38.9222 6.37988 39.4486 6.94564 39.8066 7.66895C40.1719 8.38509 40.3545 9.20508 40.3545 10.1289C40.3545 11.1315 40.1719 11.9873 39.8066 12.6963C39.4486 13.4053 38.9222 13.946 38.2275 14.3184C37.5329 14.6836 36.6807 14.8662 35.6709 14.8662ZM47.0787 21.2148C46.384 21.2148 45.7574 21.111 45.1988 20.9033C44.6402 20.6956 44.164 20.3805 43.7701 19.958C43.3762 19.5283 43.0754 18.9876 42.8677 18.3359C42.6601 17.6842 42.5562 16.9144 42.5562 16.0264V14.7158C42.5562 13.6917 42.6744 12.8252 42.9107 12.1162C43.1542 11.4072 43.48 10.8379 43.8882 10.4082C44.2964 9.97135 44.7584 9.65625 45.274 9.46289C45.7896 9.26237 46.3196 9.16211 46.8638 9.16211C47.5943 9.16211 48.2173 9.28027 48.733 9.5166C49.2486 9.75293 49.6675 10.1038 49.9898 10.5693C50.3121 11.0348 50.5484 11.6077 50.6988 12.2881C50.8563 12.9684 50.9351 13.7526 50.9351 14.6406V15.7471H43.6734V14.125H49.0337V13.8564C49.0051 13.2549 48.9227 12.7249 48.7867 12.2666C48.6578 11.8083 48.4429 11.4502 48.1421 11.1924C47.8414 10.9274 47.4153 10.7949 46.8638 10.7949C46.5129 10.7949 46.1871 10.8558 45.8863 10.9775C45.5927 11.0921 45.3384 11.2962 45.1236 11.5898C44.9159 11.8763 44.7512 12.2738 44.6295 12.7822C44.5149 13.2907 44.4576 13.9352 44.4576 14.7158V16.0264C44.4576 16.6494 44.5149 17.1865 44.6295 17.6377C44.7512 18.0817 44.9267 18.4505 45.1558 18.7441C45.3921 19.0306 45.6786 19.2454 46.0152 19.3887C46.3589 19.5247 46.7492 19.5928 47.1861 19.5928C47.8235 19.5928 48.3498 19.471 48.7652 19.2275C49.1806 18.9769 49.5422 18.6582 49.8502 18.2715L50.8492 19.4639C50.6415 19.7575 50.3694 20.0404 50.0328 20.3125C49.7033 20.5775 49.2951 20.7959 48.8082 20.9678C48.3283 21.1325 47.7518 21.2148 47.0787 21.2148ZM55.4464 9.37695H57.3478L57.2081 13.7275C57.1723 14.8304 57.0649 15.7829 56.8859 16.585C56.7068 17.387 56.4777 18.071 56.1984 18.6367C55.9191 19.1953 55.604 19.6644 55.253 20.0439C54.9021 20.4235 54.5369 20.7422 54.1573 21H53.2335L53.2765 19.3779L53.6525 19.3672C53.8601 19.0879 54.0571 18.8014 54.2433 18.5078C54.4295 18.207 54.5978 17.8525 54.7482 17.4443C54.8986 17.029 55.0203 16.5241 55.1134 15.9297C55.2137 15.3281 55.2781 14.5941 55.3068 13.7275L55.4464 9.37695ZM55.8868 9.37695H61.9347V21H60.0333V11.2139H55.8868V9.37695ZM52.8683 19.3672H63.2882V24.4268H61.3868V21H54.7696V24.4268H52.8575L52.8683 19.3672ZM71.6022 19.0127V12.707C71.6022 12.2487 71.5306 11.8799 71.3874 11.6006C71.2513 11.3213 71.0436 11.1172 70.7643 10.9883C70.4922 10.8594 70.1485 10.7949 69.7331 10.7949C69.332 10.7949 68.9847 10.8773 68.6911 11.042C68.4046 11.2067 68.1826 11.4251 68.0251 11.6973C67.8747 11.9694 67.7995 12.2702 67.7995 12.5996H65.8981C65.8981 12.1842 65.9876 11.7725 66.1667 11.3643C66.3529 10.9561 66.6179 10.5872 66.9616 10.2578C67.3054 9.92122 67.7171 9.65625 68.197 9.46289C68.6839 9.26237 69.2282 9.16211 69.8298 9.16211C70.5459 9.16211 71.1797 9.28027 71.7311 9.5166C72.2826 9.74577 72.7158 10.1217 73.0309 10.6445C73.346 11.1673 73.5036 11.862 73.5036 12.7285V18.4648C73.5036 18.8516 73.5322 19.2633 73.5895 19.7002C73.654 20.137 73.7435 20.513 73.8581 20.8281V21H71.8923C71.7992 20.7708 71.7276 20.4665 71.6774 20.0869C71.6273 19.7002 71.6022 19.3421 71.6022 19.0127ZM71.903 13.9531L71.9245 15.3496H70.6032C70.152 15.3496 69.7402 15.3997 69.3679 15.5C69.0026 15.6003 68.6875 15.7471 68.4225 15.9404C68.1576 16.1266 67.9535 16.3594 67.8102 16.6387C67.6742 16.918 67.6061 17.2367 67.6061 17.5947C67.6061 18.0602 67.6706 18.4326 67.7995 18.7119C67.9284 18.984 68.1218 19.181 68.3796 19.3027C68.6374 19.4245 68.9632 19.4854 69.3571 19.4854C69.8369 19.4854 70.2595 19.3743 70.6247 19.1523C70.9899 18.9303 71.2728 18.6618 71.4733 18.3467C71.681 18.0316 71.7777 17.738 71.7634 17.4658L72.1823 18.3574C72.1537 18.6367 72.0606 18.9411 71.903 19.2705C71.7526 19.5928 71.5414 19.9043 71.2692 20.2051C70.9971 20.4987 70.6748 20.7422 70.3024 20.9355C69.9372 21.1217 69.5254 21.2148 69.0671 21.2148C68.3939 21.2148 67.8031 21.0859 67.2946 20.8281C66.7933 20.5703 66.403 20.1908 66.1237 19.6895C65.8444 19.1882 65.7048 18.5687 65.7048 17.8311C65.7048 17.2725 65.8014 16.7568 65.9948 16.2842C66.1882 15.8115 66.4746 15.4033 66.8542 15.0596C67.2337 14.7087 67.71 14.4365 68.2829 14.2432C68.863 14.0498 69.5326 13.9531 70.2917 13.9531H71.903ZM78.9709 9.37695V21H77.0696V9.37695H78.9709ZM85.3625 9.37695L80.6897 16.0371H78.3371L78.0364 14.2969H79.9162L83.0852 9.37695H85.3625ZM83.2571 21L79.8518 15.7363L81.0657 14.2969L85.6418 21H83.2571ZM92.0867 9.37695V21H90.1854V9.37695H92.0867ZM95.2557 9.37695V10.9883H87.0594V9.37695H95.2557ZM99.7777 17.8525L103.989 9.37695H105.89V21H103.989V12.5244L99.7777 21H97.8871V9.37695H99.7777V17.8525ZM111.271 11.6113V25.4688H109.37V9.37695H111.1L111.271 11.6113ZM117.77 14.6621V15.7471C117.77 16.6637 117.684 17.4658 117.513 18.1533C117.348 18.8337 117.101 19.403 116.771 19.8613C116.449 20.3125 116.052 20.6527 115.579 20.8818C115.106 21.1038 114.566 21.2148 113.957 21.2148C113.348 21.2148 112.818 21.1003 112.367 20.8711C111.923 20.6348 111.547 20.2946 111.239 19.8506C110.938 19.4066 110.698 18.873 110.519 18.25C110.348 17.6198 110.229 16.9144 110.165 16.1338V14.4795C110.229 13.6559 110.348 12.9183 110.519 12.2666C110.691 11.6077 110.928 11.0492 111.228 10.5908C111.536 10.1253 111.912 9.77083 112.356 9.52734C112.808 9.28385 113.334 9.16211 113.935 9.16211C114.559 9.16211 115.106 9.26953 115.579 9.48438C116.059 9.69922 116.46 10.0322 116.782 10.4834C117.112 10.9274 117.359 11.4967 117.523 12.1914C117.688 12.8789 117.77 13.7025 117.77 14.6621ZM115.869 15.7471V14.6621C115.869 14.0176 115.819 13.4554 115.719 12.9756C115.626 12.4958 115.475 12.0983 115.268 11.7832C115.06 11.4681 114.798 11.2318 114.483 11.0742C114.168 10.9167 113.789 10.8379 113.345 10.8379C112.965 10.8379 112.629 10.9167 112.335 11.0742C112.048 11.2318 111.801 11.4466 111.594 11.7188C111.386 11.9837 111.214 12.2881 111.078 12.6318C110.942 12.9684 110.842 13.3193 110.777 13.6846V16.9395C110.899 17.3978 111.06 17.8311 111.261 18.2393C111.461 18.6403 111.73 18.9661 112.066 19.2168C112.41 19.4674 112.843 19.5928 113.366 19.5928C113.803 19.5928 114.179 19.514 114.494 19.3564C114.809 19.1989 115.067 18.9626 115.268 18.6475C115.475 18.3252 115.626 17.9242 115.719 17.4443C115.819 16.9574 115.869 16.3916 115.869 15.7471ZM120.262 15.7471V14.6406C120.262 13.7383 120.377 12.9469 120.606 12.2666C120.835 11.5791 121.154 11.0062 121.562 10.5479C121.97 10.0895 122.446 9.74577 122.991 9.5166C123.535 9.28027 124.119 9.16211 124.742 9.16211C125.379 9.16211 125.97 9.28027 126.514 9.5166C127.058 9.74577 127.535 10.0895 127.943 10.5479C128.358 11.0062 128.68 11.5791 128.91 12.2666C129.139 12.9469 129.253 13.7383 129.253 14.6406V15.7471C129.253 16.6494 129.139 17.4443 128.91 18.1318C128.68 18.8122 128.362 19.3815 127.954 19.8398C127.545 20.2982 127.069 20.6419 126.525 20.8711C125.981 21.1003 125.393 21.2148 124.763 21.2148C124.133 21.2148 123.546 21.1003 123.001 20.8711C122.457 20.6419 121.977 20.2982 121.562 19.8398C121.154 19.3815 120.835 18.8122 120.606 18.1318C120.377 17.4443 120.262 16.6494 120.262 15.7471ZM122.164 14.6406V15.7471C122.164 16.3844 122.228 16.943 122.357 17.4229C122.486 17.9027 122.668 18.3037 122.905 18.626C123.141 18.9482 123.417 19.1917 123.732 19.3564C124.047 19.514 124.391 19.5928 124.763 19.5928C125.193 19.5928 125.569 19.514 125.891 19.3564C126.221 19.1917 126.493 18.9482 126.707 18.626C126.922 18.3037 127.083 17.9027 127.191 17.4229C127.298 16.943 127.352 16.3844 127.352 15.7471V14.6406C127.352 14.0033 127.288 13.4482 127.159 12.9756C127.03 12.4958 126.847 12.0947 126.611 11.7725C126.374 11.443 126.095 11.1995 125.773 11.042C125.458 10.8773 125.114 10.7949 124.742 10.7949C124.376 10.7949 124.036 10.8773 123.721 11.042C123.406 11.1995 123.13 11.443 122.894 11.7725C122.665 12.0947 122.486 12.4958 122.357 12.9756C122.228 13.4482 122.164 14.0033 122.164 14.6406ZM136.826 15.8867H133.722L133.7 14.2969H136.192C136.687 14.2969 137.095 14.236 137.417 14.1143C137.746 13.9925 137.994 13.8099 138.158 13.5664C138.323 13.3229 138.405 13.0221 138.405 12.6641C138.405 12.3848 138.359 12.1413 138.266 11.9336C138.173 11.7188 138.033 11.5433 137.847 11.4072C137.668 11.264 137.442 11.1602 137.17 11.0957C136.898 11.0241 136.579 10.9883 136.214 10.9883H134.205V21H132.314V9.37695H136.214C136.844 9.37695 137.41 9.44141 137.911 9.57031C138.42 9.69922 138.849 9.89616 139.2 10.1611C139.558 10.4189 139.83 10.7484 140.017 11.1494C140.21 11.5505 140.307 12.0231 140.307 12.5674C140.307 12.9183 140.246 13.2513 140.124 13.5664C140.002 13.8815 139.82 14.1608 139.576 14.4043C139.34 14.6478 139.046 14.8483 138.695 15.0059C138.344 15.1562 137.94 15.2529 137.481 15.2959L136.826 15.8867ZM136.826 21H133.013L133.99 19.3887H136.826C137.263 19.3887 137.621 19.3206 137.9 19.1846C138.18 19.0413 138.387 18.8408 138.523 18.583C138.667 18.318 138.738 18.0029 138.738 17.6377C138.738 17.2725 138.667 16.9609 138.523 16.7031C138.387 16.4382 138.18 16.2376 137.9 16.1016C137.621 15.9583 137.263 15.8867 136.826 15.8867H134.28L134.302 14.2969H137.449L138.115 14.8984C138.667 14.9486 139.129 15.1061 139.501 15.3711C139.881 15.6361 140.163 15.9727 140.35 16.3809C140.543 16.7819 140.64 17.2188 140.64 17.6914C140.64 18.2357 140.554 18.7155 140.382 19.1309C140.21 19.5462 139.959 19.8936 139.63 20.1729C139.3 20.445 138.899 20.6527 138.427 20.7959C137.954 20.932 137.421 21 136.826 21ZM149.362 19.0127V12.707C149.362 12.2487 149.29 11.8799 149.147 11.6006C149.011 11.3213 148.803 11.1172 148.524 10.9883C148.252 10.8594 147.908 10.7949 147.493 10.7949C147.092 10.7949 146.744 10.8773 146.451 11.042C146.164 11.2067 145.942 11.4251 145.785 11.6973C145.634 11.9694 145.559 12.2702 145.559 12.5996H143.658C143.658 12.1842 143.747 11.7725 143.926 11.3643C144.113 10.9561 144.378 10.5872 144.721 10.2578C145.065 9.92122 145.477 9.65625 145.957 9.46289C146.444 9.26237 146.988 9.16211 147.589 9.16211C148.306 9.16211 148.939 9.28027 149.491 9.5166C150.042 9.74577 150.476 10.1217 150.791 10.6445C151.106 11.1673 151.263 11.862 151.263 12.7285V18.4648C151.263 18.8516 151.292 19.2633 151.349 19.7002C151.414 20.137 151.503 20.513 151.618 20.8281V21H149.652C149.559 20.7708 149.487 20.4665 149.437 20.0869C149.387 19.7002 149.362 19.3421 149.362 19.0127ZM149.663 13.9531L149.684 15.3496H148.363C147.912 15.3496 147.5 15.3997 147.128 15.5C146.762 15.6003 146.447 15.7471 146.182 15.9404C145.917 16.1266 145.713 16.3594 145.57 16.6387C145.434 16.918 145.366 17.2367 145.366 17.5947C145.366 18.0602 145.43 18.4326 145.559 18.7119C145.688 18.984 145.881 19.181 146.139 19.3027C146.397 19.4245 146.723 19.4854 147.117 19.4854C147.597 19.4854 148.019 19.3743 148.384 19.1523C148.75 18.9303 149.032 18.6618 149.233 18.3467C149.441 18.0316 149.537 17.738 149.523 17.4658L149.942 18.3574C149.913 18.6367 149.82 18.9411 149.663 19.2705C149.512 19.5928 149.301 19.9043 149.029 20.2051C148.757 20.4987 148.435 20.7422 148.062 20.9355C147.697 21.1217 147.285 21.2148 146.827 21.2148C146.154 21.2148 145.563 21.0859 145.054 20.8281C144.553 20.5703 144.163 20.1908 143.883 19.6895C143.604 19.1882 143.464 18.5687 143.464 17.8311C143.464 17.2725 143.561 16.7568 143.754 16.2842C143.948 15.8115 144.234 15.4033 144.614 15.0596C144.993 14.7087 145.47 14.4365 146.043 14.2432C146.623 14.0498 147.292 13.9531 148.051 13.9531H149.663ZM158.664 9.37695V21H156.763V9.37695H158.664ZM161.833 9.37695V10.9883H153.637V9.37695H161.833ZM165.883 13.373H168.718C169.521 13.373 170.194 13.5378 170.738 13.8672C171.282 14.1895 171.694 14.637 171.973 15.21C172.253 15.7757 172.392 16.4202 172.392 17.1436C172.392 17.6807 172.314 18.1855 172.156 18.6582C171.998 19.1237 171.762 19.5319 171.447 19.8828C171.139 20.2337 170.756 20.5094 170.298 20.71C169.846 20.9033 169.32 21 168.718 21H164.465V9.37695H166.355V19.3672H168.718C169.162 19.3672 169.513 19.2633 169.771 19.0557C170.029 18.848 170.212 18.5794 170.319 18.25C170.434 17.9206 170.491 17.5768 170.491 17.2188C170.491 16.8678 170.434 16.5241 170.319 16.1875C170.212 15.8509 170.029 15.5716 169.771 15.3496C169.513 15.1204 169.162 15.0059 168.718 15.0059H165.883V13.373Z"
            fill="white"
          />
        </g>
      </g>
    </>
  )
}
const LogoutButton = (handleExit: MouseEventHandler<SVGTSpanElement>) => {
  return (
    <>
      <tspan x="15%" y="70%">
        Если вы хотите сменить аккаунт,
        <tspan fill="#B0F2FF" onClick={handleExit} className={styles.edit}>
          выйдите
        </tspan>{' '}
        из текущего
      </tspan>
    </>
  )
}
const EnterRegisterButton = (
  handleEnter: MouseEventHandler<SVGTSpanElement>,
  handleRegister: MouseEventHandler<SVGTSpanElement>
) => {
  return (
    <>
      <tspan x="15%" y="70%">
        <tspan fill="#B0F2FF" onClick={handleEnter} className={styles.edit}>
          Войдите
        </tspan>{' '}
        в аккаунт или{' '}
        <tspan fill="#B0F2FF" onClick={handleRegister} className={styles.edit}>
          создайте
        </tspan>{' '}
        его
      </tspan>
    </>
  )
}

export const UserInfo = () => {
  const navigate = useNavigate()
  const [logOut] = useLogOutMutation()
  const { user } = useUser();

  const handleRedirectClick = () => navigate('/profile')
  const handleExit = () =>
    logOut('').then(() => isBrowser && window.location.reload())
  const handleEnter = () => navigate('/sign-in')
  const handleRegister = () => navigate('/sign-up')

  return (
    <svg width="1038" height="267" fill="none" viewBox="0 0 1038 267">
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
          fill="#010302"
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
          {user === undefined
            ? EnterButton(handleEnter)
            : Fullname(user)}
        </text>
      </g>
      {user !== undefined ? EditButton(handleRedirectClick) : null}
      <g>
        <text x="50%" y="80%" fontSize={18} fill="#05C3FF">
          {user === undefined
            ? EnterRegisterButton(handleEnter, handleRegister)
            : LogoutButton(handleExit)}
        </text>
      </g>
      <Defs />
    </svg>
  )
}
