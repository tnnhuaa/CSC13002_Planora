import { parseMentions } from '../utils/mentionUtils';

const CommentText = ({ text, className = '' }) => {
  const parts = parseMentions(text);

  return (
    <p className={`text-sm whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <strong key={index} style={{ fontWeight: 700 }}>
              {part.content}
            </strong>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </p>
  );
};

export default CommentText;
