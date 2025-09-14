import type { TransitionProps } from 'vue'
import style from '@/assets/scss/base.module.scss'

export const baseVueTransitionProps = {
  enterFromClass: '',
  enterActiveClass: '',
  enterToClass: '',
  appearFromClass: '',
  appearActiveClass: '',
  appearToClass: '',
  leaveFromClass: '',
  leaveActiveClass: '',
  leaveToClass: '',
}

export const fadeVueTransitionProps: TransitionProps = {
  ...baseVueTransitionProps,
  enterFromClass: style.fadeEnterFrom,
  enterActiveClass: style.fadeEnterActive,
  leaveActiveClass: style.fadeLeaveActive,
  leaveToClass: style.fadeLeaveTo,
}
