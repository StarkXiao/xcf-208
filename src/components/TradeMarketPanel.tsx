import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import {
  TRADE_RARITY_COLORS,
  TRADE_RARITY_NAMES,
  TRADE_CATEGORY_NAMES,
  TRADE_CATEGORY_ICONS,
  MAP_AREAS,
} from '../game/data';
import type { TradeItem, TradeInventoryItem } from '../game/types';

export default function TradeMarketPanel() {
  const {
    player,
    tradeRecords,
    getAvailableTradeItems,
    shouldRefreshTrade,
    refreshTradeInventory,
    buyTradeItem,
    sellTradeItem,
    getMaterialCount,
    getActiveTradeEvents,
    checkTradeEvents,
  } = useGameStore();

  const [selectedAreaId, setSelectedAreaId] = useState<string>(MAP_AREAS[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<{ item: TradeItem; inventory: TradeInventoryItem } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'history'>('buy');

  useEffect(() => {
    if (shouldRefreshTrade(selectedAreaId)) {
      refreshTradeInventory(selectedAreaId);
    }
  }, [selectedAreaId, shouldRefreshTrade, refreshTradeInventory]);

  useEffect(() => {
    const timer = setInterval(() => {
      checkTradeEvents();
    }, 5000);
    return () => clearInterval(timer);
  }, [checkTradeEvents]);

  const availableItems = getAvailableTradeItems(selectedAreaId);
  const activeEvents = getActiveTradeEvents();

  const handleBuy = () => {
    if (!selectedItem) return;
    const success = buyTradeItem(selectedItem.item.id, selectedAreaId, quantity);
    if (success) {
      setQuantity(1);
      const updated = getAvailableTradeItems(selectedAreaId).find(
        (i) => i.item.id === selectedItem.item.id
      );
      if (updated) {
        setSelectedItem(updated);
      } else {
        setSelectedItem(null);
      }
    }
  };

  const handleSell = () => {
    if (!selectedItem) return;
    const success = sellTradeItem(selectedItem.item.id, selectedAreaId, quantity);
    if (success) {
      setQuantity(1);
    }
  };

  const getPriceColor = (modifier: number) => {
    if (modifier < 0.9) return 'text-green-400';
    if (modifier > 1.1) return 'text-red-400';
    return 'text-gray-200';
  };

  const getPriceChangeText = (modifier: number) => {
    const percent = Math.round((modifier - 1) * 100);
    if (percent > 0) return `+${percent}%`;
    if (percent < 0) return `${percent}%`;
    return '0%';
  };

  const canAfford = (item: TradeItem, inv: TradeInventoryItem, qty: number) => {
    const total = inv.currentPrice * qty;
    if (item.currency === 'gold') return player.stats.gold >= total;
    return player.stats.soulOrbs >= total;
  };

  const hasMaterial = (item: TradeItem, qty: number) => {
    if (!item.materialId) return false;
    return getMaterialCount(item.materialId) >= qty;
  };

  const maxBuyQuantity = (item: TradeItem, inv: TradeInventoryItem) => {
    if (item.currency === 'gold') {
      return Math.min(inv.currentStock, Math.floor(player.stats.gold / inv.currentPrice));
    }
    return Math.min(inv.currentStock, Math.floor(player.stats.soulOrbs / inv.currentPrice));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-amber-400 mb-3">🏪 交易行</h2>
        
        <div className="flex gap-2 mb-3 flex-wrap">
          {MAP_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => {
                setSelectedAreaId(area.id);
                setSelectedItem(null);
              }}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedAreaId === area.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          {(['buy', 'sell', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {tab === 'buy' ? '购买' : tab === 'sell' ? '出售' : '交易记录'}
            </button>
          ))}
        </div>

        {activeEvents.length > 0 && (
          <div className="space-y-2">
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className={`p-2 rounded text-sm ${
                  event.isPositive ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
                }`}
              >
                <span className="mr-2">{event.icon}</span>
                <span className="font-medium">{event.title}</span>
                <span className="text-gray-400 ml-2">- {event.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeTab !== 'history' ? (
          <>
            <div className="w-2/3 overflow-y-auto p-4 border-r border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">
                  {activeTab === 'buy' ? '可购买商品' : '可出售商品'}
                </span>
                {activeTab === 'buy' && (
                  <button
                    onClick={() => refreshTradeInventory(selectedAreaId)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded transition-colors"
                  >
                    🔄 刷新商品
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {availableItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">暂无商品</div>
                ) : (
                  availableItems.map(({ item, inventory }) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem({ item, inventory })}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedItem?.item.id === item.id
                          ? 'bg-amber-900/30 border-amber-500'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div
                              className="font-medium"
                              style={{ color: TRADE_RARITY_COLORS[item.rarity] }}
                            >
                              {item.name}
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-700">
                                {TRADE_CATEGORY_ICONS[item.category]} {TRADE_CATEGORY_NAMES[item.category]}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              稀有度: {TRADE_RARITY_NAMES[item.rarity]}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getPriceColor(inventory.priceModifier)}`}>
                            {inventory.currentPrice}{' '}
                            <span className="text-sm">
                              {item.currency === 'gold' ? '💰' : '💎'}
                            </span>
                          </div>
                          <div className={`text-xs ${getPriceColor(inventory.priceModifier)}`}>
                            {getPriceChangeText(inventory.priceModifier)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            库存: {inventory.currentStock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-1/3 p-4 flex flex-col">
              {selectedItem ? (
                <>
                  <div className="text-lg font-bold mb-3" style={{ color: TRADE_RARITY_COLORS[selectedItem.item.rarity] }}>
                    {selectedItem.item.icon} {selectedItem.item.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">{selectedItem.item.description}</div>

                  {selectedItem.item.effect && (
                    <div className="mb-4 p-3 bg-gray-800 rounded">
                      <div className="text-sm text-gray-300">
                        效果: +{selectedItem.item.effect.value} {selectedItem.item.effect.type}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">数量</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 h-8 bg-gray-800 border border-gray-600 rounded text-center"
                      />
                      <button
                        onClick={() => {
                          if (activeTab === 'buy') {
                            setQuantity(maxBuyQuantity(selectedItem.item, selectedItem.inventory));
                          } else {
                            setQuantity(getMaterialCount(selectedItem.item.materialId || ''));
                          }
                        }}
                        className="px-3 h-8 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        最大
                      </button>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-800 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">单价:</span>
                      <span>{selectedItem.inventory.currentPrice} {selectedItem.item.currency === 'gold' ? '💰' : '💎'}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">总计:</span>
                      <span className="font-bold text-amber-400">
                        {selectedItem.inventory.currentPrice * quantity}{' '}
                        {selectedItem.item.currency === 'gold' ? '💰' : '💎'}
                      </span>
                    </div>
                    {activeTab === 'sell' && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">出售收入:</span>
                        <span className="font-bold text-green-400">
                          {Math.floor(selectedItem.item.basePrice * 0.5) * quantity} 💰
                        </span>
                      </div>
                    )}
                  </div>

                  {activeTab === 'buy' ? (
                    <button
                      onClick={handleBuy}
                      disabled={!canAfford(selectedItem.item, selectedItem.inventory, quantity) || quantity > selectedItem.inventory.currentStock}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                    >
                      购买
                    </button>
                  ) : (
                    <button
                      onClick={handleSell}
                      disabled={!hasMaterial(selectedItem.item, quantity)}
                      className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                    >
                      出售
                    </button>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  选择一个商品查看详情
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {tradeRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无交易记录</div>
              ) : (
                tradeRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={record.type === 'buy' ? 'text-blue-400' : 'text-green-400'}>
                          {record.type === 'buy' ? '购买' : '出售'}
                        </span>
                        <span className="ml-2 font-medium">{record.itemName}</span>
                        <span className="text-gray-400 ml-2">x{record.quantity}</span>
                      </div>
                      <div className={`font-medium ${
                        record.type === 'buy' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {record.type === 'buy' ? '-' : '+'}
                        {record.totalPrice} {record.currency === 'gold' ? '💰' : '💎'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(record.timestamp).toLocaleString()}
                      {record.areaId && ` · ${MAP_AREAS.find((a) => a.id === record.areaId)?.name || record.areaId}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
