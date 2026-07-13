'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/ui/components/Header';
import { Badge, Button, Card, FieldLabel } from '@/ui/components/ui';
import { getMasterchainInfo, getShards, type MasterchainBlock, type ShardBlock } from '@/lib/ton';

function formatTimestamp(utime: number): string {
  if (!Number.isFinite(utime) || utime <= 0) return '—';
  const date = new Date(utime * 1000);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

function formatShard(shard: string): string {
  if (!shard) return '—';
  return `${shard.slice(0, 6)}…${shard.slice(-6)}`;
}

function explorerBlock(seqno: number): string {
  return `https://testnet.tonscan.org/block/${seqno}`;
}

export default function BlockViewerPage() {
  const [block, setBlock] = useState<MasterchainBlock | null>(null);
  const [shards, setShards] = useState<ShardBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const info = await getMasterchainInfo();
      setBlock(info);
      try {
        const list = await getShards(info.seqno);
        setShards(list);
      } catch (shardErr) {
        setShards([]);
        const msg = shardErr instanceof Error ? shardErr.message : 'Failed to read shards.';
        setError((prev) => (prev ? `${prev}\n${msg}` : msg));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read masterchain info.');
      setBlock(null);
      setShards(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to read masterchain info.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  const seqno = block?.seqno ?? null;
  const workchains = shards ? new Set(shards.map((s) => s.workchain_id)) : new Set<number>();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="h-1 bg-gradient-to-r from-brand-700 via-accent to-brand-700/30" />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <Badge className="mb-3">Masterchain · testnet</Badge>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink">
              TON Block{' '}
              <span className="text-brand-700">Viewer</span>
            </h1>
            <p className="mt-3 max-w-prose text-ink-soft">
              Inspect the masterchain head from toncenter — seqno, timestamp, and the shards split
              for this block.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="rounded-full border border-line bg-mist px-3 py-1 text-xs font-medium text-ink-soft">
              toncenter api
            </span>
            <span className="rounded-full border border-line bg-mist px-3 py-1 text-xs font-medium text-ink-soft">
              read-only
            </span>
            <Button onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </section>

        <Card className="mt-8 overflow-hidden p-0">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.1fr_1fr]">
            <div className="border-b border-line bg-mist p-6 lg:border-b-0 lg:border-r">
              <FieldLabel>Masterchain head</FieldLabel>
              <p className="mt-2 font-display text-6xl font-bold leading-none tracking-tight text-ink tnum">
                {loading ? '—' : seqno !== null ? (
                  <a
                    href={explorerBlock(seqno)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-700"
                  >
                    #{seqno}
                  </a>
                ) : '—'}
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                {loading ? 'Fetching latest block…' : block ? formatTimestamp(block.gen_utime) : '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line">
              {block ? (
                <>
                  <div className="bg-paper p-5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-soft">Workchain</div>
                    <div className="mt-1 font-mono text-base text-ink tnum">{block.workchain_id}</div>
                  </div>
                  <div className="bg-paper p-5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-soft">Shard</div>
                    <div className="mt-1 font-mono text-base text-ink tnum">{formatShard(block.shard_id)}</div>
                  </div>
                  <div className="col-span-2 bg-paper p-5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-soft">Root hash</div>
                    <div className="mt-1 break-all font-mono text-xs text-ink">{block.root_hash}</div>
                  </div>
                  <div className="col-span-2 bg-paper p-5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-soft">File hash</div>
                    <div className="mt-1 break-all font-mono text-xs text-ink">{block.file_hash}</div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 bg-paper p-5 text-sm text-ink-soft">
                  Block metadata unavailable.
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="m-5 whitespace-pre-line rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
              {error}
            </p>
          )}
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          <Card>
            <FieldLabel>Shards split</FieldLabel>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-ink tnum">
                {shards ? shards.length : '—'}
              </span>
              <span className="text-sm text-ink-soft">
                {shards && (shards.length === 1 ? 'shard' : 'shards')}
              </span>
            </div>
            <div className="mt-2 text-xs text-ink-soft tnum">
              {shards
                ? workchains.size === 1
                  ? `workchain ${[...workchains][0]}`
                  : `${workchains.size} workchains`
                : '—'}
            </div>
            {loading && !shards && (
              <p className="mt-4 text-sm text-ink-soft">Loading shards…</p>
            )}
            {shards && shards.length === 0 && !loading && (
              <p className="mt-4 text-sm text-ink-soft">No shards reported for this block.</p>
            )}
          </Card>

          <Card>
            <FieldLabel>Per shard</FieldLabel>
            {shards && shards.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-ink-soft">
                    <tr>
                      <th className="py-2 pr-3">WC</th>
                      <th className="py-2 pr-3">Shard</th>
                      <th className="py-2 pr-3 tnum">Seqno</th>
                      <th className="py-2 pl-3">Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {shards.map((s, i) => (
                      <tr key={`${s.workchain_id}-${s.shard_id}-${i}`}>
                        <td className="py-2 pr-3 font-mono text-ink tnum">{s.workchain_id}</td>
                        <td className="py-2 pr-3 font-mono text-ink tnum">{formatShard(s.shard_id)}</td>
                        <td className="py-2 pr-3 font-mono text-ink tnum">{s.seqno}</td>
                        <td className="py-2 pl-3 text-ink-soft">
                          {s.gen_utime ? new Date(s.gen_utime * 1000).toLocaleTimeString('en-US') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}