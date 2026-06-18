import { useState, useMemo } from 'react';
import { useGameStore } from '../game/store';
import { INHERITED_BONUSES } from '../game/data';
import type { Storyline, StorylineNode, Ending, FateTab } from '../game/types';

export default function FatePanel() {
  const {
    fate,
    getStoryline,
    getStorylineProgress,
    getAvailableStorylines,
    startStoryline,
    canStartStoryline,
    advanceStorylineNode,
    getCurrentStorylineNode,
    setFateTab,
    getUnlockedEndings,
    getEndingProgress,
    getAlignment,
    getInheritedBonuses,
    getTotalPlaythroughCount,
    getStorylineCompletedCount,
    getEndingUnlockedCount,
    isStorylineNodeAccessible,
  } = useGameStore();

  const [selectedStoryline, setSelectedStoryline] = useState<Storyline | null>(null);
  const [selectedEnding, setSelectedEnding] = useState<Ending | null>(null);

  const alignment = useMemo(() => getAlignment(), [getAlignment, fate.alignment]);
  const availableStorylines = useMemo(() => getAvailableStorylines(), [getAvailableStorylines, fate.storylineProgresses]);
  const unlockedEndings = useMemo(() => getUnlockedEndings(), [getUnlockedEndings, fate.endingProgresses]);
  const inheritedBonuses = useMemo(() => getInheritedBonuses(), [getInheritedBonuses, fate.inheritedBonusIds]);

  const alignmentPercent = useMemo(() => {
    if (alignment.total === 0) return { light: 50, shadow: 50, balance: 50 };
    return {
      light: Math.round((alignment.light / alignment.total) * 100),
      shadow: Math.round((alignment.shadow / alignment.total) * 100),
      balance: Math.round((alignment.balance / alignment.total) * 100),
    };
  }, [alignment]);

  const currentNode = useMemo(() => {
    if (!selectedStoryline) return null;
    return getCurrentStorylineNode(selectedStoryline.id);
  }, [selectedStoryline, getCurrentStorylineNode, fate.storylineProgresses]);

  const handleStartStoryline = (storylineId: string) => {
    const success = startStoryline(storylineId);
    if (success) {
      const storyline = getStoryline(storylineId);
      if (storyline) {
        setSelectedStoryline(storyline);
      }
    }
  };

  const handleChoice = (choiceId: string) => {
    if (!selectedStoryline) return;
    advanceStorylineNode(selectedStoryline.id, choiceId);
  };

  const handleNext = () => {
    if (!selectedStoryline) return;
    advanceStorylineNode(selectedStoryline.id);
  };

  const renderRewardIcon = (type: string, value: number) => {
    switch (type) {
      case 'gold':
        return `💰 ${value.toLocaleString()} 金币`;
      case 'exp':
        return `⭐ ${value.toLocaleString()} 经验`;
      case 'soulOrbs':
        return `💎 ${value} 魂珠`;
      case 'attack':
        return `⚔️ +${value} 攻击`;
      case 'defense':
        return `🛡️ +${value} 防御`;
      case 'hp':
        return `❤️ +${value} 生命`;
      default:
        return `${type}: ${value}`;
    }
  };

  const renderNodeContent = (node: StorylineNode) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{node.icon || '📜'}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-100">{node.title}</h3>
            <p className="text-sm text-gray-400">
              {node.nodeType === 'event' && '事件'}
              {node.nodeType === 'battle' && '战斗'}
              {node.nodeType === 'dialogue' && '对话'}
              {node.nodeType === 'choice' && '抉择'}
              {node.nodeType === 'ending' && '结局'}
              {node.nodeType === 'branch' && '分支'}
            </p>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed">{node.description}</p>

        {node.rewards && node.rewards.length > 0 && (
          <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-3">
            <p className="text-sm text-amber-400 font-medium mb-2">奖励</p>
            <div className="flex flex-wrap gap-2">
              {node.rewards.map((reward, idx) => (
                <span key={idx} className="text-sm text-amber-200 bg-amber-800/30 px-2 py-1 rounded">
                  {renderRewardIcon(reward.type, reward.value)}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.choices && node.choices.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">做出你的选择：</p>
            {node.choices.map((choice: StorylineChoice) => {
              const accessible = choice.condition
                ? isStorylineNodeAccessible(selectedStoryline!.id, choice.nextNodeId)
                : true;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  disabled={!accessible}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    accessible
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-amber-500 cursor-pointer'
                      : 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100">{choice.text}</span>
                    {choice.alignment && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        choice.alignment === 'light' ? 'bg-yellow-500/20 text-yellow-400' :
                        choice.alignment === 'shadow' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {choice.alignment === 'light' ? '☀️ 光明' : choice.alignment === 'shadow' ? '🌙 暗影' : '⚖️ 平衡'}
                      </span>
                    )}
                  </div>
                  {choice.consequencePreview && (
                    <p className="text-xs text-gray-400 mt-1">{choice.consequencePreview}</p>
                  )}
                  {!accessible && (
                    <p className="text-xs text-red-400 mt-1">条件不满足</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {(!node.choices || node.choices.length === 0) && !node.isEnding && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
          >
            继续 →
          </button>
        )}

        {node.isEnding && (
          <div className="bg-gradient-to-r from-amber-900/50 to-purple-900/50 border border-amber-500/30 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">🏆</p>
            <p className="text-lg font-bold text-amber-400">结局达成</p>
            <p className="text-sm text-gray-300 mt-2">恭喜你完成了这段剧情！</p>
          </div>
        )}
      </div>
    );
  };

  const renderStorylineDetail = () => {
    if (!selectedStoryline) return null;

    const progress = getStorylineProgress(selectedStoryline.id);
    const node = currentNode;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedStoryline(null)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← 返回
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedStoryline.icon}</span>
              <h2 className="text-xl font-bold text-gray-100">{selectedStoryline.name}</h2>
            </div>
            <p className="text-sm text-gray-400">{selectedStoryline.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              进度: {progress.completedNodeIds.length} / {selectedStoryline.nodes.length}
            </p>
            <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${(progress.completedNodeIds.length / selectedStoryline.nodes.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!progress.unlocked ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🔒</span>
              <p className="text-gray-400 mb-4">剧情尚未解锁</p>
              {canStartStoryline(selectedStoryline.id) && (
                <button
                  onClick={() => handleStartStoryline(selectedStoryline.id)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
                >
                  开始剧情
                </button>
              )}
            </div>
          ) : node ? (
            <div className="bg-gray-800/50 rounded-lg p-6">
              {renderNodeContent(node)}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📖</span>
              <p className="text-gray-400 mb-4">
                {progress.completed ? '剧情已完成' : '选择一个节点开始'}
              </p>
              {!progress.currentNodeId && !progress.completed && (
                <button
                  onClick={() => handleStartStoryline(selectedStoryline.id)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
                >
                  重新开始
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEndingDetail = () => {
    if (!selectedEnding) return null;

    const progress = getEndingProgress(selectedEnding.id);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedEnding(null)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← 返回
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedEnding.icon}</span>
              <h2 className="text-xl font-bold text-gray-100">{selectedEnding.name}</h2>
            </div>
            <p className="text-sm text-gray-400">
              {selectedEnding.type === 'good' && '🌞 好结局'}
              {selectedEnding.type === 'bad' && '🌑 坏结局'}
              {selectedEnding.type === 'neutral' && '⚖️ 中性结局'}
              {selectedEnding.type === 'secret' && '🔮 隐藏结局'}
              {selectedEnding.type === 'true' && '👑 真结局'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!progress.unlocked ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🔒</span>
              <p className="text-gray-400 mb-2">结局尚未解锁</p>
              <p className="text-sm text-gray-500">{selectedEnding.hint || '完成特定条件后解锁'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedEnding.description}
                </p>
              </div>

              {selectedEnding.rewards && selectedEnding.rewards.length > 0 && (
                <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-4">
                  <p className="text-sm text-amber-400 font-medium mb-3">解锁奖励</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnding.rewards.map((reward, idx) => (
                      <span key={idx} className="text-sm text-amber-200 bg-amber-800/30 px-3 py-1 rounded">
                        {renderRewardIcon(reward.type, reward.value)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEnding.inheritBonuses && selectedEnding.inheritBonuses.length > 0 && (
                <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4">
                  <p className="text-sm text-purple-400 font-medium mb-3">周目继承奖励</p>
                  <div className="space-y-2">
                    {selectedEnding.inheritBonuses.map((bonus) => (
                      <div key={bonus.id} className="flex items-center justify-between bg-purple-800/20 p-2 rounded">
                        <div>
                          <span className="text-sm font-medium text-purple-200">{bonus.name}</span>
                          <p className="text-xs text-purple-300">{bonus.description}</p>
                        </div>
                        <span className="text-purple-400 text-sm">{bonus.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progress.unlockedAt && (
                <p className="text-xs text-gray-500 text-center">
                  解锁时间：{new Date(progress.unlockedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs: { id: FateTab; label: string; icon: string }[] = [
    { id: 'storyline', label: '剧情线', icon: '📖' },
    { id: 'endings', label: '结局', icon: '🏆' },
    { id: 'alignment', label: '命运', icon: '⚖️' },
    { id: 'inheritance', label: '继承', icon: '🔄' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900/95 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span>🎭</span> 命运抉择
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>📖 {getStorylineCompletedCount()} 剧情</span>
          <span>🏆 {getEndingUnlockedCount()} 结局</span>
          <span>🔄 第 {getTotalPlaythroughCount() + 1} 周目</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFateTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              fate.activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {fate.activeTab === 'storyline' && (
          selectedStoryline ? renderStorylineDetail() : (
            <div className="h-full overflow-y-auto space-y-3">
              {availableStorylines.map((storyline) => {
                const progress = getStorylineProgress(storyline.id);
                const canStart = canStartStoryline(storyline.id);
                return (
                  <div
                    key={storyline.id}
                    onClick={() => setSelectedStoryline(storyline)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      progress.completed
                        ? 'bg-green-900/20 border-green-600/30 hover:bg-green-900/30'
                        : progress.unlocked
                        ? 'bg-amber-900/20 border-amber-600/30 hover:bg-amber-900/30'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                    }`}
                    style={{ borderLeftColor: storyline.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{storyline.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-100 truncate">{storyline.name}</h3>
                          {progress.completed && <span className="text-green-400 text-sm">✓ 已完成</span>}
                          {progress.unlocked && !progress.completed && (
                            <span className="text-amber-400 text-sm">进行中</span>
                          )}
                          {!progress.unlocked && !canStart && <span className="text-gray-500 text-sm">🔒 未解锁</span>}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{storyline.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            {storyline.type === 'main' && '主线'}
                            {storyline.type === 'side' && '支线'}
                            {storyline.type === 'companion' && '伙伴'}
                            {storyline.type === 'secret' && '隐藏'}
                          </span>
                          <span>{storyline.nodes.length} 节点</span>
                          {storyline.endNodeIds && <span>{storyline.endNodeIds.length} 结局</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {progress.completedNodeIds.length}/{storyline.nodes.length}
                        </p>
                        <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(progress.completedNodeIds.length / storyline.nodes.length) * 100}%`,
                              backgroundColor: storyline.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {fate.activeTab === 'endings' && (
          selectedEnding ? renderEndingDetail() : (
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {unlockedEndings.map((ending) => {
                  const progress = getEndingProgress(ending.id);
                  return (
                    <div
                      key={ending.id}
                      onClick={() => setSelectedEnding(ending)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                        progress.unlocked
                          ? ending.type === 'good'
                            ? 'bg-green-900/20 border-green-600/30 hover:bg-green-900/30'
                            : ending.type === 'bad'
                            ? 'bg-red-900/20 border-red-600/30 hover:bg-red-900/30'
                            : ending.type === 'secret'
                            ? 'bg-purple-900/20 border-purple-600/30 hover:bg-purple-900/30'
                            : ending.type === 'true'
                            ? 'bg-amber-900/20 border-amber-600/30 hover:bg-amber-900/30'
                            : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                          : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/30'
                      }`}
                    >
                      <span className="text-4xl block mb-2">
                        {progress.unlocked ? ending.icon : '❓'}
                      </span>
                      <h3 className="font-medium text-gray-100 text-sm">
                        {progress.unlocked ? ending.name : '???'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {ending.type === 'good' && '好结局'}
                        {ending.type === 'bad' && '坏结局'}
                        {ending.type === 'neutral' && '中性结局'}
                        {ending.type === 'secret' && '隐藏结局'}
                        {ending.type === 'true' && '真结局'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {fate.activeTab === 'alignment' && (
          <div className="h-full overflow-y-auto space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4 text-center">命运天平</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-400">☀️ 光明</span>
                    <span className="text-yellow-400">{alignmentPercent.light}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                      style={{ width: `${alignmentPercent.light}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-400">🌙 暗影</span>
                    <span className="text-purple-400">{alignmentPercent.shadow}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all"
                      style={{ width: `${alignmentPercent.shadow}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">⚖️ 平衡</span>
                    <span className="text-blue-400">{alignmentPercent.balance}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${alignmentPercent.balance}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{alignment.light}</p>
                    <p className="text-xs text-gray-400">光明点数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{alignment.shadow}</p>
                    <p className="text-xs text-gray-400">暗影点数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{alignment.balance}</p>
                    <p className="text-xs text-gray-400">平衡点数</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">抉择影响</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• 你的选择会影响命运天平的倾斜</p>
                <p>• 不同的命运偏向会解锁不同的剧情分支</p>
                <p>• 光明路线：正义、守护、牺牲</p>
                <p>• 暗影路线：力量、野心、掌控</p>
                <p>• 平衡路线：中立、智慧、中庸</p>
              </div>
            </div>
          </div>
        )}

        {fate.activeTab === 'inheritance' && (
          <div className="h-full overflow-y-auto space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">周目统计</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-amber-400">{getTotalPlaythroughCount() + 1}</p>
                  <p className="text-sm text-gray-400 mt-1">当前周目</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">{getStorylineCompletedCount()}</p>
                  <p className="text-sm text-gray-400 mt-1">完成剧情</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">{getEndingUnlockedCount()}</p>
                  <p className="text-sm text-gray-400 mt-1">解锁结局</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">
                继承加成 ({inheritedBonuses.length}/{INHERITED_BONUSES.length})
              </h3>
              {inheritedBonuses.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  还没有继承任何加成，解锁结局后可获得周目继承奖励
                </p>
              ) : (
                <div className="space-y-3">
                  {inheritedBonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="flex items-center justify-between bg-purple-900/20 border border-purple-600/30 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bonus.icon}</span>
                        <div>
                          <p className="font-medium text-purple-200">{bonus.name}</p>
                          <p className="text-xs text-purple-300">{bonus.description}</p>
                        </div>
                      </div>
                      <span className="text-purple-400 font-bold">+{bonus.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">未解锁加成</h3>
              <div className="space-y-2">
                {INHERITED_BONUSES.filter((b) => !fate.inheritedBonusIds.includes(b.id)).map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className="font-medium text-gray-400">{bonus.name}</p>
                        <p className="text-xs text-gray-500">{bonus.description}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 font-bold">+{bonus.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
