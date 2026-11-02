import { showMessage } from '@/helpers'
import { type Product } from '@/services/products.api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'

type FavoriteProducts = Record<string, Product>

type ProductContextType = {
  favoriteProducts: FavoriteProducts
  isFavoritesLoading: boolean
  changeFavorite: (product: Product) => Promise<void>
}

type ProductProviderProps = {
  children: ReactNode
}

export const ProductContext = createContext<ProductContextType | null>(null)

export function ProductProvider({ children }: ProductProviderProps) {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProducts>({})
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true)
  const isFavoriteSavingRef = useRef(false)

  //Загрузка избранного из стораджа при запуске
  useEffect(() => {
    let isActive = true

    async function loadFavorites() {
      try {
        const value = await AsyncStorage.getItem('favorites')
        const data: FavoriteProducts = value ? JSON.parse(value) : {}

        if (isActive) setFavoriteProducts(data)
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

  //Добавление или удаление товара из избранного
  async function changeFavorite(product: Product) {
    if (isFavoritesLoading || isFavoriteSavingRef.current) return

    isFavoriteSavingRef.current = true

    try {
      const value = await AsyncStorage.getItem('favorites')
      const newFavorites: FavoriteProducts = value ? JSON.parse(value) : {}

      if (newFavorites[product.uuid]) {
        delete newFavorites[product.uuid]
      }
      else {
        newFavorites[product.uuid] = product
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
      setFavoriteProducts(newFavorites)
    }
    catch {
      showMessage('Не удалось сохранить избранное. Попробуйте позже')
    }
    finally {
      isFavoriteSavingRef.current = false
    }
  }

  return (
    <ProductContext.Provider value={{ favoriteProducts, isFavoritesLoading, changeFavorite }}>
      {children}
    </ProductContext.Provider>
  )
}
