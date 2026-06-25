import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createDefaultGameProgress } from '@/shared/services/platform/defaults'
import { GameProgress } from '@/shared/services/platform/types'

export type ProgressState = GameProgress

const initialState: ProgressState = createDefaultGameProgress()

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    resetProgress: state => {
      return createDefaultGameProgress()
    },
    setProgress: (state, action: PayloadAction<ProgressState>) => {
      return { ...state, ...action.payload }
    },
    completeLevel: (state, action: PayloadAction<number>) => {
      state.completedLevels.push(action.payload)
    },
    selectLevelArcade: (state, action: PayloadAction<number>) => {
      state.selectedLevelArcade = action.payload
    },
    selectLevel: (state, action: PayloadAction<number>) => {
      state.selectedLevel = action.payload
    },
    levelUp: (state, action: PayloadAction<number>) => {
      state.userLevel = action.payload
    },
    levelParamsUp: (state, action: PayloadAction<{ hp: number; guard: number; attack: number }>) => {
      const { hp, guard, attack } = action.payload
      state.userLevelParams.hp = hp
      state.userLevelParams.guard = guard
      state.userLevelParams.attack = attack
    },
    scoreArcadeUp: (state, action: PayloadAction<number>) => {
      state.userScoreArcade = action.payload
    },
    scoreUp: (state, action: PayloadAction<number>) => {
      state.userScore = action.payload
    },
    coinsUp: (state, action: PayloadAction<number>) => {
      state.userCoins = action.payload
    },
    potionsUp: (state, action: PayloadAction<number>) => {
      state.userPotions = action.payload
    },
    paramsUp: (state, action: PayloadAction<{ hp: number; guard: number; attack: number }>) => {
      const { hp, guard, attack } = action.payload
      state.userParams.hp = hp
      state.userParams.guard = guard
      state.userParams.attack = attack
    },
    updateInventory: (state, action: PayloadAction<Array<{ id: number; type: string; name: string; desc: string; price: number; organs: Array<{ id: number; name: string; count: number }>; hp: number; isPaid: boolean; isDressed: boolean }>>) => {
      state.userInventory = action.payload
    },
    updateOrgan: (state, action: PayloadAction<{ organId: number; count: number }>) => {
      const { organId, count } = action.payload
      if (state.userOrgans[organId]) {
        state.userOrgans[organId].count = count
      }
    },
  },
})

export const { 
  resetProgress, 
  setProgress,
  completeLevel,
  selectLevelArcade,
  selectLevel, 
  levelUp,
  levelParamsUp,
  scoreArcadeUp,
  scoreUp, 
  coinsUp, 
  potionsUp, 
  paramsUp, 
  updateInventory, 
  updateOrgan 
} = progressSlice.actions
