import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部', icon: 'apps' },
    { id: 'daily', name: '日常', icon: 'sunny' },
    { id: 'emotion', name: '情感', icon: 'heart' },
    { id: 'study', name: '学习', icon: 'book' },
    { id: 'life', name: '生活', icon: 'home' },
  ];

  const exploreItems = [
    {
      id: 1,
      title: '温柔的日常对话',
      description: '学习如何进行温柔自然的日常交流',
      category: 'daily',
      icon: 'chatbubble-ellipses',
      color: colors.primary,
    },
    {
      id: 2,
      title: '情感表达技巧',
      description: '掌握细腻的情感表达方式',
      category: 'emotion',
      icon: 'heart',
      color: colors.accent,
    },
    {
      id: 3,
      title: '学习陪伴模式',
      description: '在学习中提供温暖的陪伴',
      category: 'study',
      icon: 'book',
      color: colors.secondary,
    },
    {
      id: 4,
      title: '生活小贴士',
      description: '分享实用的生活小智慧',
      category: 'life',
      icon: 'bulb',
      color: colors.primary,
    },
    {
      id: 5,
      title: '倾听的艺术',
      description: '学会用心倾听和理解',
      category: 'emotion',
      icon: 'ear',
      color: colors.accent,
    },
    {
      id: 6,
      title: '美好时光记录',
      description: '记录和分享美好的瞬间',
      category: 'daily',
      icon: 'camera',
      color: colors.secondary,
    },
  ];

  const filteredItems = exploreItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 头部 */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>发现</Text>
        <Text style={[styles.headerSubtitle, { color: colors.icon }]}>探索更多可能</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 搜索栏 */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="搜索感兴趣的内容..."
              placeholderTextColor={colors.icon}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 分类标签 */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTag,
                    {
                      backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={selectedCategory === category.id ? 'white' : colors.primary}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: selectedCategory === category.id ? 'white' : colors.primary,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 内容列表 */}
        <View style={styles.contentContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.contentCard, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
              >
                <View style={[styles.contentIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.contentInfo}>
                  <Text style={[styles.contentTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.contentDescription, { color: colors.icon }]}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={60} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                没有找到相关内容
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                试试其他关键词或分类
              </Text>
            </View>
          )}
        </View>

        {/* 底部推荐 */}
        <View style={styles.recommendationContainer}>
          <Text style={[styles.recommendationTitle, { color: colors.text }]}>为你推荐</Text>
          <View style={[styles.recommendationCard, { backgroundColor: colors.primary }]}>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>
                &ldquo;每一次温柔的对话，都是心灵的相遇&rdquo;
              </Text>
              <Text style={styles.recommendationAuthor}>— 加藤惠</Text>
            </View>
            <Ionicons name="heart" size={30} color="white" style={styles.recommendationIcon} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryIcon: {
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
  },
  recommendationContainer: {
    padding: 20,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22,
  },
  recommendationAuthor: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  recommendationIcon: {
    marginLeft: 15,
  },
});
