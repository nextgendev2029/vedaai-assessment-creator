'use client';

import { AppLogo } from '@/components/brand/app-logo';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Card } from '@/components/ui/card';
import { AssignmentCard } from '@/components/assignments/assignment-card';
import { SearchFilterBar } from '@/components/assignments/search-filter-bar';
import { EmptyAssignmentsState } from '@/components/assignments/empty-assignments-state';
import { EmptyAssignmentsIllustration } from '@/components/illustrations/empty-assignments-illustration';
import { demoAssignments } from '@/lib/mock-data';
import {
  Plus,
  ArrowLeft,
  Settings,
  Bell,
  Search,
  Sparkles,
} from 'lucide-react';

/**
 * Temporary component preview page for the design system.
 * Shows all UI primitives and composed components.
 */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        VedaAI Design System
      </h1>
      <p className="text-sm text-text-muted mb-10">
        Component preview — Phase 2
      </p>

      {/* Logo */}
      <Section title="Logo">
        <div className="flex items-center gap-8 flex-wrap">
          <AppLogo size="sm" />
          <AppLogo size="md" />
          <AppLogo size="lg" />
          <AppLogo size="md" showText={false} />
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="primary" icon={<Sparkles size={16} />}>
            Create Assignment
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <Button size="sm" variant="primary">Small</Button>
          <Button size="md" variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
        </div>
      </Section>

      {/* Icon Buttons */}
      <Section title="Icon Buttons">
        <div className="flex items-center gap-3 flex-wrap">
          <IconButton label="Back" variant="default">
            <ArrowLeft size={20} />
          </IconButton>
          <IconButton label="Settings" variant="ghost">
            <Settings size={20} />
          </IconButton>
          <IconButton label="Notifications" variant="surface">
            <Bell size={20} />
          </IconButton>
          <IconButton label="Search" variant="ghost" size="sm">
            <Search size={16} />
          </IconButton>
          <IconButton label="Add" variant="surface" size="lg">
            <Plus size={24} className="text-accent" />
          </IconButton>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <p className="text-sm font-semibold text-text-primary">
              Default Card
            </p>
            <p className="text-xs text-text-muted mt-1">
              White background with subtle shadow
            </p>
          </Card>
          <Card variant="glass" className="p-6">
            <p className="text-sm font-semibold text-text-primary">
              Glass Card
            </p>
            <p className="text-xs text-text-muted mt-1">
              75% white with backdrop blur
            </p>
          </Card>
        </div>
      </Section>

      {/* Search Filter Bar */}
      <Section title="Search / Filter Bar">
        <SearchFilterBar />
      </Section>

      {/* Assignment Card */}
      <Section title="Assignment Card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AssignmentCard assignment={demoAssignments[0]} />
          <AssignmentCard assignment={demoAssignments[1]} />
        </div>
      </Section>

      {/* Empty State Illustration */}
      <Section title="Empty State Illustration">
        <EmptyAssignmentsIllustration />
      </Section>

      {/* Full Empty State */}
      <Section title="Empty Assignments State">
        <div className="bg-surface-soft rounded-3xl">
          <EmptyAssignmentsState />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-text-primary mb-1">{title}</h2>
      <div className="h-px bg-black/10 mb-5" />
      {children}
    </section>
  );
}
