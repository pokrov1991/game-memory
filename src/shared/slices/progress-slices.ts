import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProgressState {
  completedLevels: number[]
  selectedLevel: number
  userLevel: number
  userScore: number
  userCoins: number
  userPotions: number
  userParams: {
    hp: number
    guard: number
    attack: number
  };
  userInventory: Array<{
    id: number;
    type: string;
    name: string;
    desc: string;
    price: number;
    organs: Array<{ id: number; name: string; count: number }>;
    hp: number;
    isPaid: boolean;
    isDressed: boolean;
  }>;
  userOrgans: {
    [key: number]: {
      name: string
      count: number
    };
  };
}

const initialState: ProgressState = {
  completedLevels: [1],
  selectedLevel: 1,
  userLevel: 1,
  userScore: 0,
  userCoins: 0,
  userPotions: 0,
  userParams: {
    hp: 100,
    guard: 1,
    attack: 1,
  },
  userInventory: [
    {
      id: 1,
      type: 'helmet',
      name: 'Шлем астронавта',
      desc: 'Обеспечивает базовую защиту.',
      price: 0,
      organs: [],
      hp: 0,
      isPaid: true,
      isDressed: true
    },
    {
      id: 2,
      type: 'plastron',
      name: 'Скафандр астронавта',
      desc: 'Обеспечивает базовую защиту.',
      price: 0,
      organs: [],
      hp: 0,
      isPaid: true,
      isDressed: true
    },
  ],
  userOrgans: {
    1: { name: 'Зуб щитомордника', count: 0 },
    2: { name: 'Шкура голема', count: 0 }
  },
}

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    resetProgress: state => {
      state.completedLevels = [1]
      state.selectedLevel = 1
      state.userLevel = 1
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
        1: { name: 'Зуб щитомордника', count: 0 },
        2: { name: 'Шкура голема', count: 0 }
      }
    },
    setProgress: (state, action: PayloadAction<ProgressState>) => {
      return { ...state, ...action.payload }
    },
    completeLevel: (state, action: PayloadAction<number>) => {
      state.completedLevels.push(action.payload)
    },
    selectLevel: (state, action: PayloadAction<number>) => {
      state.selectedLevel = action.payload
    },
    levelUp: (state, action: PayloadAction<number>) => {
      state.userLevel = action.payload
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
  selectLevel, 
  levelUp, 
  scoreUp, 
  coinsUp, 
  potionsUp, 
  paramsUp, 
  updateInventory, 
  updateOrgan 
} = progressSlice.actions
