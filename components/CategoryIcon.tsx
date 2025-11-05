import React from 'react';
// FIX: Update the import to use a relative path
import { Transaction, TransactionType, DebtType } from '../types';
// FIX: Update the import to use a relative path
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

interface CategoryIconProps {
  transaction: Transaction;
}

const ICONS = {
    DEBT_LENT: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />, // Arrow up
    DEBT_BORROWED: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />, // Arrow down
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ transaction }) => {
  let icon: React.ReactNode | undefined;
  let bgColor = 'bg-primary';

  if (transaction.type === TransactionType.EXPENSE) {
    icon = EXPENSE_CATEGORIES.find((c) => c.value === transaction.category)?.icon;
    bgColor = 'bg-red-400'
  } else if (transaction.type === TransactionType.INCOME) {
    icon = INCOME_CATEGORIES.find((c) => c.value === transaction.category)?.icon;
    bgColor = 'bg-green-400'
  } else if (transaction.type === TransactionType.DEBT) {
    icon = transaction.debtType === DebtType.LENT ? ICONS.DEBT_LENT : ICONS.DEBT_BORROWED;
    bgColor = 'bg-amber-400'
  }

  return (
    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {icon || <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.11h2.592c.55.103 1.02.57 1.11 1.11l.09 1.586c.29.043.578.11.85.201l1.453-.39c.594-.16 1.22.155 1.488.74l1.293 2.24c.27.485.135 1.12-.32-1.488l-1.152.85c-.05.37-.05.75 0 1.12l1.152.85c.455.368.59 1.003.32-1.488l-1.293-2.24c-.268.585-.894.9-1.488.74l-1.453-.39c-.272.09-.56.158-.85.201l-.09 1.586c-.09.542-.56 1.007-1.11 1.11h-2.592c-.55-.103-1.02-.57-1.11-1.11l-.09-1.586c-.29-.043-.578-.11-.85-.201l-1.453.39c-.594-.16-1.22-.155-1.488-.74l-1.293-2.24c-.27-.485-.135-1.12.32-1.488l1.152.85c.05-.37.05.75 0 1.12l-1.152-.85c-.455-.368-.59-1.003-.32-1.488l1.293-2.24c.268-.585.894-.9 1.488.74l1.453.39c.272-.09.56-.158.85.201l.09-1.586Z" />}
      </svg>
    </div>
  );
};

export default CategoryIcon;
