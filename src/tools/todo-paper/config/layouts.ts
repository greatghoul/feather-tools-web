// A4 paper layout configuration
// For different task count × density combinations, manually fine-tune parameters to fill the paper

// A4 size: 210mm × 297mm = 794px × 1123px (96 DPI)
// Padding: 20mm = 76px
// Available height: 1123 - 76*2 = 971px

export const LAYOUT_CONFIGS = {
    // Comfortable mode - 3 tasks per group
    // Target: 6 rows × 2 columns = 12 groups
    'comfortable-3': {
        taskItemPadding: '13px 16px',   // Vertical 12px, horizontal 16px
        rowGap: 12,                      // Vertical gap between groups
        columnGap: 10,                   // Horizontal gap between groups
        taskBoxSize: { width: 18, height: 18 },
        taskFontSize: '14px',
        taskLineHeight: 1.5,
        groupCount: 12                   // 6 rows × 2 columns
    },

    // Comfortable mode - 4 tasks per group
    // Target: 5 rows × 2 columns = 10 groups
    'comfortable-4': {
        taskItemPadding: '11px 16px',
        rowGap: 11,
        columnGap: 10,
        taskBoxSize: { width: 18, height: 18 },
        taskFontSize: '14px',
        taskLineHeight: 1.5,
        groupCount: 10                   // 5 rows × 2 columns
    },

    // Comfortable mode - 5 tasks per group
    // Target: 4 rows × 2 columns = 8 groups
    'comfortable-5': {
        taskItemPadding: '11px 16px',
        rowGap: 14,
        columnGap: 10,
        taskBoxSize: { width: 18, height: 18 },
        taskFontSize: '14px',
        taskLineHeight: 1.5,
        groupCount: 8                    // 4 rows × 2 columns
    },

    // Comfortable mode - 6 tasks per group
    // Target: 4 rows × 2 columns = 8 groups
    'comfortable-6': {
        taskItemPadding: '12px 16px',
        rowGap: 29.5,
        columnGap: 10,
        taskBoxSize: { width: 18, height: 18 },
        taskFontSize: '14px',
        taskLineHeight: 1.5,
        groupCount: 8                    // 4 rows × 2 columns
    },

    // Compact mode - 3 tasks per group
    // Target: 9 rows × 3 columns = 27 groups
    'compact-3': {
        taskItemPadding: '6px 10px',
        rowGap: 8,
        columnGap: 10,
        taskBoxSize: { width: 16, height: 16 },
        taskFontSize: '13px',
        taskLineHeight: 1.4,
        groupCount: 27                   // 9 rows × 3 columns
    },

    // Compact mode - 4 tasks per group
    // Target: 6 rows × 3 columns = 18 groups
    'compact-4': {
        taskItemPadding: '8px 10px',
        rowGap: 11,
        columnGap: 10,
        taskBoxSize: { width: 16, height: 16 },
        taskFontSize: '13px',
        taskLineHeight: 1.4,
        groupCount: 18                   // 6 rows × 3 columns
    },

    // Compact mode - 5 tasks per group
    // Target: 5 rows × 3 columns = 15 groups
    'compact-5': {
        taskItemPadding: '8px 10px',
        rowGap: 9,
        columnGap: 10,
        taskBoxSize: { width: 16, height: 16 },
        taskFontSize: '13px',
        taskLineHeight: 1.4,
        groupCount: 15                   // 5 rows × 3 columns
    },

    // Compact mode - 6 tasks per group
    // Target: 4 rows × 3 columns = 12 groups
    'compact-6': {
        taskItemPadding: '8px 10px',
        rowGap: 11,
        columnGap: 10,
        taskBoxSize: { width: 16, height: 16 },
        taskFontSize: '13px',
        taskLineHeight: 1.4,
        groupCount: 12                   // 4 rows × 3 columns
    }
};

// Get layout configuration
export function getLayoutConfig(taskPerGroup, density, _hasTitle?: any) {
    const key = `${density}-${taskPerGroup}`;
    const config = LAYOUT_CONFIGS[key];

    if (!config) {
        // 默认返回舒适模式5个任务
        return LAYOUT_CONFIGS['comfortable-5'];
    }

    return config;
}

// Print configuration info (for development debugging)
export function printDebugInfo() {
    console.log('=== Todo Paper Layout Configs ===');
    for (const [key, config] of Object.entries(LAYOUT_CONFIGS)) {
        console.log(`\n${key}:`);
        console.log(`  Group count: ${config.groupCount}`);
        console.log(`  Row gap: ${config.rowGap}px`);
        console.log(`  Task padding: ${config.taskItemPadding}`);
    }
}
