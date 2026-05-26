'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Eye, FileText, GripVertical, HelpCircle, PenTool, Play, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useCreateLesson,
  useCreateSection,
  useDeleteLesson,
  useDeleteSection,
  useManagedCourseCurriculum,
  usePublishCourse,
  useReorderLessons,
  useReorderSections,
  useUpdateSection,
} from '@/hooks/use-courses';

const lessonTypeIcons = {
  VIDEO: Play,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: PenTool,
};

function formatDuration(seconds?: number) {
  if (!seconds) return '0 min';
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export default function CourseBuilderPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const curriculum = useManagedCourseCurriculum(courseId);
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson();
  const reorderLessons = useReorderLessons();
  const publishCourse = usePublishCourse();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [lessonTitleBySection, setLessonTitleBySection] = useState<Record<string, string>>({});

  const sections = curriculum.data?.sections ?? [];
  const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalDuration = sections.reduce((sum, section) => sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0), 0);
  const busy = createSection.isPending || updateSection.isPending || deleteSection.isPending || createLesson.isPending || deleteLesson.isPending;
  const expanded = useMemo(() => {
    if (expandedSections.size > 0) return expandedSections;
    return new Set(sections.map((section) => section.id));
  }, [expandedSections, sections]);

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => {
      const next = new Set(expanded);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  async function addSection() {
    const title = newSectionTitle.trim();
    if (!title) return toast.error('Add a section title first');
    try {
      await createSection.mutateAsync({ courseId, data: { title } });
      setNewSectionTitle('');
      toast.success('Section added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Section could not be added');
    }
  }

  async function renameSection(sectionId: string, title: string) {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    try {
      await updateSection.mutateAsync({ sectionId, courseId, data: { title: nextTitle } });
      toast.success('Section renamed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Section could not be renamed');
    }
  }

  async function removeSection(sectionId: string) {
    try {
      await deleteSection.mutateAsync({ sectionId, courseId });
      toast.success('Section deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Section could not be deleted');
    }
  }

  async function addLesson(sectionId: string) {
    const title = lessonTitleBySection[sectionId]?.trim();
    if (!title) return toast.error('Add a lesson title first');
    try {
      await createLesson.mutateAsync({ sectionId, courseId, data: { title, type: 'VIDEO' } });
      setLessonTitleBySection((current) => ({ ...current, [sectionId]: '' }));
      toast.success('Lesson added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lesson could not be added');
    }
  }

  async function removeLesson(lessonId: string) {
    try {
      await deleteLesson.mutateAsync({ lessonId, courseId });
      toast.success('Lesson deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lesson could not be deleted');
    }
  }

  async function moveSection(sectionId: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === sectionId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    await reorderSections.mutateAsync({ courseId, items: next.map((section, order) => ({ id: section.id, order })) });
  }

  async function moveLesson(sectionId: string, lessonId: string, direction: -1 | 1) {
    const lessons = sections.find((section) => section.id === sectionId)?.lessons ?? [];
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= lessons.length) return;
    const next = [...lessons];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    await reorderLessons.mutateAsync({ courseId, items: next.map((lesson, order) => ({ id: lesson.id, order })) });
  }

  async function publish() {
    try {
      await publishCourse.mutateAsync(courseId);
      toast.success('Course published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Course could not be published');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Courses</span>
            <span>/</span>
            <span className="text-foreground">{curriculum.data?.title ?? 'Course'}</span>
            <span>/</span>
            <span className="text-foreground">Curriculum</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Course Builder</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/c/${curriculum.data?.slug ?? courseId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-transparent px-5 text-sm font-semibold text-foreground shadow-flat-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:bg-violet/5 hover:shadow-flat-md"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>
          <Button className="gap-2" disabled={publishCourse.isPending || sections.length === 0} onClick={publish}>
            <Settings className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{sections.length}</div><div className="text-xs text-muted-foreground">Sections</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{totalLessons}</div><div className="text-xs text-muted-foreground">Lessons</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</div><div className="text-xs text-muted-foreground">Duration</div></CardContent></Card>
      </div>

      {curriculum.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : curriculum.isError ? (
        <Card><CardContent className="p-8 text-center text-sm text-red-600">{curriculum.error instanceof Error ? curriculum.error.message : 'Course curriculum could not be loaded.'}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, sectionIndex) => {
            const open = expanded.has(section.id);
            return (
              <Card key={section.id} className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border p-4 dark:border-border-dark">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <button type="button" onClick={() => toggleSection(section.id)}>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
                  <Input defaultValue={section.title} className="h-9 flex-1" onBlur={(event) => renameSection(section.id, event.target.value)} />
                  <Button size="sm" variant="outline" disabled={sectionIndex === 0} onClick={() => moveSection(section.id, -1)}>Up</Button>
                  <Button size="sm" variant="outline" disabled={sectionIndex === sections.length - 1} onClick={() => moveSection(section.id, 1)}>Down</Button>
                  <Button size="icon" variant="ghost" className="text-destructive" disabled={busy} onClick={() => removeSection(section.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>

                {open && (
                  <div className="divide-y divide-border dark:divide-border-dark">
                    {section.lessons.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-muted-foreground">No lessons yet. Add the first lesson below.</div>
                    ) : (
                      section.lessons.map((lesson, lessonIndex) => {
                        const LessonIcon = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] ?? FileText;
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              <LessonIcon className="h-4 w-4" />
                            </div>
                            <Link href={`/dashboard/courses/${courseId}/builder/${section.id}/${lesson.id}`} className="flex-1 text-sm font-medium text-foreground hover:text-mango-500">
                              {lesson.title}
                            </Link>
                            <span className="text-xs text-muted-foreground">{lesson.type}</span>
                            <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</span>
                            <Button size="sm" variant="outline" disabled={lessonIndex === 0} onClick={() => moveLesson(section.id, lesson.id, -1)}>Up</Button>
                            <Button size="sm" variant="outline" disabled={lessonIndex === section.lessons.length - 1} onClick={() => moveLesson(section.id, lesson.id, 1)}>Down</Button>
                            <Button size="icon" variant="ghost" className="text-destructive" disabled={busy} onClick={() => removeLesson(lesson.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        );
                      })
                    )}
                    <div className="flex gap-2 p-4">
                      <Input
                        value={lessonTitleBySection[section.id] ?? ''}
                        onChange={(event) => setLessonTitleBySection((current) => ({ ...current, [section.id]: event.target.value }))}
                        placeholder="New lesson title"
                      />
                      <Button disabled={busy} onClick={() => addLesson(section.id)}><Plus className="mr-2 h-4 w-4" />Add Lesson</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
              <Input value={newSectionTitle} onChange={(event) => setNewSectionTitle(event.target.value)} placeholder="New section title" />
              <Button disabled={busy} onClick={addSection}><Plus className="mr-2 h-4 w-4" />Add Section</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
