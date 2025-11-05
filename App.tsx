import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Summary from './components/Summary';
import ExpenseList from './components/ExpenseList';
import FloatingActionButton from './components/FloatingActionButton';
import Modal from './components/Modal';
import ExpenseForm from './components/ExpenseForm';
import { Transaction } from './types';
import DebtLedger from './components/DebtLedger';
import Tabs from './components/Tabs';
import { calculateDebtStatus } from './utils/transactionUtils';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialTransactions = () => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  };

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState('Giao dịch');
  
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const debtStatus = useMemo(() => calculateDebtStatus(transactions), [transactions]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: new Date().getTime().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const TABS = ['Giao dịch', 'Sổ nợ'];

  return (
    <div className="bg-background min-h-screen text-text-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 pb-24 space-y-6">
        {/* The summary section is now the main dashboard view */}
        <Summary transactions={transactions} />
        
        <div className="bg-card p-4 sm:p-6 rounded-xl shadow-md">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
            <div className="mt-6">
                {activeTab === 'Giao dịch' && <ExpenseList transactions={transactions} />}
                {activeTab === 'Sổ nợ' && <DebtLedger transactions={transactions} />}
            </div>
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ExpenseForm 
          transactions={transactions}
          debtStatus={debtStatus}
          onAddTransaction={handleAddTransaction}
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default App;