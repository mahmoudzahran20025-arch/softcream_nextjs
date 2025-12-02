/**
 * OptionGroupsBadge Utility Functions
 * 
 * Pure utility functions for the OptionGroupsBadge component.
 * Separated for easier testing without React dependencies.
 * 
 * @module admin/products/OptionGroupsBadge/utils
 */

/**
 * Information about an assigned option group
 */
export interface AssignedGroupInfo {
  groupId: string;
  groupName: string;
  groupIcon?: string;
  isRequired: boolean;
  optionsCount: number;
}

/**
 * Calculates the badge count from assigned groups.
 * This is a pure function that can be tested independently.
 * 
 * @param assignedGroups - Array of assigned group information
 * @returns The count of assigned groups
 */
export function calculateBadgeCount(assignedGroups: AssignedGroupInfo[]): number {
  if (!assignedGroups || !Array.isArray(assignedGroups)) {
    return 0;
  }
  return assignedGroups.length;
}
