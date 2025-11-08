import React from 'react';
import { Feedback } from '../../types';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  feedback: Feedback[];
}

export default function FeedbackPanel({ feedback }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">Feedback</h2>
      <div className="space-y-3">
        {feedback.map((item, idx) => (
          <FeedbackItem key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

function FeedbackItem({ item }: { item: Feedback }) {
  const styles = {
    success: { bg: 'bg-green-600/20', border: 'border-green-600', text: 'text-green-400', Icon: CheckCircleIcon },
    warning: { bg: 'bg-yellow-600/20', border: 'border-yellow-600', text: 'text-yellow-400', Icon: ExclamationTriangleIcon },
    error: { bg: 'bg-red-600/20', border: 'border-red-600', text: 'text-red-400', Icon: XCircleIcon },
    info: { bg: 'bg-blue-600/20', border: 'border-blue-600', text: 'text-blue-400', Icon: InformationCircleIcon },
  } as const;

  const s = styles[item.type] ?? styles.info;
  const Icon = s.Icon;

  return (
    <div className={`${s.bg} border ${s.border} rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`w-6 h-6 ${s.text} flex-shrink-0 mt-0.5`} />
      <p className={s.text}>{item.message}</p>
    </div>
  );
}