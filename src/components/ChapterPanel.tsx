import { useGameStore } from '../game/store';
import { CHAPTERS } from '../game/data';
import { StoryDialogueModal } from './StoryDialogueModal';
import type { Chapter, ChapterStage, StageType } from '../game/types';

const STAGE_TYPE_ICONS: Record<StageType, string> = {
  normal: '⚔️',
  elite: '💀',
  boss: '👹',
  story: '📖',
  treasure: '💰',
  shrine: '✨',
  rest: '🏕️',
};

const STAGE_TYPE_NAMES: Record<StageType, string> = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
  story: '剧情',
  treasure: '宝藏',
  shrine: '神殿',
  rest: '休息',
};

const STAGE_TYPE_COLORS: Record<StageType, string> = {
  normal: '#6b7280',
  elite: '#3b82f6',
  boss: '#ef4444',
  story: '#8b5cf6',
  treasure: '#f59e0b',
  shrine: '#10b981',
  rest: '#06b6d4',
};

export function ChapterPanel() {
  const {
    currentChapterId,
    chapterActiveTab,
    getChapter,
    getChapterProgress,
    getStageProgress,
    isChapterUnlocked,
    isStageAccessible,
    getChapterUnlockProgress,
    setCurrentChapter,
    setChapterActiveTab,
    startStage,
    claimStageReward,
    claimFirstClearReward,
    canClaimStageReward,
    canClaimFirstClearReward,
    claimChapterReward,
    canClaimChapterReward,
    currentDialogue,
    player,
  } = useGameStore();

  const currentChapter = getChapter(currentChapterId);
  const currentChapterProgress = getChapterProgress(currentChapterId);

  const renderChapterList = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">📚 主线章节</h2>
      <div className="grid gap-4">
        {CHAPTERS.map((chapter) => {
          const progress = getChapterProgress(chapter.id);
          const unlocked = isChapterUnlocked(chapter.id);
          const unlockProgress = getChapterUnlockProgress(chapter.id);
          const isSelected = currentChapterId === chapter.id;

          return (
            <div
              key={chapter.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-yellow-400 bg-gray-800'
                  : unlocked
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-400'
                  : 'border-gray-700 bg-gray-900/50 opacity-70'
              }`}
              style={{ borderLeftColor: chapter.bgColor, borderLeftWidth: '4px' }}
              onClick={() => unlocked && setCurrentChapter(chapter.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{chapter.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{chapter.name}</h3>
                    {!unlocked && <span className="text-gray-500">🔒 未解锁</span>}
                    {unlocked && progress.completed && (
                      <span className="text-yellow-400">🏆 已通关</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{chapter.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-2">推荐等级: Lv.{chapter.minLevel}</p>

                  {unlocked && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">章节进度</span>
                        <span className="text-yellow-400">
                          ⭐ {progress.totalStars} / {progress.maxStars}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{
                            width: `${progress.maxStars > 0 ? (progress.totalStars / progress.maxStars) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!unlocked && unlockProgress.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-500 mb-2">解锁条件：</p>
                      {unlockProgress.map((cond, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className={cond.completed ? 'text-green-400' : 'text-gray-500'}>
                            {cond.completed ? '✓' : '○'} {cond.condition}
                          </span>
                          <span className={cond.completed ? 'text-green-400' : 'text-gray-500'}>
                            {cond.current} / {cond.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {unlocked && canClaimChapterReward(chapter.id) && (
                <button
                  className="mt-3 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    claimChapterReward(chapter.id);
                  }}
                >
                  🎁 领取章节通关奖励
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStageMap = () => {
    if (!currentChapter) return null;

    const stages = currentChapter.stages;

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <button
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            onClick={() => setChapterActiveTab('chapters')}
          >
            ← 返回章节列表
          </button>
          <h2 className="text-lg font-bold text-white">
            {currentChapter.icon} {currentChapter.name}
          </h2>
          <div className="text-yellow-400 text-sm">
            ⭐ {currentChapterProgress.totalStars} / {currentChapterProgress.maxStars}
          </div>
        </div>

        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentChapter.bgColor}40, #1f2937)`,
            minHeight: '400px',
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {stages.map((stage) =>
              stage.connections.map((connId) => {
                const targetStage = stages.find((s) => s.id === connId);
                if (!targetStage) return null;
                const isAccessible = isStageAccessible(currentChapter.id, stage.id);
                const targetProgress = getStageProgress(currentChapter.id, connId);
                const isCleared = targetProgress.cleared;

                return (
                  <line
                    key={`${stage.id}-${connId}`}
                    x1={`${stage.position.x}px`}
                    y1={`${stage.position.y}%`}
                    x2={`${targetStage.position.x}px`}
                    y2={`${targetStage.position.y}%`}
                    stroke={isCleared ? '#fbbf24' : isAccessible ? '#6b7280' : '#374151'}
                    strokeWidth="3"
                    strokeDasharray={isCleared ? 'none' : '8,4'}
                  />
                );
              })
            )}
          </svg>

          {stages.map((stage) => {
            const progress = getStageProgress(currentChapter.id, stage.id);
            const accessible = isStageAccessible(currentChapter.id, stage.id);
            const canClaimReward = canClaimStageReward(currentChapter.id, stage.id);
            const canClaimFirstClear = canClaimFirstClearReward(currentChapter.id, stage.id);
            const isBoss = stage.type === 'boss';

            return (
              <div
                key={stage.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${stage.position.x}px`, top: `${stage.position.y}%` }}
              >
                <div
                  className={`relative group ${
                    accessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  onClick={() => accessible && startStage(currentChapter.id, stage.id)}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 transition-all ${
                      progress.cleared
                        ? 'bg-green-600 border-green-400'
                        : accessible
                        ? isBoss
                          ? 'bg-red-600 border-red-400 animate-pulse'
                          : 'bg-gray-700 border-gray-500 hover:border-yellow-400'
                        : 'bg-gray-800 border-gray-700 opacity-50'
                    }`}
                    style={{
                      boxShadow: progress.cleared
                        ? '0 0 15px rgba(34, 197, 94, 0.5)'
                        : accessible && isBoss
                        ? '0 0 20px rgba(239, 68, 68, 0.6)'
                        : 'none',
                    }}
                  >
                    {progress.cleared ? (
                      <span>✓</span>
                    ) : (
                      <span>{STAGE_TYPE_ICONS[stage.type]}</span>
                    )}
                  </div>

                  {progress.bestStars > 0 && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {Array.from({ length: progress.bestStars }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}

                  {(canClaimReward || canClaimFirstClear) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce">
                      !
                    </div>
                  )}

                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 min-w-48 shadow-xl">
                      <h4 className="font-bold text-white text-sm">{stage.name}</h4>
                      <p
                        className="text-xs mt-1"
                        style={{ color: STAGE_TYPE_COLORS[stage.type] }}
                      >
                        {STAGE_TYPE_NAMES[stage.type]}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{stage.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        推荐等级: Lv.{stage.minLevel}
                      </p>

                      {stage.starConditions && stage.starConditions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">星级条件：</p>
                          {stage.starConditions.map((cond, idx) => (
                            <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                              <span>{cond.icon}</span>
                              <span>{cond.description}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!accessible && stage.requiredStageIds && (
                        <p className="text-xs text-red-400 mt-2">
                          需要先完成前置关卡
                        </p>
                      )}

                      {player.stats.level < stage.minLevel && (
                        <p className="text-xs text-red-400 mt-1">等级不足</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span>已通关</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-700 border border-gray-500"></span>
            <span>可挑战</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700 opacity-50"></span>
            <span>未解锁</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBossRush = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">👹 首领挑战</h2>
      <div className="space-y-3">
        {CHAPTERS.filter((c) => isChapterUnlocked(c.id)).map((chapter) => {
          const bossStage = chapter.stages.find((s) => s.type === 'boss');
          if (!bossStage) return null;

          const progress = getStageProgress(chapter.id, bossStage.id);
          const accessible = isStageAccessible(chapter.id, bossStage.id);

          return (
            <div
              key={chapter.id}
              className="p-4 rounded-lg bg-gray-800 border-2 border-red-900"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">{bossStage.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{bossStage.name}</h3>
                  <p className="text-sm text-gray-400">{chapter.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {progress.bestStars > 0 && (
                      <span className="text-yellow-400 text-sm">
                        {'⭐'.repeat(progress.bestStars)}
                      </span>
                    )}
                    {progress.cleared && (
                      <span className="text-green-400 text-xs">已击败</span>
                    )}
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded font-bold ${
                    accessible
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!accessible}
                  onClick={() => accessible && startStage(chapter.id, bossStage.id)}
                >
                  挑战
                </button>
              </div>

              {bossStage.bossMechanics && bossStage.bossMechanics.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Boss机制：</p>
                  <div className="grid grid-cols-2 gap-2">
                    {bossStage.bossMechanics.map((mechanic) => (
                      <div
                        key={mechanic.id}
                        className="p-2 bg-gray-900/50 rounded text-xs"
                      >
                        <div className="flex items-center gap-1 text-white font-medium">
                          <span>{mechanic.icon}</span>
                          <span>{mechanic.name}</span>
                        </div>
                        <p className="text-gray-500 mt-1">{mechanic.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            chapterActiveTab === 'chapters'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setChapterActiveTab('chapters')}
        >
          📚 章节列表
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            chapterActiveTab === 'stages'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setChapterActiveTab('stages')}
          disabled={!currentChapter || !isChapterUnlocked(currentChapterId)}
        >
          🗺️ 关卡地图
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            chapterActiveTab === 'bosses'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setChapterActiveTab('bosses')}
        >
          👹 首领挑战
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chapterActiveTab === 'chapters' && renderChapterList()}
        {chapterActiveTab === 'stages' && renderStageMap()}
        {chapterActiveTab === 'bosses' && renderBossRush()}
      </div>

      {currentDialogue && <StoryDialogueModal />}
    </div>
  );
}
