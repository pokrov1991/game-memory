import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/app/store'
import {
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
  updateOrgan,
} from '@/shared/slices'

export const useProgress = () => {
  const dispatch = useDispatch<AppDispatch>()

  const progress = useSelector((state: RootState) => state.progress)
  const completedLevels = useSelector((state: RootState) => state.progress.completedLevels)
  const selectedLevel = useSelector((state: RootState) => state.progress.selectedLevel)
  const userLevel = useSelector((state: RootState) => state.progress.userLevel)
  const userScore = useSelector((state: RootState) => state.progress.userScore)
  const userCoins = useSelector((state: RootState) => state.progress.userCoins)
  const userPotions = useSelector((state: RootState) => state.progress.userPotions)
  const userParams = useSelector((state: RootState) => state.progress.userParams)
  const userInventory = useSelector((state: RootState) => state.progress.userInventory)
  const userOrgans = useSelector((state: RootState) => state.progress.userOrgans)

  const handleResetProgress = () => {
    dispatch(resetProgress())
  }

  const handleSetProgress = (progress: any) => {
    dispatch(setProgress(progress))
  }

  const handleCompleteLevel = (level: number) => {
    dispatch(completeLevel(level))
  }

  const handleSelectLevel = (level: number) => {
    dispatch(selectLevel(level))
  }

  const handleLevelUp = (level: number) => {
    dispatch(levelUp(level))
  }

  const handleScoreUp = (score: number) => {
    dispatch(scoreUp(score))
  }

  const handleCoinsUp = (coins: number) => {
    dispatch(coinsUp(coins))
  }

  const handlePotionsUp = (potions: number) => {
    dispatch(potionsUp(potions))
  }

  const handleParamsUp = (params: { hp: number; guard: number; attack: number }) => {
    dispatch(paramsUp(params))
  }

  const handleUpdateInventory = (inventory: Array<{ id: number; type: string; name: string; desc: string; price: number; organs: Array<{ id: number; name: string; count: number }>; hp: number; isPaid: boolean; isDressed: boolean }>) => {
    dispatch(updateInventory(inventory))
  }

  const handleUpdateOrgan = (organ: { organId: number; count: number }) => {
    dispatch(updateOrgan(organ))
  }

  return {
    progress,
    completedLevels,
    selectedLevel,
    userLevel,
    userScore,
    userCoins,
    userPotions,
    userParams,
    userInventory,
    userOrgans,
    resetProgress: handleResetProgress,
    setProgress: handleSetProgress,
    completeLevel: handleCompleteLevel,
    selectLevel: handleSelectLevel,
    levelUp: handleLevelUp,
    scoreUp: handleScoreUp,
    coinsUp: handleCoinsUp,
    potionsUp: handlePotionsUp,
    paramsUp: handleParamsUp,
    updateInventory: handleUpdateInventory,
    updateOrgan: handleUpdateOrgan,
  }
}
