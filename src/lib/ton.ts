export const TONCENTER_TESTNET = 'https://testnet.toncenter.com/api/v2';

export type TonBalanceResult = {
  ok: true;
  balance: string;
} | {
  ok: false;
  error: string;
};

export async function getTonBalance(address: string): Promise<string> {
  const url = `${TONCENTER_TESTNET}/getAddressBalance?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`toncenter HTTP ${res.status}`);
  }
  const data = (await res.json()) as { ok?: boolean; result?: string };
  if (!data.ok || typeof data.result !== 'string') {
    throw new Error('toncenter returned non-ok response');
  }
  return data.result;
}

export type MasterchainBlock = {
  seqno: number;
  gen_utime: number;
  workchain_id: number;
  shard_id: string;
  file_hash: string;
  root_hash: string;
};

export type ShardBlock = {
  seqno: number;
  workchain_id: number;
  shard_id: string;
  root_hash: string;
  file_hash: string;
  gen_utime: number;
  start_lt: string;
  end_lt: string;
};

async function fetchToncenter<T>(path: string): Promise<T> {
  const res = await fetch(`${TONCENTER_TESTNET}${path}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`toncenter HTTP ${res.status}`);
  }
  const data = (await res.json()) as { ok?: boolean; result?: T; error?: string };
  if (!data.ok || data.result === undefined) {
    throw new Error(data.error ?? 'toncenter returned non-ok response');
  }
  return data.result;
}

export async function getMasterchainInfo(): Promise<MasterchainBlock> {
  return fetchToncenter<MasterchainBlock>('/getMasterchainInfo');
}

export async function getMasterchainBlock(seqno: number): Promise<unknown> {
  return fetchToncenter<unknown>(`/getBlock?workchain=-1&shard=${2n ** 63n}&seqno=${seqno}`);
}

export async function getShards(seqno: number): Promise<ShardBlock[]> {
  return fetchToncenter<ShardBlock[]>(`/shards?seqno=${seqno}`);
}