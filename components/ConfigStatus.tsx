import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { checkAllConfigs, getConfigStatusDescription, getConfigSuggestions, ConfigStatus as ConfigStatusType } from '@/utils/configChecker';

interface ConfigStatusProps {
  showSuggestions?: boolean;
  onStatusChange?: (status: ConfigStatusType) => void;
}

export default function ConfigStatus({ showSuggestions = true, onStatusChange }: ConfigStatusProps) {
  const [status, setStatus] = useState<ConfigStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfigStatus();
  }, []);

  const checkConfigStatus = async () => {
    try {
      setLoading(true);
      const configStatus = await checkAllConfigs();
      setStatus(configStatus);
      onStatusChange?.(configStatus);
    } catch (error) {
      console.error('配置状态检查失败:', error);
      Alert.alert('配置检查失败', '无法检查API配置状态');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>正在检查配置...</ThemedText>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>配置检查失败</ThemedText>
      </View>
    );
  }

  const descriptions = getConfigStatusDescription(status);
  const suggestions = showSuggestions ? getConfigSuggestions(status) : [];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>API配置状态</ThemedText>
      
      <View style={styles.statusContainer}>
        {descriptions.map((description, index) => (
          <ThemedText key={index} style={styles.statusText}>
            {description}
          </ThemedText>
        ))}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ThemedText style={styles.suggestionsTitle}>配置建议:</ThemedText>
          {suggestions.map((suggestion, index) => (
            <ThemedText key={index} style={styles.suggestionText}>
              {suggestion}
            </ThemedText>
          ))}
        </View>
      )}

      <View style={styles.priorityContainer}>
        <ThemedText style={styles.priorityTitle}>功能状态:</ThemedText>
        <ThemedText style={styles.priorityText}>
          {status.overall.hasAnyApi ? '✅ 功能可用' : '❌ 功能受限'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  suggestionText: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
    color: '#666',
  },
  priorityContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FF3B30',
  },
}); 