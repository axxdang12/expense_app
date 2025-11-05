export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  DEBT = 'DEBT',
}

export enum ExpenseCategory {
  FOOD = 'Ăn uống',
  TRANSPORT = 'Đi lại',
  HOUSING = 'Nhà ở',
  UTILITIES = 'Dịch vụ',
  HEALTH = 'Sức khỏe',
  ENTERTAINMENT = 'Giải trí',
  SHOPPING = 'Mua sắm',
  EDUCATION = 'Giáo dục',
  REPAYMENT = 'Trả nợ',
  OTHER = 'Khác',
}

export enum IncomeCategory {
  SALARY = 'Lương',
  BUSINESS = 'Kinh doanh',
  INVESTMENT = 'Đầu tư',
  GIFT = 'Quà tặng',
  DEBT_COLLECTION = 'Thu nợ',
  OTHER = 'Khác',
}

export enum DebtType {
    LENT = 'LENT',
    BORROWED = 'BORROWED',
}

export enum DebtCategory {
    DEBT = 'Nợ',
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory | DebtCategory;
  debtType?: DebtType;
  dueDate?: string; // ISO string
  relatedTransactionId?: string; // For repayments and collections
}