export type CompanyRequest = {
    companyName: string;
    telephoneCompany: string;
    companyCnpj: string | null;
};

export type IndividualClient = {
    clientName: string;
    telephoneNumber: string;
    cpf: string | null;
};

export type CompanyClient = {
    companyName: string;
    telephoneNumber: string;
    cnpj: string | null;
};

export type ClientRequest = ({ type : 'PF'} & IndividualClient) | ({ type : 'PJ' } & CompanyClient);

export type ItemRequest = {
    itemDescription: string;
    quantity: number;
    itemValue: number;
};

export type LaborRequest = {
    laborDescription: string;
    laborValue: number;
};

export type BudgetRequest = {
    companyRequest: CompanyRequest;
    clientRequest: ClientRequest;
    items: ItemRequest[];
    labors: LaborRequest[];
    observation: string;
};