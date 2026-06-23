import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_GAME_PROGRESS } from '@/shared/services/platform/defaults'
import { GameProgress } from '@/shared/services/platform/types'

export type ProgressState = GameProgress

const initialState: ProgressState = DEFAULT_GAME_PROGRESS

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    resetProgress: state => {
      state.completedLevels = [1]
      state.selectedLevelArcade = 1
      state.selectedLevel = 1
      state.userLevel = 1
      state.userLevelParams = {
        hp: 0,
        guard: 0,
        attack: 0,    
      }
      state.userScoreArcade = 0
      state.userScore = 0
      state.userCoins = 0
      state.userPotions = 0
      state.userParams = {
        hp: 100,
        guard: 1,
        attack: 1,
      }
      state.userInventory = [
        {
          id: 0,
          type: 'helmet',
          name: 'Шлем астронавта',
          desc: 'Обеспечивает базовую защиту.',
          price: 0,
          organs: [],
          hp: 5,
          isPaid: false,
          isDressed: true
        },
        {
          id: 0,
          type: 'plastron',
          name: 'Скафандр астронавта',
          desc: 'Обеспечивает базовую защиту.',
          price: 0,
          organs: [],
          hp: 5,
          isPaid: false,
          isDressed: true
        },
      ]
      state.userOrgans = {
        0: { id: 0, name: 'Болт от ПС-91', count: 0 },
        1: { id: 1, name: 'Камень щитомордника', count: 0 },
        2: { id: 2, name: 'Кость литора', count: 0 },
        3: { id: 3, name: 'Хромовая пластина', count: 0 },
        4: { id: 4, name: 'Ткань меркиля', count: 0 },
        5: { id: 5, name: 'Перья титуса', count: 0 },
        6: { id: 6, name: 'Тентакля севы', count: 0 },
      }
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
