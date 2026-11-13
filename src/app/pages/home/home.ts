import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetRequest, ItemRequest, LaborRequest } from '../../models/budget-request';
import { CommonModule } from '@angular/common';
import { Budget } from '../../services/budget';
import { finalize } from 'rxjs';

@Component({
  imports: [ FormsModule, CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  @ViewChild('itemForm') private itemForm?: ElementRef<HTMLElement>;
  @ViewChild('laborForm') private laborForm?: ElementRef<HTMLElement>;

  private readonly brazilianAmountFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  private readonly brazilianCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  request : BudgetRequest = {
    companyRequest: {
      companyName: '',
      telephoneCompany: '',
      companyCnpj: null
    },
    clientRequest: {
      type: 'PF',
      clientName: '',
      telephoneNumber: '',
      cpf: null
    },
    items: [],
    labors: [],
    observation: ''
  };

  newItem: ItemRequest = {
    itemDescription: '',
    quantity: 0,
    itemValue: 0,
  };

  itemValueInput = '';
  editingItemIndex: number | null = null;
  cpfInput = '';
  companyCnpjInput = '';
  clientCnpjInput = '';
  companyTelephoneInput = '';
  clientTelephoneInput = '';

  addItem(): void {
    if (this.editingItemIndex === null) {
      this.request.items.push({ ...this.newItem });
    } else {
      this.request.items[this.editingItemIndex] = { ...this.newItem };
    }

    this.cancelItemEdit();
  }

  editItem(index: number): void {
    const item = this.request.items[index];
    this.newItem = { ...item };
    this.itemValueInput = item.itemValue === 0
      ? ''
      : this.brazilianAmountFormatter.format(item.itemValue);
    this.editingItemIndex = index;
    this.itemForm?.nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  onItemValueInput(value: string): void {
    this.itemValueInput = this.formatCurrencyInput(value);
    this.newItem.itemValue = this.parseCurrencyInput(this.itemValueInput);
  }

  onItemQuantityInput(value: string): void {
    const digits = value.replace(/\D/g, '');
    this.newItem.quantity = digits ? Number(digits) : 0;
  }

  preventNonDigitInput(event: InputEvent): void {
    if (event.data !== null && /\D/.test(event.data)) {
      event.preventDefault();
    }
  }

  preventNonDigitPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (/\D/.test(pastedText)) {
      event.preventDefault();
    }
  }

  preventInvalidDocumentPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (/[^\d./-]/.test(pastedText)) {
      event.preventDefault();
    }
  }

  preventInvalidCnpjInput(event: InputEvent): void {
    if (event.data !== null && /[^a-zA-Z0-9./-]/.test(event.data)) {
      event.preventDefault();
    }
  }

  preventInvalidCnpjPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (/[^a-zA-Z0-9./-]/.test(pastedText)) {
      event.preventDefault();
    }
  }

  preventInvalidPhonePaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (/[^\d ()-]/.test(pastedText)) {
      event.preventDefault();
    }
  }

  onCompanyTelephoneInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    this.request.companyRequest.telephoneCompany = digits;
    this.companyTelephoneInput = this.formatPhoneInput(digits);
  }

  onClientTelephoneInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    this.request.clientRequest.telephoneNumber = digits;
    this.clientTelephoneInput = this.formatPhoneInput(digits);
  }

  onCpfInput(value: string): void {
    if (this.request.clientRequest.type === 'PF') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      this.request.clientRequest.cpf = digits || null;
      this.cpfInput = this.formatDocumentInput(digits, 'cpf');
    }
  }

  onCompanyCnpjInput(value: string): void {
    const cnpj = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
    this.request.companyRequest.companyCnpj = cnpj || null;
    this.companyCnpjInput = this.formatDocumentInput(cnpj, 'cnpj');
  }

  onClientCnpjInput(value: string): void {
    if (this.request.clientRequest.type === 'PJ') {
      const cnpj = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
      this.request.clientRequest.cnpj = cnpj;
      this.clientCnpjInput = this.formatDocumentInput(cnpj, 'cnpj');
    }
  }

  private formatDocumentInput(digits: string, type: 'cpf' | 'cnpj'): string {
    if (type === 'cpf') {
      if (digits.length > 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
      }
      if (digits.length > 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      }
      if (digits.length > 3) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      }
      return digits;
    }

    if (digits.length > 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    }
    if (digits.length > 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }
    if (digits.length > 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    }
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    return digits;
  }

  private formatPhoneInput(digits: string): string {
    if (!digits) {
      return '';
    }

    if (digits.length <= 2) {
      return `(${digits}`;
    }

    const areaCode = digits.slice(0, 2);
    const number = digits.slice(2);
    if (number.length <= 4) {
      return `(${areaCode}) ${number}`;
    }
    if (digits.length <= 10) {
      return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }
    return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
  }

  cancelItemEdit(): void {
    this.editingItemIndex = null;
    this.itemValueInput = '';
    this.newItem = {
      itemDescription: '',
      quantity: 0,
      itemValue: 0,
    };
  }

  removeItem(index: number): void {
    this.request.items.splice(index, 1);
    if (this.editingItemIndex === index) {
      this.cancelItemEdit();
    } else if (this.editingItemIndex !== null && this.editingItemIndex > index) {
      this.editingItemIndex--;
    }
  }

  newLabor: LaborRequest = {
    laborDescription: '',
    laborValue: 0,
  };

  laborValueInput = '';
  editingLaborIndex: number | null = null;

  addLabor(): void {
    if (this.editingLaborIndex === null) {
      this.request.labors.push({ ...this.newLabor });
    } else {
      this.request.labors[this.editingLaborIndex] = { ...this.newLabor };
    }

    this.cancelLaborEdit();
  }

  editLabor(index: number): void {
    const labor = this.request.labors[index];
    this.newLabor = { ...labor };
    this.laborValueInput = labor.laborValue === 0
      ? ''
      : this.brazilianAmountFormatter.format(labor.laborValue);
    this.editingLaborIndex = index;
    this.laborForm?.nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  onLaborValueInput(value: string): void {
    this.laborValueInput = this.formatCurrencyInput(value);
    this.newLabor.laborValue = this.parseCurrencyInput(this.laborValueInput);
  }

  cancelLaborEdit(): void {
    this.editingLaborIndex = null;
    this.laborValueInput = '';
    this.newLabor = {
      laborDescription: '',
      laborValue: 0,
    };
  }

  removeLabor(index: number): void {
    this.request.labors.splice(index, 1);
    if (this.editingLaborIndex === index) {
      this.cancelLaborEdit();
    } else if (this.editingLaborIndex !== null && this.editingLaborIndex > index) {
      this.editingLaborIndex--;
    }
  }

  formatCurrencyInput(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      return '';
    }

    return this.brazilianAmountFormatter.format(Number(digits) / 100);
  }

  private parseCurrencyInput(value: string): number {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits) / 100 : 0;
  }

  formatCurrency(value: number): string {
    return this.brazilianCurrencyFormatter.format(value);
  }

  private readonly budgetService = inject(Budget);
  shareableBudgetFile: File | null = null;
  hasGeneratedBudget = signal(false);
  isClearConfirmationOpen = signal(false);
  isProcessing = signal(false);

  submitRequest(): void {
    if (this.isProcessing()) {
      return;
    }

    if (this.request.clientRequest.type === 'PF') {
      if (!this.request.clientRequest.cpf) {
        alert('CPF é obrigatório para clientes do tipo PF.');
        return;
      }
    }

    if (this.request.clientRequest.type === 'PJ') {
      if (!this.request.clientRequest.cnpj) {
        alert('CNPJ é obrigatório para clientes do tipo PJ.');
        return;
      }
    }
    
    this.shareableBudgetFile = null;
    this.isProcessing.set(true);
    this.budgetService.createBudget(this.request)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
      next: blob => {
        this.hasGeneratedBudget.set(true);
        const clientName = this.request.clientRequest.type === 'PF'
          ? this.request.clientRequest.clientName
          : this.request.clientRequest.companyName;
        const fileName = `Orçamento_${clientName.replace(/ /g, '_')}.pdf`;
        const file = new File([blob], fileName, { type: 'application/pdf' });

        if (this.canShareBudgetFile(file)) {
          this.shareableBudgetFile = file;
          return;
        }

        this.downloadBudgetFile(file);
        alert('Orçamento criado com sucesso!');
      },
      error: err => {
        this.shareableBudgetFile = null;
        console.error('Falha ao gerar orçamento', err);
        alert('Erro ao criar orçamento. Por favor, tente novamente.');
      }
    });

  }

  openClearConfirmation(): void {
    this.isClearConfirmationOpen.set(true);
  }

  closeClearConfirmation(): void {
    this.isClearConfirmationOpen.set(false);
  }

  clearBudget(): void {
    this.request = {
      companyRequest: {
        companyName: '',
        telephoneCompany: '',
        companyCnpj: null,
      },
      clientRequest: {
        type: 'PF',
        clientName: '',
        telephoneNumber: '',
        cpf: null,
      },
      items: [],
      labors: [],
      observation: '',
    };

    this.companyTelephoneInput = '';
    this.clientTelephoneInput = '';
    this.companyCnpjInput = '';
    this.clientCnpjInput = '';
    this.cpfInput = '';
    this.cancelItemEdit();
    this.cancelLaborEdit();
    this.shareableBudgetFile = null;
    this.hasGeneratedBudget.set(false);
    this.isClearConfirmationOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async shareBudget(): Promise<void> {
    const file = this.shareableBudgetFile;
    if (!file || typeof navigator.share !== 'function') {
      return;
    }

    try {
      await navigator.share({ files: [file], title: file.name });
      this.shareableBudgetFile = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      console.error('Falha ao compartilhar orçamento', err);
      alert('Não foi possível compartilhar o orçamento. Tente novamente.');
    }
  }

  private canShareBudgetFile(file: File): boolean {
    return typeof navigator.share === 'function'
      && (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] }));
  }

  private downloadBudgetFile(file: File): void {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    window.URL.revokeObjectURL(url);
  }

}
