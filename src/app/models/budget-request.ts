export type CompanyRequest = {
    companyName: string;
    telephoneCompany: string;
    companyCNPJ: string | null;
};

export type IndividualClient = {
    name: string;
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

export type ProfessionalRole = 'Engenheiro(a)' | 'Arquiteto(a)';

export type ProfessionalRequest = {
    name: string;
    role: ProfessionalRole;
};

export type WorkInformationRequest = {
    address: string;
    numberAddress: string;
    professionals: ProfessionalRequest[];
};

export type BudgetRequest = {
    companyRequest: CompanyRequest;
    clientRequest: ClientRequest;
    workInformation: WorkInformationRequest;
    items: ItemRequest[];
    labors: LaborRequest[];
    observation: string;
};