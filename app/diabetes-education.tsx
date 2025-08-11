import { ThemedText } from '@/components/ThemedText';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface EducationSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
  expanded: boolean;
}

export default function DiabetesEducationScreen() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['what-is-diabetes']));

  const educationData: EducationSection[] = [
    {
      id: 'what-is-diabetes',
      title: '什么是糖尿病？',
      icon: 'medical',
      content: [
        '糖尿病是一种慢性代谢性疾病，特征是血糖水平持续升高。',
        '当身体无法产生足够的胰岛素或无法有效使用胰岛素时，就会发生糖尿病。',
        '胰岛素是帮助葡萄糖进入细胞的重要激素，葡萄糖是身体的主要能量来源。',
        '长期高血糖会损害血管、神经和器官，导致严重的并发症。'
      ],
      expanded: true
    },
    {
      id: 'types-of-diabetes',
      title: '糖尿病的类型',
      icon: 'list',
      content: [
        '1型糖尿病：免疫系统攻击胰腺中的胰岛素产生细胞，通常需要终身注射胰岛素。',
        '2型糖尿病：身体对胰岛素产生抵抗，或胰腺无法产生足够的胰岛素，是最常见的类型。',
        '妊娠糖尿病：怀孕期间发生的糖尿病，通常在分娩后消失。',
        '其他特殊类型：如药物引起的糖尿病、胰腺疾病等。'
      ],
      expanded: false
    },
    {
      id: 'symptoms',
      title: '常见症状',
      icon: 'warning',
      content: [
        '多饮、多尿、多食',
        '体重下降',
        '疲劳和虚弱',
        '视力模糊',
        '伤口愈合缓慢',
        '频繁感染',
        '手脚麻木或刺痛'
      ],
      expanded: false
    },
    {
      id: 'risk-factors',
      title: '危险因素',
      icon: 'alert-circle',
      content: [
        '家族史：有糖尿病家族史的人风险更高',
        '年龄：45岁以上人群风险增加',
        '超重或肥胖：特别是腹部脂肪过多',
        '缺乏运动：久坐不动的生活方式',
        '不健康饮食：高糖、高脂肪、低纤维饮食',
        '妊娠糖尿病史：曾患妊娠糖尿病的女性',
        '种族：某些种族群体风险更高'
      ],
      expanded: false
    },
    {
      id: 'prevention',
      title: '预防措施',
      icon: 'shield-checkmark',
      content: [
        '保持健康体重：通过饮食和运动控制体重',
        '规律运动：每周至少150分钟中等强度运动',
        '健康饮食：多吃蔬菜、水果、全谷物，限制精制糖和饱和脂肪',
        '戒烟限酒：避免吸烟，适量饮酒',
        '定期体检：监测血糖、血压和胆固醇水平',
        '管理压力：学习压力管理技巧',
        '充足睡眠：保证7-9小时的优质睡眠'
      ],
      expanded: false
    },
    {
      id: 'treatment',
      title: '治疗方法',
      icon: 'medical-outline',
      content: [
        '生活方式干预：饮食控制、运动、体重管理',
        '口服药物：如二甲双胍、磺脲类药物等',
        '胰岛素治疗：1型糖尿病和部分2型糖尿病需要',
        '血糖监测：定期检查血糖水平',
        '并发症预防：控制血压、血脂，定期眼科检查',
        '心理支持：糖尿病管理需要心理和情感支持',
        '教育：学习糖尿病自我管理技能'
      ],
      expanded: false
    },
    {
      id: 'diet-guidelines',
      title: '饮食指导',
      icon: 'nutrition',
      content: [
        '控制总热量：根据体重和活动量调整',
        '碳水化合物：选择低升糖指数的食物',
        '蛋白质：瘦肉、鱼类、豆类等优质蛋白',
        '脂肪：限制饱和脂肪，选择健康脂肪',
        '纤维：多吃蔬菜、水果、全谷物',
        '定时定量：规律进餐，避免暴饮暴食',
        '限制盐分：控制钠的摄入量'
      ],
      expanded: false
    },
    {
      id: 'complications',
      title: '并发症',
      icon: 'medical',
      content: [
        '心血管疾病：心脏病、中风',
        '肾病：糖尿病肾病，可能导致肾衰竭',
        '眼病：糖尿病视网膜病变，可能导致失明',
        '神经病变：手脚麻木、疼痛',
        '足部问题：糖尿病足，可能导致截肢',
        '皮肤问题：感染、溃疡',
        '牙周疾病：牙龈疾病'
      ],
      expanded: false
    },
    {
      id: 'emergency',
      title: '紧急情况',
      icon: 'call',
      content: [
        '低血糖：出汗、颤抖、饥饿、头晕、意识模糊',
        '高血糖：极度口渴、多尿、恶心、呕吐、腹痛',
        '酮症酸中毒：呼吸急促、水果味呼吸、意识改变',
        '立即就医：出现严重症状时及时寻求医疗帮助',
        '携带医疗卡：标明糖尿病类型和用药情况',
        '家人教育：让家人了解糖尿病紧急情况的处理'
      ],
      expanded: false
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSection = (section: EducationSection) => {
    const isExpanded = expandedSections.has(section.id);
    
    return (
      <View key={section.id} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleContainer}>
            <Ionicons 
              name={section.icon as any} 
              size={24} 
              color="#0a7ea4" 
              style={styles.sectionIcon}
            />
            <ThemedText style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#687076"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {section.content.map((item, index) => (
              <View key={index} style={styles.contentItem}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.contentText}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: getStatusBarHeight() + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>糖尿病科普</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* 简介卡片 */}
      <View style={styles.introCard}>
        <View style={styles.introHeader}>
          <Ionicons name="heart" size={32} color="#e74c3c" />
          <ThemedText style={styles.introTitle}>了解糖尿病，守护健康</ThemedText>
        </View>
        <ThemedText style={styles.introText}>
          糖尿病是一种常见的慢性疾病，通过了解其知识、预防措施和治疗方法，我们可以更好地管理健康，预防并发症的发生。
        </ThemedText>
      </View>

      {/* 主要内容 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {educationData.map(renderSection)}
        
        {/* 底部提示 */}
        <View style={styles.bottomTip}>
          <Ionicons name="information-circle" size={20} color="#0a7ea4" />
          <ThemedText style={styles.bottomTipText}>
            本页面提供的信息仅供参考，如有疑问请咨询专业医生
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
  },
  placeholder: {
    width: 40,
  },
  introCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginLeft: 12,
    flex: 1,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#687076',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a7ea4',
    marginTop: 6,
    marginRight: 12,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#687076',
    flex: 1,
  },
  bottomTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  bottomTipText: {
    fontSize: 13,
    color: '#0a7ea4',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
