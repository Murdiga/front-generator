import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BudgetRequest } from '../models/budget-request';

@Service()
export class Budget {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'https://generator-bezk.onrender.com/';

    createBudget(request: BudgetRequest) {
        return this.http.post(`${this.baseUrl}/api/generator/budget`, request, { responseType: 'blob' });
    }
}
