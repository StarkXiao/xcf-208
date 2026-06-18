import { useGameStore } from '../game/store';
import { STORY_DIALOGUES } from '../game/data';
import type { EventEffect } from '../game/types';

export function StoryDialogueModal() {
  const {
    currentDialogue,
    advanceDialogue,
    closeDialogue,
  } = useGameStore();

  if (!currentDialogue) return null;

  const dialogues = STORY_DIALOGUES[currentDialogue.dialogueId];
  if (!dialogues) return null;

  const currentLine = dialogues[currentDialogue.currentIndex];
  if (!currentLine) return null;

  const isLastLine = currentDialogue.currentIndex >= dialogues.length - 1;
  const hasChoices = currentLine.choices && currentLine.choices.length > 0;

  const handleContinue = () => {
    if (hasChoices) return;
    if (isLastLine) {
      closeDialogue();
    } else {
      advanceDialogue();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
      <div
        className="w-full max-w-4xl bg-gray-900 border-2 border-yellow-600 rounded-t-2xl overflow-hidden"
        style={{ marginBottom: '5vh' }}
      >
        {currentLine.speaker && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-transparent px-6 py-3 border-b border-yellow-800/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentLine.speakerAvatar || '💬'}</span>
              <h3 className="text-lg font-bold text-yellow-400">{currentLine.speaker}</h3>
            </div>
          </div>
        )}

        <div className="p-6 min-h-32">
          <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
            {currentLine.text}
          </p>
        </div>

        {hasChoices ? (
          <div className="px-6 pb-6 space-y-2">
            <p className="text-gray-400 text-sm mb-3">做出你的选择：</p>
            {currentLine.choices!.map((choice, index) => (
              <button
                key={choice.id || index}
                className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-yellow-500 rounded-lg transition-all group"
                onClick={() => advanceDialogue(choice.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 group-hover:text-yellow-400">
                    {index + 1}.
                  </span>
                  <span className="text-white group-hover:text-yellow-300 flex-1">
                    {choice.text}
                  </span>
                  {choice.effects && (
                    <span className="text-xs text-gray-500">
                      {choice.effects.map((eff: EventEffect, i: number) => (
                        <span key={i} className="ml-2">
                          {eff.type === 'reputation'
                            ? `声望 ${eff.value > 0 ? '+' : ''}${eff.value}`
                            : eff.type === 'soulOrbs'
                            ? `魂珠 ${eff.value > 0 ? '+' : ''}${eff.value}`
                            : ''}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-6 flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              {currentDialogue.currentIndex + 1} / {dialogues.length}
            </div>
            <button
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
              onClick={handleContinue}
            >
              {isLastLine ? '结束对话 ✕' : '继续 →'}
            </button>
          </div>
        )}
      </div>

      <button
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-2xl"
        onClick={closeDialogue}
      >
        ✕
      </button>
    </div>
  );
}
