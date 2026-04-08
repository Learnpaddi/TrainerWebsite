import { Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRole } from '@/hooks/useRole';

const MessagesPage = () => {
  const { role } = useRole();
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState('');

  const threads = useMemo(() => role === 'trainer'
    ? [
      { name: 'Aarav Learner', preview: 'Can you unlock module 4?', time: '2m ago' },
      { name: 'Priya S.', preview: 'Loved today’s session!', time: '18m ago' },
      { name: 'Operations Team', preview: 'Weekly metrics shared.', time: '1h ago' },
    ]
    : [
      { name: 'Meera Trainer', preview: 'Great progress this week.', time: '5m ago' },
      { name: 'Support', preview: 'Certificate generated successfully.', time: '30m ago' },
      { name: 'Study Group', preview: 'Join evening revision call?', time: '2h ago' },
    ], [role]);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md">
        <p className="text-sm font-semibold text-corporate-text">Inbox</p>
        <div className="mt-3 space-y-2">
          {threads.map((thread, index) => (
            <button
              key={thread.name}
              type="button"
              onClick={() => setSelected(index)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                selected === index
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-corporate-text">{thread.name}</p>
                <span className="text-xs text-corporate-muted">{thread.time}</span>
              </div>
              <p className="mt-1 text-xs text-corporate-muted">{thread.preview}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md">
        <p className="text-sm font-semibold text-corporate-text">Conversation</p>
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="ml-auto max-w-[80%] rounded-xl bg-blue-600 px-3 py-2 text-sm text-white">
            Hello! I need help with the next learning step.
          </div>
          <div className="max-w-[80%] rounded-xl bg-white px-3 py-2 text-sm text-corporate-secondary">
            Absolutely. I reviewed your progress and shared the next action plan.
          </div>
          <div className="ml-auto max-w-[80%] rounded-xl bg-blue-600 px-3 py-2 text-sm text-white">
            Thank you. I will continue today.
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          <button type="button" className="inline-flex rounded-xl bg-corporate-accent p-2.5 text-white hover:bg-blue-700">
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default MessagesPage;
