import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { borderRadius, spacing } from "../../theme/spacing";
import CategoryIcon from "./CategoryIcon";

/**
 * CategoryPicker – grid chọn hạng mục từ Redux local state.
 * Props:
 *   selected : string
 *   onSelect : (category) => void
 *
 * Categories are not income/expense-typed; the transaction's direction
 * decides that, so every category is selectable here.
 */
export default function CategoryPicker({ selected, onSelect }) {
  const categories = useSelector((state) => state.categories.categories);

  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const isSelected = selected === cat.name || selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${cat.color}22` }]}>
              <CategoryIcon icon={cat.icon} size={24} color={cat.color || colors.primary} />
            </View>
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
            {isSelected && <View style={styles.checkDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: spacing.sm },
  item: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
  },
  itemSelected: { backgroundColor: colors.surfaceAlt },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
    textAlign: "center",
  },
  labelSelected: {
    color: colors.primary,
    fontFamily: typography.family.semiBold,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
