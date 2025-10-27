
import React, { useState, useCallback } from 'react';
import { ConversationSuggestion } from './types';
import { getConversationStarter } from './services/geminiService';
import { SparklesIcon, LightBulbIcon, ChatBubbleIcon, ExclamationTriangleIcon } from './components/icons';

interface InputGroupProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputGroup: React.FC<InputGroupProps> = ({ id, label, placeholder, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
      {label}
    </label>
    <div className="mt-2">
      <textarea
        id={id}
        name={id}
        rows={3}
        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 transition"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

interface ResultCardProps {
    icon: React.ReactNode;
    title: string;
    content: string;
    colorClass: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, title, content, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`p-4 flex items-center space-x-4 border-b border-slate-200 dark:border-slate-700 ${colorClass}`}>
            <div className="flex-shrink-0 text-white">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="p-6 text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
            {content}
        </div>
    </div>
);


const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
        <p className="ml-4 text-slate-600 dark:text-slate-400">AI đang suy nghĩ...</p>
    </div>
);

export default function App() {
  const [speakerInfo, setSpeakerInfo] = useState('');
  const [audienceInfo, setAudienceInfo] = useState('');
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('');

  const [result, setResult] = useState<ConversationSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerInfo || !audienceInfo || !context || !goal) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const suggestion = await getConversationStarter(speakerInfo, audienceInfo, context, goal);
      setResult(suggestion);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã có lỗi không mong muốn xảy ra.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [speakerInfo, audienceInfo, context, goal]);
  
  const isFormIncomplete = !speakerInfo || !audienceInfo || !context || !goal;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-emerald-500">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Trình Khởi Tạo Cuộc Trò Chuyện
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Nhập thông tin về bối cảnh và mục tiêu của bạn, AI sẽ giúp bạn tìm ra cách bắt đầu cuộc trò chuyện một cách tự nhiên và hiệu quả nhất.
          </p>
        </header>

        <main>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup id="speakerInfo" label="Bạn là ai?" placeholder="VD: Một sinh viên IT năm cuối, tính cách hướng nội..." value={speakerInfo} onChange={(e) => setSpeakerInfo(e.target.value)} />
              <InputGroup id="audienceInfo" label="Bạn đang nói chuyện với ai?" placeholder="VD: Một nhà tuyển dụng tại ngày hội việc làm, trông khá thân thiện..." value={audienceInfo} onChange={(e) => setAudienceInfo(e.target.value)} />
              <InputGroup id="context" label="Bối cảnh cuộc trò chuyện?" placeholder="VD: Tại một sự kiện networking công nghệ, không khí khá ồn ào..." value={context} onChange={(e) => setContext(e.target.value)} />
              <InputGroup id="goal" label="Mục đích của bạn là gì?" placeholder="VD: Gây ấn tượng và hỏi về cơ hội thực tập tại công ty của họ..." value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            
            {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-md p-3 text-sm">{error}</div>}

            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isLoading || isFormIncomplete}
                className="inline-flex items-center justify-center gap-x-2 rounded-lg bg-sky-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <SparklesIcon className="w-5 h-5"/>
                <span>{isLoading ? 'Đang tạo...' : 'Tạo gợi ý'}</span>
              </button>
            </div>
          </form>

          <div className="mt-12">
            {isLoading && <LoadingSpinner />}
            {result && (
              <div className="space-y-8 animate-fade-in">
                <ResultCard 
                    icon={<ChatBubbleIcon className="w-8 h-8"/>} 
                    title="Gợi ý bắt chuyện" 
                    content={result.loiChao}
                    colorClass="bg-gradient-to-r from-sky-500 to-cyan-400"
                />
                <ResultCard 
                    icon={<LightBulbIcon className="w-8 h-8"/>}
                    title="Phân tích & Diễn giải" 
                    content={result.phanTich}
                    colorClass="bg-gradient-to-r from-emerald-500 to-lime-500"
                />
                <ResultCard 
                    icon={<ExclamationTriangleIcon className="w-8 h-8"/>}
                    title="Những hiểu lầm có thể xảy ra" 
                    content={result.hieuLamCoTheXayRa}
                    colorClass="bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
