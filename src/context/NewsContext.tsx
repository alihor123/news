import { showMessage } from '@/helpers'
import { type Article } from '@/services/news.api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'

type FavoriteNews = Record<string, Article>

type NewsContextType = {
  favoriteNews: FavoriteNews
  isFavoritesLoading: boolean
  selectedArticle: Article | null
  setSelectedArticle: (article: Article) => void
  changeFavorite: (article: Article) => Promise<void>
}

type NewsProviderProps = {
  children: ReactNode
}

export const NewsContext = createContext<NewsContextType | null>(null)

export function NewsProvider({ children }: NewsProviderProps) {
  const [favoriteNews, setFavoriteNews] = useState<FavoriteNews>({})
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const isFavoriteSavingRef = useRef(false)

  //Загрузка избранного из стораджа при запуске
  useEffect(() => {
    let isActive = true

    async function loadFavorites() {
      try {
        const value = await AsyncStorage.getItem('newsFavorites')
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
  async function changeFavorite(article: Article) {
    if (isFavoritesLoading || isFavoriteSavingRef.current) return

    isFavoriteSavingRef.current = true

    try {
      const value = await AsyncStorage.getItem('newsFavorites')
      const newFavorites: FavoriteNews = value ? JSON.parse(value) : {}

      if (newFavorites[article.id]) {
        delete newFavorites[article.id]
      }
      else {
        newFavorites[article.id] = article
      }

      await AsyncStorage.setItem('newsFavorites', JSON.stringify(newFavorites))
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
    <NewsContext.Provider value={{ favoriteNews, isFavoritesLoading, selectedArticle, setSelectedArticle, changeFavorite }}>
      {children}
    </NewsContext.Provider>
  )
}
