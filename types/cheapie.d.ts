// types/cheapie.d.ts

export interface Cheapie {
    id: number
    name: string
    quantity: number
    price: number
    exp?: string
    addBy?: string
    image?: string
    stock: 'plenty' | 'mid' | 'low' | 'gone'
    createdAt: string
}
