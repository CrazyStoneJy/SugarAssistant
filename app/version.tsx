import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getBaiduSpeechConfig, isBaiduSpeechConfigured } from '@/config/env';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import { diagnoseBaiduSpeechIssues } from '@/utils/baiduSpeechApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface VersionInfo {
  appVersion: string;
  buildNumber: string;
  runtimeVersion: string;
  easBuildNumber: string;
  easBuildId: string | null;
  updateId: string | null;
  channel: string | null;
  isUpdateAvailable: boolean;
  lastUpdateCheck: string | null;
}

export default function VersionScreen() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    appVersion: '',
    buildNumber: '',
    runtimeVersion: '',
    easBuildNumber: '',
    easBuildId: null,
    updateId: null,
    channel: null,
    isUpdateAvailable: false,
    lastUpdateCheck: null,
  });
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      // 获取应用版本信息
      const appVersion = Constants.expoConfig?.version || '1.0.0';
      const buildNumber = Constants.expoConfig?.ios?.buildNumber || 
                         Constants.expoConfig?.android?.versionCode?.toString() || '1';
      
      // 获取运行时版本
      let runtimeVersion = '1.0.0';
      if (typeof Constants.expoConfig?.runtimeVersion === 'string') {
        runtimeVersion = Constants.expoConfig.runtimeVersion;
      } else if (Constants.expoConfig?.runtimeVersion?.policy === 'appVersion') {
        runtimeVersion = appVersion;
      }

      // 获取 EAS 构建信息
      const easBuildNumber = Constants.expoConfig?.android?.versionCode?.toString() || 
                            Constants.expoConfig?.ios?.buildNumber || '1';
      const easBuildId = Constants.expoConfig?.extra?.eas?.buildId || null;

      // 获取更新信息
      let updateId = null;
      let channel = null;
      let isUpdateAvailable = false;

      if (Updates.isEnabled) {
        try {
          const update = await Updates.checkForUpdateAsync();
          isUpdateAvailable = update.isAvailable;
          updateId = Updates.updateId;
          channel = Updates.channel;
        } catch (error) {
          console.log('获取更新信息失败:', error);
        }
      }

      setVersionInfo({
        appVersion,
        buildNumber,
        runtimeVersion,
        easBuildNumber,
        easBuildId,
        updateId,
        channel,
        isUpdateAvailable,
        lastUpdateCheck: new Date().toLocaleString('zh-CN'),
      });
    } catch (error) {
      console.error('加载版本信息失败:', error);
    }
  };

  const handleCheckUpdate = async () => {
    try {
      if (!Updates.isEnabled) {
        Alert.alert('提示', 'Updates 功能未启用');
        return;
      }

      Alert.alert('检查更新', '正在检查更新...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Alert.alert(
          '发现更新',
          '发现新版本，是否立即更新？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '更新',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  Alert.alert('更新失败', '更新过程中出现错误');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('提示', '当前已是最新版本');
      }

      // 重新加载版本信息
      loadVersionInfo();
    } catch (error) {
      Alert.alert('错误', '检查更新失败');
    }
  };

  const getUpdateStatusText = () => {
    if (!Updates.isEnabled) return '未启用';
    if (versionInfo.isUpdateAvailable) return '有可用更新';
    return '已是最新版本';
  };

  const getUpdateStatusColor = () => {
    if (!Updates.isEnabled) return '#999';
    if (versionInfo.isUpdateAvailable) return '#FF9500';
    return '#4CAF50';
  };

  const runDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const result = await diagnoseBaiduSpeechIssues();
      setDiagnosis(result);
      
      const message = result.recommendations.join('\n');
      Alert.alert('百度语音API诊断结果', message);
    } catch (error) {
      Alert.alert('诊断失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const config = getBaiduSpeechConfig();
  const isConfigured = isBaiduSpeechConfigured();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'}
      />
      <ThemedView style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>版本信息</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 应用信息卡片 */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>应用信息</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>应用名称</ThemedText>
              <ThemedText style={styles.infoValue}>SugarAssistant</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>版本号</ThemedText>
              <ThemedText style={styles.infoValue}>{versionInfo.appVersion}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>构建号</ThemedText>
              <ThemedText style={styles.infoValue}>{versionInfo.buildNumber}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>EAS构建号</ThemedText>
              <ThemedText style={styles.infoValue}>{versionInfo.easBuildNumber}</ThemedText>
            </View>
            {versionInfo.easBuildId && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>EAS构建ID</ThemedText>
                <ThemedText style={styles.infoValue}>{versionInfo.easBuildId}</ThemedText>
              </View>
            )}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>运行时版本</ThemedText>
              <ThemedText style={styles.infoValue}>{versionInfo.runtimeVersion}</ThemedText>
            </View>
          </View>

          {/* 更新信息卡片 */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>更新信息</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>更新状态</ThemedText>
              <ThemedText style={[styles.infoValue, { color: getUpdateStatusColor() }]}>
                {getUpdateStatusText()}
              </ThemedText>
            </View>
            {versionInfo.channel && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>更新频道</ThemedText>
                <ThemedText style={styles.infoValue}>{versionInfo.channel}</ThemedText>
              </View>
            )}
            {versionInfo.updateId && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>更新ID</ThemedText>
                <ThemedText style={styles.infoValue}>{versionInfo.updateId}</ThemedText>
              </View>
            )}
            {versionInfo.lastUpdateCheck && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>最后检查</ThemedText>
                <ThemedText style={styles.infoValue}>{versionInfo.lastUpdateCheck}</ThemedText>
              </View>
            )}
          </View>

          {/* 系统信息卡片 */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>系统信息</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>平台</ThemedText>
              <ThemedText style={styles.infoValue}>{Platform.OS}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>平台版本</ThemedText>
              <ThemedText style={styles.infoValue}>{Platform.Version}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>设备型号</ThemedText>
              <ThemedText style={styles.infoValue}>{Constants.deviceName || '未知'}</ThemedText>
            </View>
          </View>

          {/* 操作按钮 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.checkUpdateButton} onPress={handleCheckUpdate}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>检查更新</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.refreshButton} onPress={loadVersionInfo}>
              <Ionicons name="reload" size={20} color="#007AFF" />
              <ThemedText style={styles.refreshButtonText}>刷新信息</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>百度语音API配置</ThemedText>
            <ThemedText style={styles.infoText}>
              配置状态: {isConfigured ? '✅ 已配置' : '❌ 未配置'}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              App ID: {config.appId ? `${config.appId.substring(0, 8)}...` : '未配置'}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              API Key: {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : '未配置'}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Secret Key: {config.secretKey ? `${config.secretKey.substring(0, 8)}...` : '未配置'}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.diagnoseButton, isDiagnosing && styles.diagnoseButtonDisabled]}
            onPress={runDiagnosis}
            disabled={isDiagnosing}
          >
            <Ionicons
              name="bug"
              size={20}
              color="#FFFFFF"
            />
            <ThemedText style={styles.diagnoseButtonText}>
              {isDiagnosing ? '诊断中...' : '诊断百度语音API'}
            </ThemedText>
          </TouchableOpacity>

          {diagnosis && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>诊断结果</ThemedText>
              {diagnosis.recommendations.map((rec: string, index: number) => (
                <ThemedText key={index} style={styles.diagnosisText}>
                  {rec}
                </ThemedText>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
  },
  checkUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  diagnoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  diagnoseButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  diagnoseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
}); 