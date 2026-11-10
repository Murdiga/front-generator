import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update an existing item without adding another one', () => {
    component.request.items = [
      { itemDescription: 'Cabo', quantity: 2, itemValue: 10 },
    ];

    component.editItem(0);
    component.newItem.itemDescription = 'Cabo atualizado';
    component.newItem.quantity = 3;
    component.addItem();

    expect(component.request.items).toEqual([
      { itemDescription: 'Cabo atualizado', quantity: 3, itemValue: 10 },
    ]);
    expect(component.editingItemIndex).toBeNull();
  });

  it('should update an existing labor without adding another one', () => {
    component.request.labors = [
      { laborDescription: 'Instalação', laborValue: 50 },
    ];

    component.editLabor(0);
    component.newLabor.laborDescription = 'Instalação atualizada';
    component.addLabor();

    expect(component.request.labors).toEqual([
      { laborDescription: 'Instalação atualizada', laborValue: 50 },
    ]);
    expect(component.editingLaborIndex).toBeNull();
  });

  it('should format typed item value digits as Brazilian cents', () => {
    component.onItemValueInput('1');

    expect(component.itemValueInput).toBe('0,01');
    expect(component.newItem.itemValue).toBe(0.01);

    component.onItemValueInput('0,012');

    expect(component.itemValueInput).toBe('0,12');
    expect(component.newItem.itemValue).toBe(0.12);
  });

  it('should format item and labor values as Brazilian currency', () => {
    expect(component.formatCurrency(1234.56)).toBe('R$\u00a01.234,56');
    expect(component.formatCurrency(0)).toBe('R$\u00a00,00');
  });

  it('should clear the item value input when cancelling an edit', () => {
    component.request.items = [
      { itemDescription: 'Cabo', quantity: 2, itemValue: 1.23 },
    ];

    component.editItem(0);
    component.cancelItemEdit();

    expect(component.itemValueInput).toBe('');
    expect(component.newItem.itemValue).toBe(0);
    expect(component.editingItemIndex).toBeNull();
  });

  it('should keep only digits in item quantity', () => {
    component.onItemQuantityInput('2abc.5');

    expect(component.newItem.quantity).toBe(25);
  });

  it('should keep only up to 11 digits in an individual client CPF', () => {
    component.onCpfInput('123abc45678901');

    expect(component.request.clientRequest).toMatchObject({
      type: 'PF',
      cpf: '12345678901',
    });
    expect(component.cpfInput).toBe('123.456.789-01');
  });

  it('should format company CNPJ for display and keep only digits in the request', () => {
    component.onCompanyCnpjInput('12345678000199');

    expect(component.companyCnpjInput).toBe('12.345.678/0001-99');
    expect(component.request.companyRequest.companyCnpj).toBe('12345678000199');
  });

  it('should format client CNPJ for display and keep only digits in the request', () => {
    component.request.clientRequest = {
      type: 'PJ',
      companyName: '',
      telephoneNumber: '',
      cnpj: '',
    };

    component.onClientCnpjInput('12345678000199');

    expect(component.clientCnpjInput).toBe('12.345.678/0001-99');
    expect(component.request.clientRequest.cnpj).toBe('12345678000199');
  });

  it('should accept and uppercase letters in company CNPJ', () => {
    component.onCompanyCnpjInput('ab123456789012');

    expect(component.companyCnpjInput).toBe('AB.123.456/7890-12');
    expect(component.request.companyRequest.companyCnpj).toBe('AB123456789012');
  });

  it('should accept and uppercase letters in client CNPJ', () => {
    component.request.clientRequest = {
      type: 'PJ',
      companyName: '',
      telephoneNumber: '',
      cnpj: '',
    };

    component.onClientCnpjInput('ab123456789012');

    expect(component.clientCnpjInput).toBe('AB.123.456/7890-12');
    expect(component.request.clientRequest.cnpj).toBe('AB123456789012');
  });

  it('should format a mobile phone with area code and keep only digits in the request', () => {
    component.onClientTelephoneInput('11987654321');

    expect(component.clientTelephoneInput).toBe('(11) 98765-4321');
    expect(component.request.clientRequest.telephoneNumber).toBe('11987654321');
  });

  it('should format a landline phone with area code', () => {
    component.onCompanyTelephoneInput('1132345678');

    expect(component.companyTelephoneInput).toBe('(11) 3234-5678');
    expect(component.request.companyRequest.telephoneCompany).toBe('1132345678');
  });

  it('should keep only digits in labor currency input', () => {
    component.onLaborValueInput('R$ 1a,2b3');

    expect(component.laborValueInput).toBe('1,23');
    expect(component.newLabor.laborValue).toBe(1.23);
  });

  it('should prevent non-digit keyboard input', () => {
    const letterInput = new InputEvent('beforeinput', {
      data: 'a',
      inputType: 'insertText',
      cancelable: true,
    });
    const digitInput = new InputEvent('beforeinput', {
      data: '7',
      inputType: 'insertText',
      cancelable: true,
    });

    component.preventNonDigitInput(letterInput);
    component.preventNonDigitInput(digitInput);

    expect(letterInput.defaultPrevented).toBe(true);
    expect(digitInput.defaultPrevented).toBe(false);
  });

  it('should prevent pasting text that contains non-digit characters', () => {
    const pasteEvent = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: { getData: () => '123abc' },
    });

    component.preventNonDigitPaste(pasteEvent);

    expect(pasteEvent.defaultPrevented).toBe(true);
  });

  it('should allow pasting formatted CPF but reject letters in CPF', () => {
    const formattedCnpjPaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(formattedCnpjPaste, 'clipboardData', {
      value: { getData: () => '12.345.678/0001-99' },
    });
    const letterPaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(letterPaste, 'clipboardData', {
      value: { getData: () => '12.345.A78/0001-99' },
    });

    component.preventInvalidDocumentPaste(formattedCnpjPaste);
    component.preventInvalidDocumentPaste(letterPaste);

    expect(formattedCnpjPaste.defaultPrevented).toBe(false);
    expect(letterPaste.defaultPrevented).toBe(true);
  });

  it('should allow formatted alphanumeric CNPJ paste but reject special characters', () => {
    const formattedCnpjPaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(formattedCnpjPaste, 'clipboardData', {
      value: { getData: () => 'AB.123.456/7890-12' },
    });
    const invalidPaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(invalidPaste, 'clipboardData', {
      value: { getData: () => 'AB.123.456/7890-1!' },
    });

    component.preventInvalidCnpjPaste(formattedCnpjPaste);
    component.preventInvalidCnpjPaste(invalidPaste);

    expect(formattedCnpjPaste.defaultPrevented).toBe(false);
    expect(invalidPaste.defaultPrevented).toBe(true);
  });

  it('should allow formatted phone paste but reject letters', () => {
    const formattedPhonePaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(formattedPhonePaste, 'clipboardData', {
      value: { getData: () => '(11) 98765-4321' },
    });
    const letterPaste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(letterPaste, 'clipboardData', {
      value: { getData: () => '(11) 98abc-4321' },
    });

    component.preventInvalidPhonePaste(formattedPhonePaste);
    component.preventInvalidPhonePaste(letterPaste);

    expect(formattedPhonePaste.defaultPrevented).toBe(false);
    expect(letterPaste.defaultPrevented).toBe(true);
  });
});
