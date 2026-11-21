import { APIRequestContext } from '@playwright/test';

const API = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

export class ProductsClient {
    constructor(private readonly request: APIRequestContext){}

    async search(query: string){
        return this.request.get(`${API}/products/search`, {
            params: {q: query}
        })
    }

}