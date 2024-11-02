declare module 'memory-cache';
import cache from 'memory-cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenIds = searchParams.get('tokenIds');
  const cacheKey = `tokenRates-${tokenIds}`;
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    return NextResponse.json(cachedResponse, { status: 200 });
  }

  try {
    const tokenList = tokenIds?.split(',') || [];
    const results = await Promise.all(
      tokenList.map(async (tokenId) => {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${tokenId}`,
          {
            headers: {
              accept: 'application/json',
              'x-cg-demo-api-key': 'CG-g45oG44aBMkrfsZXP9rGame4',
            },
          }
        );
        return response.json();
      })
    );
    const tokenData = results.map((data) => ({
      name: data.name,
      symbol: data.symbol,
      marketCapUsd: data.market_data?.market_cap?.usd ?? 0,
      marketCapIdr: data.market_data?.market_cap?.idr ?? 0,
    }));

    cache.put(cacheKey, tokenData, 10 * 60 * 1000); // Cache for 10 minutes
    return NextResponse.json(tokenData, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error fetching token rates' }, { status: 500 });
  }
}