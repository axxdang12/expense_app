import React, { useState, useCallback } from 'react';
// FIX: Update the import to use a relative path
import { Transaction, TransactionType } from '../types';
import { getSpendingAnalysis } from '../services/geminiService';

interface AnalysisProps {
  transactions: Transaction[];
}

const Analysis: React.FC<AnalysisProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExpenses = transactions.some(t => t.type === TransactionType.EXPENSE);

  const handleGetAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    try {
      const result = await getSpendingAnalysis(transactions);
      setAnalysis(result);
    } catch (err) {
      setError('Không thể lấy phân tích. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  const renderFormattedText = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-primary">{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
           return <p key={index} className="mt-2 font-semibold text-text-primary">{line}</p>;
        }
        return <p key={index} className="my-1">{line}</p>;
      })
      .reduce((acc, elem, index) => {
        if (elem.type === 'li' && (index === 0 || acc[acc.length - 1].type !== 'ul')) {
          return [...acc, <ul key={`ul-${index}`} className="space-y-1 text-text-secondary">{elem}</ul>];
        } else if (elem.type === 'li') {
          const lastUl = acc[acc.length - 1];
          const newChildren = Array.isArray(lastUl.props.children) ? [...lastUl.props.children, elem] : [lastUl.props.children, elem];
          const newUl = React.cloneElement(lastUl, { children: newChildren });
          return [...acc.slice(0, -1), newUl];
        }
        return [...acc, elem];
        // FIX: Specify generic type for React.ReactElement to avoid props being typed as 'unknown'.
      }, [] as React.ReactElement<any, string | React.JSXElementConstructor<any>>[]);
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-md h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary mb-2 sm:mb-0">Phân tích chi tiêu từ AI</h2>
        <button
          onClick={handleGetAnalysis}
          disabled={isLoading || !hasExpenses}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
          <span>{isLoading ? 'Đang phân tích...' : 'Nhận phân tích'}</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {analysis ? (
         <div className="prose prose-slate max-w-none prose-p:text-text-secondary prose-li:text-text-secondary">
          {renderFormattedText(analysis)}
        </div>
      ) : (
        !isLoading && <p className="text-text-secondary">Nhấn nút để nhận phân tích chi tiêu và lời khuyên từ AI (cần có ít nhất một khoản chi).</p>
      )}
    </div>
  );
};

export default Analysis;
