'use client';

import OptionsPage from '@/components/admin/options';

/**
 * Admin Options Management Page
 * 
 * Full-featured options management including:
 * - Option Groups CRUD (create, read, update, delete)
 * - Options CRUD within groups
 * - UI Config editing (display_style, columns, show_images)
 * - Drag & drop reordering
 * - Search and filtering
 * - Availability toggle
 */
export default function OptionsManagementPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <OptionsPage />
            </div>
        </div>
    );
}
