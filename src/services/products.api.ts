import { Api, type Errors } from '@/services/api'
import { z } from 'zod'

const apiUrl = 'https://store.halukaksoy.dev/api'

const ProductSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category_id: z.number(),
  category: z.string(),
  price: z.number(),
  currency: z.string(),
  stock_quantity: z.number(),
  image_url: z.string(),
  brand: z.string().nullable()
})

const ProductsSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({
    current_page: z.number(),
    per_page: z.number(),
    total: z.number(),
    total_pages: z.number()
  })
})

const ProductResponseSchema = z.object({
  data: ProductSchema
})

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  product_count: z.number()
})

const CategoriesSchema = z.object({
  data: z.array(CategorySchema)
})

export type Product = z.infer<typeof ProductSchema>
export type Products = z.infer<typeof ProductsSchema>
export type Category = z.infer<typeof CategorySchema>

export type ProductsParams = {
  search?: string
  category?: string
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'created_at_desc'
  page?: number
  per_page?: number
}

const PRODUCTS_ERRORS: Errors = {
  default: 'Не удалось загрузить товары. Попробуйте позже',
  network: 'Не удалось подключиться к сервису товаров. Проверьте интернет',
  response: 'Сервис вернул некорректные данные о товарах',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис товаров не ответил вовремя. Попробуйте позже'
}

const CATEGORIES_ERRORS: Errors = {
  default: 'Не удалось загрузить категории. Попробуйте позже',
  network: 'Не удалось подключиться к сервису товаров. Проверьте интернет',
  response: 'Сервис вернул некорректные категории',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис категорий не ответил вовремя. Попробуйте позже'
}

const PRODUCT_ERRORS: Errors = {
  default: 'Не удалось загрузить товар. Попробуйте позже',
  network: 'Не удалось подключиться к сервису товаров. Проверьте интернет',
  response: 'Сервис вернул некорректные данные о товаре',
  404: 'Товар не найден',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис товаров не ответил вовремя. Попробуйте позже'
}

//Получение товаров с поиском, фильтрацией, сортировкой и пагинацией
export async function getProducts({
  search,
  category,
  sort = 'price_asc',
  page = 1,
  per_page = 20
}: ProductsParams = {}): Promise<Products> {
  try {
    const params = new URLSearchParams({
      sort,
      page: String(page),
      per_page: String(per_page)
    })

    if (search) params.set('search', search)
    if (category) params.set('category', category)

    const response = await Api.fetchGet(`${apiUrl}/products?${params}`, PRODUCTS_ERRORS, true)
    return await Api.parseResponse(response, ProductsSchema)
  }
  catch (error) {
    Api.throwResponseError(error, PRODUCTS_ERRORS, true)
  }
}

//Получение категорий товаров
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await Api.fetchGet(`${apiUrl}/categories`, CATEGORIES_ERRORS, true)
    const data = await Api.parseResponse(response, CategoriesSchema)
    return data.data
  }
  catch (error) {
    Api.throwResponseError(error, CATEGORIES_ERRORS, true)
  }
}

//Получение товара по UUID
export async function getProduct(uuid: string): Promise<Product> {
  try {
    const response = await Api.fetchGet(`${apiUrl}/products/${encodeURIComponent(uuid)}`, PRODUCT_ERRORS, true)
    const data = await Api.parseResponse(response, ProductResponseSchema)
    return data.data
  }
  catch (error) {
    Api.throwResponseError(error, PRODUCT_ERRORS, true)
  }
}
