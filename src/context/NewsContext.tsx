import { showMessage } from '@/helpers'
import { type Product } from '@/services/products.api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'

type FavoriteNews = Record<string, Product>

type NewsContextType = {
  favoriteNews: FavoriteNews
  isFavoritesLoading: boolean
  changeFavorite: (article: Product) => Promise<void>
}

type NewsProviderProps = {
  children: ReactNode
}

export const NewsContext = createContext<NewsContextType | null>(null)

export function NewsProvider({ children }: NewsProviderProps) {
  const [favoriteNews, setFavoriteNews] = useState<FavoriteNews>({})
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true)
  const isFavoriteSavingRef = useRef(false)

  //Загрузка избранного из стораджа при запуске
  useEffect(() => {
    let isActive = true

    async function loadFavorites() {
      try {
        const value = await AsyncStorage.getItem('favorites')
        const data: FavoriteNews = value ? JSON.parse(value) : {}

        if (isActive) setFavoriteNews(data)
      }
      catch {
        if (isActive) showMessage('Не удалось загрузить избранное. Попробуйте позже')
      }
      finally {
        if (isActive) setIsFavoritesLoading(false)
      }
    }

    loadFavorites()

    return () => {
      isActive = false
    }
  }, [])

  //Добавление или удаление статьи из избранного
  async function changeFavorite(article: Product) {
    if (isFavoritesLoading || isFavoriteSavingRef.current) return

    isFavoriteSavingRef.current = true

    try {
      const value = await AsyncStorage.getItem('favorites')
      const newFavorites: FavoriteNews = value ? JSON.parse(value) : {}

      if (newFavorites[article.uuid]) {
        delete newFavorites[article.uuid]
      }
      else {
        newFavorites[article.uuid] = article
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
      setFavoriteNews(newFavorites)
    }
    catch {
      showMessage('Не удалось сохранить избранное. Попробуйте позже')
    }
    finally {
      isFavoriteSavingRef.current = false
    }
  }

  return (
    <NewsContext.Provider value={{ favoriteNews, isFavoritesLoading, changeFavorite }}>
      {children}
    </NewsContext.Provider>
  )
}
