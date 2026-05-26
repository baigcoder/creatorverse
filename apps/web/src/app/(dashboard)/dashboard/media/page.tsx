'use client';

import { useState } from 'react';
import { FileArchive, FileText, Link2, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCompleteUpload, useMediaAssets, useSignedMediaUrl, useUploadFile, useUploadPolicy } from '@/hooks/use-media';
import { UploadPolicy } from '@/services/media';

function iconFor(type?: string) {
  if (type?.startsWith('video/')) return Video;
  if (type === 'application/pdf') return FileText;
  if (type === 'application/zip') return FileArchive;
  return Upload;
}

export default function MediaDashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState('videos');
  const [policy, setPolicy] = useState<UploadPolicy | null>(null);
  const [key, setKey] = useState('');
  const uploadPolicy = useUploadPolicy();
  const uploadFile = useUploadFile();
  const completeUpload = useCompleteUpload();
  const signedUrl = useSignedMediaUrl();
  const mediaAssets = useMediaAssets({ page: 1, limit: 60 });
  const FileIcon = iconFor(file?.type);

  async function prepareUpload() {
    if (!file) return;
    try {
      const nextPolicy = await uploadPolicy.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        folder,
      });
      setPolicy(nextPolicy);
      toast.success(nextPolicy.uploadUrl ? 'Upload URL generated' : nextPolicy.message ?? 'Policy generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload policy failed');
    }
  }

  async function startUpload() {
    if (!file || !policy) return;
    try {
      const result = await uploadFile.mutateAsync({ file, policy });
      await completeUpload.mutateAsync({
        key: result.key,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        folder,
        visibility: 'PROTECTED',
      });
      setKey(result.key);
      toast.success(result.uploaded ? 'File uploaded and saved to library' : result.message ?? 'Asset saved to library in dev pending mode');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  async function generateSignedUrl() {
    if (!key.trim()) return;
    try {
      const result = await signedUrl.mutateAsync(key.trim());
      await navigator.clipboard?.writeText(result.url);
      toast.success('Signed URL copied');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signed URL failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload course videos, PDFs, templates, thumbnails, and protected files through validated presigned URLs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Allowed assets', value: 'Images, video, PDF, ZIP', icon: Upload },
          { label: 'Max upload', value: '500 MB', icon: Video },
          { label: 'Access model', value: 'Signed URLs', icon: Link2 },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <metric.icon className="h-5 w-5 text-mango-500" />
              <p className="mt-3 text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-lg font-bold text-foreground">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Library assets</CardTitle></CardHeader>
        <CardContent>
          {mediaAssets.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : mediaAssets.data?.data.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mediaAssets.data.data.map((asset) => {
                const AssetIcon = iconFor(asset.contentType);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setKey(asset.key);
                      navigator.clipboard?.writeText(asset.url || asset.key);
                      toast.success('Asset key copied. Paste it into a lesson video URL or product file field.');
                    }}
                    className="rounded-xl border p-4 text-left transition hover:bg-muted dark:border-border-dark"
                  >
                    <AssetIcon className="h-5 w-5 text-mango-500" />
                    <p className="mt-3 truncate text-sm font-semibold text-foreground">{asset.filename}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{asset.contentType} · {(asset.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="mt-2 truncate text-xs text-muted-foreground">{asset.key}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground dark:border-border-dark">
              Upload an asset to make it available for lessons and products.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upload asset</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center transition hover:bg-muted/50">
              <FileIcon className="h-10 w-10 text-mango-500" />
              <p className="mt-3 text-sm font-medium text-foreground">{file ? file.name : 'Choose a file'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{file ? `${file.type || 'unknown'} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'MP4, WebM, images, PDF, or ZIP'}</p>
              <input type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </label>
            <Input label="Folder" value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="videos" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={!file || uploadPolicy.isPending} onClick={prepareUpload}>{uploadPolicy.isPending ? 'Preparing...' : 'Generate upload URL'}</Button>
              <Button variant="outline" disabled={!policy || !file || uploadFile.isPending} onClick={startUpload}>{uploadFile.isPending ? 'Uploading...' : 'Upload file'}</Button>
            </div>
            {policy && (
              <div className="rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                <p><strong>Provider:</strong> {policy.provider}</p>
                <p><strong>Key:</strong> {policy.key}</p>
                <p><strong>Status:</strong> {policy.uploadUrl ? 'Ready for direct upload' : policy.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Signed access URL</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Asset key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="videos/creators/creator_id/file.mp4" />
            <Button className="gap-2" disabled={!key.trim() || signedUrl.isPending} onClick={generateSignedUrl}>
              <Link2 className="h-4 w-4" />
              {signedUrl.isPending ? 'Generating...' : 'Generate and copy URL'}
            </Button>
            <p className="text-sm text-muted-foreground">Signed URLs are short-lived and should be requested only for users who have access to the asset.</p>
            {signedUrl.data && (
              <div className="rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                <p><strong>Expires:</strong> {signedUrl.data.expiresIn}s</p>
                <p className="break-all"><strong>URL:</strong> {signedUrl.data.url}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
