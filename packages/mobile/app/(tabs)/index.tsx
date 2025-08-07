import { Image } from 'expo-image';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const features = [
    {
      icon: 'heart',
      title: '温柔陪伴',
      description: '如加藤惠般温柔的陪伴体验',
      color: colors.primary,
    },
    {
      icon: 'chatbubble-ellipses',
      title: '智能对话',
      description: '自然流畅的对话交流',
      color: colors.accent,
    },
    {
      icon: 'camera',
      title: '扫码功能',
      description: '便捷的二维码扫描体验',
      color: colors.secondary,
    },
    {
      icon: 'person-circle',
      title: '个人中心',
      description: '专属的个人空间管理',
      color: colors.primary,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部欢迎区域 */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>欢迎来到</Text>
            <Text style={styles.titleText}>加藤惠的世界</Text>
            <Text style={styles.subtitleText}>温柔、自然、贴心的陪伴体验</Text>
          </View>
        </LinearGradient>

        {/* 功能卡片区域 */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>主要功能</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.featureCard, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={30} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.icon }]}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 快捷操作区域 */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>快捷操作</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={24} color="white" />
              <Text style={styles.quickActionText}>扫一扫</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble" size={24} color="white" />
              <Text style={styles.quickActionText}>开始对话</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部装饰 */}
        <View style={styles.bottomDecoration}>
          <Text style={[styles.decorationText, { color: colors.icon }]}>
            &ldquo;平凡而美好的日常，就是最珍贵的回忆&rdquo;
          </Text>
          <Text style={[styles.decorationAuthor, { color: colors.primary }]}>— 加藤惠</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsContainer: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomDecoration: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  decorationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  decorationAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
