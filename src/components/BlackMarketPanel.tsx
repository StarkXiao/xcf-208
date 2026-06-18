import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import {
  TRADE_RARITY_COLORS,
  TRADE_RARITY_NAMES,
  TRADE_CATEGORY_NAMES,
  TRADE_CATEGORY_ICONS,
  BLACK_MARKET_CONFIG,
} from '../game/data';
import type { TradeItem, TradeInventoryItem } from '../game/types';

export default function BlackMarketPanel() {
  const {
    player,
    blackMarketInventory,
    isBlackMarketUnlocked,
    shouldRefreshBlackMarket,
    refreshBlackMarket,
    buyBlackMarketItem,
    getBlackMarketItems,
    getActiveTradeEvents,
    checkTradeEvents,
  } = useGameStore();

  const [selectedItem, setSelectedItem] = useState<{ item: TradeItem; inventory: TradeInventoryItem } | null>(null);
  const [quantity, setQuantity] = useState(1);

  const unlocked = isBlackMarketUnlocked();
  const items = getBlackMarketItems();
  const activeEvents = getActiveTradeEvents();

  useEffect(() => {
    if (unlocked && shouldRefreshBlackMarket()) {
      refreshBlackMarket();
    }
  }, [unlocked, shouldRefreshBlackMarket, refreshBlackMarket]);

  useEffect(() => {
    if (!unlocked) return;
    const timer = setInterval(() => {
      checkTradeEvents();
    }, 5000);
    return () => clearInterval(timer);
  }, [unlocked, checkTradeEvents]);

  const handleBuy = () => {
    if (!selectedItem) return;
    const success = buyBlackMarketItem(selectedItem.item.id, quantity);
    if (success) {
      setQuantity(1);
      const updated = getBlackMarketItems().find(
        (i) => i.item.id === selectedItem.item.id
      );
      if (updated) {
        setSelectedItem(updated);
      } else {
        setSelectedItem(null);
      }
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

  const maxBuyQuantity = (item: TradeItem, inv: TradeInventoryItem) => {
    if (item.currency === 'gold') {
      return Math.min(inv.currentStock, Math.floor(player.stats.gold / inv.currentPrice));
    }
    return Math.min(inv.currentStock, Math.floor(player.stats.soulOrbs / inv.currentPrice));
  };

  if (!unlocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-100">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-purple-400 mb-2">黑市未解锁</h2>
        <p className="text-gray-400 mb-4">需要达到 {BLACK_MARKET_CONFIG.unlockLevel} 级才能进入黑市</p>
        <p className="text-sm text-gray-500">
          当前等级: {player.stats.level} 级
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-purple-900 bg-gradient-to-r from-purple-900/50 to-gray-900">
        <h2 className="text-xl font-bold text-purple-400 mb-2">🌑 神秘黑市</h2>
        <p className="text-sm text-gray-400 mb-3">
          传闻中的地下交易市场，出售稀有物品，价格波动剧烈...
        </p>

        {activeEvents.length > 0 && (
          <div className="space-y-2 mb-3">
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshBlackMarket()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors"
          >
            🔄 刷新商品
          </button>
          <span className="text-sm text-gray-400">
            刷新费用: {BLACK_MARKET_CONFIG.refreshCost}{' '}
            {BLACK_MARKET_CONFIG.refreshCurrency === 'gold' ? '💰' : '💎'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-2/3 overflow-y-auto p-4 border-r border-purple-900/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">黑市商品</span>
            <span className="text-xs text-purple-400">
              稀有物品出现概率提升
            </span>
          </div>

          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {blackMarketInventory ? '暂无商品' : '点击刷新查看商品'}
              </div>
            ) : (
              items.map(({ item, inventory }) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem({ item, inventory })}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedItem?.item.id === item.id
                      ? 'bg-purple-900/30 border-purple-500'
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
                          {inventory.priceModifier < 0.9 && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-green-900 text-green-400">
                              折扣
                            </span>
                          )}
                          {inventory.priceModifier > 1.3 && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-400">
                              稀缺
                            </span>
                          )}
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
              <div
                className="text-lg font-bold mb-3"
                style={{ color: TRADE_RARITY_COLORS[selectedItem.item.rarity] }}
              >
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
                    onClick={() => setQuantity(maxBuyQuantity(selectedItem.item, selectedItem.inventory))}
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
                  <span>
                    {selectedItem.inventory.currentPrice}{' '}
                    {selectedItem.item.currency === 'gold' ? '💰' : '💎'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">市场价:</span>
                  <span className="text-gray-500">
                    {selectedItem.item.basePrice}{' '}
                    {selectedItem.item.currency === 'gold' ? '💰' : '💎'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">总计:</span>
                  <span className="font-bold text-purple-400">
                    {selectedItem.inventory.currentPrice * quantity}{' '}
                    {selectedItem.item.currency === 'gold' ? '💰' : '💎'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={
                  !canAfford(selectedItem.item, selectedItem.inventory, quantity) ||
                  quantity > selectedItem.inventory.currentStock
                }
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                购买
              </button>

              <div className="mt-4 p-3 bg-purple-900/30 rounded border border-purple-800">
                <div className="text-xs text-purple-300">
                  <p className="mb-1">⚠️ 黑市提示</p>
                  <ul className="text-purple-400 space-y-1 ml-2">
                    <li>• 商品稀有度更高</li>
                    <li>• 价格波动更大</li>
                    <li>• 刷新需要费用</li>
                    <li>• 小心被坑！</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              选择一个商品查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
