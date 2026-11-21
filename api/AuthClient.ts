import { APIRequestContext } from '@playwright/test';

const API = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

export class AuthClient {
    constructor(private readonly request: APIRequestContext) { }

    async login(email: string, password: string) {
        return this.request.post(`${API}/users/login`,
            {
                data: {
                    email: email,
                    password: password
                }
            }
        );
    }
}