import { Api, ApiError, type Errors } from '@/services/api'
import { z } from 'zod'

const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  author: z.string().nullable(),
  image: z.string().nullable(),
  language: z.string(),
  category: z.array(z.string()),
  published: z.string()
})

const NewsSchema = z.object({
  status: z.literal('ok'),
  news: z.array(ArticleSchema),
  page: z.number(),
  next_cursor: z.string().nullable()
})

const CategoriesSchema = z.object({
  status: z.literal('ok'),
  categories: z.array(z.string())
})

export type Article = z.infer<typeof ArticleSchema>
export type News = z.infer<typeof NewsSchema>

export type NewsParams = {
  keywords?: string
  category?: string
  cursor?: string
  page_size?: number
}

const NEWS_ERRORS: Errors = {
  default: 'Не удалось загрузить новости. Попробуйте позже',
  network: 'Не удалось подключиться к сервису новостей. Проверьте интернет',
  response: 'Сервис вернул некорректные данные о новостях',
  400: 'Не удалось выполнить поиск. Проверьте запрос',
  401: 'Неверный API-ключ Currents',
  403: 'Нет доступа к новостям на текущем тарифе',
  429: 'Лимит запросов исчерпан. Попробуйте позже',
  504: 'Сервис новостей не ответил вовремя. Попробуйте позже'
}

const CATEGORIES_ERRORS: Errors = {
  default: 'Не удалось загрузить категории. Попробуйте позже',
  network: 'Не удалось подключиться к сервису новостей. Проверьте интернет',
  response: 'Сервис вернул некорректные категории',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис категорий не ответил вовремя. Попробуйте позже'
}

//Получение русских новостей с поиском, категориями и пагинацией
export async function getNews({ keywords, category, cursor, page_size = 20 }: NewsParams = {}): Promise<News> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_API_KEY
    if (!apiKey) throw new ApiError('Не задан API-ключ в EXPO_PUBLIC_API_KEY')

    const params = new URLSearchParams({ language: 'ru', country: 'RU', page_size: String(page_size) })
    if (keywords) params.set('keywords', keywords)
    if (category) params.set('category', category)
    if (cursor) params.set('cursor', cursor)

    const response = await Api.fetchGet(`/search?${params}`, NEWS_ERRORS, true, {
      Authorization: `Bearer ${apiKey}`
    })
    return await Api.parseResponse(response, NewsSchema)
  }
  catch (error) {
    Api.throwResponseError(error, NEWS_ERRORS, true)
  }
}

//Получение категорий новостей
export async function getCategories(): Promise<string[]> {
  try {
    const response = await Api.fetchGet('/available/categories', CATEGORIES_ERRORS, true)
    const data = await Api.parseResponse(response, CategoriesSchema)
    return data.categories
  }
  catch (error) {
    Api.throwResponseError(error, CATEGORIES_ERRORS, true)
  }
}
