'use client';

import { useState } from 'react';

interface TokenRate {
  name: string;
  symbol: string;
  marketCapUsd: number;
  marketCapIdr: number;
  tokenPriceUsd: number;
  tokenValueUsd: number;
  tokenPriceIdr: number;
  tokenValueIdr: number;
}

export default function Home() {
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [formattedTokenAmount, setFormattedTokenAmount] = useState<string>('');
  const [tokenRates, setTokenRates] = useState<TokenRate[]>([]);
  const tokenIds = ['notcoin', 'dogs-2', 'hamster-kombat', 'catizen'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setTokenAmount(value);
    if (value) {
      setFormattedTokenAmount(new Intl.NumberFormat().format(Number(value)));
    } else {
      setFormattedTokenAmount('');
    }
  };

  const handleInputBlur = () => {
    if (tokenAmount) {
      setTokenAmount(new Intl.NumberFormat().format(Number(tokenAmount.replace(/,/g, ''))));
    }
  };

  const getTokenRates = async () => {
    const numericTokenAmount = parseInt(tokenAmount.replace(/,/g, ''), 10);
    if (isNaN(numericTokenAmount) || numericTokenAmount <= 0) {
      alert('Please enter a valid token amount.');
      return;
    }

    try {
      const response = await fetch(
        `/api/tokenRates?tokenIds=${tokenIds.join(',')}`
      );
      const data = await response.json();
      setTokenRates(
        data.map((token: TokenRate) => ({
          ...token,
          tokenPriceUsd: token.marketCapUsd ? token.marketCapUsd / 100000000000 : 0,
          tokenValueUsd: token.marketCapUsd ? (token.marketCapUsd / 100000000000) * numericTokenAmount : 0,
          tokenPriceIdr: token.marketCapIdr ? token.marketCapIdr / 100000000000 : 0,
          tokenValueIdr: token.marketCapIdr ? (token.marketCapIdr / 100000000000) * numericTokenAmount : 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching token rates:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 mt-5 mb-5">
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg border border-blue-300 shadow-lg">
          <p className="text-xs text-gray-400 text-center mb-2">
            <a
              href="https://docs.coingecko.com/reference/introduction"
              target="_blank"
              rel="noopener noreferrer"
            >
              Data powered by CoinGecko
            </a>
          </p>
          <h1 className="text-2xl font-bold text-center mb-4">Check TOMA Token Rates</h1>

          {/* Input Section */}
          <div className="mb-4">
            <label htmlFor="tokenAmount" className="block text-sm font-medium text-blue-200 mb-1">
              Enter Number of TOMA Tokens:
              <span className="ml-2 text-blue-400">{formattedTokenAmount}</span>
            </label>
            <input
              type="text"
              id="tokenAmount"
              value={tokenAmount}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 1000"
              className="w-full px-3 py-2 bg-gray-700 border border-blue-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          {/* Display Section */}
          <div className="mb-4 text-center">
            <button
              onClick={getTokenRates}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold"
            >
              Check Rates
            </button>
          </div>

          {/* Output Section */}
          <div id="output" className="text-center">
            {tokenRates.map((token, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg border border-blue-300 sm:mx-1">
                <h2 className="text-lg font-bold text-blue-300">
                  {token.name} ({token.symbol.toUpperCase()})
                </h2>
                <p className="text-green-500 font-bold">
                  Market Cap (USD): ${token.marketCapUsd ? token.marketCapUsd.toLocaleString() : 'N/A'}
                </p>
                <hr></hr>
                <p className="text-blue-300">
                  TOMA Price (USD): ${token.tokenPriceUsd ? token.tokenPriceUsd.toFixed(6) : 'N/A'}
                </p>
                <p className="text-yellow-300">
                  Your TOMA Value (USD): ${token.tokenValueUsd ? Number(token.tokenValueUsd.toFixed(0)).toLocaleString()  : 'N/A'}
                </p>
                <p className="text-blue-300">
                  TOMA Price (IDR): Rp{token.tokenPriceIdr ? Number(token.tokenPriceIdr.toFixed(0)).toLocaleString()  : 'N/A'}
                </p>
                <p className="text-yellow-300">
                  Your TOMA Value (IDR): Rp{token.tokenValueIdr ? Number(token.tokenValueIdr.toFixed(0)).toLocaleString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}