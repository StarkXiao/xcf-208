import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';

export default function OfflineRewardsModal() {
  const { calculateOfflineRewards, collectOfflineRewards, lastOnlineTime } = useGameStore();
  const [show, setShow] = useState(false);
  const [rewards, setRewards] = useState({ exp: 0, gold: 0 });
  const [offlineDuration, setOfflineDuration] = useState('');

  useEffect(() => {
    const checkOfflineRewards = () => {
      const rewards = calculateOfflineRewards();
      const now = Date.now();
      const offlineMs = now - lastOnlineTime;
      const offlineMinutes = Math.floor(offlineMs / 60000);
      const offlineHours = Math.floor(offlineMinutes / 60);
      const offlineDays = Math.floor(offlineHours / 24);

      if (rewards.exp > 0 || rewards.gold > 0) {
        setRewards(rewards);
        
        if (offlineDays > 0) {
          setOfflineDuration(`${offlineDays}天${offlineHours % 24}小时`);
        } else if (offlineHours > 0) {
          setOfflineDuration(`${offlineHours}小时${offlineMinutes % 60}分钟`);
        } else {
          setOfflineDuration(`${offlineMinutes}分钟`);
        }
        
        setShow(true);
      }
    };

    const timer = setTimeout(checkOfflineRewards, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCollect = () => {
    collectOfflineRewards();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="offline-modal-overlay">
      <div className="offline-modal">
        <div className="offline-modal-header">
          <h3>📦 欢迎回来！</h3>
        </div>
        
        <div className="offline-modal-body">
          <p className="offline-duration">
            你离开了 <span className="highlight">{offlineDuration}</span>
          </p>
          
          <div className="offline-rewards">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-label">经验</span>
              <span className="reward-value">+{rewards.exp.toLocaleString()}</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-label">金币</span>
              <span className="reward-value">+{rewards.gold.toLocaleString()}</span>
            </div>
          </div>

          <p className="offline-hint">
            提示：离线收益为在线收益的 50%，最多计算 8 小时
          </p>
        </div>

        <button className="collect-btn" onClick={handleCollect}>
          🎁 领取奖励
        </button>
      </div>
    </div>
  );
}
