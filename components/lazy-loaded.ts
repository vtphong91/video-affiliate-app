/**
 * Lazy-loaded components for code splitting
 *
 * Components are loaded dynamically to reduce initial bundle size
 * and improve page load performance
 */

import dynamic from 'next/dynamic';

/**
 * NOTE: These components currently don't support lazy loading
 * because they don't export default. Keep them here for future use
 * when components are refactored to support default exports.
 *
 * For now, import components directly:
 * import AIContentEditor from '@/components/AIContentEditor'
 */

// Placeholder exports - not functional yet
export const AIContentEditorLazy = null;
export const ReviewPreviewLazy = null;
export const AffiliateLinkManagerLazy = null;

// Future lazy-loaded components will be added here when components support default exports
