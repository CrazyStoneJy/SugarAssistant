import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BloodSugarRecord {
  id: string;
  timestamp: Date;
  bloodSugar: number; // 血糖值 (mmol/L)
  mealType: 'before-breakfast' | 'after-breakfast' | 'before-lunch' | 'after-lunch' | 'before-dinner' | 'after-dinner' | 'bedtime';
  notes?: string;
}

/**
 * 获取所有血糖记录
 */
export async function getAllBloodSugarRecords(): Promise<BloodSugarRecord[]> {
  try {
    const storedRecords = await AsyncStorage.getItem('bloodSugarRecords');
    if (storedRecords) {
      return JSON.parse(storedRecords).map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('获取血糖记录失败:', error);
    return [];
  }
}

/**
 * 获取最近的血糖记录（默认最近7天）
 */
export async function getRecentBloodSugarRecords(days: number = 7): Promise<BloodSugarRecord[]> {
  try {
    const allRecords = await getAllBloodSugarRecords();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allRecords.filter(record => record.timestamp >= cutoffDate);
  } catch (error) {
    console.error('获取最近血糖记录失败:', error);
    return [];
  }
}

/**
 * 格式化血糖记录为系统提示词格式
 */
export function formatBloodSugarRecordsForPrompt(records: BloodSugarRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  const mealTypeLabels = {
    'before-breakfast': '早餐前',
    'after-breakfast': '早餐后',
    'before-lunch': '午餐前',
    'after-lunch': '午餐后',
    'before-dinner': '晚餐前',
    'after-dinner': '晚餐后',
    'bedtime': '睡前'
  };

  // 按日期分组
  const groupedByDate = records.reduce((groups, record) => {
    const dateKey = record.timestamp.toLocaleDateString('zh-CN');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(record);
    return groups;
  }, {} as Record<string, BloodSugarRecord[]>);

  // 格式化输出
  const formattedRecords = Object.entries(groupedByDate).map(([date, dayRecords]) => {
    const sortedRecords = dayRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const daySummary = sortedRecords.map(record => {
      const time = record.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const mealType = mealTypeLabels[record.mealType];
      const value = record.bloodSugar;
      const notes = record.notes ? ` (备注: ${record.notes})` : '';
      
      return `${mealType} ${time}: ${value} mmol/L${notes}`;
    }).join('\n    ');
    
    return `${date}:\n    ${daySummary}`;
  }).join('\n\n');

  return `\n\n用户血糖记录数据：\n${formattedRecords}\n\n请基于这些血糖记录数据，结合营养师的专业知识，为用户提供针对性的饮食建议和血糖控制建议。重点关注血糖波动模式、餐次管理、以及可能的饮食调整建议。`;
}

/**
 * 获取血糖统计信息
 */
export function getBloodSugarStats(records: BloodSugarRecord[]): {
  totalRecords: number;
  average: number;
  highest: number;
  lowest: number;
  normalRange: number;
  highRange: number;
  lowRange: number;
} {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      normalRange: 0,
      highRange: 0,
      lowRange: 0
    };
  }

  const values = records.map(r => r.bloodSugar);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  
  const normalRange = values.filter(v => v >= 3.9 && v <= 6.1).length;
  const highRange = values.filter(v => v > 6.1).length;
  const lowRange = values.filter(v => v < 3.9).length;

  return {
    totalRecords: records.length,
    average: Math.round(average * 10) / 10,
    highest: Math.round(highest * 10) / 10,
    lowest: Math.round(lowest * 10) / 10,
    normalRange,
    highRange,
    lowRange
  };
}

/**
 * 分析血糖趋势
 */
export function analyzeBloodSugarTrends(records: BloodSugarRecord[]): {
  trend: 'improving' | 'stable' | 'worsening' | 'fluctuating';
  description: string;
  recommendations: string[];
} {
  if (records.length < 3) {
    return {
      trend: 'stable',
      description: '记录数据不足，无法分析趋势',
      recommendations: ['建议继续记录血糖数据，以便进行趋势分析']
    };
  }

  // 按时间排序
  const sortedRecords = records.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // 计算最近7天的平均值
  const recentRecords = sortedRecords.slice(-7);
  const olderRecords = sortedRecords.slice(0, -7);
  
  if (recentRecords.length === 0 || olderRecords.length === 0) {
    return {
      trend: 'stable',
      description: '数据不足，无法进行趋势分析',
      recommendations: ['建议继续记录血糖数据']
    };
  }

  const recentAvg = recentRecords.reduce((sum, r) => sum + r.bloodSugar, 0) / recentRecords.length;
  const olderAvg = olderRecords.reduce((sum, r) => sum + r.bloodSugar, 0) / olderRecords.length;
  
  const change = recentAvg - olderAvg;
  const changePercent = (change / olderAvg) * 100;

  if (Math.abs(changePercent) < 5) {
    return {
      trend: 'stable',
      description: '血糖水平相对稳定',
      recommendations: [
        '继续保持当前的饮食和生活方式',
        '定期监测血糖水平',
        '如有异常及时就医'
      ]
    };
  } else if (changePercent < -5) {
    return {
      trend: 'improving',
      description: '血糖水平有所改善',
      recommendations: [
        '继续保持良好的饮食习惯',
        '规律运动有助于血糖控制',
        '定期复查，监测改善情况'
      ]
    };
  } else if (changePercent > 5) {
    return {
      trend: 'worsening',
      description: '血糖水平有所上升',
      recommendations: [
        '建议咨询医生调整治疗方案',
        '注意饮食控制，减少高糖食物',
        '增加运动量，帮助血糖控制',
        '定期监测血糖变化'
      ]
    };
  } else {
    return {
      trend: 'fluctuating',
      description: '血糖水平波动较大',
      recommendations: [
        '建议咨询医生了解波动原因',
        '保持规律的饮食和作息时间',
        '避免情绪波动和压力',
        '定期监测血糖水平'
      ]
    };
  }
}
