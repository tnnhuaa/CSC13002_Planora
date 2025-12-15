import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import getCaretCoordinates from 'textarea-caret'; 

const CommentInput = ({ value, onChange, onSubmit, placeholder, members, disabled, currentUser }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  
  // State for caret coordinates
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  const textareaRef = useRef(null);

  // Logic filter list suggestions
  const getMentionSuggestions = () => {
    const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

    // Filter out the current user from the members list
    const otherMembers = members.filter(m => {
       const memberId = (m.user?._id || m._id)?.toString();
       return memberId !== currentUserId;
    });

    if (!mentionSearch) return [{ username: 'all', _id: 'all' }, ...otherMembers];
    
    const search = mentionSearch.toLowerCase();
    const filtered = otherMembers.filter(m => 
      m.user?.username?.toLowerCase().includes(search)
    );
    
    if ('all'.includes(search)) return [{ username: 'all', _id: 'all' }, ...filtered];
    return filtered;
  };

  // Logic handle change input
  const handleChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(text);

    const textBeforeCursor = text.substring(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);
    
    if (match) {
      setMentionSearch(match[1]);
      setShowMentions(true);

      // Calculate caret position
      const caret = getCaretCoordinates(e.target, cursorPos);
      const textareaWidth = textareaRef.current.offsetWidth; 
      const MENU_WIDTH = 256; 

      let leftPos = caret.left;
    
      if (leftPos + MENU_WIDTH > textareaWidth) {
        leftPos = textareaWidth - MENU_WIDTH; 
      }
      
      setCoords({
        top: caret.top + 20, 
        left: caret.left
      });
    } else {
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  const selectMention = (username) => {
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    const newTextBefore = textBeforeCursor.replace(/@(\w*)$/, `@${username} `);
    const newText = newTextBefore + textAfterCursor;
    
    onChange(newText);
    setShowMentions(false);
    setMentionSearch('');
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newTextBefore.length, newTextBefore.length);
      }
    }, 0);
  };

  // Close mention menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMentions && !e.target.closest('.mention-dropdown') && !e.target.closest('textarea')) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentions]);

  const suggestions = getMentionSuggestions();

  return (
    <div className="relative w-full">
      
      {/* Menu suggestion */}
      {showMentions && suggestions.length > 0 && (
        <div 
          className="mention-dropdown absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden w-64 flex flex-col"
          style={{
            top: coords.top, 
            left: coords.left, 
          }}
        >
          <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-700">
            Suggestion
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {suggestions.map((member) => {
              const username = member.username || member.user?.username;
              const isAll = member._id === 'all';
              
              return (
                <button
                  key={member._id}
                  onClick={() => selectMention(username)}
                  className="w-full text-left cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-md transition flex items-center gap-3 group"
                >
                  {isAll ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">@</div>
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: `hsl(${username.charCodeAt(0) * 137.508 % 360}, 60%, 50%)` }}
                    >
                      {username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 truncate">
                      @{username}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        rows={3}
      />
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-slate-500"></div>
        <button
          onClick={onSubmit}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          disabled={disabled || !value.trim()}
        >
          <Send size={14} />
          Comment
        </button>
      </div>
    </div>
  );
};

export default CommentInput;