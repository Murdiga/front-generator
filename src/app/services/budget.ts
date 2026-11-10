import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BudgetRequest } from '../models/budget-request';

@Service()
export class Budget {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8080/api/generator/budget';

    createBudget(request: BudgetRequest) {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'blob' });
    }
}
